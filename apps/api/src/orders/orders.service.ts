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

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const rawTotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

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

    const discountAmount = Math.round((rawTotal * discountPercent) / 100);
    const finalTotal = Math.max(0, rawTotal - discountAmount);

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
      return {
        message: 'Tạo đơn hàng thành công',
        orderId: Number(recentPendingOrder.id),
        total: Number(recentPendingOrder.total),
        rawTotal,
        discount: discountAmount,
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
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.qty },
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

    while (attempts < maxRetries) {
      attempts++;
      try {
        order = await this.prisma.$transaction(async (tx) => {
          for (const item of createOrderDto.items) {
            const product = await tx.product.findUnique({
              where: { id: BigInt(item.productId) as any },
            });

            if (!product) {
              throw new NotFoundException(`Sản phẩm #${item.productId} không tồn tại`);
            }

            if (product.stock < item.qty) {
              throw new BadRequestException(
                `Sản phẩm "${product.name}" không đủ số lượng tồn kho (còn ${product.stock}, yêu cầu ${item.qty})`,
              );
            }

            const updateResult = await tx.product.updateMany({
              where: {
                id: product.id,
                version: product.version,
                stock: { gte: item.qty },
              },
              data: {
                stock: { decrement: item.qty },
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
            dbToppings.forEach((t: any) => toppingsMap.set(t.name, { id: t.id, price: t.price }));
          }

          return tx.order.create({
            data: {
              userId: BigInt(userId) as any,
              status: order_status.PENDING,
              total: finalTotal,
              OrderItem: {
                create: createOrderDto.items.map((item) => {
                  const itemToppings = (item.toppings || [])
                    .map((name) => toppingsMap.get(name))
                    .filter(Boolean);

                  return {
                    size: item.size as any,
                    qty: item.qty,
                    lineTotal: item.price * item.qty,
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
                  };
                }),
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
      total: finalTotal,
      rawTotal,
      discount: discountAmount,
      loyaltyPoints,
      discountPercent,
      membershipTier,
      voucher: null,
    };
  }

  async cancelOrder(id: number, userId: number) {
    const order = await this.findOne(id);

    if (Number(order.userId) !== userId) {
      const user = await this.usersService.findOne(userId);
      const isStaff = user && ((user as any).role === 'barista' || (user as any).email?.includes('barista'));
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
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.qty },
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
        const isStaff =
          user &&
          ((user as any).role === 'barista' ||
            (user as any).email?.toLowerCase().includes('barista') ||
            (user as any).email?.toLowerCase().includes('staff') ||
            (user as any).email?.toLowerCase().includes('admin'));

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
        const isBarista =
          user &&
          ((user as any).role === 'barista' ||
            (user as any).email?.toLowerCase().includes('barista') ||
            (user as any).email?.toLowerCase().includes('staff') ||
            (user as any).email?.toLowerCase().includes('admin'));

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
    const isBarista =
      user &&
      ((user as any).role === 'barista' ||
        (user as any).email?.toLowerCase().includes('barista') ||
        (user as any).email?.toLowerCase().includes('staff') ||
        (user as any).email?.toLowerCase().includes('admin'));

    if (!isBarista) {
      throw new ForbiddenException('Khách hàng không có quyền chỉnh sửa trạng thái đơn hàng');
    }

    return this.updateStatus(orderId, newStatus);
  }
}