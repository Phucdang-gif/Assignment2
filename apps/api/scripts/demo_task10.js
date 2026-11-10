
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const validTransitions = {
  PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

function assertTransition(orderId, currentStatus, newStatus) {
  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `[INVALID TRANSITION] Đơn hàng #${orderId}: Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}"!`,
    );
  }
}

async function runStateMachineDemo() {
  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN} 1. DEMO ORDER STATE MACHINE (Chu trình xử lý đơn hàng chuẩn)${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  console.log(`${BOLD}${YELLOW}Sơ đồ trạng thái:${RESET} ${GREEN}PENDING${RESET} -> ${GREEN}PAID${RESET} -> ${GREEN}PREPARING${RESET} -> ${GREEN}READY${RESET} -> ${GREEN}COMPLETED${RESET}\n`);

  let currentStatus = 'PENDING';
  const orderId = 101;

  console.log(`[Bước 1] Khách hàng tạo đơn #${orderId}:`);
  console.log(`         Trạng thái ban đầu: ${BOLD}${YELLOW}[${currentStatus}]${RESET} (Chờ thanh toán)`);
  await sleep(400);

  const steps = [
    { target: 'PAID', action: 'Khách hàng quét mã VietQR PayOS thanh toán thành công' },
    { target: 'PREPARING', action: 'Barista tiếp nhận đơn và bắt đầu pha chế đồ uống' },
    { target: 'READY', action: 'Pha chế hoàn tất, thông báo mời khách nhận đồ uống' },
    { target: 'COMPLETED', action: 'Khách hàng nhận đồ uống tại quầy, hoàn tất đơn hàng' },
  ];

  for (const step of steps) {
    try {
      assertTransition(orderId, currentStatus, step.target);
      console.log(`\n[Chuyển đổi] ${step.action}:`);
      console.log(`             ${BOLD}${currentStatus}${RESET} ➔ ${BOLD}${GREEN}${step.target}${RESET}  ✔ [HỢP LỆ THEO STATE MACHINE]`);
      currentStatus = step.target;
      await sleep(350);
    } catch (err) {
      console.log(`             ${BOLD}${RED}✘ ${err.message}${RESET}`);
    }
  }

  console.log(`\n${BOLD}${GREEN}✔ Chu trình hoàn tất: (PENDING -> PAID -> PREPARING -> READY -> COMPLETED)${RESET}\n`);

  console.log(`${BOLD}${YELLOW}Kiểm tra bảo vệ State Machine (Chặn chuyển trạng thái sai quy trình):${RESET}`);
  const invalidTests = [
    { from: 'PENDING', to: 'COMPLETED', reason: 'Nhảy cóc bước thanh toán & pha chế' },
    { from: 'PENDING', to: 'READY', reason: 'Chưa pha chế' },
    { from: 'COMPLETED', to: 'PENDING', reason: 'Đơn đã hoàn tất không thể quay lại' },
    { from: 'CANCELLED', to: 'PAID', reason: 'Đơn đã hủy không thể thanh toán' },
  ];

  for (const test of invalidTests) {
    try {
      assertTransition(orderId, test.from, test.to);
      console.log(`  ✘ LỖI: Lẽ ra phải chặn ${test.from} -> ${test.to}`);
    } catch {
      console.log(`  ${RED}✘ CHẶN THÀNH CÔNG:${RESET} ${test.from} -> ${test.to} (${test.reason}) ➔ ${BOLD}${GREEN}ĐÃ BẢO VỆ TOÀN VẸN${RESET}`);
    }
  }
}

async function runTransactionLockDemo() {
  console.log(`\n${BOLD}${MAGENTA}======================================================================${RESET}`);
  console.log(`${BOLD}${MAGENTA} 2. DEMO TRANSACTION LOCK & KIỂM SOÁT TỒN KHO ĐỒNG THỜI${RESET}`);
  console.log(`${BOLD}${MAGENTA}======================================================================${RESET}\n`);

  let productDb = {
    id: 1,
    name: 'Trà sữa Oolong nướng',
    price: 42000,
    stock: 1,
    version: 0,    // Version counter cho Optimistic Locking
  };

  console.log(`${BOLD}Trạng thái sản phẩm ban đầu trong Database:${RESET}`);
  console.log(`- Tên sản phẩm: ${productDb.name}`);
  console.log(`- Tồn kho còn lại (Stock): ${BOLD}${YELLOW}${productDb.stock}${RESET}`);
  console.log(`- Phiên bản khóa (Version): ${BOLD}${YELLOW}${productDb.version}${RESET}\n`);

  console.log(`${BOLD}${CYAN}[Mô phỏng Race Condition]${RESET} 2 khách hàng đồng thời bấm "Đặt hàng" vào cùng 1 thời điểm:\n`);

  async function simulateOrderTransaction(clientId, qtyRequested) {
    console.log(`  [Client ${clientId}] ➔ Bắt đầu Prisma.$transaction...`);
    const currentVersion = productDb.version;
    const currentStock = productDb.stock;

    console.log(`  [Client ${clientId}] ➔ Đọc sản phẩm: Stock = ${currentStock}, Version = ${currentVersion}`);
    await sleep(200);

    console.log(`  [Client ${clientId}] ➔ Thực thi UPDATE với Transaction Lock:`);
    console.log(`                   WHERE id = 1 AND version = ${currentVersion} AND stock >= ${qtyRequested}`);

    if (productDb.version === currentVersion && productDb.stock >= qtyRequested) {
      productDb.stock -= qtyRequested;
      productDb.version += 1;
      console.log(`  [Client ${clientId}] ➔ ${BOLD}${GREEN}✔ TRANSACTION COMMIT THÀNH CÔNG!${RESET}`);
      console.log(`                   Tồn kho mới: ${productDb.stock}, Version mới: ${productDb.version}`);
      return { success: true, clientId };
    } else {
      console.log(`  [Client ${clientId}] ➔ ${BOLD}${RED}✘ TRANSACTION ROLLBACK (XUNG ĐỘT KHÓA / VERSION MISMATCH)!${RESET}`);
      console.log(`                   Lỗi 409 ConflictException: Sản phẩm đã bị giao dịch khác thay đổi.`);
      return { success: false, clientId };
    }
  }

  const [resA, resB] = await Promise.all([
    simulateOrderTransaction('A (Khách hàng 1)', 1),
    simulateOrderTransaction('B (Khách hàng 2)', 1),
  ]);

  console.log(`\n${BOLD}============================== KẾT QUẢ ==============================${RESET}`);
  console.log(`- Client A: ${resA.success ? GREEN + 'THÀNH CÔNG (Tạo đơn thành công)' : RED + 'THẤT BẠI'} ${RESET}`);
  console.log(`- Client B: ${resB.success ? GREEN + 'THÀNH CÔNG' : RED + 'BỊ CHẶN BỞI TRANSACTION LOCK (Không bị bán âm kho!)'} ${RESET}`);
  console.log(`- Tồn kho cuối cùng trong DB: ${BOLD}${GREEN}${productDb.stock}${RESET} (Không bao giờ bị âm!)`);
  console.log(`${BOLD}${GREEN}✔ Đã bảo vệ toàn vẹn dữ liệu thành công bằng Transaction Lock & Optimistic OCC!${RESET}\n`);
}

async function main() {
  await runStateMachineDemo();
  await sleep(500);
  await runTransactionLockDemo();
}

main();
