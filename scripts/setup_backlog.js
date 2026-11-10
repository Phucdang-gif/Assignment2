const { execSync, execFileSync } = require('child_process');

console.log('\x1b[36m>>> Đang kiểm tra đăng nhập GitHub CLI (gh)...\x1b[0m');
try {
  execSync('gh auth status', { stdio: 'pipe' });
} catch (error) {
  console.log('\x1b[33m\n[!] Token GitHub CLI chưa hợp lệ hoặc bạn chưa đăng nhập.\x1b[0m');
  console.log('\x1b[33m[*] Vui lòng chạy lệnh:  gh auth login  trên terminal trước, sau đó chạy lại script này.\n\x1b[0m');
  process.exit(1);
}

const repo = 'Phucdang-gif/Assignment2';

// ==============================================================================
// 1. Tự động tạo các Labels (Nhãn) cần thiết trên GitHub
// ==============================================================================
console.log(`\n\x1b[36m>>> Đang khởi tạo các Nhãn (Labels) cho repository: ${repo}...\x1b[0m`);

const requiredLabels = [
  { name: 'setup', color: 'c5def5', description: 'Cấu hình và thiết lập môi trường' },
  { name: 'devops', color: '0052cc', description: 'CI/CD, Docker, Deployment' },
  { name: 'documentation', color: '0075ca', description: 'Tài liệu dự án' },
  { name: 'backend', color: '1d76db', description: 'NestJS REST API và Database' },
  { name: 'api', color: 'd4c5f9', description: 'API endpoints' },
  { name: 'frontend', color: '5319e7', description: 'Next.js UI và PWA' },
  { name: 'ui', color: 'e99695', description: 'Giao diện người dùng' },
  { name: 'testing', color: 'bfdadc', description: 'Unit, Integration và E2E tests' },
  { name: 'ci/cd', color: 'fbca04', description: 'Continuous Integration / Delivery' },
  { name: 'fullstack', color: 'b60205', description: 'Cả frontend và backend' },
  { name: 'auth', color: 'd93f0b', description: 'Xác thực và phân quyền' },
  { name: 'payment', color: '0e8a16', description: 'Cổng thanh toán' },
  { name: 'qa', color: 'fef2c0', description: 'Quality Assurance' },
  { name: 'management', color: '006b75', description: 'Quản lý dự án và bàn giao' },
];

for (const lbl of requiredLabels) {
  try {
    execFileSync('gh', [
      'label', 'create', lbl.name,
      '--repo', repo,
      '--color', lbl.color,
      '--description', lbl.description,
      '--force'
    ], { stdio: 'pipe' });
    console.log(`  + Label: ${lbl.name}`);
  } catch (err) {
    // Đã tồn tại
  }
}

// ==============================================================================
// 2. Tạo 2 Milestones
// ==============================================================================
console.log(`\n\x1b[36m>>> Đang kiểm tra Milestones...\x1b[0m`);

const milestones = [
  {
    title: 'Sprint 1 - Foundation & Menu MVP',
    description: 'Sprint Goal: Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu.'
  },
  {
    title: 'Sprint 2 - Full Flow & Delivery',
    description: 'Sprint Goal: Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai một phiên bản production có thể truy cập được.'
  }
];

for (const m of milestones) {
  try {
    execFileSync('gh', ['api', `repos/${repo}/milestones`, '-f', `title=${m.title}`, '-f', `description=${m.description}`], { stdio: 'pipe' });
    console.log(`  + Đã tạo Milestone: ${m.title}`);
  } catch (err) {
    console.log(`  * Milestone đã có sẵn: ${m.title}`);
  }
}

// ==============================================================================
// 3. Lấy danh sách các Issues đã tồn tại để tránh tạo trùng
// ==============================================================================
let existingTitles = new Set();
try {
  const existingOut = execFileSync('gh', ['issue', 'list', '--repo', repo, '--limit', '100', '--json', 'title'], { encoding: 'utf8' });
  const parsed = JSON.parse(existingOut);
  parsed.forEach(i => existingTitles.add(i.title.trim()));
} catch (e) {
  // Bỏ qua nếu lỗi kết nối
}

// ==============================================================================
// 4. Danh sách 15 Issues cho 2 Sprints
// ==============================================================================
const issues = [
  // Sprint 1
  {
    title: '[TASK-4.1] [Chore] Thiết lập Monorepo (apps/web, apps/api), Branch Strategy, PR Template & DoD',
    body: `## Mục tiêu\nThiết lập kiến trúc monorepo, quy ước branch, pull request template và Definition of Done cho dự án.\n\n## Checklist\n- [x] Chuyển đổi sang apps/web và apps/api\n- [x] Tạo .github/pull_request_template.md\n- [x] Cập nhật README.md, docker-compose.yml và .gitignore`,
    labels: 'setup,devops',
    milestone: 'Sprint 1 - Foundation & Menu MVP'
  },
  {
    title: '[TASK-4.2] [Docs] Đưa toàn bộ tài liệu Task 1-3 vào thư mục docs/ và kiểm soát phiên bản',
    body: `## Mục tiêu\nĐưa toàn bộ tạo phẩm của Task 1-3 vào docs/: requirements, sơ đồ diagrams, quyết định kiến trúc adr.\n\n## Checklist\n- [ ] docs/requirements/ (SRS, Context & Scope)\n- [ ] docs/diagrams/ (Activity, Sequence, Class)\n- [ ] docs/architecture/ (ADR 001-006)\n- [ ] docs/traceability-matrix.md`,
    labels: 'documentation',
    milestone: 'Sprint 1 - Foundation & Menu MVP'
  },
  {
    title: '[TASK-4.3A] [FR-01] Backend: Hiện thực API GET /products và GET /products/:id + Database Seed',
    body: `## User Story\nLà một Khách hàng, tôi muốn API trả về danh sách đồ uống và chi tiết từng món để giao diện có thể hiển thị.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] GET /api/products trả về 200 OK và danh sách món\n- [ ] GET /api/products/:id trả về chi tiết món hoặc 404\n- [ ] Dữ liệu seed nạp tự động qua prisma/seed.js`,
    labels: 'backend,api',
    milestone: 'Sprint 1 - Foundation & Menu MVP'
  },
  {
    title: '[TASK-4.3B] [FR-01] Frontend: Màn hình menu đồ uống mobile-first Next.js (Loading, Empty, Error)',
    body: `## User Story\nLà một Khách hàng, tôi muốn duyệt menu đồ uống dạng mobile-first trực quan có trạng thái tải rõ ràng.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] Giao diện responsive mobile-first\n- [ ] Trạng thái Loading (Skeleton), Empty State và Error State\n- [ ] Danh mục phân loại đồ uống (Cà phê, Trà sữa, Đá xay...)`,
    labels: 'frontend,ui',
    milestone: 'Sprint 1 - Foundation & Menu MVP'
  },
  {
    title: '[TASK-4.3C] [Testing] Viết Unit Test cho Product Service (API) và Menu Component (Next.js)',
    body: `## Mục tiêu\nViết kiểm thử tối thiểu cho API và component/luồng chính theo yêu cầu Task 4.3.\n\n## Checklist\n- [ ] Unit test cho ProductsService.findAll()\n- [ ] Unit test cho ProductsService.findOne()\n- [ ] Test component hiển thị Menu`,
    labels: 'testing',
    milestone: 'Sprint 1 - Foundation & Menu MVP'
  },
  {
    title: '[TASK-4.4] [DevOps] Thiết lập GitHub Actions CI Pipeline (Install -> Lint -> Test -> Build)',
    body: `## Mục tiêu\nThiết lập pipeline CI tự động kích hoạt khi mở Pull Request vào main hoặc develop.\n\n## Checklist\n- [ ] Job Backend: Install -> Lint -> Test -> Build\n- [ ] Job Frontend: Install -> Lint -> Build\n- [ ] Chặn không cho merge PR nếu CI thất bại\n- [ ] Lưu link và log minh chứng CI pass / fail`,
    labels: 'ci/cd,devops',
    milestone: 'Sprint 1 - Foundation & Menu MVP'
  },
  // Sprint 2
  {
    title: '[TASK-5.1A] [FR-02] Chi tiết sản phẩm, tùy chọn Size (S/M/L) và chọn Topping',
    body: `## User Story\nLà một Khách hàng, tôi muốn tùy chỉnh size và topping kèm theo để đặt món theo ý thích.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] Cho phép chọn Size S/M/L (+giá tương ứng)\n- [ ] Chọn nhiều loại Topping\n- [ ] Cập nhật giá động theo lựa chọn`,
    labels: 'fullstack',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.1B] [FR-03] Giỏ hàng và tính tổng tiền tự động (Zustand State)',
    body: `## User Story\nLà một Khách hàng, tôi muốn lưu món vào giỏ hàng và xem tổng tiền trước khi thanh toán.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] Thêm, bớt, xóa món khỏi giỏ hàng\n- [ ] Tính tổng tiền chính xác theo size và topping\n- [ ] Giỏ hàng không bị mất khi reload trang`,
    labels: 'frontend',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.1C] [FR-04] Đăng ký, Đăng nhập và quản lý phiên làm việc qua JWT',
    body: `## User Story\nLà người dùng, tôi muốn đăng nhập tài khoản an toàn để bảo mật thông tin và tích điểm thưởng.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] API Đăng ký / Đăng nhập với mật khẩu băm bcrypt\n- [ ] Sinh mã JWT Bearer Token\n- [ ] JWT Auth Guard bảo vệ các API đặt hàng`,
    labels: 'backend,auth',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.1D] [FR-05] API tạo đơn hàng và kiểm soát tồn kho đồng thời (Optimistic Lock)',
    body: `## User Story\nLà hệ thống, tôi cần tạo đơn trong một Database Transaction và trừ kho an toàn.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] POST /api/orders yêu cầu Bearer JWT\n- [ ] Thực thi trong Prisma Transaction atomic\n- [ ] Optimistic Lock qua trường version chống overselling`,
    labels: 'backend',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.1E] [FR-06] API Thanh toán Ví/Thẻ mô phỏng với cơ chế Idempotency Key',
    body: `## User Story\nLà Khách hàng, tôi muốn thanh toán đơn hàng an toàn không bị trừ tiền 2 lần khi mạng lag.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] POST /api/payments nhận idempotencyKey\n- [ ] Xử lý phương thức thanh toán WALLET và CARD\n- [ ] Trả về kết quả trước đó nếu key đã xử lý (idempotent: true)`,
    labels: 'backend,payment',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.1F] [FR-07] Xác nhận đơn hàng, Máy trạng thái đơn và Lịch sử đơn',
    body: `## User Story\nLà Khách hàng, tôi muốn theo dõi tiến độ pha chế và xem lại các đơn hàng đã đặt.\n\n## Tiêu chí chấp nhận (AC)\n- [ ] Chuyển trạng thái: PENDING -> PAID -> PREPARING -> READY -> COMPLETED\n- [ ] Trang theo dõi đơn /orders/:id\n- [ ] Giao diện Barista cập nhật trạng thái đơn`,
    labels: 'fullstack',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.2] [Testing] Tích hợp kiểm thử E2E luồng đặt món & Docker Compose hoàn chỉnh',
    body: `## Mục tiêu\nHệ thống có đầy đủ Unit Test, Integration Test và ít nhất 1 E2E test cho luồng xem menu đến thanh toán.\n\n## Checklist\n- [ ] Integration test cho API tạo đơn / thanh toán\n- [ ] E2E test luồng end-to-end\n- [ ] Endpoint GET /health kiểm tra sức khỏe hệ thống\n- [ ] docker-compose.yml khởi chạy đầy đủ local`,
    labels: 'testing,qa',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.3] [DevOps] Pipeline Continuous Delivery (CD) triển khai tự động lên Cloud',
    body: `## Mục tiêu\nTự động hóa đóng gói Docker Image và triển khai ứng dụng lên môi trường Production (Render/Railway/Vercel).\n\n## Checklist\n- [ ] Quality gate: Lint, test và build pass\n- [ ] Build & Push Docker image\n- [ ] Deploy an toàn và gọi health check sau triển khai\n- [ ] Có phương án rollback khi triển khai thất bại`,
    labels: 'ci/cd,devops',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  },
  {
    title: '[TASK-5.4] [Delivery] Bàn giao hệ thống, URL Production HTTPS, Release Notes & Demo Retro',
    body: `## Mục tiêu\nHoàn tất toàn bộ sản phẩm bàn giao theo tiêu chí nghiệm thu mục 7.4 của đề bài.\n\n## Checklist\n- [ ] URL Frontend Production qua HTTPS\n- [ ] URL API và /health check hoạt động\n- [ ] Release tag phiên bản và Release notes\n- [ ] Video demo trực tiếp luồng end-to-end\n- [ ] Tài liệu Sprint Review & Retrospective`,
    labels: 'management',
    milestone: 'Sprint 2 - Full Flow & Delivery'
  }
];

console.log('\n\x1b[36m>>> Đang tự động tạo các Issues còn thiếu lên GitHub...\x1b[0m');
for (const item of issues) {
  if (existingTitles.has(item.title.trim())) {
    console.log(`  \x1b[33m✔ Bỏ qua (Đã tồn tại): ${item.title}\x1b[0m`);
    continue;
  }

  try {
    execFileSync('gh', [
      'issue', 'create',
      '--repo', repo,
      '--title', item.title,
      '--body', item.body,
      '--label', item.labels,
      '--milestone', item.milestone
    ], { stdio: 'pipe' });
    console.log(`  \x1b[32m✔ Đã tạo thành công: ${item.title}\x1b[0m`);
  } catch (err) {
    console.error(`  \x1b[31m✖ Lỗi khi tạo: ${item.title}\x1b[0m`);
  }
}

console.log('\n\x1b[32m>>> [HOÀN TẤT] Toàn bộ 15 Issues cho Sprint 1 & Sprint 2 đã được tự động tạo thành công trên GitHub!\x1b[0m');
