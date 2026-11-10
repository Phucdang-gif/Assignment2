# ADR 006: Chiến Lược Ghi Log, Health Check & Quản Lý Cấu Hình Tập Trung

* **Trạng thái (Status)**: Chấp thuận (Accepted)
* **Ngày quyết định (Date)**: 2026-10-25
* **Người quyết định (Deciders)**: Nhóm phát triển BrewLite
* **Liên kết yêu cầu (Requirements)**: Task 3.1, Task 4.4, Task 5.2, Task 5.3, NFR-04 (Khả năng triển khai & Vận hành)

---

## 1. Ngữ cảnh (Context)
Khi hệ thống BrewLite chuyển từ môi trường lập trình cục bộ (Local) lên môi trường tích hợp liên tục (CI) và môi trường thực tế (Production trên Cloud như Render/Railway/Fly.io):
* Cần cơ chế giám sát xem ứng dụng backend và database có đang "sống" (liveness) và "sẵn sàng" (readiness) nhận request hay không.
* Cần kiểm soát biến môi trường bảo mật (Database Credentials, JWT Secret, Port) mà không để lộ bí mật (Secret Leaks) lên kho mã nguồn Git.
* Cần chuẩn hóa nhật ký (Logging) để dễ dàng gỡ lỗi (Debugging) và giám sát lỗi trong luồng thanh toán và đặt hàng.

## 2. Quyết định (Decision)
1. **Quản lý cấu hình tập trung (Configuration Management)**:
   * Sử dụng `@nestjs/config` nạp tự động các biến từ tệp môi trường `.env`.
   * Cung cấp tệp mẫu `.env.example` công khai chứa danh sách các key bắt buộc cùng giá trị giả định an toàn.
   * Cấm tuyệt đối commit file `.env` lên Git bằng cách khai báo vào `.gitignore`.
2. **Cung cấp Endpoint Health Check**:
   * Cung cấp đường dẫn công khai `GET /api/health` trả về kết quả JSON:
     ```json
     {
       "status": "ok",
       "info": {
         "database": { "status": "up" }
       }
     }
     ```
   * Endpoint này được nền tảng cloud (Render/Railway/Docker) gọi định kỳ (liveness probe) để tự động khởi động lại container nếu xảy ra sự cố.
3. **Chuẩn hóa hệ thống Logging**:
   * Sử dụng Logger chuẩn của NestJS (`LoggerService`).
   * Ghi log có ngữ cảnh rõ ràng: `[OrdersService]`, `[PaymentsService]`, `[AuthService]`.
   * Ẩn toàn bộ thông tin nhạy cảm của khách hàng trong log (mật khẩu người dùng, số thẻ, chuỗi token).

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Đạt chuẩn 12-Factor App (Factor III: Config & Factor XI: Logs)**: Ứng dụng hoàn toàn độc lập với môi trường chạy; khi đổi môi trường từ Local sang Cloud chỉ cần thay đổi biến môi trường mà không cần sửa một dòng code nào.
2. **Phục vụ tự động hóa CI/CD**: Giúp bước `Smoke Test` trong pipeline triển khai của Task 5.3 có thể tự động ping kiểm tra `/api/health` ngay sau khi deploy để quyết định chấp thuận hay kích hoạt cơ chế Rollback.

### Nhược điểm & Hạn chế (Cons):
1. Chưa tích hợp các công cụ gom log tập trung bên thứ ba như Datadog, Sentry hoặc Grafana Loki (chấp nhận lưu log dạng console stdout theo tiêu chuẩn của container Docker).
