# Đặc Tả Sơ Đồ Hoạt Động (Activity Diagram - Task 2.1)

> **Dự án**: BrewLite – Coffee Ordering System  
> **Mã truy vết**: Activity-01  
> **Tệp nguồn PlantUML**: [`activity-order-flow.puml`](activity-order-flow.puml)  
> **Tệp ảnh SVG**: [`activity-order-flow.svg`](activity-order-flow.svg)  
> **Tệp ảnh PNG**: [`activity-order-flow.png`](activity-order-flow.png)  

---

## 1. Mục đích và Phạm vi mô hình hóa
Sơ đồ hoạt động này mô hình hóa toàn bộ chu trình nghiệp vụ **End-to-End** từ khi khách hàng mở ứng dụng, duyệt menu, tùy biến món, kiểm tra giỏ hàng, xác thực tài khoản, tạo đơn trong Transaction, thanh toán trực tuyến mô phỏng, đến quá trình nhân viên Barista tiếp nhận đơn và bàn giao món tại quầy.

---

## 2. Các phân làn trách nhiệm (Swimlanes)
Sơ đồ được phân tách thành 5 làn trách nhiệm tương ứng với kiến trúc hệ thống:

1. **Khách hàng (Customer)**: Thao tác duyệt món, tùy chọn size/topping, tiến hành đặt hàng, chọn phương thức thanh toán và nhận đồ uống tại quầy.
2. **Giao diện người dùng (Next.js UI)**: Xử lý hiển thị responsive mobile-first, lưu trữ giỏ hàng và phiên đăng nhập (LocalStorage), sinh mã `idempotencyKey` và chuyển hướng màn hình.
3. **Backend & Cơ sở dữ liệu (NestJS API & DB)**: Xử lý xác thực JWT, mở Database Transaction (`$transaction`), kiểm tra tồn kho bằng Optimistic Lock (`version`), ghi nhận thanh toán và cộng điểm `loyaltyPoints`.
4. **Cổng thanh toán (Payment Service)**: Mô phỏng trừ tiền qua Ví điện tử (`WALLET`) hoặc Thẻ (`CARD`), hỗ trợ Idempotency Key chống trừ trùng.
5. **Nhân viên quầy (Barista)**: Nhận danh sách đơn hàng đã thanh toán (`PAID`), cập nhật tuần tự `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`.

---

## 3. Các điểm rẽ nhánh và luồng xử lý ngoại lệ chính
1. **Kiểm tra tồn kho khi chọn món**: Nếu `stock = 0`, vô hiệu hóa nút chọn và hiển thị nhãn "Hết hàng".
2. **Kiểm tra phiên đăng nhập (JWT)**: Nếu chưa đăng nhập, tạm lưu giỏ hàng và điều hướng sang `/login?redirect=/checkout`.
3. **Kiểm tra tồn kho & Khóa lạc quan (Optimistic Concurrency)**: Nếu tồn kho không đủ hoặc xung đột `version`, Transaction tự động rollback và báo lỗi cho khách hàng điều chỉnh giỏ.
4. **Kiểm tra chống trừ trùng tiền (Idempotency)**: Nếu `idempotencyKey` đã tồn tại trong CSDL, trả về ngay kết quả giao dịch trước đó mà không trừ tiền lần 2.
5. **Thanh toán thất bại / Timeout**: Chuyển đơn sang `PAYMENT_FAILED`, mở Transaction hoàn trả số lượng tồn kho (Stock Rollback), cho phép khách hàng đổi phương thức thanh toán hoặc hủy đơn (`CANCELLED`).
