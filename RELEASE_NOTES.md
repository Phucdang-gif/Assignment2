# Release Notes – BrewLite Coffee Ordering System

---

## 🚀 Phiên bản `v1.0.1` – Production Handover & Docker Fix (Latest)

- **Ngày phát hành**: 15/11/2026
- **Tag / Release**: [`v1.0.1`](https://github.com/Phucdang-gif/Assignment2/releases/tag/v1.0.1)
- **Phạm vi**: Hợp nhất PR `#47` (Task 5.4 Delivery & Handover), đồng bộ hạ tầng Docker Compose local và kiểm chứng CD Pipeline trên Render Cloud mới (`CD Run #43622804787`).

### 🔧 Thay đổi chính trong `v1.0.1`
- **Khắc phục Docker Healthcheck (`docker-compose.yml`)**: Đổi healthcheck của `brewlite-api` từ `http://localhost:3001/health` sang `http://127.0.0.1:3001/health` để `wget` trong Alpine không phân giải nhầm sang IPv6 `::1`, giúp stack 3 container (`db`, `api`, `web`) khởi động ổn định và pass `8/8` bước E2E.
- **Chuẩn hóa tài liệu bàn giao & bảo mật (Task 5.4)**: Loại bỏ toàn bộ khóa/mật khẩu khỏi `.env.example`, `PAYMENT_SETUP.md`, `payments.service.ts` và log CI; bổ sung tài liệu bàn giao (`README.md`, `docs/delivery/sprint-review-retrospective.md`, `docs/deployment.md`).
- **Kiểm chứng Production CD Pipeline**: Đã chạy thành công toàn bộ 4 chặng trên GitHub Actions ([CD Run `#43622804787`](https://github.com/Phucdang-gif/Assignment2/actions/runs/43622804787)) với Render Web Service & Vercel Production hiện tại.

---

## 📦 Phiên bản `v1.0.0` – Production Release (Sprint 2 Delivery)

- **Ngày phát hành**: 14/11/2026
- **Tag / Release**: [`v1.0.0`](https://github.com/Phucdang-gif/Assignment2/releases/tag/v1.0.0)
- **Phạm vi**: Hoàn thiện toàn bộ luồng End-to-End (Task 5.1 – Task 5.4), kiểm thử tự động 3 tầng và pipeline CI/CD triển khai Production.

### ✨ Tính năng mới & Hoàn thiện nghiệp vụ (FR-01 – FR-13)
- **Thực đơn & Chi tiết sản phẩm (`FR-01`, `FR-02`, `FR-09`, `FR-12`)**:
  - Giao diện Mobile-first / PWA với Next.js 16, React 19, Tailwind CSS 4 cùng 3 trạng thái Loading (Skeleton), Empty và Error.
  - Chọn Size (`S`, `M +5.000đ`, `L +10.000đ`) và chọn nhiều Topping kèm tính giá động; hiển thị tồn kho khả dụng tính theo định mức nguyên liệu (`ProductRecipeItem` & `Ingredient`).
- **Giỏ hàng & Khuyến mãi (`FR-03`, `FR-11`)**:
  - Quản lý giỏ hàng bền vững với Zustand (`cartStore`), cho phép khách vãng lai thêm/sửa/xóa món trước khi đăng nhập, hỗ trợ kiểm tra mã Voucher và tự động áp dụng chiết khấu hạng thành viên (`Đồng 0%`, `Bạc 5%`, `Vàng 10%`, `Kim Cương 15%`).
- **Xác thực & Phân quyền (`FR-04`)**:
  - Đăng ký, đăng nhập (`bcrypt` + JWT Bearer Token), bảo vệ endpoint bằng `JwtAuthGuard`, `RolesGuard` và `@StaffOnly()`.
  - Cấu hình `CORS_ORIGIN` whitelist bảo mật cho môi trường Production.
- **Đặt đơn, Khóa tồn kho đồng thời & Dọn đơn hết hạn (`FR-05`, `FR-10`)**:
  - `POST /api/orders` thực thi toàn bộ tính giá từ server, trừ tồn kho nguyên liệu trong Prisma `$transaction` kết hợp **Optimistic Locking** (`Product.version`) chống bán vượt tồn kho (`409 Conflict` / `400 Bad Request`).
  - Tự động giải phóng tồn kho các đơn `PENDING` quá hạn khi tạo đơn hoặc khi khách hủy đơn (`PATCH /api/orders/:id/cancel`).
- **Thanh toán Idempotent & Tích điểm Loyalty (`FR-06`, `FR-07`, `FR-13`)**:
  - Hỗ trợ phương thức thanh toán không tiền mặt (`WALLET`, `CARD`, tích hợp luồng VietQR PayOS và MoMo Sandbox với `returnUrl`/`cancelUrl` động theo domain Vercel).
  - Bảo vệ chống trừ tiền hai lần bằng `idempotencyKey` (`UNIQUE` trên bảng `Payment`).
  - Tự động cộng điểm thưởng (`1 điểm / 10.000đ`) và ghi nhận lịch sử biến động vào `LoyaltyTransaction`.
- **Máy trạng thái đơn hàng & Phân hệ Barista (`FR-08`)**:
  - Chuyển trạng thái chặt chẽ qua `OrdersService.assertTransition()`: `PENDING ➔ PAID ➔ PREPARING ➔ READY ➔ COMPLETED` (cùng các nhánh ngoại lệ `PAYMENT_FAILED`, `CANCELLED`).
  - Trang theo dõi tiến độ & lịch sử đơn (`/orders`, `/orders/:id`) và giao diện quầy pha chế (`/barista`).

### 🧪 Kiểm thử & Đảm bảo chất lượng (Task 5.2)
- **Backend Unit Tests**: 11 suites, 118 test cases pass 100% (`npm test` tại `apps/api`).
- **Backend Integration Tests**: Kiểm thử trực tiếp với PostgreSQL 16 (`apps/api/test/app.e2e-spec.ts` & `apps/api/test/orders-payments.e2e-spec.ts`) cho luồng tạo đơn, khóa lạc quan, thanh toán idempotent và phân quyền JWT.
- **End-to-End Flow Test**: Kiểm thử luồng 8 bước hoàn chỉnh từ Health Check đến Barista hoàn tất đơn (`tests/e2e/ordering-flow.e2e.test.mjs`).

### 🐳 Hạ tầng Docker & CI/CD (Task 5.3 & 5.4)
- **Docker Compose Local**: `docker compose up --build` khởi tạo PostgreSQL 16, tự động chạy `npx prisma migrate deploy`, nạp dữ liệu mẫu idempotent (`node prisma/seed.js`) và khởi động NestJS + Next.js.
- **CI Pipeline (`.github/workflows/ci.yml`)**: Chặn merge PR nếu thất bại tại `Install ➔ Lint ➔ Migrate & Seed ➔ Unit Test ➔ Integration/E2E Test ➔ Build`.
- **CD Pipeline (`.github/workflows/cd.yml`)**: Tự động chạy Quality Gates ➔ Đóng gói và đẩy Docker Image lên GHCR (`ghcr.io/phucdang-gif/assignment2/brewlite-api`) ➔ Kích hoạt Deploy lên Render ➔ Smoke Test (`/health` & `/api/products`) ➔ Hỗ trợ Auto/SOP Rollback khi thất bại.
- **Bảo mật & Bàn giao**: Loại bỏ toàn bộ khóa bí mật/mật khẩu khỏi repo và log CI; database PostgreSQL Production đặt trong Render Private Network (không mở public).

### 🔄 Hướng dẫn Rollback nhanh cho bản `v1.0.0`
1. **Trên Render Dashboard**: Vào Web Service Backend ➔ **Deploys** ➔ Chọn bản *Live* ổn định trước đó ➔ **Rollback to this deploy** (hoặc tự động qua Render API khi Smoke Test thất bại nếu có `RENDER_API_KEY` & `RENDER_SERVICE_ID`).
2. **Trên Vercel Dashboard**: Vào tab **Deployments** ➔ Chọn bản build ổn định trước đó ➔ **Promote to Production**.
3. **Qua Git VCS**:
   ```bash
   git revert <commit-sha-loi> -m 1
   git tag v1.0.2 && git push origin main v1.0.2
   ```

---

## 📦 Phiên bản `v0.1.0` – Sprint 1 MVP Baseline

- **Phạm vi**: Task 1 – Task 4 (Khai thác yêu cầu, Sơ đồ UML, Kiến trúc C4 & 6 ADR, Thiết lập Monorepo, MVP Menu API `GET /api/products` & UI Mobile-first với Loading/Empty/Error, GitHub Actions CI Pipeline).
