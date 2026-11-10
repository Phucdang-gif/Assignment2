# ADR 003: Quản Lý Cơ Sở Dữ Liệu PostgreSQL Bằng Prisma ORM & Migration Tự Động

* **Trạng thái (Status)**: Chấp thuận (Accepted)
* **Ngày quyết định (Date)**: 2026-10-20
* **Người quyết định (Deciders)**: Nhóm phát triển BrewLite
* **Liên kết yêu cầu (Requirements)**: Task 3.1, Task 5.2, FR-05, FR-06, NFR-02 (Tính toàn vẹn dữ liệu)

---

## 1. Ngữ cảnh (Context)
Dữ liệu của BrewLite đòi hỏi tính toàn vẹn quan hệ rất cao (ví dụ: một `Order` phải gắn liền với `User`, gồm nhiều `OrderItem`, mỗi item liên kết với `Product` và danh sách `OrderItemTopping`, kèm theo bản ghi `Payment` đối soát).

Nhóm cần lựa chọn giải pháp cơ sở dữ liệu và cơ chế quản lý Schema/Migration:
1. **Loại Database**: Quan hệ (RDBMS - PostgreSQL / MySQL) hay Phi quan hệ (NoSQL - MongoDB).
2. **Công cụ truy cập & Migration**: Viết Raw SQL thủ công hay dùng ORM (Prisma ORM, TypeORM, Sequelize).

## 2. Quyết định (Decision)
1. Sử dụng **PostgreSQL (phiên bản 15+)** làm hệ quản trị cơ sở dữ liệu chính vì khả năng hỗ trợ ACID mạnh mẽ, tính năng JSONB linh hoạt và hệ sinh thái lưu trữ đám mây phong phú.
2. Sử dụng **Prisma ORM** làm công cụ định nghĩa schema, sinh mã nguồn truy vấn type-safe và quản lý cơ chế Schema Migration tự động:
   * Định nghĩa toàn bộ cấu trúc tại tệp duy nhất `backend/prisma/schema.prisma`.
   * Tạo tệp migration: `npx prisma migrate dev --name <ten_thay_doi>`.
   * Tự động đồng bộ lên môi trường CI và Production bằng lệnh: `npx prisma migrate deploy`.
   * Tạo dữ liệu mẫu khởi tạo qua kịch bản `prisma/seed.ts`.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Type-Safety tuyệt đối từ Schema đến Code**: Prisma tự động sinh các kiểu TypeScript (`User`, `Order`, `Product`, `order_status`...). Nếu schema thay đổi mà code chưa sửa, TypeScript Compiler sẽ báo lỗi ngay lập tức lúc build (Compile-time validation).
2. **Kiểm soát phiên bản Database chặt chẽ (Database-as-Code)**: Toàn bộ thay đổi của bảng được lưu thành các file SQL tuần tự trong Git, loại bỏ hoàn toàn rủi ro lệch cấu trúc database giữa các thành viên nhóm và giữa môi trường Dev - Production.
3. **Bảo vệ chống xung đột dữ liệu với Khóa lạc quan (Optimistic Concurrency Control)**: Prisma hỗ trợ cập nhật có điều kiện theo trường `version` của bảng `Product`, giúp phát hiện và ngăn chặn hiện tượng mua vượt tồn kho (race condition) khi nhiều khách cùng đặt món cuối cùng.

### Nhược điểm & Hạn chế (Cons):
1. **Truy vấn phân tích phức tạp hạn chế hơn Raw SQL**: Với các báo cáo thống kê doanh thu phức tạp nhiều tầng gom nhóm (GROUP BY / HAVING / CUBE), Prisma Client có cú pháp dài dòng hơn so với viết trực tiếp câu lệnh SQL native (`$queryRaw`).
2. **Kích thước file nhị phân của Prisma Engine**: Prisma Engine chạy bằng engine Rust, làm tăng dung lượng Docker image lên thêm khoảng 50MB-100MB.
