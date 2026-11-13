import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestNestApp, StatefulPrismaTestHarness } from './test-db.helper';

describe('Orders & Payments Integration Tests (TASK-5.2 / FR-05 & FR-06)', () => {
  let app: INestApplication;
  let db: StatefulPrismaTestHarness;
  let customerToken: string;

  beforeEach(async () => {
    const setup = await createTestNestApp();
    app = setup.app;
    db = setup.db;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'customer@brewlite.com', password: 'customer123' })
      .expect(201);

    customerToken = loginRes.body.access_token;
  });

  afterEach(async () => {
    await app.close();
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

  describe('2. AC-INT-01: Tạo đơn hàng trong Transaction & Trừ tồn kho nguyên liệu + Khóa lạc quan', () => {
    it('tạo đơn PENDING, tính đúng giá từ DB (chống giả mạo giá), trừ Ingredient.stock và tăng Product.version', async () => {
      const coffeeBefore = db.ingredients.find((i) => i.id === 1)!.stock; // 200g
      const milkBefore = db.ingredients.find((i) => i.id === 3)!.stock; // 350ml
      const cupMBefore = db.ingredients.find((i) => i.id === 12)!.stock; // 10 cái
      const productBefore = db.products.find((p) => p.id === 1n)!.version; // 0

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
      expect(Number(res.body.orderId)).toBe(1);
      expect(res.body.rawTotal).toBe(90000);
      expect(res.body.discount).toBe(9000);
      expect(res.body.total).toBe(81000);
      expect(res.body.membershipTier).toBe('Vàng');

      // Kiểm tra trừ nguyên liệu theo công thức Size M (25g cà phê, 35ml sữa đặc, 1 ly M mỗi ly * 2 ly)
      expect(db.ingredients.find((i) => i.id === 1)!.stock).toBe(coffeeBefore - 50);
      expect(db.ingredients.find((i) => i.id === 3)!.stock).toBe(milkBefore - 70);
      expect(db.ingredients.find((i) => i.id === 12)!.stock).toBe(cupMBefore - 2);

      // Kiểm tra Optimistic Locking version tăng từ 0 -> 1
      expect(db.products.find((p) => p.id === 1n)!.version).toBe(productBefore + 1);
    });
  });

  describe('3. AC-INT-02: Chống bán âm kho (Stock Rollback) & Xung đột Optimistic Locking', () => {
    it('rollback toàn bộ Transaction khi nguyên liệu không đủ (400 Bad Request)', async () => {
      const coffeeBefore = db.ingredients.find((i) => i.id === 1)!.stock; // 200g (chỉ đủ tối đa 8 ly Size M * 25g)
      const versionBefore = db.products.find((p) => p.id === 1n)!.version;

      // Đặt 15 ly Size M (cần 375g cà phê > 200g hiện có)
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: 1, size: 'M', qty: 15 }],
        })
        .expect(400);

      expect(res.body.message).toContain('không đủ');
      // Đảm bảo tồn kho nguyên liệu, version sản phẩm và bảng Order không bị thay đổi (Atomic Rollback)
      expect(db.ingredients.find((i) => i.id === 1)!.stock).toBe(coffeeBefore);
      expect(db.products.find((p) => p.id === 1n)!.version).toBe(versionBefore);
      expect(db.orders).toHaveLength(0);
    });

    it('tự động retry và thành công khi xảy ra xung đột Optimistic Lock tạm thời', async () => {
      db.simulateVersionConflictOnce = true;

      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: 1, size: 'S', qty: 1 }],
        })
        .expect(201);

      expect(Number(res.body.orderId)).toBe(1);
      expect(db.products.find((p) => p.id === 1n)!.version).toBe(1);
    });
  });

  describe('4. AC-INT-03 & AC-INT-04: Thanh toán Idempotent (Idempotency Key) & Tích điểm Loyalty', () => {
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

      // Kiểm tra điểm thưởng khách hàng tăng từ 50 -> 59 và có bản ghi LoyaltyTransaction (AC-INT-04)
      const customerAfterPay1 = db.users.find((u) => u.email === 'customer@brewlite.com')!;
      expect(customerAfterPay1.loyaltyPoints).toBe(59);
      expect(db.loyaltyTransactions).toHaveLength(1);
      expect(db.loyaltyTransactions[0]).toEqual(
        expect.objectContaining({
          points: 9,
          type: 'EARN',
          balanceAfter: 59,
        }),
      );

      // Bước 4: Gửi lại request thanh toán lần 2 với CÙNG idempotencyKey (mô phỏng mạng lag / nhấn đúp) (AC-INT-03)
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

      // Đảm bảo chỉ có đúng 1 bản ghi Payment và điểm thưởng không bị cộng trùng lần 2
      expect(db.payments).toHaveLength(1);
      expect(db.loyaltyTransactions).toHaveLength(1);
      expect(db.users.find((u) => u.email === 'customer@brewlite.com')!.loyaltyPoints).toBe(59);
    });
  });
});
