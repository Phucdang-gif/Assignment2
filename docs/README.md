# 📚 Thư Mục Tài Liệu Dự Án BrewLite (Documentation Index)

> **Học phần:** Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Dự án:** BrewLite Coffee Ordering System  
> **Repository:** [Phucdang-gif/Assignment2](https://github.com/Phucdang-gif/Assignment2)  
> **Trạng thái:** Toàn bộ tạo phẩm phân tích, thiết kế & kiểm thử từ Task 1 đến Task 3 đã được đưa vào kiểm soát phiên bản (Version Control) theo đúng yêu cầu Task 4.2.

---

## 🗺️ Bản đồ tài liệu (Documentation Map)

### 1. Phân tích yêu cầu (Task 1 - Requirements)
- [`requirements/context-and-scope.md`](requirements/context-and-scope.md): Bối cảnh hệ thống, các bên liên quan (Stakeholders) và phạm vi dự án.
- [`requirements/srs.md`](requirements/srs.md): Đặc tả yêu cầu phần mềm (SRS), danh sách 13 yêu cầu chức năng (FR-01 đến FR-13), 5 yêu cầu phi chức năng (NFR-01 đến NFR-05) và bảng phân loại mức độ ưu tiên MoSCoW.
- [`requirements/usecase-checkout.md`](requirements/usecase-checkout.md): Đặc tả chi tiết Use Case trọng tâm `UC-CHECKOUT` (Quy trình xem giỏ hàng, chọn phương thức thanh toán, xử lý idempotency key và xác nhận đơn).

### 2. Thiết kế mô hình & Sơ đồ UML (Task 2 - Diagrams)
- [`diagrams/activity/activity-diagram.md`](diagrams/activity/activity-diagram.md): Sơ đồ hoạt động (Activity Diagram) thể hiện luồng nghiệp vụ end-to-end từ đặt món đến nhận đồ uống.
- [`diagrams/sequence-checkout.puml`](diagrams/sequence-checkout.puml): Sơ đồ tuần tự (Sequence Diagram) chi tiết cho luồng thanh toán và xác nhận đơn hàng qua Webhook.
- [`diagrams/class-diagram.md`](diagrams/class-diagram.md): Sơ đồ lớp miền nghiệp vụ (Domain Class Diagram) với đầy đủ quan hệ bội số (multiplicity), trạng thái Enum và cơ chế Optimistic Lock (`version`).

### 3. Kiến trúc hệ thống & Quyết định kiến trúc (Task 3 - Architecture & ADR)
- [`architecture/system-architecture.md`](architecture/system-architecture.md): Tài liệu kiến trúc C4 Model (Context, Container, Component).
- **Bộ 6 bản ghi quyết định kiến trúc (Architecture Decision Records - ADRs):**
  - [`architecture/adr/001-monorepo.md`](architecture/adr/001-monorepo.md): Lựa chọn Monorepo (`apps/api`, `apps/web`).
  - [`architecture/adr/002-modular-monolith-nestjs.md`](architecture/adr/002-modular-monolith-nestjs.md): Kiến trúc Modular Monolith với NestJS.
  - [`architecture/adr/003-postgresql-and-prisma-migration.md`](architecture/adr/003-postgresql-and-prisma-migration.md): Sử dụng PostgreSQL và Prisma ORM Migration.
  - [`architecture/adr/004-payment-simulation-and-idempotency.md`](architecture/adr/004-payment-simulation-and-idempotency.md): Mô phỏng cổng thanh toán và cơ chế chống trùng lặp Idempotency Key.
  - [`architecture/adr/005-jwt-stateless-authentication.md`](architecture/adr/005-jwt-stateless-authentication.md): Xác thực phân quyền không trạng thái qua JWT.
  - [`architecture/adr/006-logging-healthcheck-and-configuration.md`](architecture/adr/006-logging-healthcheck-and-configuration.md): Quản lý cấu hình môi trường, Logging và Endpoint `/health`.
- [`deployment.md`](deployment.md): Sơ đồ triển khai hệ thống (UML Deployment Diagram), cấu hình Docker Production và chiến lược giám sát.

### 4. Quy chuẩn & Truy vết kỹ thuật (Task 4 Foundation)
- [`traceability-matrix.md`](traceability-matrix.md): Ma trận truy vết từ Yêu cầu (FR/NFR) đến Thiết kế, ADR, API Code và Test Case tương ứng.
- [`conventions.md`](conventions.md): Quy ước đặt tên Git branch, Conventional Commits, Coding style và chuẩn hóa RESTful API.
- [`team-workflow.md`](team-workflow.md): Quy trình làm việc nhóm theo Git Feature Branch, Pull Request Review và Definition of Done.
- [`api-testing-guide.md`](api-testing-guide.md): Hướng dẫn kiểm thử API tự động và bộ sưu tập Postman/Thunder Client.
