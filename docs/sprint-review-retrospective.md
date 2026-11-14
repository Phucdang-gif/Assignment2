# Sprint Review & Sprint Retrospective – BrewLite Assignment 2

> **Dự án**: BrewLite – Ứng dụng Đặt Cà phê Không dùng Tiền mặt (Cashless Coffee Ordering System)  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Repository**: [`Phucdang-gif/Assignment2`](https://github.com/Phucdang-gif/Assignment2)  
> **Phiên bản phát hành**: `v1.0.0` (Sprint 2 Production Delivery)

---

## 1. Tổng Quan Tiến Độ Agile / Scrum (2 Sprints)

Dự án được tổ chức theo mô hình phát triển lặp tăng trưởng qua **2 Sprints** gắn với **2 Milestones** và **15 Issues** trên GitHub Projects:

| Sprint | Milestone | Sprint Goal (Mục tiêu Sprint) | Số Issues | Trạng thái |
| :---: | :--- | :--- | :---: | :---: |
| **Sprint 1** | `Sprint 1 - Foundation & Menu MVP` | Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu. | `#1` – `#6` (6/6) | Hoàn thành 100% |
| **Sprint 2** | `Sprint 2 - Full Flow & Delivery` | Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai một phiên bản production có thể truy cập được. | `#7` – `#15` (9/9) | Hoàn thành 100% |

---

## 2. Sprint 1 Review (Task 4.1 – Task 4.4)

### 2.1. Kết quả hoàn thành Backlog Sprint 1

| Issue | Mã Task / Yêu cầu | Nội dung bàn giao | Pull Request / Minh chứng | Kết quả DoD |
| :---: | :--- | :--- | :--- | :---: |
| **#1** | `TASK-4.1` | Thiết lập Monorepo (`apps/web`, `apps/api`, `docs/`), Branch Strategy, PR Template, `.gitignore`, `.env.example`, `docker-compose.yml` | PR `#16`, PR `#23` | Đạt |
| **#2** | `TASK-4.2` | Đưa toàn bộ tạo phẩm Task 1–3 (`requirements/`, `diagrams/`, `architecture/adr/`, `deployment.md`, `traceability-matrix.md`) vào kiểm soát phiên bản | PR `#17`, `#20`, `#25`–`#29` | Đạt |
| **#3** | `TASK-4.3A` (`FR-01`) | API `GET /api/products`, `GET /api/products/:id`, `GET /api/categories`, Prisma Schema & `prisma/seed.js` | PR `#17`, PR `#25` | Đạt |
| **#4** | `TASK-4.3B` (`FR-01`) | Giao diện Menu Mobile-First / PWA bằng Next.js 16 với đầy đủ 3 trạng thái **Loading (Skeleton), Empty State, Error Alert** | PR `#17` | Đạt |
| **#5** | `TASK-4.3C` | Unit test cho `ProductsService` (`API-T01`) và `AppController` | PR `#17`, PR `#19` | Đạt |
| **#6** | `TASK-4.4` (`NFR-05`) | GitHub Actions CI Pipeline (`.github/workflows/ci.yml`): `Install ➔ Lint ➔ Unit Test ➔ Build` + minh chứng PR Pass (`#22`) & PR Fail (`#21`) | PR `#19`, `#22`, `#24` ([`docs/ci-evidence.md`](ci-evidence.md)) | Đạt |

### 2.2. Nhận xét nghiệm thu Sprint 1
- **Điểm đạt được**: Đã chuyển giao từ các tệp đơn lẻ sang cấu trúc Monorepo chuẩn hóa; người mới clone repo có thể dựng PostgreSQL 16 + NestJS + Next.js bằng Docker Compose; toàn bộ PR vào `main` đều bắt buộc vượt qua Quality Gate của GitHub Actions.
- **Mở rộng kịp thời trong Sprint 1**: Nhóm đã bổ sung mô hình nguyên liệu & công thức pha chế (`Ingredient`, `ProductRecipeItem` theo Size `S`/`M`/`L` tại PR `#25`) để việc tính tồn kho sản phẩm phản ánh thực tế quầy pha chế.

---

## 3. Sprint 1 Retrospective

### 3.1. Điểm làm tốt (*What Went Well*)
- Phân tách sớm trách nhiệm rõ ràng giữa Frontend (`apps/web`), Backend (`apps/api`) và Tài liệu/DevOps (`docs/`, `.github/`) giúp giảm xung đột khi merge PR song song.
- Pipeline CI (`ci.yml`) phát hiện ngay lỗi khi unit test fail (đã kiểm chứng thực tế qua PR `#21` fail và PR `#22` pass), giúp giữ nhánh `main` luôn build được.
- Tài liệu kiến trúc (6 ADR, C4, UML Activity/Sequence/Class/Deployment) được đồng bộ theo schema thật ngay trong Sprint 1.

### 3.2. Điểm cần cải thiện (*What Could Be Improved*)
- Khi bổ sung bảng `Ingredient` và `ProductRecipeItem`, một số tài liệu sơ đồ và SQL seed ban đầu cần chỉnh sửa lại nhiều vòng mới đồng bộ hoàn toàn (`#20`, `#25`, `#29`).
- Một số lệnh trong `README.md` ở đầu Sprint 1 vẫn còn tên thư mục cũ (`backend/`, `frontend/`) trước khi tái cấu trúc thành `apps/api`, `apps/web`.
- Cần tách rõ dữ liệu nhạy cảm (key cổng thanh toán) ra khỏi `.env.example` và file hướng dẫn nội bộ ngay từ lúc thiết lập.

### 3.3. Hành động cải thiện cho Sprint 2 (*Action Items*)
1. Mọi thay đổi schema Prisma phải đi kèm migration chuẩn (`npx prisma migrate dev`), **không** dùng `db push --accept-data-loss` trên Production.
2. Áp dụng kiểm thử tích hợp trên **PostgreSQL thật** (chứ không chỉ mock Prisma) cho các luồng quan trọng là Đặt đơn (`FR-05`) và Thanh toán (`FR-06`).
3. Bắt buộc rà soát secret/credential trước khi hoàn tất bàn giao Task 5.4.

---

## 4. Sprint 2 Review (Task 5.1 – Task 5.4)

### 4.1. Kết quả hoàn thành Backlog Sprint 2

| Issue | Mã Task / Yêu cầu | Nội dung bàn giao | Pull Request / Minh chứng | Kết quả DoD |
| :---: | :--- | :--- | :--- | :---: |
| **#7** | `TASK-5.1A` (`FR-02`) | Trang chi tiết sản phẩm `apps/web/app/product/[id]/pageProduct.tsx`, chọn Size (`S`/`M`/`L`), chọn nhiều Topping, hiển thị tồn kho động | PR `#35` | Đạt |
| **#8** | `TASK-5.1B` (`FR-03`) | Giỏ hàng Zustand (`apps/web/store/cartStore.ts`) lưu bền vững, thêm/sửa/xóa món, áp dụng mã Voucher & tính tổng tiền | PR `#33`, PR `#36` | Đạt |
| **#9** | `TASK-5.1C` (`FR-04`) | Đăng ký, Đăng nhập (`bcrypt` + JWT Bearer Token), `JwtAuthGuard`, `RolesGuard` & `StaffOnly` bảo vệ route nhạy cảm | PR `#40`, PR `#42` | Đạt |
| **#10** | `TASK-5.1D` (`FR-05`) | `POST /api/orders` tính giá hoàn toàn từ server, trừ tồn kho nguyên liệu trong Prisma `$transaction`, Optimistic Locking qua `Product.version` (`409 Conflict` / `400 Bad Request`) | PR `#18`, `#30`, `#34` | Đạt |
| **#11** | `TASK-5.1E` (`FR-06`) | `POST /api/payments` hỗ trợ Ví/Thẻ mô phỏng + VietQR PayOS / MoMo Sandbox, chống trùng lặp bằng `idempotencyKey`, tích điểm Loyalty & `LoyaltyTransaction` | PR `#31`, `#36`, `#46` | Đạt |
| **#12** | `TASK-5.1F` (`FR-07`, `FR-08`) | Máy trạng thái 7 bước (`OrdersService.assertTransition()`), trang theo dõi đơn `/orders/:id`, lịch sử đơn `/orders`, phân hệ quầy pha chế `/barista` | PR `#32`, PR `#36` | Đạt |
| **#13** | `TASK-5.2` | Kiểm thử 3 tầng: Unit Tests (11 suites / 90 tests), Integration Tests (`apps/api/test/orders-payments.e2e-spec.ts`), E2E Test 8 bước (`tests/e2e/ordering-flow.e2e.test.mjs`), `GET /health` & `docker-compose.yml` | PR `#37`, `#39`, `#41` | Đạt |
| **#14** | `TASK-5.3` (`NFR-05`) | Pipeline CD (`.github/workflows/cd.yml`): Quality Gate ➔ Build & Push GHCR Docker Image ➔ Trigger Render Deploy ➔ Smoke Test (`/health`, `/api/products`) ➔ Auto/SOP Rollback | PR `#38`, `#43`, `#44`, `#45` ([CD Run `#43552738435`](https://github.com/Phucdang-gif/Assignment2/actions/runs/43552738435)) | Đạt |
| **#15** | `TASK-5.4` | Làm sạch secret trong repo/CI, hoàn thiện `README.md`, `RELEASE_NOTES.md`, `docs/sprint-review-retrospective.md`, Release `v1.0.0` & bàn giao | Nhánh `docs/task-5.4-delivery-and-handover` | Đạt |

### 4.2. Chỉ số chất lượng tại thời điểm bàn giao (`v1.0.0`)
- **Backend Unit Tests**: **11 test suites passed, 90 test cases passed** (`cd apps/api && npm test`).
- **Backend Integration & E2E Tests**: Pass trên PostgreSQL 16 service container trong CI/CD (`apps/api/test/app.e2e-spec.ts` & `apps/api/test/orders-payments.e2e-spec.ts`).
- **Frontend E2E Flow Test**: 8 bước end-to-end từ `/health` ➔ Menu ➔ Đăng nhập ➔ Tạo đơn ➔ Thanh toán Idempotent ➔ Barista hoàn tất (`tests/e2e/ordering-flow.e2e.test.mjs`).
- **CI/CD Pipelines**: Cả `BrewLite CI Pipeline` (`ci.yml`) và `BrewLite CD Pipeline` (`cd.yml`) đều đạt trạng thái **Success** trên nhánh `main` (Run `#43552738455` và `#43552738435`).

---

## 5. Sprint 2 Retrospective

### 5.1. Start – Stop – Continue

| Nhóm hành động | Nội dung cụ thể từ thực tế triển khai Sprint 2 |
| :--- | :--- |
| **Start** *(Bắt đầu làm)* | - Viết **Integration Tests trên PostgreSQL thật** (`orders-payments.e2e-spec.ts`) để bắt các lỗi race condition, transaction rollback và ràng buộc kiểu dữ liệu mà unit test mock không thấy.<br>- Rà soát bảo mật định kỳ trước release (phát hiện & khóa quyền `StaffOnly` cho `payos-confirm-url`, bổ sung `CORS_ORIGIN` whitelist tại PR `#42`, dọn credential khỏi `PAYMENT_SETUP.md` và `.env.example` tại Task 5.4).<br>- Tự động hóa Smoke Test hậu triển khai (kiểm tra cả `/health` lẫn truy vấn dữ liệu thật `/api/products`). |
| **Stop** *(Ngừng làm)* | - Ngừng ghi cứng đường dẫn URL cục bộ (`http://localhost:3000`, link Ngrok cá nhân) hoặc thông tin tài khoản thử nghiệm trong code và tài liệu markdown (`PAYMENT_SETUP.md`).<br>- Ngừng sửa tay trực tiếp trên nhánh `main` hoặc chạy `prisma db push` trên dữ liệu có sẵn; luôn đi qua `prisma migrate deploy` và PR review. |
| **Continue** *(Tiếp tục duy trì)* | - Duy trì quy ước **Conventional Commits** gắn mã Task/FR và liên kết Issue vào PR để bảng `docs/traceability-matrix.md` luôn truy vết được.<br>- Duy trì tách biệt cấu hình Local (`docker-compose.yml` tự migrate + seed idempotent) với Production (`apps/api/Dockerfile` chỉ migrate `npx prisma migrate deploy` để tránh ghi đè dữ liệu thật khi restart container). |

### 5.2. Bài học kinh nghiệm rút ra (Key Takeaways)
1. **Tính giá và kiểm soát tồn kho phải đặt ở Backend**: PR `#34` đã sửa dứt điểm việc tính `unitPrice` và `total` trực tiếp từ giá sản phẩm/topping trong database, kết hợp transaction trừ `Ingredient.stock` và Optimistic Lock `Product.version` giúp ngăn chặn hoàn toàn gian lận giá từ client và lỗi bán âm khi đồng thời nhiều người đặt.
2. **Idempotency là bắt buộc trong thanh toán**: Việc lưu khóa `idempotencyKey` (`UNIQUE`) trên bảng `Payment` giúp client an toàn khi retry mạng hoặc khi webhook gọi về trùng với thao tác bấm xác nhận của người dùng.
3. **Quan sát sự khác biệt giữa CI và Production**: Trong quá trình làm Task 5.3 (PR `#43`–`#46`), nhóm gặp lỗi Smoke Test gọi nhầm `/products` thay vì `/api/products` và lỗi `returnUrl` trỏ về `localhost:3000` khi chạy trên Vercel; việc có Smoke Test tự động trong `cd.yml` giúp phát hiện và xử lý triệt để trước khi bàn giao.

---

## 6. Kịch Bản Video / Demo Trực Tiếp Luồng End-to-End (Task 5.4 Live Demo Runbook)

Kịch bản dùng để quay video hoặc trình diễn trực tiếp lúc nghiệm thu (thời lượng đề xuất: **3–5 phút**):

1. **Kiểm tra trạng thái hệ thống Production & Health Check (30s)**:
   - Mở URL Health Check trên trình duyệt/cURL (`<PRODUCTION_API_URL>/health`) ➔ Xác nhận JSON trả về `{"status":"ok","service":"BrewLite API","info":{"database":{"status":"up"}}}`.
   - Mở URL Frontend HTTPS trên Vercel (`https://assignment2-murex-gamma.vercel.app`) ở chế độ responsive di động (Mobile View `390x844`).
2. **Khách hàng duyệt Menu & Tùy biến món (45s)**:
   - Minh họa các trạng thái UI (Skeleton loading, lọc danh mục Cà phê / Trà trái cây / Trà sữa).
   - Chọn 1 món (ví dụ *Cà phê sữa đá*), chọn Size `M` (`+5.000đ`), chọn thêm Topping, bấm **Thêm vào giỏ hàng** (không cần đăng nhập trước).
3. **Giỏ hàng, Đăng nhập JWT & Ưu đãi thành viên (45s)**:
   - Vào `/cart`, kiểm tra tổng tiền, thử nhập mã ưu đãi hợp lệ (hoặc đăng nhập tài khoản mẫu `customer@brewlite.com` / `customer123` để hệ thống tự áp dụng giảm giá **10% Hạng Vàng** từ `50 loyaltyPoints`).
4. **Đặt đơn & Thanh toán Idempotent (60s)**:
   - Bấm **Đặt hàng & Thanh toán**, chọn phương thức Ví/Thẻ mô phỏng (hoặc VietQR PayOS/MoMo nếu đang bật cấu hình sandbox).
   - Hệ thống gọi `POST /api/orders` (khóa tồn kho nguyên liệu) và `POST /api/payments` kèm `idempotencyKey`.
   - Điều hướng tới `/orders/:id`: đơn hiển thị trạng thái **`PAID`**, điểm Loyalty được cộng thêm (`1 điểm / 10.000đ`).
5. **Barista tiếp nhận & Cập nhật pha chế (45s)**:
   - Đăng nhập tài khoản `barista@brewlite.com` / `barista123` tại `/barista`.
   - Chuyển trạng thái đơn vừa đặt theo đúng máy trạng thái: **`PAID` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`**.
   - Quay lại lịch sử đơn của khách hàng (`/orders`) để xác nhận trạng thái đồng bộ **`COMPLETED`**.
6. **Chứng minh CI/CD & Khả năng chạy Local (30s)**:
   - Mở tab GitHub Actions (`BrewLite CI Pipeline` và `BrewLite CD Pipeline` xanh) và Docker Compose chạy local qua `docker compose up --build`.
