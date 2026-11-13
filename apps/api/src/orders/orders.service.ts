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

    const recentPendingOrder = await this.prisma.order.findFirst({
      where: {
        userId: BigInt(userId) as any,
        status: order_status.PENDING,
        createdAt: {
          gte: new Date(Date.now() - 4000), // trong vòng 4 giây
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentPendingOrder) {
      const recentSubtotal = Number((recentPendingOrder as any).subtotal ?? recentPendingOrder.total);
      const recentDiscount = Number((recentPendingOrder as any).discountAmount ?? 0);
      return {
        message: 'Tạo đơn hàng thành công',
        orderId: Number(recentPendingOrder.id),
        total: Number(recentPendingOrder.total),
        rawTotal: recentSubtotal,
        discount: recentDiscount,
        loyaltyPoints,
        membershipTier,
      };
    }

    const oldUserPendingOrders = await this.prisma.order.findMany({
      where: {
        userId: BigInt(userId) as any,
        status: order_status.PENDING,
        createdAt: {
          lt: new Date(Date.now() - 4000),
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

            await tx.product.update({
              where: { id: item.productId },
              data: {
                ...((tx.product as any)?.stock !== undefined ? { stock: { increment: item.qty } } : {}),
                version: { increment: 1 },
              },
            });
          }
          await tx.order.update({
            where: { id: expOrder.id },
            data: { status: order_status.CANCELLED },
          });
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

            productsMap.set(Number(item.productId), product);

            // Kiểm tra và trừ tồn kho theo nguyên vật liệu (ProductRecipeItem & Ingredient)
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
                  const ing = r.Ingredient;
                  if (!ing || ing.stock < needed) {
                    throw new BadRequestException(
                      `Nguyên liệu "${ing?.name || 'Không xác định'}" không đủ để pha món "${product.name}" size ${item.size} (còn ${ing?.stock ?? 0} ${ing?.unit ?? ''}, cần ${needed} ${ing?.unit ?? ''})`,
                    );
                  }

                  await (tx as any).ingredient.update({
                    where: { id: r.ingredientId },
                    data: { stock: { decrement: needed } },
                  });
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

            if (updateResult.count === 0) {
              throw new ConflictException(
                `Xung đột tồn kho khi nhiều khách đặt đồng thời sản phẩm "${product.name}". Vui lòng thử lại!`,
              );
            }
          }

          const allToppingNames = new Set<string>();
          for (const item of createOrderDto.items) {
            if (item.toppings && Array.isArray(item.toppings)) {
              item.toppings.forEach((t) => allToppingNames.add(t));
            }
          }

          const toppingsMap = new Map<string, { id: number; price: number }>();
          if (allToppingNames.size > 0 && (tx as any).topping) {
            const dbToppings = await (tx as any).topping.findMany({
              where: { name: { in: Array.from(allToppingNames) } },
            });
            dbToppings.forEach((t: any) =>
              toppingsMap.set(t.name, { id: t.id, price: Number(t.price) }),
            );
          }

          // Tính đơn giá từng món trực tiếp từ Database (Product.price + phụ thu Size + Topping.price)
          // Tuyệt đối không tin tưởng giá (item.price) từ phía Client gửi lên
          const enrichedItems = createOrderDto.items.map((item) => {
            const product = productsMap.get(Number(item.productId));
            const basePrice = Number(product.price);
            const sizeExtra =
              OrdersService.SIZE_SURCHARGE[String(item.size).toUpperCase()] ?? 0;
            const itemToppings = (item.toppings || [])
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
            const promo = await (tx as any).promotion.findUnique({
              where: { code: createOrderDto.voucherCode.trim().toUpperCase() },
            });
            const now = new Date();
            if (promo && promo.isActive && now >= promo.startDate && now <= promo.endDate) {
              if (rawTotal >= Number(promo.minOrderValue || 0)) {
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
            }
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
      const isStaff = user && (user as any).role === 'barista';
      if (!isStaff) {
        throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
      }
    }

    if (order.status === order_status.CANCELLED) {
      return order;
    }

    this.assertTransition(order.status, order_status.CANCELLED);

    return this.prisma.$transaction(async (tx) => {
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
            ...((item as any)?.Product?.stock !== undefined ? { stock: { increment: item.qty } } : {}),
            version: { increment: 1 },
          },
        });
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

  async markPaymentFailed(id: number) {
    const order = await this.findOne(id);
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
        const isStaff = user && (user as any).role === 'barista';

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
        const isBarista = user && (user as any).role === 'barista';

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
    const isBarista = user && (user as any).role === 'barista';

    if (!isBarista) {
      throw new ForbiddenException('Khách hàng không có quyền chỉnh sửa trạng thái đơn hàng');
    }

    return this.updateStatus(orderId, newStatus);
  }
}