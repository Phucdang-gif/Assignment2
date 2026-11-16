import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { order_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { isStaffRole } from '../auth/roles.guard';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getOrderStatuses(): Promise<string[]> {
    try {
      const result: any = await this.prisma.$queryRaw`
        SELECT enum_range(NULL::order_status);
      `;
      if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0]?.enum_range)) {
        return result[0].enum_range;
      }
    } catch {
      // Fallback sang enum định nghĩa trong Prisma Client nếu query raw không thành công
    }
    return Object.values(order_status);
  }

  private static readonly SIZE_SURCHARGE: Record<string, number> = {
    S: 0,
    M: 5000,
    L: 10000,
  };

  async create(createOrderDto: CreateOrderDto, userId: number) {
    let loyaltyPoints = 0;
    try {
      const user = await this.usersService.findOne(userId);
      if (user && typeof user.loyaltyPoints === 'number') {
        loyaltyPoints = user.loyaltyPoints;
      }
    } catch {
      loyaltyPoints = 0;
    }

    let discountPercent = 0;
    let membershipTier = 'Đồng';

    if (loyaltyPoints >= 100) {
      discountPercent = 15;
      membershipTier = 'Kim Cương';
    } else if (loyaltyPoints >= 50) {
      discountPercent = 10;
      membershipTier = 'Vàng';
    } else if (loyaltyPoints >= 20) {
      discountPercent = 5;
      membershipTier = 'Bạc';
    }

    const oldUserPendingOrders = await this.prisma.order.findMany({
      where: {
        userId: BigInt(userId) as any,
        status: order_status.PENDING,
        createdAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000), // tự động hủy các đơn treo quá thời gian giữ đơn (5 phút) của user
        },
      },
      include: { OrderItem: true },
    });

    for (const oldOrder of oldUserPendingOrders) {
      try {
        await this.cancelOrder(Number(oldOrder.id), userId);
      } catch (err) {
        console.warn(`[AutoCancel] Không thể hoàn đơn cũ #${oldOrder.id}:`, err);
      }
    }

    try {
      const expiredPendingOrders = await this.prisma.order.findMany({
        where: {
          status: order_status.PENDING,
          createdAt: {
            lt: new Date(Date.now() - 6 * 60 * 1000),
          },
        },
        include: { OrderItem: true },
        take: 20,
      });

      for (const expOrder of expiredPendingOrders) {
        await this.prisma.$transaction(async (tx) => {
          const updateRes = tx.order.updateMany
            ? await tx.order.updateMany({
                where: { id: expOrder.id, status: order_status.PENDING },
                data: { status: order_status.CANCELLED },
              })
            : await tx.order.update({
                where: { id: expOrder.id },
                data: { status: order_status.CANCELLED },
              });

          if (updateRes && (updateRes as any).count === 0) return;

          for (const item of expOrder.OrderItem) {
            if ((tx as any).productRecipeItem) {
              const recipeItems = await (tx as any).productRecipeItem.findMany({
                where: {
                  productId: item.productId,
                  size: item.size,
                },
              });

              for (const r of recipeItems) {
                await (tx as any).ingredient.update({
                  where: { id: r.ingredientId },
                  data: { stock: { increment: r.amount * item.qty } },
                });
              }
            }
          }
        });
      }
    } catch {
      // bỏ qua lỗi background cleanup
    }

    const maxRetries = 3;
    let attempts = 0;
    let order: any = null;
    let computedRawTotal = 0;
    let computedTotalDiscount = 0;
    let computedFinalTotal = 0;
    let appliedVoucher: {
      id: number;
      code: string;
      description: string | null;
      discountType: string;
      discountValue: number;
      discountAmount: number;
    } | null = null;

    while (attempts < maxRetries) {
      attempts++;
      try {
        order = await this.prisma.$transaction(async (tx) => {
          const productsMap = new Map<number, any>();

          for (const item of createOrderDto.items) {
            const product = await tx.product.findUnique({
              where: { id: BigInt(item.productId) as any },
            });

            if (!product) {
              throw new NotFoundException(`Sản phẩm #${item.productId} không tồn tại`);
            }

            if (product.status && product.status !== 'active') {
              throw new BadRequestException(`Sản phẩm "${product.name}" hiện đang tạm ngưng phục vụ`);
            }

            productsMap.set(Number(item.productId), product);

            // Kiểm tra và trừ tồn kho atomic theo nguyên vật liệu (ProductRecipeItem & Ingredient)
            if ((tx as any).productRecipeItem) {
              const recipeItems = await (tx as any).productRecipeItem.findMany({
                where: {
                  productId: BigInt(item.productId) as any,
                  size: item.size as any,
                },
                include: { Ingredient: true },
              });

              if (recipeItems.length > 0) {
                for (const r of recipeItems) {
                  const needed = r.amount * item.qty;
                  const ingName = r.Ingredient?.name || 'Nguyên liệu';

                  if (typeof (tx as any).ingredient?.updateMany === 'function') {
                    const updateIngRes = await (tx as any).ingredient.updateMany({
                      where: {
                        id: r.ingredientId,
                        stock: { gte: needed },
                      },
                      data: {
                        stock: { decrement: needed },
                      },
                    });

                    if (updateIngRes.count === 0) {
                      throw new BadRequestException(
                        `Nguyên liệu "${ingName}" không đủ để pha món "${product.name}" size ${item.size}`,
                      );
                    }
                  } else {
                    const ing = r.Ingredient;
                    if (!ing || ing.stock < needed) {
                      throw new BadRequestException(
                        `Nguyên liệu "${ingName}" không đủ để pha món "${product.name}" size ${item.size} (còn ${ing?.stock ?? 0} ${ing?.unit ?? ''}, cần ${needed} ${ing?.unit ?? ''})`,
                      );
                    }
                    if ((tx as any).ingredient?.update) {
                      await (tx as any).ingredient.update({
                        where: { id: r.ingredientId },
                        data: { stock: { decrement: needed } },
                      });
                    }
                  }
                }
              }
            }

            const prodStock = (product as any).stock;
            if (typeof prodStock === 'number' && prodStock < item.qty) {
              throw new BadRequestException(
                `Sản phẩm "${product.name}" không đủ số lượng tồn kho (còn ${prodStock}, yêu cầu ${item.qty})`,
              );
            }

            const updateResult = await tx.product.updateMany({
              where: {
                id: product.id,
                version: product.version,
                ...(typeof prodStock === 'number' ? { stock: { gte: item.qty } } : {}),
              },
              data: {
                ...(typeof prodStock === 'number' ? { stock: { decrement: item.qty } } : {}),
                version: { increment: 1 },
              },
            });

            if (updateResult && updateResult.count === 0) {
              throw new ConflictException(
                `Xung đột tồn kho khi nhiều khách đặt đồng thời sản phẩm "${product.name}". Vui lòng thử lại!`,
              );
            }
          }

          const allToppingNames = new Set<string>();
          for (const item of createOrderDto.items) {
            if (item.toppings && Array.isArray(item.toppings)) {
              item.toppings.forEach((t) => {
                if (typeof t === 'string' && t.trim()) allToppingNames.add(t.trim());
              });
            }
          }

          const toppingsMap = new Map<string, { id: number; price: number }>();
          if (allToppingNames.size > 0 && (tx as any).topping) {
            const dbToppings = await (tx as any).topping.findMany({
              where: { name: { in: Array.from(allToppingNames) } },
            });
            const foundNames = new Set(dbToppings.map((t: any) => t.name));
            for (const name of allToppingNames) {
              if (!foundNames.has(name)) {
                throw new BadRequestException(`Topping "${name}" không tồn tại trong hệ thống`);
              }
            }
            for (const t of dbToppings) {
              if (t.isAvailable === false) {
                throw new BadRequestException(`Topping "${t.name}" hiện đang hết hàng`);
              }
              toppingsMap.set(t.name, { id: t.id, price: Number(t.price) });
            }
          }

          // Tính đơn giá từng món trực tiếp từ Database (Product.price + phụ thu Size + Topping.price)
          // Tuyệt đối không tin tưởng giá (item.price) từ phía Client gửi lên.
          // Khử trùng lặp topping trên mỗi món để tránh lỗi trùng khóa chính OrderItemTopping(orderItemId, toppingId)
          const enrichedItems = createOrderDto.items.map((item) => {
            const product = productsMap.get(Number(item.productId));
            const basePrice = Number(product.price);
            const sizeExtra =
              OrdersService.SIZE_SURCHARGE[String(item.size).toUpperCase()] ?? 0;
            const uniqueToppingNames = Array.from(
              new Set(
                (item.toppings || [])
                  .map((t) => (typeof t === 'string' ? t.trim() : t))
                  .filter(Boolean),
              ),
            );
            const itemToppings = uniqueToppingNames
              .map((name) => toppingsMap.get(name))
              .filter(Boolean);
            const toppingsExtra = itemToppings.reduce(
              (sum, t) => sum + Number(t!.price),
              0,
            );
            const serverUnitPrice = basePrice + sizeExtra + toppingsExtra;
            const serverLineTotal = serverUnitPrice * item.qty;

            return {
              item,
              itemToppings,
              serverUnitPrice,
              serverLineTotal,
            };
          });

          const rawTotal = enrichedItems.reduce(
            (sum, entry) => sum + entry.serverLineTotal,
            0,
          );
          const discountAmount = Math.round((rawTotal * discountPercent) / 100);

          let promotionId: bigint | null = null;
          let promoDiscount = 0;
          appliedVoucher = null;
          if (createOrderDto.voucherCode && (tx as any).promotion) {
            const cleanCode = createOrderDto.voucherCode.trim().toUpperCase();
            const promo = await (tx as any).promotion.findUnique({
              where: { code: cleanCode },
            });
            if (!promo || !promo.isActive) {
              throw new BadRequestException(`Mã giảm giá "${cleanCode}" không tồn tại hoặc đã ngừng áp dụng`);
            }
            const now = new Date();
            if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
              throw new BadRequestException(`Mã giảm giá "${cleanCode}" đã hết hạn hoặc chưa đến thời gian áp dụng`);
            }
            if (rawTotal < Number(promo.minOrderValue || 0)) {
              throw new BadRequestException(
                `Đơn hàng cần đạt tối thiểu ${Number(promo.minOrderValue).toLocaleString('vi-VN')}đ để áp dụng mã "${cleanCode}"`,
              );
            }

            promotionId = promo.id;
            if (promo.discountType === 'PERCENTAGE' || promo.discountType === 'MEMBERSHIP_TIER') {
              promoDiscount = Math.round((rawTotal * Number(promo.discountValue)) / 100);
            } else {
              promoDiscount = Number(promo.discountValue);
            }
            appliedVoucher = {
              id: Number(promo.id),
              code: promo.code,
              description: promo.description ?? null,
              discountType: promo.discountType,
              discountValue: Number(promo.discountValue),
              discountAmount: promoDiscount,
            };
          }

          const totalDiscount = Math.min(rawTotal, discountAmount + promoDiscount);
          computedRawTotal = rawTotal;
          computedTotalDiscount = totalDiscount;
          computedFinalTotal = Math.max(0, rawTotal - totalDiscount);

          return tx.order.create({
            data: {
              userId: BigInt(userId) as any,
              status: order_status.PENDING,
              subtotal: computedRawTotal,
              discountAmount: computedTotalDiscount,
              total: computedFinalTotal,
              ...(promotionId ? { promotionId } : {}),
              OrderItem: {
                create: enrichedItems.map(
                  ({ item, itemToppings, serverUnitPrice, serverLineTotal }) => ({
                    size: item.size as any,
                    qty: item.qty,
                    unitPrice: serverUnitPrice,
                    lineTotal: serverLineTotal,
                    Product: {
                      connect: { id: BigInt(item.productId) as any },
                    },
                    ...(itemToppings.length > 0 && (tx as any).orderItemTopping
                      ? {
                          OrderItemTopping: {
                            create: itemToppings.map((t) => ({
                              toppingId: t!.id,
                              priceAtTime: t!.price,
                            })),
                          },
                        }
                      : {}),
                  }),
                ),
              },
            },
          });
        });

        break;
      } catch (err) {
        if (err instanceof ConflictException && attempts < maxRetries) {
          await new Promise((res) => setTimeout(res, 50 * attempts + Math.floor(Math.random() * 30)));
          continue;
        }
        throw err;
      }
    }

    return {
      message: 'Tạo đơn hàng thành công',
      orderId: order.id,
      total: computedFinalTotal,
      rawTotal: computedRawTotal,
      discount: computedTotalDiscount,
      loyaltyPoints,
      discountPercent,
      membershipTier,
      voucher: appliedVoucher,
    };
  }

  async validateVoucher(code: string, subtotal = 0) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new BadRequestException('Vui lòng nhập mã giảm giá');
    }

    if (!(this.prisma as any).promotion) {
      throw new BadRequestException('Hệ thống khuyến mãi tạm thời không khả dụng');
    }

    const promo = await (this.prisma as any).promotion.findUnique({
      where: { code: cleanCode },
    });

    if (!promo || !promo.isActive) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" không tồn tại hoặc đã ngừng áp dụng`);
    }

    const now = new Date();
    if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" đã hết hạn hoặc chưa đến thời gian áp dụng`);
    }

    const minOrderValue = Number(promo.minOrderValue || 0);
    if (subtotal > 0 && subtotal < minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng cần đạt tối thiểu ${minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã "${cleanCode}"`,
      );
    }

    const discountValue = Number(promo.discountValue || 0);
    const discountAmount =
      subtotal > 0
        ? promo.discountType === 'PERCENTAGE' || promo.discountType === 'MEMBERSHIP_TIER'
          ? Math.round((subtotal * discountValue) / 100)
          : Math.min(subtotal, discountValue)
        : 0;

    return {
      valid: true,
      id: Number(promo.id),
      code: promo.code,
      description: promo.description ?? null,
      discountType: promo.discountType,
      discountValue,
      minOrderValue,
      discountAmount,
    };
  }

  async cancelOrder(id: number, userId: number) {
    const order = await this.findOne(id);

    if (Number(order.userId) !== userId) {
      const user = await this.usersService.findOne(userId);
      const isStaff = isStaffRole((user as any)?.role);
      if (!isStaff) {
        throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
      }
    }

    if (order.status === order_status.CANCELLED) {
      return order;
    }

    this.assertTransition(order.status, order_status.CANCELLED);

    return this.prisma.$transaction(async (tx) => {
      if (typeof tx.order.updateMany === 'function') {
        const updateResult = await tx.order.updateMany({
          where: {
            id: BigInt(id) as any,
            status: { in: [order_status.PENDING, order_status.PAID, order_status.PAYMENT_FAILED] },
          },
          data: { status: order_status.CANCELLED },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException('Đơn hàng không thể hủy hoặc đã được xử lý');
        }
      }

      for (const item of order.OrderItem) {
        if ((tx as any).productRecipeItem) {
          const recipeItems = await (tx as any).productRecipeItem.findMany({
            where: {
              productId: item.productId,
              size: item.size,
            },
          });

          for (const r of recipeItems) {
            await (tx as any).ingredient.update({
              where: { id: r.ingredientId },
              data: { stock: { increment: r.amount * item.qty } },
            });
          }
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            version: { increment: 1 },
          },
        });
      }

      // Thu hồi điểm tích lũy nếu đơn hàng đã từng được PAID
      if (order.status === order_status.PAID && (tx as any).loyaltyTransaction) {
        const earnTxs = await (tx as any).loyaltyTransaction.findMany({
          where: {
            orderId: BigInt(id),
            type: 'EARN',
          },
        });
        const pointsToRevoke = (earnTxs || []).reduce(
          (sum: number, t: any) => sum + Number(t.points),
          0,
        );
        if (pointsToRevoke > 0) {
          const targetUser = await tx.user.findUnique({ where: { id: order.userId } });
          const currentPoints = targetUser?.loyaltyPoints ?? 0;
          const newBalance = Math.max(0, currentPoints - pointsToRevoke);

          await tx.user.update({
            where: { id: order.userId },
            data: { loyaltyPoints: newBalance },
          });

          await (tx as any).loyaltyTransaction.create({
            data: {
              userId: order.userId,
              orderId: BigInt(id),
              points: -pointsToRevoke,
              type: 'ADJUST',
              balanceAfter: newBalance,
              reason: `Thu hồi điểm do hủy đơn hàng #${id}`,
            },
          });
        }
      }

      return tx.order.update({
        where: { id: BigInt(id) as any },
        data: { status: order_status.CANCELLED },
        include: {
          OrderItem: { include: { Product: true } },
          Payment: true,
        },
      });
    });
  }

  async retryPayment(id: number, userId: number) {
    const order = await this.findOne(id);
    if (Number(order.userId) !== userId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này');
    }

    this.assertTransition(order.status, order_status.PENDING);

    return this.prisma.order.update({
      where: { id: BigInt(id) as any },
      data: { status: order_status.PENDING },
      include: {
        OrderItem: { include: { Product: true } },
        Payment: true,
      },
    });
  }

  async markPaymentFailed(id: number, userId?: number) {
    const order = await this.findOne(id);
    if (userId !== undefined && Number(order.userId) !== userId) {
      const user = await this.usersService.findOne(userId);
      const isStaff = isStaffRole((user as any)?.role);
      if (!isStaff) {
        throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này');
      }
    }
    this.assertTransition(order.status, order_status.PAYMENT_FAILED);

    return this.prisma.order.update({
      where: { id: BigInt(id) as any },
      data: { status: order_status.PAYMENT_FAILED },
      include: {
        OrderItem: { include: { Product: true } },
        Payment: true,
      },
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId: BigInt(userId) as any,
      },
      include: {
        OrderItem: {
          include: {
            Product: true,
            OrderItemTopping: {
              include: {
                Topping: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: BigInt(id) as any,
      },
      include: {
        OrderItem: {
          include: {
            Product: true,
            OrderItemTopping: {
              include: {
                Topping: true,
              },
            },
          },
        },
        Payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Đơn hàng #${id} không tồn tại`);
    }

    if (userId !== undefined) {
      const isOwner = Number(order.userId) === userId;
      if (!isOwner) {
        const user = await this.usersService.findOne(userId);
        const isStaff = isStaffRole((user as any)?.role);

        if (!isStaff) {
          throw new ForbiddenException(
            'Khách hàng chỉ có quyền xem lịch sử đơn hàng của mình, không có quyền xem đơn hàng của người khác',
          );
        }
      }
    }

    return order;
  }

  async findOneForUser(id: number, userId: number) {
    return this.findOne(id, userId);
  }

  assertTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      [order_status.PENDING]: [
        order_status.PAID,
        order_status.PAYMENT_FAILED,
        order_status.CANCELLED,
      ],
      [order_status.PAYMENT_FAILED]: [
        order_status.PENDING,
        order_status.CANCELLED,
      ],
      [order_status.PAID]: [
        order_status.PREPARING,
        order_status.CANCELLED,
      ],
      [order_status.PREPARING]: [
        order_status.READY,
      ],
      [order_status.READY]: [
        order_status.COMPLETED,
      ],
    };

    const allowed = validTransitions[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Chuyển đổi trạng thái không hợp lệ: không thể chuyển từ ${currentStatus} sang ${newStatus}`,
      );
    }
  }

  async updateStatus(id: number, newStatus: string) {
    if (newStatus === order_status.PAID) {
      throw new BadRequestException(
        'Không thể chuyển trạng thái sang PAID thủ công. Đơn hàng phải qua cổng thanh toán.',
      );
    }
    if (newStatus === order_status.CANCELLED) {
      throw new BadRequestException(
        'Vui lòng sử dụng tính năng hủy đơn hàng chuyên biệt để hoàn kho nguyên liệu.',
      );
    }

    const order = await this.findOne(id);
    this.assertTransition(order.status, newStatus);

    return this.prisma.order.update({
      where: {
        id: BigInt(id) as any,
      },
      data: {
        status: newStatus as order_status,
      },
      include: {
        OrderItem: {
          include: {
            Product: true,
            OrderItemTopping: {
              include: {
                Topping: true,
              },
            },
          },
        },
        Payment: true,
      },
    });
  }

  async findBaristaQueue(userId?: number) {
    let isCustomer = false;
    let customerUserId: number | null = null;

    if (userId) {
      try {
        const user = await this.usersService.findOne(userId);
        const isBarista = isStaffRole((user as any)?.role);

        if (!isBarista) {
          isCustomer = true;
          customerUserId = userId;
        }
      } catch {
        isCustomer = true;
        customerUserId = userId;
      }
    }

    const whereClause: any = {
      status: {
        in: [
          order_status.PAID,
          order_status.PREPARING,
          order_status.READY,
          ...(isCustomer ? [order_status.COMPLETED] : []),
        ],
      },
    };

    if (isCustomer && customerUserId) {
      whereClause.userId = BigInt(customerUserId);
    }

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        OrderItem: {
          include: {
            Product: true,
            OrderItemTopping: {
              include: {
                Topping: true,
              },
            },
          },
        },
        User: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: isCustomer ? 'desc' : 'asc',
      },
    });
  }

  async baristaUpdateStatus(orderId: number, newStatus: string, userId: number) {
    const user = await this.usersService.findOne(userId);
    const isBarista = isStaffRole((user as any)?.role);

    if (!isBarista) {
      throw new ForbiddenException('Khách hàng không có quyền chỉnh sửa trạng thái đơn hàng');
    }

    return this.updateStatus(orderId, newStatus);
  }
}