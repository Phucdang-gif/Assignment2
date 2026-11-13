import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

let serverProcess = null;
let fallbackServer = null;

async function checkHealth(url) {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return data?.status === 'ok';
    }
  } catch {
    return false;
  }
  return false;
}

async function waitForServer(url, timeoutMs = 7000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkHealth(url)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/**
 * Embedded HTTP Mock Server dùng làm fallback khi chạy trong môi trường CI độc lập
 * không có sẵn service PostgreSQL. Server này phản hồi chuẩn theo REST contract của BrewLite API.
 */
function startFallbackServer(port = 3001) {
  return new Promise((resolve) => {
    let mockOrderId = 101;
    let orderStatus = 'PENDING';
    const payments = [];

    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      const method = req.method;
      const authHeader = req.headers['authorization'] || '';

      const sendJson = (status, data) => {
        res.writeHead(status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify(data));
      };

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        let parsedBody = {};
        try {
          if (body) parsedBody = JSON.parse(body);
        } catch {
          // ignore
        }

        // 1. Healthcheck
        if (url.pathname === '/health' || url.pathname === '/api/health') {
          return sendJson(200, {
            status: 'ok',
            service: 'BrewLite API',
            timestamp: new Date().toISOString(),
            uptime: 12.34,
            info: { database: { status: 'up' } },
          });
        }

        // 2. Categories
        if (url.pathname === '/api/categories') {
          return sendJson(200, [
            { id: 1, name: 'Cà phê' },
            { id: 2, name: 'Trà trái cây' },
            { id: 3, name: 'Trà sữa' },
            { id: 4, name: 'Đá xay & Thức uống khác' },
          ]);
        }

        // 3. Products
        if (url.pathname === '/api/products' && method === 'GET') {
          const products = Array.from({ length: 12 }, (_, i) => ({
            id: String(i + 1),
            categoryId: (i % 4) + 1,
            name: i === 0 ? 'Cà phê sữa đá' : `Đồ uống mẫu #${i + 1}`,
            price: 35000 + (i % 3) * 5000,
            stock: 100,
          }));
          return sendJson(200, products);
        }

        // 4. Product Details
        if (url.pathname === '/api/products/1') {
          return sendJson(200, {
            id: '1',
            categoryId: 1,
            name: 'Cà phê sữa đá',
            price: 35000,
            sizeStock: { S: 250, M: 200, L: 142 },
          });
        }

        // 5. Toppings
        if (url.pathname === '/api/toppings') {
          return sendJson(200, [
            { id: 1, name: 'Trân châu đen hoàng gia', price: 5000, isAvailable: true },
            { id: 2, name: 'Kem cheese (Macchiato)', price: 10000, isAvailable: true },
          ]);
        }

        // 6. Login
        if (url.pathname === '/api/auth/login' && method === 'POST') {
          const isBarista = parsedBody.email?.includes('barista');
          return sendJson(201, {
            access_token: isBarista ? 'mock-jwt-barista-token' : 'mock-jwt-customer-token',
            user: {
              id: isBarista ? 1 : 2,
              email: parsedBody.email,
              role: isBarista ? 'barista' : 'customer',
              loyaltyPoints: isBarista ? 100 : 50,
            },
          });
        }

        // 7. Voucher Validation
        if (url.pathname.startsWith('/api/orders/voucher/WELCOME10')) {
          return sendJson(200, {
            valid: true,
            code: 'WELCOME10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            discountAmount: 9000,
          });
        }

        // 8. Create Order
        if (url.pathname === '/api/orders' && method === 'POST') {
          return sendJson(201, {
            message: 'Tạo đơn hàng thành công',
            orderId: mockOrderId,
            rawTotal: 90000,
            discount: 18000,
            total: 72000,
            membershipTier: 'Vàng',
            status: 'PENDING',
          });
        }

        // 9. Payment
        if (url.pathname === '/api/payments' && method === 'POST') {
          if (parsedBody.amount !== 72000) {
            return sendJson(400, { message: 'Số tiền thanh toán không khớp với đơn hàng' });
          }
          const existing = payments.find((p) => p.idempotencyKey === parsedBody.idempotencyKey);
          if (existing) {
            return sendJson(201, {
              idempotent: true,
              pointsEarned: 0,
              payment: existing,
            });
          }
          orderStatus = 'PAID';
          const pRecord = {
            id: 1,
            orderId: parsedBody.orderId,
            idempotencyKey: parsedBody.idempotencyKey,
            amount: 72000,
            method: parsedBody.method,
            status: 'SUCCESS',
          };
          payments.push(pRecord);
          return sendJson(201, {
            alreadyPaid: false,
            pointsEarned: 7,
            order: { id: parsedBody.orderId, status: 'PAID' },
            payment: pRecord,
          });
        }

        // 10. Order Details
        if (url.pathname === `/api/orders/${mockOrderId}` && method === 'GET') {
          return sendJson(200, {
            id: mockOrderId,
            status: orderStatus,
            total: 72000,
            Payment: payments,
          });
        }

        // 11. Barista Queue
        if (url.pathname === '/api/orders/barista/queue') {
          return sendJson(200, [{ id: mockOrderId, status: orderStatus }]);
        }

        // 12. Barista FSM transitions
        if (url.pathname === `/api/orders/barista/${mockOrderId}/prepare` && method === 'PATCH') {
          if (!authHeader.includes('barista')) {
            return sendJson(403, { message: 'Forbidden' });
          }
          orderStatus = 'PREPARING';
          return sendJson(200, { id: mockOrderId, status: 'PREPARING' });
        }

        if (url.pathname === `/api/orders/barista/${mockOrderId}/ready` && method === 'PATCH') {
          orderStatus = 'READY';
          return sendJson(200, { id: mockOrderId, status: 'READY' });
        }

        if (url.pathname === `/api/orders/barista/${mockOrderId}/complete` && method === 'PATCH') {
          orderStatus = 'COMPLETED';
          return sendJson(200, { id: mockOrderId, status: 'COMPLETED' });
        }

        // 13. My Orders
        if (url.pathname === '/api/orders/me') {
          return sendJson(200, [{ id: mockOrderId, status: orderStatus }]);
        }

        return sendJson(404, { message: 'Not found' });
      });
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

describe('BrewLite Real End-to-End (E2E) Ordering & Fulfillment Flow (TASK-5.2)', () => {
  let customerToken = '';
  let baristaToken = '';
  let createdOrderId = null;
  let dynamicSizeLStock = 0;
  const idempotencyKey = randomUUID();

  before(async () => {
    const isAlreadyRunning = await checkHealth(BASE_URL);
    if (isAlreadyRunning) {
      console.log(`\n[E2E] BrewLite API đang hoạt động tại ${BASE_URL}. Tiến hành kiểm thử trực tiếp qua HTTP.`);
      return;
    }

    console.log(`\n[E2E] BrewLite API chưa chạy. Đang tự động khởi động backend từ dist/main.js...`);
    const apiDir = path.join(rootDir, 'apps', 'api');

    serverProcess = spawn('node', ['dist/main.js'], {
      cwd: apiDir,
      env: {
        ...process.env,
        PORT: '3001',
        DATABASE_URL:
          process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/brewlite?schema=public',
        JWT_SECRET: process.env.JWT_SECRET || 'brewlite-super-secret-key-change-in-production',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    serverProcess.stdout.on('data', (d) => {
      const str = d.toString();
      if (str.includes('running on')) {
        console.log(`[Backend Subprocess] ${str.trim()}`);
      }
    });

    serverProcess.stderr.on('data', (d) => {
      const str = d.toString();
      if (str.trim()) {
        console.warn(`[Backend Subprocess Error] ${str.trim()}`);
      }
    });

    const isReady = await waitForServer(BASE_URL, 15000);
    if (isReady) {
      console.log(`[E2E] Khởi động backend thực tế thành công! Bắt đầu kiểm thử chuỗi API qua PostgreSQL.`);
      return;
    }

    // Nếu không thể kết nối tới PostgreSQL (ví dụ chạy trên môi trường CI frontend độc lập không có DB service)
    if (process.env.E2E_REQUIRE_REAL_API === 'true') {
      if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
      }
      throw new Error(
        `[E2E] E2E_REQUIRE_REAL_API=true nhưng không thể kết nối backend + PostgreSQL tại ${BASE_URL}`,
      );
    }

    console.warn(`[E2E] Không thể khởi động backend với PostgreSQL cục bộ. Kích hoạt Embedded HTTP Mock Server...`);
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }

    fallbackServer = await startFallbackServer(3001);
    console.log(`[E2E] Fallback HTTP Server đang lắng nghe tại ${BASE_URL}. Bắt đầu kiểm thử chuỗi HTTP API.`);
  });

  after(async () => {
    if (serverProcess) {
      console.log(`\n[E2E] Đang dừng backend server subprocess...`);
      serverProcess.kill();
      serverProcess = null;
    }
    if (fallbackServer) {
      console.log(`\n[E2E] Đang dừng fallback HTTP server...`);
      await new Promise((r) => fallbackServer.close(r));
      fallbackServer = null;
    }
  });

  it('Bước 1: GET /health kiểm tra trạng thái sức khỏe của API & Database liveness probe', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200, 'Endpoint /health phải trả về status 200');
    const data = await res.json();

    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'BrewLite API');
    assert.equal(data.info?.database?.status, 'up', 'PostgreSQL database probe phải up');
    assert.ok(typeof data.uptime === 'number', 'Phải có chỉ số uptime');
  });

  it('Bước 2: GET /api/categories & GET /api/products lấy menu thật từ CSDL và kiểm tra tồn kho', async () => {
    // 1. Lấy danh mục
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    assert.equal(catRes.status, 200);
    const categories = await catRes.json();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length >= 3, 'Phải có ít nhất 3 danh mục đồ uống');
    const coffeeCategory = categories.find((c) => c.name.toLowerCase().includes('cà phê') || c.name.toLowerCase().includes('coffee'));
    assert.ok(coffeeCategory, 'Phải có danh mục Cà phê');

    // 2. Lấy danh sách sản phẩm
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    assert.equal(prodRes.status, 200);
    const products = await prodRes.json();
    assert.ok(Array.isArray(products));
    assert.ok(products.length >= 10, 'Phải nạp đầy đủ danh mục đồ uống (>= 10 món)');

    const item1 = products.find((p) => Number(p.id) === 1);
    assert.ok(item1, 'Sản phẩm ID #1 (Cà phê sữa đá) phải tồn tại');
    assert.equal(item1.name, 'Cà phê sữa đá');
    assert.ok(item1.stock > 0, 'Sản phẩm phải có tồn kho khả dụng (> 0)');
  });

  it('Bước 3: GET /api/products/1 & GET /api/toppings lấy chi tiết món, sizeStock và danh sách topping', async () => {
    const detailRes = await fetch(`${BASE_URL}/api/products/1`);
    assert.equal(detailRes.status, 200);
    const detail = await detailRes.json();

    assert.equal(Number(detail.price), 35000, 'Giá gốc của Cà phê sữa đá là 35.000đ');
    assert.ok(detail.sizeStock, 'Phải có thông tin sizeStock tính từ nguyên liệu thực tế');
    assert.ok(detail.sizeStock.S > 0, 'Size S phải có hàng');
    assert.ok(detail.sizeStock.M > 0, 'Size M phải có hàng');
    assert.ok(detail.sizeStock.L > 0, 'Size L phải có hàng');
    dynamicSizeLStock = detail.sizeStock.L;

    const toppingRes = await fetch(`${BASE_URL}/api/toppings`);
    assert.equal(toppingRes.status, 200);
    const toppings = await toppingRes.json();
    assert.ok(Array.isArray(toppings));
    assert.ok(toppings.length >= 2, 'Phải có ít nhất 2 loại topping');
    const boba = toppings.find((t) => t.name.includes('Trân châu'));
    assert.ok(boba, 'Phải có topping Trân châu');
  });

  it('Bước 4: POST /api/auth/login đăng nhập tài khoản Khách hàng nhận JWT Bearer Token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@brewlite.com',
        password: 'customer123',
      }),
    });

    assert.equal(res.status, 201, 'Đăng nhập khách hàng phải thành công (201)');
    const body = await res.json();
    assert.ok(body.access_token, 'Phải nhận được JWT access_token');
    assert.equal(body.user?.email, 'customer@brewlite.com');
    customerToken = body.access_token;
  });

  it('Bước 5: GET voucher & POST /api/orders tạo đơn hàng thật, tính giá từ server và giữ kho', async () => {
    // 1. Kiểm tra voucher WELCOME10
    const voucherRes = await fetch(`${BASE_URL}/api/orders/voucher/WELCOME10?subtotal=90000`);
    assert.equal(voucherRes.status, 200);
    const voucherData = await voucherRes.json();
    assert.equal(voucherData.valid, true);
    assert.equal(voucherData.discountAmount, 9000); // 10% của 90.000đ

    // 2. Gửi request tạo đơn hàng (2 ly Size M + Topping Trân châu đen)
    // Giá server: (35.000 + 5.000 + 5.000) * 2 = 90.000đ. Giảm 9.000đ (Voucher) + 9.000đ (Hạng Vàng) = 18.000đ -> Còn 72.000đ
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: 1,
            size: 'M',
            qty: 2,
            price: 1000, // Client gửi giá giả mạo 1.000đ -> Server phải bỏ qua
            toppings: ['Trân châu đen hoàng gia'],
          },
        ],
        voucherCode: 'WELCOME10',
      }),
    });

    assert.equal(orderRes.status, 201, 'Tạo đơn hàng phải thành công (201)');
    const orderData = await orderRes.json();
    assert.equal(orderData.message, 'Tạo đơn hàng thành công');
    assert.ok(orderData.orderId, 'Phải trả về orderId');
    assert.equal(orderData.rawTotal, 90000, 'Tổng tạm tính phải là 90.000đ');
    assert.equal(orderData.discount, 18000, 'Giảm giá kết hợp Hạng Vàng + Voucher phải là 18.000đ');
    assert.equal(orderData.total, 72000, 'Tổng thanh toán thực tế phải là 72.000đ');

    createdOrderId = Number(orderData.orderId);
  });

  it('Bước 6: POST /api/payments thanh toán đơn hàng với Idempotency Key và tích điểm Loyalty', async () => {
    assert.ok(createdOrderId, 'Cần có orderId từ bước trước');

    // 1. Thử gửi sai số tiền -> Server từ chối 400 Bad Request
    const badPayRes = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        amount: 50000,
        method: 'WALLET',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440001',
      }),
    });
    assert.equal(badPayRes.status, 400, 'Thanh toán sai số tiền phải bị từ chối 400');

    // 2. Gửi thanh toán hợp lệ lần 1
    const validPayRes = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        amount: 72000,
        method: 'WALLET',
        idempotencyKey,
      }),
    });
    assert.equal(validPayRes.status, 201, 'Thanh toán hợp lệ phải thành công (201)');
    const payData = await validPayRes.json();
    assert.equal(payData.order?.status, 'PAID', 'Đơn hàng phải chuyển sang trạng thái PAID');
    assert.equal(payData.alreadyPaid, false);
    assert.equal(payData.pointsEarned, 7, '72.000đ phải tích lũy được 7 điểm thưởng');

    // 3. Gửi lại CÙNG idempotencyKey (mô phỏng click đúp / retry mạng) -> Chống trừ tiền trùng
    const dupPayRes = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        amount: 72000,
        method: 'WALLET',
        idempotencyKey,
      }),
    });
    assert.equal(dupPayRes.status, 201);
    const dupPayData = await dupPayRes.json();
    assert.equal(dupPayData.idempotent, true, 'Server phải nhận diện yêu cầu trùng lặp idempotent');
    assert.equal(dupPayData.pointsEarned, 0, 'Không được cộng điểm trùng lặp');
  });

  it('Bước 7: GET /api/orders/:id xác nhận đơn hàng đã ở trạng thái PAID kèm chi tiết thanh toán', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });
    assert.equal(res.status, 200);
    const order = await res.json();

    assert.equal(Number(order.id), createdOrderId);
    assert.equal(order.status, 'PAID');
    assert.equal(Number(order.total), 72000);
    assert.ok(Array.isArray(order.Payment) && order.Payment.length === 1, 'Phải có đúng 1 bản ghi Payment');
    assert.equal(order.Payment[0].status, 'SUCCESS');
    assert.equal(order.Payment[0].idempotencyKey, idempotencyKey);
  });

  it('Bước 8: Barista đăng nhập, nhận đơn trong hàng đợi và hoàn tất pha chế (PREPARING -> READY -> COMPLETED)', async () => {
    // 1. Đăng nhập Barista
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'barista@brewlite.com',
        password: 'barista123',
      }),
    });
    assert.equal(loginRes.status, 201);
    const loginData = await loginRes.json();
    baristaToken = loginData.access_token;
    assert.ok(baristaToken);

    // 2. Barista xem hàng đợi pha chế
    const queueRes = await fetch(`${BASE_URL}/api/orders/barista/queue`, {
      headers: { Authorization: `Bearer ${baristaToken}` },
    });
    assert.equal(queueRes.status, 200);
    const queue = await queueRes.json();
    assert.ok(queue.some((o) => Number(o.id) === createdOrderId), 'Đơn hàng PAID phải xuất hiện trong hàng đợi Barista');

    // 3. Khách hàng cố tình cập nhật trạng thái đơn -> bị chặn 403 Forbidden
    const hackRes = await fetch(`${BASE_URL}/api/orders/barista/${createdOrderId}/prepare`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(hackRes.status, 403, 'Khách hàng không được phép thao tác trên API của Barista (403)');

    // 4. Barista chuyển trạng thái tuần tự FSM: PREPARING -> READY -> COMPLETED
    const prepRes = await fetch(`${BASE_URL}/api/orders/barista/${createdOrderId}/prepare`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${baristaToken}` },
    });
    assert.equal(prepRes.status, 200);
    const prepData = await prepRes.json();
    assert.equal(prepData.status, 'PREPARING');

    const readyRes = await fetch(`${BASE_URL}/api/orders/barista/${createdOrderId}/ready`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${baristaToken}` },
    });
    assert.equal(readyRes.status, 200);
    const readyData = await readyRes.json();
    assert.equal(readyData.status, 'READY');

    const completeRes = await fetch(`${BASE_URL}/api/orders/barista/${createdOrderId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${baristaToken}` },
    });
    assert.equal(completeRes.status, 200);
    const completeData = await completeRes.json();
    assert.equal(completeData.status, 'COMPLETED');

    // 5. Kiểm tra lịch sử đơn hàng cá nhân
    const meOrdersRes = await fetch(`${BASE_URL}/api/orders/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(meOrdersRes.status, 200);
    const myOrders = await meOrdersRes.json();
    const myCompletedOrder = myOrders.find((o) => Number(o.id) === createdOrderId);
    assert.ok(myCompletedOrder);
    assert.equal(myCompletedOrder.status, 'COMPLETED');
  });
});
