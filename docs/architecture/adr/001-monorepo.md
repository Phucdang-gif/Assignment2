# ADR 001: Lựa Chọn Cấu Trúc Mã Nguồn Monorepo (Monorepo Architecture Structure)

* **Trạng thái (Status)**: Chấp thuận (Accepted)
* **Ngày quyết định (Date)**: 2026-10-15
* **Người quyết định (Deciders)**: Nhóm phát triển BrewLite
* **Liên kết yêu cầu (Requirements)**: Task 3.1, Task 4.1, SRS Mục 4

---

## 1. Ngữ cảnh (Context)
Dự án BrewLite bao gồm hai ứng dụng chính:
1. **Frontend**: Ứng dụng Web / PWA xây dựng trên nền Next.js dành cho khách hàng đặt món và nhân viên quầy xử lý đơn.
2. **Backend**: Ứng dụng RESTful API xây dựng trên nền NestJS kết nối cơ sở dữ liệu PostgreSQL.

Khi bắt đầu dự án, nhóm đứng trước hai phương án cấu trúc mã nguồn:
* **Multi-repo**: Mỗi ứng dụng được lưu trữ ở một kho lưu trữ Git độc lập (`brewlite-web`, `brewlite-api`, `brewlite-docs`).
* **Monorepo**: Toàn bộ mã nguồn frontend, backend, tài liệu đặc tả (SRS, sơ đồ kiến trúc) và kịch bản CI/CD được lưu chung trong một Git repository duy nhất theo cấu trúc chuẩn.

## 2. Quyết định (Decision)
Nhóm quyết định áp dụng mô hình **Monorepo** thống nhất cho toàn bộ hệ thống BrewLite:
* Lưu trữ mã nguồn frontend tại `frontend/` (hoặc `apps/web/`).
* Lưu trữ mã nguồn backend tại `backend/` (hoặc `apps/api/`).
* Lưu trữ toàn bộ tài liệu kỹ thuật, sơ đồ PlantUML và ma trận truy vết tại `docs/`.
* Tệp cấu hình Docker Compose và GitHub Actions CI/CD được quản lý tại thư mục gốc của repository.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Quản lý phiên bản nguyên tử (Atomic Commits)**: Cho phép một Pull Request có thể cập nhật đồng thời cả tài liệu đặc tả, schema database, mã backend và giao diện frontend tương ứng, giúp ma trận truy vết (Traceability Matrix) luôn chính xác 100%.
2. **Đơn giản hóa CI/CD**: Chỉ cần thiết lập một pipeline GitHub Actions duy nhất để tự động kiểm thử và build cho toàn bộ hệ thống.
3. **Tiện lợi cho môi trường phát triển cục bộ (Local Development)**: Sử dụng một tệp `docker-compose.yml` duy nhất ở thư mục gốc để khởi chạy cùng lúc Frontend, Backend và PostgreSQL chỉ với một lệnh `docker compose up`.
4. **Chia sẻ cấu hình và biến môi trường**: Dễ dàng chia sẻ các file mẫu `.env.example`, tài liệu Swagger/OpenAPI và bộ sưu tập Postman/Thunder Client.

### Nhược điểm & Hạn chế (Cons):
1. **Kích thước repository lớn hơn**: Lịch sử commit của tất cả thành phần được gộp chung, dung lượng repo tải về ban đầu sẽ lớn hơn so với repo đơn lẻ.
2. **Cấu hình CI cần kiểm soát thay đổi theo đường dẫn**: Cần cấu hình CI thông minh để tránh việc sửa một dòng trong tài liệu `docs/` lại kích hoạt build toàn bộ Docker image của frontend và backend.
