# ADR 002: Thiết Kế Backend Theo Kiến Trúc Modular Monolith Với NestJS

* **Trạng thái (Status)**: Chấp thuận (Accepted)
* **Ngày quyết định (Date)**: 2026-10-18
* **Người quyết định (Deciders)**: Nhóm phát triển BrewLite
* **Liên kết yêu cầu (Requirements)**: Task 3.1, FR-01 -> FR-09, NFR-01 (Hiệu năng)

---

## 1. Ngữ cảnh (Context)
Hệ thống BrewLite có quy mô phục vụ chuỗi quán cà phê vừa và nhỏ với các phân hệ nghiệp vụ chính: quản lý người dùng & phân quyền (`users`, `auth`), danh mục sản phẩm & topping (`products`, `categories`, `toppings`), đặt hàng & giữ tồn kho (`orders`), và thanh toán (`payments`).

Nhóm cần lựa chọn kiến trúc phần mềm cho backend giữa hai giải pháp:
1. **Microservices Architecture**: Tách từng nghiệp vụ thành các dịch vụ nhỏ chạy độc lập (Auth Service, Product Service, Order Service, Payment Service).
2. **Modular Monolith Architecture**: Xây dựng toàn bộ hệ thống trong một tiến trình duy nhất (Single Deployment Unit) nhưng phân rã thành các Module độc lập theo ranh giới nghiệp vụ (Bounded Contexts).

## 2. Quyết định (Decision)
Nhóm quyết định lựa chọn **Kiến trúc Modular Monolith** trên nền tảng framework **NestJS (TypeScript)**:
* Toàn bộ mã nguồn backend được gom chung trong một ứng dụng NestJS.
* Mã nguồn được chia thành các Module độc lập: `AuthModule`, `UsersModule`, `ProductsModule`, `ToppingsModule`, `CategoriesModule`, `OrdersModule`, `PaymentsModule` và `PrismaModule`.
* Các module chỉ giao tiếp với nhau thông qua Service công khai (Inject qua Dependency Injection) hoặc gọi qua Prisma Client, không truy cập trực tiếp vào nội bộ private của module khác.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Giảm độ phức tạp vận hành (Low Operational Overhead)**: Toàn bộ backend đóng gói thành một container Docker duy nhất, triển khai cực kỳ đơn giản lên các nền tảng như Render, Railway, Fly.io mà không cần cấu hình API Gateway, Service Discovery hay mạng nội bộ (Service Mesh).
2. **Transaction cơ sở dữ liệu mạnh mẽ (ACID Transactions)**: Khi thực hiện đặt đơn hàng và giữ chỗ tồn kho (Task 2.2), hệ thống có thể sử dụng giao dịch Prisma `$transaction` trực tiếp trên PostgreSQL, đảm bảo tính toàn vẹn dữ liệu tuyệt đối mà không cần đến các giải pháp phân tán phức tạp như SAGA Pattern hay 2-Phase Commit.
3. **Hiệu năng cao, độ trễ thấp**: Giao tiếp giữa các module diễn ra trực tiếp trong bộ nhớ (In-process memory call), không phát sinh độ trễ mạng (Network Latency) như giữa các Microservices.
4. **Sẵn sàng chuyển đổi trong tương lai**: Do ranh giới các module được định nghĩa rõ ràng bằng NestJS Module, nếu trong tương lai nhu cầu tải tăng cao, nhóm có thể dễ dàng bóc tách `PaymentsModule` hoặc `OrdersModule` thành các microservice riêng biệt.

### Nhược điểm & Hạn chế (Cons):
1. **Rủi ro Single Point of Failure (SPoF) ở mức tiến trình**: Nếu một module bị rò rỉ bộ nhớ hoặc gặp lỗi không được xử lý (Unhandled Exception) làm crash tiến trình Node.js, toàn bộ API của hệ thống sẽ bị gián đoạn.
2. **Mở rộng đồng loạt (Coupled Scaling)**: Khi số lượng người dùng xem menu tăng đột biến, hệ thống phải scale toàn bộ backend thay vì chỉ scale riêng module sản phẩm.
