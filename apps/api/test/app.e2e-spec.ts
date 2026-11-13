import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestNestApp, resetTestDatabase } from './test-db.helper';

describe('BrewLite End-to-End Ordering & Fulfillment Flow (TASK-5.2 / AC-E2E-01 / Real PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestNestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await resetTestDatabase(prisma);
  });

  afterAll(async () => {
    if (prisma) {
      await resetTestDatabase(prisma);
    }
    if (app) {
      await app.close();
    }
  });

  it('GET /health và GET /api/health trả về 200 OK và trạng thái sức khỏe hệ thống', async () => {
    const healthRes = await request(app.getHttpServer()).get('/health').expect(200);
    expect(healthRes.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'BrewLite API',
        info: {
          database: { status: 'up' },
        },
      }),
    );
    expect(healthRes.body).toHaveProperty('timestamp');
    expect(healthRes.body).toHaveProperty('uptime');

    const apiHealthRes = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(apiHealthRes.body.status).toBe('ok');
  });

  it('Hoàn tất luồng E2E từ Xem Menu -> Chọn Size/Topping -> Đăng ký/Đăng nhập -> Áp Voucher & Đặt đơn -> Thanh toán Idempotent -> Barista pha chế hoàn tất', async () => {
    // =========================================================================
    // BƯỚC 1: Khách hàng xem danh mục và thực đơn đồ uống (FR-01)
    // =========================================================================
    const categoriesRes = await request(app.getHttpServer())
      .get('/api/categories')
      .expect(200);
    expect(categoriesRes.body.length).toBeGreaterThanOrEqual(3);

    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);
    expect(productsRes.body.length).toBeGreaterThanOrEqual(2);
    const selectedProduct = productsRes.body.find(
      (p: { id: string; name: string }) => Number(p.id) === 1,
    );
    expect(selectedProduct).toBeDefined();
    expect(selectedProduct.name).toBe('Cà phê sữa đá');
    expect(selectedProduct.stock).toBeGreaterThan(0);

    // =========================================================================
    // BƯỚC 2: Xem chi tiết sản phẩm, tồn kho theo Size (S/M/L) & danh sách Topping (FR-02)
    // =========================================================================
    const detailRes = await request(app.getHttpServer())
      .get('/api/products/1')
      .expect(200);
    expect(detailRes.body.sizeStock.S).toBeGreaterThan(0);
    expect(detailRes.body.sizeStock.M).toBeGreaterThan(0);
    expect(detailRes.body.sizeStock.L).toBeGreaterThan(0);
    const sizeLBefore = detailRes.body.sizeStock.L;

    const toppingsRes = await request(app.getHttpServer())
      .get('/api/toppings')
      .expect(200);
    expect(toppingsRes.body).toHaveLength(3);

    // =========================================================================
    // BƯỚC 3: Đăng ký tài khoản mới & Đăng nhập nhận JWT Bearer Token (FR-04)
    // =========================================================================
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'e2e.buyer@gmail.com',
        password: 'password123',
        fullName: 'Nguyễn Văn An',
        phone: '0933445566',
      })
      .expect(201);
    expect(registerRes.body.email).toBe('e2e.buyer@gmail.com');

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'e2e.buyer@gmail.com',
        password: 'password123',
      })
      .expect(201);
    const buyerToken = loginRes.body.access_token as string;
    expect(buyerToken).toBeDefined();

    // =========================================================================
    // BƯỚC 4: Kiểm tra mã giảm giá Voucher & Tạo đơn hàng giữ kho (FR-03, FR-05, FR-11)
    // =========================================================================
    // Chọn 2 ly Cà phê sữa đá Size L (35.000 + 10.000) + Topping Kem cheese (+10.000) = 55.000đ/ly -> Subtotal = 110.000đ
    const voucherRes = await request(app.getHttpServer())
      .get('/api/orders/voucher/WELCOME10?subtotal=110000')
      .expect(200);
    expect(voucherRes.body.valid).toBe(true);
    expect(voucherRes.body.discountAmount).toBe(11000);

    const createOrderRes = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        items: [
          {
            productId: 1,
            size: 'L',
            qty: 2,
            toppings: ['Kem cheese (Macchiato)'],
          },
        ],
        voucherCode: 'WELCOME10',
      })
      .expect(201);

    const orderId = Number(createOrderRes.body.orderId);
    expect(createOrderRes.body.rawTotal).toBe(110000);
    expect(createOrderRes.body.discount).toBe(11000);
    expect(createOrderRes.body.total).toBe(99000);

    // Kiểm tra tồn kho Size L đã giảm đúng 2 ly sau khi giữ kho
    const detailAfterOrder = await request(app.getHttpServer())
      .get('/api/products/1')
      .expect(200);
    expect(detailAfterOrder.body.sizeStock.L).toBe(sizeLBefore - 2);

    // =========================================================================
    // BƯỚC 5: Thanh toán đơn hàng bằng Ví điện tử với Idempotency Key (FR-06)
    // =========================================================================
    const idempotencyKey = '550e8400-e29b-41d4-a716-446655440e2e';
    const paymentRes = await request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        orderId,
        amount: 99000,
        method: 'WALLET',
        idempotencyKey,
      })
      .expect(201);

    expect(paymentRes.body.order.status).toBe('PAID');
    expect(paymentRes.body.pointsEarned).toBe(9); // 99.000đ -> +9 điểm

    // Kiểm tra trạng thái đơn hàng tại trang xác nhận /orders/:id
    const orderDetailRes = await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(orderDetailRes.body.status).toBe('PAID');
    expect(orderDetailRes.body.Payment).toHaveLength(1);

    // =========================================================================
    // BƯỚC 6: Nhân viên Barista nhận đơn và cập nhật tiến độ pha chế (FR-07, FR-08)
    // =========================================================================
    const baristaLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'barista@brewlite.com',
        password: 'barista123',
      })
      .expect(201);
    const baristaToken = baristaLoginRes.body.access_token as string;

    // Barista xem hàng đợi pha chế
    const queueRes = await request(app.getHttpServer())
      .get('/api/orders/barista/queue')
      .set('Authorization', `Bearer ${baristaToken}`)
      .expect(200);
    expect(queueRes.body.some((o: { id: string }) => Number(o.id) === orderId)).toBe(true);

    // Khách hàng cố tình gọi API Barista -> bị chặn 403 Forbidden
    await request(app.getHttpServer())
      .patch(`/api/orders/barista/${orderId}/prepare`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(403);

    // Barista chuyển trạng thái tuần tự theo FSM: PAID -> PREPARING -> READY -> COMPLETED
    const prepRes = await request(app.getHttpServer())
      .patch(`/api/orders/barista/${orderId}/prepare`)
      .set('Authorization', `Bearer ${baristaToken}`)
      .expect(200);
    expect(prepRes.body.status).toBe('PREPARING');

    const readyRes = await request(app.getHttpServer())
      .patch(`/api/orders/barista/${orderId}/ready`)
      .set('Authorization', `Bearer ${baristaToken}`)
      .expect(200);
    expect(readyRes.body.status).toBe('READY');

    const completeRes = await request(app.getHttpServer())
      .patch(`/api/orders/barista/${orderId}/complete`)
      .set('Authorization', `Bearer ${baristaToken}`)
      .expect(200);
    expect(completeRes.body.status).toBe('COMPLETED');

    // Kiểm tra lịch sử đơn hàng và điểm tích lũy của khách hàng sau khi hoàn tất
    const myOrdersRes = await request(app.getHttpServer())
      .get('/api/orders/me')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(myOrdersRes.body).toHaveLength(1);
    expect(myOrdersRes.body[0].status).toBe('COMPLETED');

    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(meRes.body.loyaltyPoints).toBe(9);

    // =========================================================================
    // BƯỚC 7: Hủy đơn hàng PENDING và hoàn trả tồn kho (Stock Rollback - FR-10)
    // =========================================================================
    const ingredientBeforeCancel = await prisma.ingredient.findUnique({ where: { id: 1 } });
    const stockBeforeCancelOrder = ingredientBeforeCancel!.stock;
    const secondOrderRes = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        items: [{ productId: 1, size: 'S', qty: 2 }],
      })
      .expect(201);
    const secondOrderId = Number(secondOrderRes.body.orderId);
    const ingredientDuringPending = await prisma.ingredient.findUnique({ where: { id: 1 } });
    expect(ingredientDuringPending!.stock).toBe(stockBeforeCancelOrder - 40);

    const cancelRes = await request(app.getHttpServer())
      .patch(`/api/orders/${secondOrderId}/cancel`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(cancelRes.body.status).toBe('CANCELLED');
    const ingredientAfterCancel = await prisma.ingredient.findUnique({ where: { id: 1 } });
    expect(ingredientAfterCancel!.stock).toBe(stockBeforeCancelOrder);
  });
});
