# ADR 005: Cơ Chế Xác Thực & Phân Quyền Bằng JSON Web Token (JWT Stateless Authentication)

* **Trạng thái (Status)**: Chấp thuận (Accepted)
* **Ngày quyết định (Date)**: 2026-10-24
* **Người quyết định (Deciders)**: Nhóm phát triển BrewLite
* **Liên kết yêu cầu (Requirements)**: Task 1.3, Task 2.2, Task 3.1, FR-04, NFR-03 (Bảo mật)

---

## 1. Ngữ cảnh (Context)
BrewLite phục vụ nhiều đối tượng người dùng qua giao diện Web và PWA di động:
* Khách hàng (`customer`): Đặt món, thanh toán, xem lịch sử đơn, tích lũy điểm thưởng loyalty.
* Nhân viên pha chế (`barista`): Tiếp nhận đơn, đổi trạng thái đơn, quản lý bật/tắt nguyên liệu.

Cần một cơ chế xác thực an toàn, nhẹ nhàng và tương thích hoàn hảo giữa Frontend (Next.js) và Backend REST API (NestJS). Có hai phương án:
1. **Stateful Session (Cookie + Session Store)**: Máy chủ lưu session trên bộ nhớ/Redis, gửi cookie `connect.sid` về cho client.
2. **Stateless JWT (JSON Web Token)**: Máy chủ ký điện tử thông tin người dùng vào token và gửi về cho client lưu trữ.

## 2. Quyết định (Decision)
Nhóm quyết định áp dụng cơ chế **Stateless JWT Authentication**:
* Khi người dùng đăng nhập thành công (`POST /api/auth/login`), NestJS `AuthService` sinh ra một `access_token` có chứa payload: `{ sub: userId, email: user.email, role: user.role }`, được ký bằng khóa bí mật `JWT_SECRET` với thuật toán HMAC-SHA256, thời hạn 1 ngày.
* Client lưu trữ token trong bộ nhớ ứng dụng / LocalStorage và đính kèm vào HTTP Header: `Authorization: Bearer <token>` trong các yêu cầu gọi API.
* Tại backend, sử dụng `@nestjs/passport` kết hợp `JwtAuthGuard` để giải mã và kiểm tra tính hợp lệ của chữ ký mà không cần truy vấn lại bảng User cho mỗi request, giúp tối ưu hiệu năng.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Không tiêu tốn bộ nhớ server (Stateless)**: Backend không cần lưu session id hay duy trì cụm Redis session, giảm thiểu chi phí tài nguyên và giúp ứng dụng dễ dàng mở rộng theo chiều ngang (Horizontal Scaling).
2. **Tương thích cao với Mobile/PWA**: Token dạng chuỗi dễ dàng truyền qua HTTP Header trên mọi nền tảng trình duyệt di động mà không lo ngại sự cố chặn Cookie bên thứ ba (Third-party cookie restrictions).
3. **Phân quyền vai trò (Role-Based Access Control - RBAC) tức thì**: Vai trò của người dùng (`role: customer | barista`) được nhúng trực tiếp trong payload, cho phép NestJS Guard kiểm tra quyền truy cập endpoint ngay lập tức.

### Nhược điểm & Hạn chế (Cons):
1. **Khó thu hồi token tức thì (Revocation)**: Do JWT là stateless, nếu token bị lộ trước khi hết hạn (chưa hết TTL), máy chủ không thể vô hiệu hóa ngay trừ khi áp dụng danh sách đen (Token Blacklist/Denylist) lưu trên Redis.
