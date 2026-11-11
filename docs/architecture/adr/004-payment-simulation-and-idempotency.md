# ADR 004: Thiết Kế Dịch Vụ Thanh Toán Mô Phỏng & Cơ Chế Idempotency Key Chống Trùng Lặp

* **Trạng thái (Status)**: Chấp thuận (Accepted)
* **Ngày quyết định (Date)**: 2026-10-22
* **Người quyết định (Deciders)**: Nhóm phát triển BrewLite
* **Liên kết yêu cầu (Requirements)**: Task 2.2, Task 3.1, FR-06 (Thanh toán an toàn), NFR-03 (Bảo mật & độ tin cậy)

---

## 1. Ngữ cảnh (Context)
Trong nghiệp vụ thương mại và đặt đồ uống trực tuyến:
* Mạng di động của khách hàng có thể chập chờn, khiến ứng dụng gửi lại yêu cầu thanh toán nhiều lần khi bấm nút (Network Retry).
* Nếu không có cơ chế phòng thủ, hệ thống có thể trừ tiền 2 lần cho cùng một đơn hàng hoặc tạo ra nhiều bản ghi thanh toán trùng lặp.
* Ngoài ra, trong phạm vi bài tập lớn và đồ án học phần, việc tích hợp cổng thanh toán thực tế (VNPAY, ZaloPay, MoMo Business) gặp khó khăn do yêu cầu pháp nhân doanh nghiệp, chữ ký số bảo mật và IP tĩnh.

## 2. Quyết định (Decision)
1. **Thiết kế Cổng Thanh Toán Mô Phỏng (Mock Payment Subsystem)**:
   * Giả lập đầy đủ các phương thức thanh toán: Ví điện tử (`WALLET`), Thẻ (`CARD`), và sinh mã động chuẩn chuyển khoản VietQR.
   * Hỗ trợ mô phỏng 100% các kịch bản thực tế: Thanh toán thành công (HTTP 200/201), Thanh toán thất bại do thiếu số dư (HTTP 400), và Quá thời gian chờ (Timeout 504).
2. **Cơ chế Idempotency Key**:
   * Khi Client gửi yêu cầu thanh toán đến `POST /api/payments`, bắt buộc gửi kèm một khóa duy nhất `idempotencyKey` (chuỗi UUID v4 được sinh từ phía Frontend).
   * Tại tầng cơ sở dữ liệu, cột `idempotencyKey` trong bảng `Payment` được đặt ràng buộc `UNIQUE` và có Index (`@unique @db.VarChar(255)`).
   * Backend kiểm tra:
     * Nếu `idempotencyKey` đã tồn tại trong bảng `Payment`: Không thực hiện trừ tiền lại, trả về ngay thông tin thanh toán đã xử lý trước đó với mã HTTP 200.
     * Nếu là key mới: Thực hiện giao dịch thanh toán trong Prisma Transaction, lưu bản ghi mới và chuyển trạng thái đơn hàng sang `PAID`.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Tuyệt đối an toàn trước lỗi gửi lặp (Safe Retries)**: Dù khách hàng vô tình bấm liên tục nhiều lần hoặc mạng bị rớt gói tin khiến axios tự động retry, tài khoản chỉ bị trừ tiền đúng một lần duy nhất.
2. **Độc lập và tự kiểm thử được toàn diện (Deterministic Testing)**: Nhóm có thể dễ dàng viết Unit Test và E2E Test để kiểm tra tự động cả nhánh thành công và thất bại mà không phụ thuộc vào tình trạng mạng hay máy chủ của bên thứ ba.
3. **Mô phỏng trải nghiệm người dùng thực tế**: Khách hàng vẫn quét được mã QR VietQR thật trên màn hình với đầy đủ số tiền, nội dung chuyển khoản và mã đơn hàng.

### Nhược điểm & Hạn chế (Cons):
1. **Cần dọn dẹp khóa cũ (Key Expiration)**: Hiện tại các bản ghi `idempotencyKey` được lưu vĩnh viễn trong bảng `Payment`. Trong hệ thống sản phẩm quy mô lớn, cần có cơ chế định kỳ dọn dẹp hoặc lưu tạm thời trên Redis với thời gian sống (TTL) 24h - 48h.
