# 📚 Thư Mục Tài Liệu Dự Án BrewLite (Documentation Index)

> **Học phần:** Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Dự án:** BrewLite Coffee Ordering System  
> **Repository:** [Phucdang-gif/Assignment2](https://github.com/Phucdang-gif/Assignment2)  
> **Trạng thái:** Hoàn thiện toàn bộ tạo phẩm từ Task 1 đến Task 5 (Phân tích yêu cầu, Sơ đồ UML, Kiến trúc ADR, Kiểm thử 3 tầng, CI/CD & Bàn giao Production `v1.0.1`).

---

## 🗺️ Bản đồ tài liệu (Documentation Map)

### 1. Phân tích yêu cầu (Task 1 - Requirements)
- [`requirements/context-and-scope.md`](requirements/context-and-scope.md): Bối cảnh hệ thống, các bên liên quan (Stakeholders) và phạm vi dự án.
- [`requirements/srs.md`](requirements/srs.md): Đặc tả yêu cầu phần mềm (SRS), danh sách 13 yêu cầu chức năng (FR-01 đến FR-13), 5 yêu cầu phi chức năng (NFR-01 đến NFR-05) và bảng phân loại mức độ ưu tiên MoSCoW.
- [`requirements/usecase-checkout.md`](requirements/usecase-checkout.md): Đặc tả chi tiết Use Case trọng tâm `UC-CHECKOUT` (Quy trình xem giỏ hàng, chọn phương thức thanh toán, xử lý idempotency key và xác nhận đơn).

### 2. Thiết kế mô hình & Sơ đồ UML (Task 2 - Diagrams)
- [`diagrams/activity/activity-diagram.md`](diagrams/activity/activity-diagram.md): Sơ đồ hoạt động (Activity Diagram) thể hiện luồng nghiệp vụ end-to-end từ đặt món đến nhận đồ uống.
- [`diagrams/sequence-checkout.md`](diagrams/sequence-checkout.md) ([`.puml`](diagrams/sequence-checkout.puml) / [`.svg`](diagrams/sequence-checkout.svg)): Sơ đồ tuần tự (Sequence Diagram) chi tiết cho luồng thanh toán và xác nhận đơn hàng.
- [`diagrams/class-diagram.md`](diagrams/class-diagram.md): Sơ đồ lớp miền nghiệp vụ (Domain Class Diagram) với đầy đủ quan hệ bội số (multiplicity), trạng thái Enum và cơ chế Optimistic Lock (`version`).
- [`diagrams/deployment-diagram.puml`](diagrams/deployment-diagram.puml) ([`.svg`](diagrams/deployment-diagram.svg)): Sơ đồ triển khai hệ thống (Vercel Edge Network + Render Docker Containers).

### 3. Kiến trúc hệ thống & Quyết định kiến trúc (Task 3 - Architecture & ADR)
- [`architecture/system-architecture.md`](architecture/system-architecture.md): Tài liệu kiến trúc C4 Model (Context, Container, Component).
- **Bộ 6 bản ghi quyết định kiến trúc (Architecture Decision Records - ADRs):**
  - [`architecture/adr/001-monorepo.md`](architecture/adr/001-monorepo.md): Lựa chọn Monorepo (`apps/api`, `apps/web`).
  - [`architecture/adr/002-modular-monolith-nestjs.md`](architecture/adr/002-modular-monolith-nestjs.md): Kiến trúc Modular Monolith với NestJS.
  - [`architecture/adr/003-postgresql-and-prisma-migration.md`](architecture/adr/003-postgresql-and-prisma-migration.md): Sử dụng PostgreSQL và Prisma ORM Migration.
  - [`architecture/adr/004-payment-simulation-and-idempotency.md`](architecture/adr/004-payment-simulation-and-idempotency.md): Mô phỏng cổng thanh toán và cơ chế chống trùng lặp Idempotency Key.
  - [`architecture/adr/005-jwt-stateless-authentication.md`](architecture/adr/005-jwt-stateless-authentication.md): Xác thực phân quyền không trạng thái qua JWT.
  - [`architecture/adr/006-logging-healthcheck-and-configuration.md`](architecture/adr/006-logging-healthcheck-and-configuration.md): Quản lý cấu hình môi trường, Logging và Endpoint `/health`.
- [`deployment.md`](deployment.md): Sơ đồ triển khai hệ thống (UML Deployment Diagram: Frontend trên Vercel, Backend & PostgreSQL chạy Docker Container trên Render), cấu hình môi trường Production và bảng truy vết thành phần.

### 4. Quy chuẩn, CI Pipeline & Truy vết kỹ thuật (Task 4 Foundation & CI)
- [`delivery/ci-evidence.md`](delivery/ci-evidence.md): Báo cáo vận hành GitHub Actions CI Pipeline, hướng dẫn Branch Protection và minh chứng PR CI Pass / CI Fail.
- [`traceability-matrix.md`](traceability-matrix.md): Ma trận truy vết từ Yêu cầu (FR/NFR) đến Thiết kế, ADR, API Code và Test Case tương ứng.
- [`delivery/conventions.md`](delivery/conventions.md): Quy ước đặt tên Git branch, Conventional Commits, Coding style và chuẩn hóa RESTful API.
- [`delivery/team-workflow.md`](delivery/team-workflow.md): Quy trình làm việc nhóm theo Git Feature Branch, Pull Request Review và Definition of Done.
- [`delivery/api-testing-guide.md`](delivery/api-testing-guide.md) & [`BrewLite API Collection/`](delivery/BrewLite%20API%20Collection): Hướng dẫn kiểm thử API tự động và bộ sưu tập request YAML cho Postman / API client.

### 5. Kiểm thử Tích hợp, CD Pipeline & Bàn giao (Task 5 Delivery)
- [`../.github/workflows/cd.yml`](../.github/workflows/cd.yml): Pipeline Continuous Delivery/Deployment (Quality Gates ➔ GHCR Docker Image ➔ Render Deploy ➔ Smoke Test ➔ Auto/SOP Rollback).
- [`delivery/sprint-review-retrospective.md`](delivery/sprint-review-retrospective.md): Báo cáo Sprint Review & Sprint Retrospective cho Sprint 1 và Sprint 2 cùng kịch bản Demo End-to-End.
- [`demo/BrewLite-Live-Demo-Runbook.mp4`](demo/BrewLite-Live-Demo-Runbook.mp4): Video demo quay sẵn quy trình End-to-End 6 bước.
- [`../RELEASE_NOTES.md`](../RELEASE_NOTES.md): Ghi chú phát hành phiên bản `v1.0.1` / `v1.0.0` (Production Release) và hướng dẫn Rollback.
