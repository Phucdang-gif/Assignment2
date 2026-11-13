import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ForbiddenException,
} from '@nestjs/common';
import { order_status, payment_method, payment_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPayOSDto } from './dto/verify-payos.dto';
import { isStaffRole } from '../auth/roles.guard';
import * as crypto from 'crypto';

let PayOSConstructor: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const payosModule = require('@payos/node');
  PayOSConstructor = payosModule.PayOS || payosModule.default || payosModule;
} catch (e) {
  console.warn('[PaymentsService] @payos/node could not be imported:', e);
}

export interface PaymentProcessResult {
  payment?: any;
  order?: any;
  idempotent?: boolean;
  pointsEarned?: number;
  message?: string;
  alreadyPaid?: boolean;
}

@Injectable()
export class PaymentsService implements OnModuleInit {
  private payOS: any = null;
  private latestOrderCodes = new Map<number, number>();

  constructor(private readonly prisma: PrismaService) {}

  public initPayOS() {
    if (this.payOS || !PayOSConstructor) return;
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (clientId && apiKey && checksumKey) {
      try {
        this.payOS = new PayOSConstructor({
          clientId,
          apiKey,
          checksumKey,
        });
        console.log(
          '[PayOS] SDK initialized successfully with client ID:',
          clientId.slice(0, 8) + '...',
        );
      } catch (err: any) {
        console.error('[PayOS] Initialization error:', err?.message || err);
      }
    }
  }

  onModuleInit() {
    this.initPayOS();
  }

  /**
   * Cập nhật trạng thái đơn hàng sang PAID và lưu bản ghi Payment
   */
  async markOrderAsPaid(
    orderId: number,
    amount?: number,
    reference?: string,
    method: payment_method = payment_method.WALLET,
  ): Promise<PaymentProcessResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
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
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    if (order.status === order_status.PAID || order.status === order_status.COMPLETED) {
      return {
        alreadyPaid: true,
        order,
      };
    }

    const payAmount = Number(amount ?? order.total);
    const idempotencyKey = reference || `PAYMENT-${orderId}-${Date.now()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findFirst({
        where: { orderId: BigInt(orderId) },
      });

      let payment = existingPayment;
      if (!existingPayment) {
        payment = await tx.payment.create({
          data: {
            orderId: BigInt(orderId),
            amount: payAmount,
            method,
            status: payment_status.SUCCESS,
            transactionRef: reference ?? null,
            idempotencyKey,
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: BigInt(orderId) },
        data: { status: order_status.PAID },
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

      return { payment, order: updatedOrder };
    });

    // Cộng điểm thưởng tích lũy: mỗi 10.000đ tích 1 điểm và lưu vết LoyaltyTransaction
    const pointsEarned = Math.floor(payAmount / 10000);
    if (pointsEarned > 0 && order.userId) {
      try {
        const updatedUser = await this.prisma.user.update({
          where: { id: order.userId },
          data: {
            loyaltyPoints: {
              increment: pointsEarned,
            },
          },
        });
        if ((this.prisma as any).loyaltyTransaction) {
          await (this.prisma as any).loyaltyTransaction.create({
            data: {
              userId: order.userId,
              orderId: BigInt(orderId),
              points: pointsEarned,
              type: 'EARN',
              balanceAfter: Number(updatedUser?.loyaltyPoints ?? pointsEarned),
              reason: `Tích điểm thanh toán đơn hàng #${orderId}`,
            },
          });
        }
      } catch (err) {
        console.warn('[Payments] Lỗi tích điểm thưởng cho người dùng:', err);
      }
    }

    return {
      alreadyPaid: false,
      ...result,
      pointsEarned,
    };
  }

  /**
   * API Thanh toán Ví/Thẻ mô phỏng với cơ chế Idempotency Key 
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentProcessResult> {
    const { orderId, amount, method, idempotencyKey } = createPaymentDto;

    // 1. Kiểm tra Idempotency Key chống trừ tiền lặp lại
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });

    if (existingPayment) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id: BigInt(orderId) },
      });
      return {
        payment: existingPayment,
        order: existingOrder,
        idempotent: true,
        pointsEarned: 0,
        message: 'Giao dịch thanh toán đã được xử lý thành công trước đó (Idempotent)',
      };
    }

    // 2. Kiểm tra tính hợp lệ của đơn hàng
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    if (order.status === order_status.CANCELLED) {
      throw new BadRequestException('Không thể thanh toán đơn hàng đã hủy');
    }
    if (order.status === order_status.COMPLETED) {
      throw new BadRequestException('Đơn hàng này đã hoàn thành');
    }
    if (order.status === order_status.PAID) {
      throw new BadRequestException('Đơn hàng này đã được thanh toán');
    }

    if (Number(order.total) !== amount) {
      throw new BadRequestException(
        `Số tiền thanh toán (${amount}đ) không khớp với tổng tiền đơn hàng (${Number(order.total)}đ)`,
      );
    }

    // 3. Tiến hành xử lý thanh toán mô phỏng an toàn
    return this.markOrderAsPaid(orderId, amount, idempotencyKey, method);
  }

  /** Chỉ chủ đơn (hoặc nhân viên nếu allowStaff=true) mới được thao tác */
async assertOrderAccess(orderId: number, userId: number, allowStaff = false) {
  const order = await this.prisma.order.findUnique({
    where: { id: BigInt(orderId) },
    select: { userId: true },
  });
  if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
  if (Number(order.userId) === userId) return;

  if (allowStaff) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { role: true },
    });
    if (isStaffRole(user?.role)) return;
  }
  throw new ForbiddenException('Bạn không có quyền với đơn hàng này');
}

  /**
   * Lấy lịch sử giao dịch thanh toán theo đơn hàng
   */
  async findByOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    return this.prisma.payment.findMany({
      where: { orderId: BigInt(orderId) },
    });
  }

  /**
   * Tra cứu trạng thái thanh toán của đơn hàng
   */
  async getPaymentStatus(orderId: number) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        Payment: true,
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
    });

    if (!existingOrder) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    let currentOrder: any = existingOrder;

    if (existingOrder.status === order_status.PENDING && this.payOS) {
      const cachedCode = this.latestOrderCodes.get(orderId);
      if (cachedCode) {
        try {
          const payosInfo = await this.payOS.paymentRequests.get(cachedCode);
          if (payosInfo && (payosInfo.status === 'PAID' || payosInfo.amountRemaining === 0)) {
            const updated = await this.markOrderAsPaid(
              orderId,
              payosInfo.amountPaid || Number(existingOrder.total),
              payosInfo.transactions?.[0]?.reference || `PAYOS-${cachedCode}`,
              payment_method.WALLET,
            );
            if (updated.order) {
              currentOrder = updated.order;
            }
          }
        } catch {
          // Bỏ qua lỗi polling ngầm
        }
      }
    }

    return {
      orderId,
      status: currentOrder.status,
      isPaid:
        currentOrder.status === order_status.PAID ||
        currentOrder.status === order_status.COMPLETED,
      total: Number(currentOrder.total),
      payment: currentOrder.Payment,
      order: currentOrder,
    };
  }

  /**
   * Tạo link thanh toán PayOS VietQR
   */
  async createPayOSLink(
    orderId: number,
    options?: { returnUrl?: string; cancelUrl?: string },
  ) {
    if (!this.payOS) {
      this.initPayOS();
    }
    if (!this.payOS) {
      throw new BadRequestException('PayOS chưa được khởi tạo, vui lòng kiểm tra cấu hình .env');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    if (order.status === order_status.PAID || order.status === order_status.COMPLETED) {
      throw new BadRequestException('Đơn hàng này đã được thanh toán hoàn tất');
    }

    if (order.status === order_status.CANCELLED) {
      throw new BadRequestException('Đơn hàng này đã bị hủy, không thể thanh toán');
    }

    const timestampSuffix = Date.now().toString().slice(-6);
    const orderCode = Number(`${order.id}${timestampSuffix}`);
    this.latestOrderCodes.set(Number(order.id), orderCode);

    const amount = Math.round(Number(order.total));
    const formattedOrderId = String(orderId).padStart(8, '0');
    const description = `BL${formattedOrderId}`;
    const cancelUrl =
      options?.cancelUrl ||
      `http://localhost:3000/cart?status=cancelled&reason=payos_timeout&orderId=${orderId}`;
    const returnUrl =
      options?.returnUrl || `http://localhost:3000/orders/${orderId}?status=PAID`;

    try {
      const paymentLinkRes = await this.payOS.paymentRequests.create({
        orderCode,
        amount,
        description,
        cancelUrl,
        expiredAt: Math.floor(Date.now() / 1000) + 5 * 60,
        returnUrl,
      });

      return {
        success: true,
        orderId,
        orderCode,
        amount: paymentLinkRes.amount,
        accountName: paymentLinkRes.accountName,
        accountNumber: paymentLinkRes.accountNumber,
        bin: paymentLinkRes.bin,
        description: paymentLinkRes.description,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        qrCode: paymentLinkRes.qrCode,
        paymentLinkId: paymentLinkRes.paymentLinkId,
        status: paymentLinkRes.status,
      };
    } catch (err: any) {
      if (err?.message?.includes('đã tồn tại') || err?.code === '231') {
        try {
          const existingLink = await this.payOS.paymentRequests.get(orderCode);
          return {
            success: true,
            orderId,
            orderCode,
            amount: existingLink.amount,
            accountName: (existingLink as any).accountName,
            accountNumber: (existingLink as any).accountNumber,
            bin: (existingLink as any).bin,
            description: (existingLink as any).description,
            checkoutUrl:
              (existingLink as any).checkoutUrl ||
              (existingLink.id ? `https://pay.payos.vn/web/${existingLink.id}` : undefined),
            qrCode: (existingLink as any).qrCode,
            paymentLinkId: existingLink.id,
            status: existingLink.status,
          };
        } catch (getErr) {
          console.error('[PayOS] Lỗi lấy thông tin link thanh toán đã tồn tại:', getErr);
        }
      }
      console.error('[PayOS] Lỗi tạo payment link:', err?.message || err);
      throw new BadRequestException(err?.message || 'Không thể tạo mã thanh toán VietQR');
    }
  }

  /**
   * Xác thực thanh toán PayOS trả về
   */
  async verifyPayOSPayment(body: VerifyPayOSDto) {
    const orderId = Number(body.orderId);
    if (!orderId) {
      throw new BadRequestException('Mã đơn hàng không hợp lệ');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
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
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    if (order.status === order_status.PAID || order.status === order_status.COMPLETED) {
      return {
        success: true,
        isPaid: true,
        message: 'Đơn hàng đã được thanh toán hoàn tất',
        order,
      };
    }

    if (order.status === order_status.CANCELLED) {
      throw new BadRequestException('Đơn hàng này đã bị hủy');
    }

    let parsedOrderCode: number | null = null;
    if (body.orderCode) {
      parsedOrderCode = Number(body.orderCode);
    } else if (this.latestOrderCodes.has(orderId)) {
      parsedOrderCode = this.latestOrderCodes.get(orderId)!;
    }

    if (this.payOS && parsedOrderCode) {
      try {
        const payosInfo = await this.payOS.paymentRequests.get(parsedOrderCode);
        if (payosInfo && (payosInfo.status === 'PAID' || payosInfo.amountRemaining === 0)) {
          const res = await this.markOrderAsPaid(
            orderId,
            payosInfo.amountPaid || Number(order.total),
            payosInfo.transactions?.[0]?.reference || `PAYOS-${parsedOrderCode}`,
            payment_method.WALLET,
          );
          return {
            success: true,
            isPaid: true,
            message: 'Thanh toán PayOS được xác thực thành công!',
            order: res.order,
          };
        }
      } catch (err: any) {
        console.warn(`[PayOS Verify] Lỗi kiểm tra PayOS API:`, err?.message || err);
      }
    }

    if (body.status === 'PAID' && (body.code === '00' || !body.code)) {
      const res = await this.markOrderAsPaid(
        orderId,
        Number(order.total),
        `PAYOS-RETURN-${orderId}-${Date.now()}`,
        payment_method.WALLET,
      );
      return {
        success: true,
        isPaid: true,
        message: 'Thanh toán được xác nhận tự động từ thông tin trả về của PayOS!',
        order: res.order,
      };
    }

    return {
      success: false,
      isPaid: false,
      status: order.status,
      message: 'Đơn hàng chưa hoàn tất thanh toán trên PayOS',
      order,
    };
  }

  /**
   * Xác nhận Webhook URL với PayOS
   */
  async confirmPayOSWebhookUrl(webhookUrl: string) {
    if (!this.payOS) {
      throw new BadRequestException('PayOS chưa được cấu hình Client ID / API Key trong file .env');
    }
    try {
      const res = await this.payOS.webhooks.confirm(webhookUrl);
      return { success: true, data: res };
    } catch (err: any) {
      console.error('[PayOS] Lỗi confirm webhook URL:', err?.message || err);
      throw new BadRequestException(
        err?.message || 'Không thể xác thực Webhook URL với PayOS',
      );
    }
  }

  /**
   * Xử lý IPN Webhook từ PayOS khi khách hàng chuyển tiền
   */
  async handlePayOSWebhook(webhookBody: any) {
    console.log('[PayOS Webhook] Received webhook payload:', JSON.stringify(webhookBody));

    if (!webhookBody) {
      return { success: false, message: 'No data' };
    }

    if (webhookBody?.webhookUrl) {
      return { success: true, message: 'Webhook URL verified successfully' };
    }

    let verifiedData: any = null;

    if (this.payOS && webhookBody.signature) {
      try {
        verifiedData = await this.payOS.webhooks.verify(webhookBody);
      } catch (err: any) {
        console.warn('[PayOS Webhook] Signature notice:', err?.message || err);
        verifiedData = webhookBody.data;
      }
    } else {
      verifiedData = webhookBody.data;
    }

    if (!verifiedData) {
      return { success: true, message: 'Ping/verification acknowledged' };
    }

    const rawOrderCode = Number(verifiedData.orderCode);
    if (!rawOrderCode) {
      return { success: true, message: 'No valid orderCode found' };
    }

    let order = await this.prisma.order.findUnique({
      where: { id: BigInt(rawOrderCode) },
    });
    let orderId = rawOrderCode;

    if (!order && rawOrderCode > 1000000) {
      const strCode = rawOrderCode.toString();
      orderId = Number(strCode.slice(0, strCode.length - 6));
      order = await this.prisma.order.findUnique({
        where: { id: BigInt(orderId) },
      });
    }

    if (!order) {
      console.warn(`[PayOS Webhook] Order #${orderId} not found in database`);
      return { success: true, message: 'Order not found, acknowledged' };
    }

    if (order.status === order_status.PAID || order.status === order_status.COMPLETED) {
      return { success: true, message: 'Order already paid' };
    }

    const amount = Number(verifiedData.amount || order.total);
    const reference = verifiedData.reference || `${Date.now()}`;
    const result = await this.markOrderAsPaid(
      orderId,
      amount,
      reference,
      payment_method.WALLET,
    );

    return {
      success: true,
      message: 'Payment confirmed successfully',
      data: result,
    };
  }

  /**
   * Tạo yêu cầu thanh toán qua ví MoMo Sandbox
   */
  async createMomoPayment(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${orderId}`);
    }
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const momoApiUrl =
      process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create';
    const amount = Math.round(Number(order.total));
    const orderInfo = `Thanh toan don hang #${orderId} tai BrewLite`;
    const requestId = `${partnerCode}-${orderId}-${Date.now()}`;
    const momoOrderId = `BL_${orderId}_${Date.now()}`;

    const redirectUrl = `http://localhost:3000/orders/${orderId}`;
    const ipnUrl = `https://cusp-pager-velvet.ngrok-free.dev/api/payments/momo-ipn`;
    const requestType = 'captureWallet';
    const extraData = '';
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      partnerName: 'BrewLite Coffee',
      storeId: 'BrewLiteStore',
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    const response = await fetch(momoApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const result = await response.json();
    if (result.resultCode !== 0) {
      throw new BadRequestException(result.message || 'Lỗi kết nối tới cổng thanh toán MoMo');
    }
    return {
      orderId,
      payUrl: result.payUrl,
      qrCodeUrl: result.qrCodeUrl,
      deeplink: result.deeplink,
    };
  }

  /**
   * Xử lý IPN phản hồi từ ví MoMo
   */
  async handleMomoIPN(body: any) {
    console.log('[MoMo IPN] Received notification:', JSON.stringify(body));
    const { resultCode, orderId: momoOrderId, amount, transId } = body;
    if (resultCode === 0) {
      const match = momoOrderId?.match(/BL_(\d+)_/);
      const orderId = match ? Number(match[1]) : null;
      if (!orderId) {
        return { message: 'Invalid orderId format' };
      }
      const order = await this.prisma.order.findUnique({
        where: { id: BigInt(orderId) },
      });
      if (!order || order.status === order_status.PAID || order.status === order_status.COMPLETED) {
        return { message: 'Order processed or not found' };
      }
      const idempotencyKey = `MOMO-${orderId}-${transId || Date.now()}`;
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            orderId: BigInt(orderId),
            amount: Number(amount),
            method: payment_method.WALLET,
            status: payment_status.SUCCESS,
            transactionRef: transId ? String(transId) : null,
            idempotencyKey,
          },
        });
        await tx.order.update({
          where: { id: BigInt(orderId) },
          data: { status: order_status.PAID },
        });
      });
      const pointsEarned = Math.floor(Number(amount) / 10000);
      if (pointsEarned > 0 && order.userId) {
        try {
          const updatedUser = await this.prisma.user.update({
            where: { id: order.userId },
            data: { loyaltyPoints: { increment: pointsEarned } },
          });
          if ((this.prisma as any).loyaltyTransaction) {
            await (this.prisma as any).loyaltyTransaction.create({
              data: {
                userId: order.userId,
                orderId: BigInt(orderId),
                points: pointsEarned,
                type: 'EARN',
                balanceAfter: Number(updatedUser?.loyaltyPoints ?? pointsEarned),
                reason: `Tích điểm thanh toán MoMo đơn hàng #${orderId}`,
              },
            });
          }
        } catch (err) {
          console.error('Lỗi cộng điểm tích lũy:', err);
        }
      }
      console.log(`[MoMo IPN] Đơn hàng #${orderId} đã duyệt thanh toán MoMo thành công!`);
    }
    return { message: 'Received' };
  }
}
