# Ma Trận Truy Vết Yêu Cầu (Requirements Traceability Matrix - RTM)

> **Dự án**: BrewLite – Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Phiên bản**: 2.1 (Cập nhật hoàn chỉnh Task 1.2, Task 2.3 & Task 3.1)  
> **Tài liệu tham chiếu**: [`srs.md`](requirements/srs.md), [`usecase-checkout.md`](requirements/usecase-checkout.md), [`class-diagram.md`](diagrams/class-diagram.md), [`system-architecture.md`](architecture/system-architecture.md)

---

## 1. Bảng truy vết yêu cầu chức năng (Functional Requirements - FR)

| Mã yêu cầu | Use-case / User Story | Thiết kế / Sơ đồ | Quyết định kiến trúc (ADR) | Code / API | Test Cases |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **US-01**: Xem menu đồ uống<br>**UC-01**: Xem menu | `Activity-01`<br>`Class-01` (`Product`, `Category`)<br>`C4-Container` | [`ADR-001`](architecture/adr/001-monorepo.md)<br>[`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) | `GET /products`<br>`GET /products/:id` | `API-T01` (Sprint 1 MVP Test) |
| **FR-02** | **US-02**: Tùy chỉnh kích cỡ & Topping<br>**UC-03**, **UC-04** | `Class-01` (`Product`, `Topping`, `OrderItemTopping`)<br>`C4-Backend` | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) | `GET /api/toppings` | `API-T02` (Unit Test Options) |
| **FR-03** | **US-03**: Quản lý giỏ hàng<br>**UC-05**: Quản lý giỏ hàng | `Class-01` (`OrderItem`, `OrderItemTopping`)<br>`C4-Container` | [`ADR-001`](architecture/adr/001-monorepo.md) | Frontend State Management (`useCartStore`)<br>`apps/web/app/cart/page.tsx`<br>`apps/web/app/product/[id]/page.tsx` | `E2E-T01` (Cart State & Auto Price Calculation) |
| **FR-04** | **US-04**: Đăng ký & Đăng nhập JWT<br>**UC-10**, **UC-11** | `Class-01` (`User`, `user_role`)<br>`Sequence-Auth`<br>`C4-Backend` | [`ADR-005`](architecture/adr/005-jwt-stateless-authentication.md) | `POST /auth/login`<br>`POST /auth/register` | `AUTH-T01` (JWT Verification Test) |
| **FR-05** | **US-05**: Đặt hàng & Khóa giữ kho<br>**UC-06**: Đặt hàng mới | `UC-01` (`usecase-checkout.puml`)<br>`Sequence-01` (`sequence-checkout.puml`)<br>`Class-01` (`Order`, `Product.version`) | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md)<br>[`ADR-003`](architecture/adr/003-postgresql-and-prisma-migration.md) | `POST /orders` (Prisma Transaction & Optimistic Lock) | `INT-T01` (Order Creation Test)<br>`INT-T02` (Optimistic Lock Test) |
| **FR-06** | **US-06**: Thanh toán an toàn<br>**UC-07**: Thanh toán trực tuyến | `UC-01` (`usecase-checkout.puml`)<br>`Sequence-01` (`sequence-checkout.puml`)<br>`Class-01` (`Payment`, `payment_method`) | [`ADR-004`](architecture/adr/004-payment-simulation-and-idempotency.md) | `POST /payments` (Idempotency Key Check) | `INT-T03` (Payment Success & Fail)<br>`INT-T04` (Idempotency Key Retry Test) |
| **FR-07** | **US-07**: Xem lịch sử & Tích điểm<br>**UC-09**: Lịch sử & Điểm | `Class-01` (`LoyaltyTransaction`, `User`)<br>`C4-Backend` | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) | `GET /api/orders`, `GET /api/orders/me`<br>`GET /api/orders/:id`<br>`apps/web/app/orders/page.tsx`<br>`apps/web/app/orders/[id]/page.tsx` | `INT-T05` (`orders.service.spec.ts` - Order History & Loyalty Points) |
| **FR-08** | **US-08**: Tiếp nhận & Cập nhật pha chế<br>**UC-12**, **UC-13** | `State-Order` (Order State Machine)<br>`Class-01` (`order_status`)<br>`C4-Container` | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) | `PATCH /api/orders/:id/status`<br>`PATCH /api/orders/barista/:id/{prepare,ready,complete}`<br>`GET /api/orders/barista/queue`<br>`apps/web/app/barista/page.tsx` | `API-T03` (`orders.service.spec.ts` - FSM State Transition & RBAC Test) |
| **FR-09** | **US-09**: Quản lý bật/tắt món<br>**UC-14**: Bật/tắt món | `Class-01` (`Topping.isAvailable`, `ProductStatus`)<br>`C4-Backend` | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) | `PATCH /api/toppings/:id` | `API-T04` (Availability Toggle Test) |
| **FR-10** | **US-10**: Tự động dọn dẹp đơn hết hạn<br>**UC-06**: Hủy đơn PENDING | `Activity-01` (Nhánh Rollback kho)<br>`Class-01` (`Order.cancelAndRollback`) | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md)<br>[`ADR-003`](architecture/adr/003-postgresql-and-prisma-migration.md) | Background Cleanup Service (NestJS Cron / Queue) | `INT-T06` (Order Expiration & Stock Rollback Test) |
| **FR-11** | **US-11**: Chiết khấu ưu đãi thành viên<br>**UC-06**: Đặt đơn hàng | `Class-01` (`Promotion`, `LoyaltyTransaction`)<br>`C4-Backend` | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) | `OrderService.calculateDiscount()` | `UNIT-T03` (Membership Tier Calculation Test) |
| **FR-12** | **US-12**: Gợi ý thức uống phổ biến<br>**UC-01**: Menu | `C4-Container` (Frontend Next.js View)<br>`Class-01` (`Product`) | [`ADR-001`](architecture/adr/001-monorepo.md) | `GET /products?featured=true` | `FE-T02` (Trending Drinks Display Test) |
| **FR-13** | **US-13**: Giới hạn thanh toán tiền mặt<br>**UC-07**: Thanh toán | `Class-01` (`payment_method` chỉ gồm WALLET/CARD) | [`ADR-004`](architecture/adr/004-payment-simulation-and-idempotency.md) | UI Alert & Validation Chặn Tiền Mặt | `FE-T03` (Unsupported Payment Alert Test) |

---

## 2. Bảng truy vết yêu cầu phi chức năng (Non-Functional Requirements - NFR)

| Mã NFR | Mục tiêu phi chức năng | Tiêu chí kiểm chứng | Giải pháp kiến trúc / ADR áp dụng | Thành phần kỹ thuật |
| :---: | :--- | :--- | :--- | :--- |
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian phản hồi API < 500ms; Tải trang PWA < 1.5s | [`ADR-002`](architecture/adr/002-modular-monolith-nestjs.md) (Modular Monolith, in-memory DI)<br>PWA caching | NestJS Modules, Next.js SSR/PWA |
| **NFR-02** | **Tính toàn vẹn (Data Integrity)** | Không xảy ra bán âm tồn kho khi nhiều khách đặt cùng lúc; ACID Transactions | [`ADR-003`](architecture/adr/003-postgresql-and-prisma-migration.md) (Prisma Migration & Optimistic Lock) | PostgreSQL, Prisma `$transaction`, `Product.version` |
| **NFR-03** | **Bảo mật & Độ tin cậy (Security & Reliability)** | Mật khẩu băm an toàn (bcrypt); Không bị trừ tiền lặp; Token hết hạn tự động | [`ADR-004`](architecture/adr/004-payment-simulation-and-idempotency.md) (Idempotency Key)<br>[`ADR-005`](architecture/adr/005-jwt-stateless-authentication.md) (JWT AuthGuard) | `Payment.idempotencyKey`, `@nestjs/passport`, `JwtAuthGuard` |
| **NFR-04** | **Khả dụng (Usability)** | Giao diện mobile-first, có đủ 3 trạng thái loading, empty, error | [`ADR-001`](architecture/adr/001-monorepo.md)<br>TailwindCSS Responsive | Next.js Skeleton, Toast Notification |
| **NFR-05** | **Khả năng triển khai (Deployability)** | Tự động hóa CI/CD; Dễ dàng cấu hình và kiểm tra sức khỏe ứng dụng | [`ADR-001`](architecture/adr/001-monorepo.md)<br>[`ADR-006`](architecture/adr/006-logging-healthcheck-and-configuration.md)<br>[`Task 4.4 CI`](ci-evidence.md) | Docker Compose, Endpoint `GET /health`, GitHub Actions (`.github/workflows/ci.yml`) |
