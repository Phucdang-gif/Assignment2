import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestNestApp, resetAndSeedDatabase } from './test-db.helper';

describe('Orders & Payments Integration Tests (TASK-5.2 / FR-05 & FR-06 / Real PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;

  beforeAll(async () => {
    const setup = await createTestNestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await resetAndSeedDatabase(prisma);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'customer@brewlite.com', password: 'customer123' })
      .expect(201);

    customerToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    if (prisma) {
      await resetAndSeedDatabase(prisma);
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Authentication & DTO Validation Guard on Order / Payment APIs', () => {
    it('chặn tạo đơn hàng khi không có JWT Bearer Token (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          items: [{ productId: 1, size: 'M', qty: 1 }],
        })
        .expect(401);
    });

    it('chặn tạo đơn hàng khi số lượng không hợp lệ (qty < 1 -> 400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: 1, size: 'M', qty: 0 }],
        })
        .expect(400);
    });

    it('chặn thanh toán khi idempotencyKey không đúng chuẩn UUID v4 hoặc phương thức không hợp lệ (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: 1,
          amount: 35000,
          method: 'WALLET',
          idempotencyKey: 'not-a-valid-uuid',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: 1,
          amount: 35000,
          method: 'CASH',
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
        })
        .expect(400);
    });

    it('chặn thanh toán khi không có JWT (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/payments')
        .send({ orderId: 1, amount: 35000, method: 'WALLET',
                idempotencyKey: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(401);
    });
  });

  describe('2. AC-INT-01: Tạo đơn hàng trong PostgreSQL Transaction & Trừ tồn kho nguyên liệu + Khóa lạc quan', () => {
    it('tạo đơn PENDING, tính đúng giá từ DB (chống giả mạo giá), trừ Ingredient.stock và tăng Product.version', async () => {
      // Đọc trạng thái ban đầu trực tiếp từ bảng PostgreSQL thật
      const coffeeBefore = (await prisma.ingredient.findUnique({ where: { id: 1 } }))!.stock; // 5000g
      const milkBefore = (await prisma.ingredient.findUnique({ where: { id: 3 } }))!.stock; // 10000ml
      const cupMBefore = (await prisma.ingredient.findUnique({ where: { id: 12 } }))!.stock; // 500 cái
      const productBefore = (await prisma.product.findUnique({ where: { id: 1n } }))!.version; // 0

      // Đặt 2 ly Cà phê sữa đá (base 35.000) + Size M (+5.000) + Topping Trân châu (+5.000) = 45.000đ/ly
      // Tổng tạm tính: 90.000đ. Khách hàng có 50 điểm (Hạng Vàng - giảm 10% = 9.000đ) -> Tổng thanh toán: 81.000đ
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: 1,
              size: 'M',
              qty: 2,
              price: 1000, // Client cố tình gửi giá giả mạo 1.000đ -> Server phải bỏ qua và tính từ DB
              toppings: ['Trân châu đen hoàng gia'],
            },
          ],
        })
        .expect(201);

      expect(res.body.message).toBe('Tạo đơn hàng thành công');
      expect(res.body.rawTotal).toBe(90000);
      expect(res.body.discount).toBe(9000);
      expect(res.body.total).toBe(81000);
      expect(res.body.membershipTier).toBe('Vàng');

      // Kiểm tra trừ nguyên liệu thực tế trong bảng Ingredient (Size M: 25g cà phê, 35ml sữa đặc, 1 ly M mỗi ly * 2 ly)
      const coffeeAfter = (await prisma.ingredient.findUnique({ where: { id: 1 } }))!.stock;
      const milkAfter = (await prisma.ingredient.findUnique({ where: { id: 3 } }))!.stock;
      const cupMAfter = (await prisma.ingredient.findUnique({ where: { id: 12 } }))!.stock;
      const productAfter = (await prisma.product.findUnique({ where: { id: 1n } }))!.version;

      expect(coffeeAfter).toBe(coffeeBefore - 50);
      expect(milkAfter).toBe(milkBefore - 70);
      expect(cupMAfter).toBe(cupMBefore - 2);

      // Kiểm tra Optimistic Locking version tăng trong bảng Product
      expect(productAfter).toBe(productBefore + 1);
    });
  });

  describe('3. AC-INT-02: Chống bán âm kho (Stock Rollback) & Xung đột Optimistic Locking trong PostgreSQL', () => {
    it('rollback toàn bộ Transaction khi nguyên liệu không đủ (400 Bad Request)', async () => {
      const coffeeBefore = (await prisma.ingredient.findUnique({ where: { id: 1 } }))!.stock;
      const versionBefore = (await prisma.product.findUnique({ where: { id: 1n } }))!.version;

      // Đặt 99999 ly Size M (vượt xa tồn kho nguyên liệu hiện có)
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: 1, size: 'M', qty: 99999 }],
        })
        .expect(400);

      expect(res.body.message).toContain('không đủ');

      // Đảm bảo tồn kho nguyên liệu, version sản phẩm và bảng Order không bị thay đổi (Atomic Rollback trong Postgres)
      const coffeeAfter = (await prisma.ingredient.findUnique({ where: { id: 1 } }))!.stock;
      const versionAfter = (await prisma.product.findUnique({ where: { id: 1n } }))!.version;
      const ordersCount = await prisma.order.count();

      expect(coffeeAfter).toBe(coffeeBefore);
      expect(versionAfter).toBe(versionBefore);
      expect(ordersCount).toBe(0);
    });

    it('tự động retry và tạo đơn thành công khi phát hiện version đã bị thay đổi (Optimistic Concurrency Control)', async () => {
      const initialProduct = await prisma.product.findUnique({ where: { id: 1n } });
      const versionBefore = initialProduct!.version;

      // Giả lập một tiến trình khác đã cập nhật version của sản phẩm
      await prisma.product.update({
        where: { id: 1n },
        data: { version: { increment: 1 } },
      });

      // API tạo đơn hàng tự động re-read version mới và hoàn tất giao dịch
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: 1, size: 'S', qty: 1 }],
        })
        .expect(201);

      expect(res.body.message).toBe('Tạo đơn hàng thành công');

      const finalProduct = await prisma.product.findUnique({ where: { id: 1n } });
      expect(finalProduct!.version).toBe(versionBefore + 2);
    });
  });

  describe('4. AC-INT-03 & AC-INT-04: Thanh toán Idempotent (Idempotency Key) & Tích điểm Loyalty trong PostgreSQL', () => {
    it('thanh toán đơn hàng thành công (PAID), cộng điểm thưởng và chống trừ tiền trùng khi gửi lại cùng idempotencyKey', async () => {
      // Bước 1: Tạo đơn hàng 2 ly Size M + Kem cheese (35k + 5k + 10k = 50k * 2 = 100k, giảm 10% hạng Vàng = 90k)
      const orderRes = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: 1,
              size: 'M',
              qty: 2,
              toppings: ['Kem cheese (Macchiato)'],
            },
          ],
        })
        .expect(201);

      const orderId = Number(orderRes.body.orderId);
      const totalAmount = Number(orderRes.body.total); // 90.000đ
      expect(totalAmount).toBe(90000);

      // Bước 2: Gửi thanh toán với số tiền sai lệch -> Bị từ chối 400 Bad Request
      await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId,
          amount: 50000,
          method: 'WALLET',
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440099',
        })
        .expect(400);

      // Bước 3: Thanh toán lần 1 hợp lệ với idempotencyKey
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440001';
      const payRes1 = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId,
          amount: totalAmount,
          method: 'WALLET',
          idempotencyKey,
        })
        .expect(201);

      expect(payRes1.body.alreadyPaid).toBe(false);
      expect(payRes1.body.order.status).toBe('PAID');
      expect(payRes1.body.pointsEarned).toBe(9); // 90.000 / 10.000 = 9 điểm

      // Kiểm tra điểm thưởng khách hàng tăng từ 50 -> 59 và có bản ghi LoyaltyTransaction trong PostgreSQL
      const customerAfterPay1 = (await prisma.user.findUnique({
        where: { email: 'customer@brewlite.com' },
      }))!;
      expect(customerAfterPay1.loyaltyPoints).toBe(59);

      const loyaltyTxs = await prisma.loyaltyTransaction.findMany({
        where: { userId: customerAfterPay1.id },
      });
      expect(loyaltyTxs.length).toBeGreaterThanOrEqual(1);
      const latestTx = loyaltyTxs[loyaltyTxs.length - 1];
      expect(latestTx.points).toBe(9);
      expect(latestTx.type).toBe('EARN');
      expect(latestTx.balanceAfter).toBe(59);

      // Bước 4: Gửi lại request thanh toán lần 2 với CÙNG idempotencyKey (AC-INT-03)
      const payRes2 = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId,
          amount: totalAmount,
          method: 'WALLET',
          idempotencyKey,
        })
        .expect(201);

      expect(payRes2.body.idempotent).toBe(true);
      expect(payRes2.body.pointsEarned).toBe(0);
      expect(payRes2.body.payment.idempotencyKey).toBe(idempotencyKey);

      // Đảm bảo chỉ có đúng 1 bản ghi Payment trong PostgreSQL cho đơn này và điểm thưởng không bị cộng trùng
      const payments = await prisma.payment.findMany({
        where: { orderId: BigInt(orderId) },
      });
      expect(payments).toHaveLength(1);

      const customerAfterPay2 = (await prisma.user.findUnique({
        where: { email: 'customer@brewlite.com' },
      }))!;
      expect(customerAfterPay2.loyaltyPoints).toBe(59);
    });
  });
});
