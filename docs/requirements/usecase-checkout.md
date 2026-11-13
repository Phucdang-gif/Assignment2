# Đặc Tả Use-Case Trọng Tâm: Đặt và Thanh Toán Đơn Hàng (Task 1.3)

> **Dự án**: BrewLite – Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Mã Use-case**: **UC-01: Đặt và thanh toán đơn hàng (Place Order & Payment)**  
> **Phiên bản**: 1.0 (Chuẩn UML 2.0 Quốc Tế)  
> **Tệp mã nguồn PlantUML**: [`docs/diagrams/usecase-checkout.puml`](../diagrams/usecase-checkout.puml)  
> **Tệp ảnh Vector SVG**: [`docs/diagrams/usecase-checkout.svg`](../diagrams/usecase-checkout.svg)  
> **Tệp ảnh PNG**: [`docs/diagrams/usecase-checkout.png`](../diagrams/usecase-checkout.png)  
> **Bản in PDF**: [`docs/requirements/usecase-checkout.pdf`](usecase-checkout.pdf)  

---

## 1. Giới thiệu & Bối cảnh nghiệp vụ

Trong hệ sinh thái BrewLite, **"Đặt và thanh toán đơn hàng"** là luồng nghiệp vụ xương sống mang lại giá trị giao dịch cốt lõi. Luồng này chuyển hóa giỏ hàng của khách hàng thành đơn hàng chính thức trong hệ thống, bảo đảm kiểm soát tồn kho tức thời (tránh bán âm kho - overselling), thanh toán an toàn qua cổng mô phỏng (hỗ trợ chống trừ trùng lặp - idempotency), và kích hoạt quy trình pha chế cho nhân viên quầy (Barista).

---

## 2. Sơ đồ Use-case chuẩn UML 2.0 Quốc Tế

### 2.1. Quy tắc thiết kế chuẩn UML (OMG Specification)
1. **Actor chuẩn thế giới**: Tất cả tác nhân đều được vẽ bằng **hình người que (Stick figure)** (`Customer` và `Payment Service`).
2. **Use Case**: Thể hiện bằng **hình elip (oval/ellipse)** nằm ngang.
3. **Biên giới hệ thống (System Boundary)**: Hình chữ nhật bao trùm phân hệ nghiệp vụ cần mô hình hóa.
4. **Quan hệ `<<include>>` (Bắt buộc)**: Mũi tên nét đứt hướng từ **Base Use Case $\rightarrow$ Included Use Case**. Nếu không có use-case con này, use-case cha không thể hoàn tất.
5. **Quan hệ `<<extend>>` (Mở rộng có điều kiện)**: Mũi tên nét đứt hướng từ **Extension Use Case $\rightarrow$ VỀ Base Use Case** (Đúng chuẩn OMG UML: Base không biết trước ai extend nó, Extension trỏ về Base kèm điểm mở rộng / Extension Point).

### 2.2. Mã nguồn PlantUML chuẩn (`docs/diagrams/usecase-checkout.puml`)

```plantuml
@startuml usecase-checkout
!theme plain
skinparam packageStyle rectangle
skinparam shadowing false
skinparam actorStyle default
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam usecase {
    BackgroundColor #FFFFFF
    BorderColor #1E3A8A
    BorderThickness 1.5
    ArrowColor #2563EB
    ArrowThickness 1.2
}

skinparam actor {
    BackgroundColor #EFF6FF
    BorderColor #1E40AF
    BorderThickness 1.5
}

left to right direction

' --- 1. ACTORS (2 Tác nhân đặt phía bên trái) ---
actor "Khách hàng\n(Customer)" as Customer
actor "Cổng thanh toán\n(PayOS / MoMo)" as PaymentService

' --- 2. SYSTEM BOUNDARY ---
rectangle "Hệ thống BrewLite - Phân hệ Đặt hàng và Thanh toán" {
    usecase "Đặt và thanh toán\nđơn hàng" as UC_PlaceOrder
    usecase "Xử lý giao dịch\nthanh toán" as UC_ProcessPayment

    usecase "Xác thực phiên\nđăng nhập (JWT)" as UC_Auth
    usecase "Tạo đơn hàng và\nTrừ tồn kho (Transaction)" as UC_CreateOrder
    usecase "Giảm giá theo điểm\ntích lũy thành viên" as UC_Discount
    usecase "Tích lũy điểm\nthành viên" as UC_Loyalty
    usecase "Kiểm tra Idempotency\n(Chống trừ tiền trùng)" as UC_Idempotency
    usecase "Hoàn trả tồn kho\n(Stock Rollback)" as UC_Rollback

    ' <<include>>
    UC_PlaceOrder .right.> UC_ProcessPayment : <<include>>
    UC_PlaceOrder .down.> UC_Auth : <<include>>
    UC_PlaceOrder .down.> UC_CreateOrder : <<include>>

    ' <<extend>> (Từ Extension trỏ VỀ Base)
    UC_Discount .up.> UC_CreateOrder : <<extend>>
    UC_Loyalty .up.> UC_ProcessPayment : <<extend>>
    UC_Idempotency .up.> UC_ProcessPayment : <<extend>>
    UC_Rollback .up.> UC_ProcessPayment : <<extend>>

    UC_Auth -[hidden]right- UC_CreateOrder
    UC_CreateOrder -[hidden]right- UC_Loyalty
    UC_Loyalty -[hidden]right- UC_Idempotency
    UC_Idempotency -[hidden]right- UC_Rollback
}

Customer -[hidden]right- PaymentService
Customer -down- UC_PlaceOrder
PaymentService -down- UC_ProcessPayment

@enduml
```

### 2.3. Sơ đồ hình ảnh trực quan

![Sơ đồ Use-case Đặt và thanh toán](../diagrams/usecase-checkout.png)

---

## 3. Đặc tả chi tiết từng Use-Case (Đánh số tuần tự từ UC-01 đến UC-08)

Dưới đây là bảng đặc tả chi tiết cho toàn bộ 8 Use-Case trong phân hệ Đặt hàng và Thanh toán của BrewLite, được đánh số tuần tự từ **UC-01** đến **UC-08** theo đúng cấu trúc tiêu chuẩn:

### 3.1. UC-01: Đặt và thanh toán đơn hàng (Use-Case Tổng hợp Trọng tâm)

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-01 -- Đặt và thanh toán đơn hàng** |
| **Tóm tắt** | Chức năng cho phép Khách hàng kiểm tra giỏ hàng, áp dụng giảm giá dựa trên điểm tích lũy thành viên, kiểm tra và trừ tồn kho bằng Database Transaction an toàn, thực hiện thanh toán qua Cổng thanh toán (hỗ trợ Idempotency chống trừ tiền trùng), hoàn trả tồn kho nếu giao dịch thất bại và tích lũy điểm thưởng thành viên khi hoàn tất. |
| **Dòng sự kiện chính** | 1. **Khách hàng (Customer)** truy cập giỏ hàng (`/cart`) trên **Next.js UI**, có thể nhập mã giảm giá (`voucherCode`) và nhấn nút **"Thanh toán"**.<br>2. **Next.js UI** kiểm tra phiên đăng nhập (JWT Token) ở `useAuthStore`; nếu hợp lệ, gửi yêu cầu tạo đơn hàng `POST /api/orders` kèm `items` và `voucherCode` (nếu có).<br>3. **NestJS API** xác thực JWT token (`JwtAuthGuard`), trích xuất `userId`, kiểm tra điểm `loyaltyPoints` và tính chiết khấu hạng thành viên + voucher.<br>4. **NestJS API** mở Transaction (`$transaction`) trên **PostgreSQL**: kiểm tra và trừ tồn kho nguyên liệu (`Ingredient.stock` theo `ProductRecipeItem`), cập nhật `Product.version` theo khóa lạc quan, lưu bản ghi `Order` với trạng thái `PENDING` cùng `OrderItem`, `OrderItemTopping`.<br>5. **Next.js UI** nhận phản hồi tạo đơn thành công (`orderId`), chuyển sang trang `/checkout` hiển thị tóm tắt đơn và đếm ngược giữ chỗ (5 phút).<br>6. Khách hàng chọn phương thức thanh toán (`WALLET` / `CARD` / `PayOS` / `MoMo`) và nhấn **"Xác nhận thanh toán"**.<br>7. **Next.js UI** sinh mã `idempotencyKey` (UUID v4) và gửi yêu cầu thanh toán `POST /api/payments` kèm `orderId`, `method`, `amount` và `idempotencyKey` đến **NestJS API**.<br>8. **NestJS API** kiểm tra khóa `idempotencyKey` trong CSDL chống trùng lặp, sau đó xử lý giao dịch hoặc chuyển tiếp sang **Cổng thanh toán (PayOS / MoMo)**.<br>9. Khi giao dịch thành công (`SUCCESS`), **NestJS API** mở Database Transaction: lưu bản ghi `Payment`, cập nhật `Order` sang `PAID`, cộng điểm tích lũy thành viên vào `User.loyaltyPoints`, ghi lịch sử vào `LoyaltyTransaction`, và phản hồi HTTP `200/201`.<br>10. **Next.js UI** nhận kết quả thành công, xóa giỏ hàng (`clearCart()`) và điều hướng khách hàng đến màn hình chi tiết đơn hàng (`/orders/:id`). |
| **Dòng sự kiện phụ** | - **2a. Phiên đăng nhập hết hạn hoặc chưa đăng nhập**: Next.js UI bảo lưu giỏ hàng ở LocalStorage và chuyển hướng người dùng đến trang Đăng nhập (`/login?redirect=/cart`).<br>- **3a. Khách hàng chưa đạt mốc tích lũy điểm**: Không áp dụng chiết khấu hạng thành viên (giữ nguyên giá gốc hoặc chỉ áp dụng voucher nếu có).<br>- **4a. Nguyên liệu hết hàng hoặc xung đột tồn kho (Optimistic Lock)**: NestJS API hủy bỏ Transaction (Rollback 100%) và trả về HTTP 400/409; Next.js UI hiển thị banner cảnh báo để điều chỉnh giỏ hàng.<br>- **8a. Gửi lại request với Idempotency Key đã tồn tại**: NestJS API phát hiện khóa đã xử lý, lập tức trả về kết quả cũ mà không gọi Cổng thanh toán lần 2 (chống trừ tiền trùng).<br>- **9a. Thanh toán bị hủy hoặc hết thời gian chờ (Timeout)**: Hệ thống kích hoạt hoàn trả tồn kho nguyên liệu (`cancelOrder`), cập nhật trạng thái đơn sang `CANCELLED` hoặc `PAYMENT_FAILED` và hoàn lại món về giỏ hàng (`/cart?status=cancelled`). |
| **Tiền điều kiện** | - Khách hàng đã đăng nhập vào hệ thống và sở hữu JSON Web Token (JWT Bearer) còn hiệu lực.<br>- Giỏ hàng có ít nhất một sản phẩm hợp lệ (`items.length > 0`).<br>- Toàn bộ sản phẩm và topping trong đơn hàng đều đang được mở bán (`isAvailable = true`). |
| **Hậu điều kiện** | - **Thành công**: Đơn hàng được lưu vào CSDL với trạng thái `PAID`; tồn kho bị trừ tương ứng và trường `version` tăng 1; giao dịch thanh toán được ghi nhận cùng `idempotencyKey`; khách hàng được cộng điểm tích lũy thành viên; giỏ hàng được làm rỗng và giao diện chuyển đến trang chi tiết đơn hàng.<br>- **Thất bại**: Giao dịch bị Rollback hoặc được hoàn trả tồn kho (Stock Rollback); đơn hàng chuyển sang trạng thái `PAYMENT_FAILED` hoặc không được tạo; giỏ hàng của khách hàng được bảo lưu nguyên vẹn. |

---

### 3.2. UC-02: Xác thực phiên đăng nhập (JWT)

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-02 -- Xác thực phiên đăng nhập (JWT)** |
| **Tóm tắt** | Chức năng kiểm tra tính hợp lệ và thời hạn của JSON Web Token (JWT Bearer) trong request header nhằm xác thực danh tính khách hàng trước khi cho phép thực hiện các thao tác đặt hàng và thanh toán. |
| **Dòng sự kiện chính** | 1. Next.js UI lấy chuỗi Bearer Token từ bộ nhớ LocalStorage và đính kèm vào Header `Authorization: Bearer <token>` của HTTP request.<br>2. Next.js UI gửi request đến NestJS API.<br>3. `AuthGuard` tại NestJS API chặn request và trích xuất chuỗi token từ Header.<br>4. `JwtService` thực hiện giải mã (verify signature) bằng secret key của hệ thống và kiểm tra thời hạn sống (`exp`) của token.<br>5. Hệ thống trích xuất thông tin người dùng (`userId`, `role`, `email`) và gán vào context đối tượng `Request.user`.<br>6. NestJS API cho phép request tiếp tục đi vào controller xử lý đơn hàng. |
| **Dòng sự kiện phụ** | - **1a. Token không tồn tại (chưa đăng nhập)**: Next.js UI chuyển hướng người dùng sang trang Đăng nhập (`/login?redirect=/checkout`).<br>- **4a. Token không hợp lệ hoặc bị giả mạo**: NestJS API từ chối request và trả về mã lỗi HTTP 401 Unauthorized.<br>- **4b. Token đã hết hạn (Expired Token)**: NestJS API trả về HTTP 401; UI xóa token cũ trong LocalStorage và yêu cầu khách hàng đăng nhập lại. |
| **Tiền điều kiện** | Khách hàng thực hiện hành động yêu cầu định danh (xác nhận giỏ hàng, đặt hàng, gửi thanh toán). |
| **Hậu điều kiện** | - **Thành công**: Danh tính khách hàng được xác thực hợp lệ và gán vào request context, cho phép thực thi logic nghiệp vụ tiếp theo.<br>- **Thất bại**: Request bị chặn lại với mã lỗi HTTP 401 Unauthorized, không có dữ liệu nghiệp vụ nào bị sửa đổi. |

---

### 3.3. UC-03: Tạo đơn hàng và Trừ tồn kho (Transaction)

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-03 -- Tạo đơn hàng và Trừ tồn kho (Transaction)** |
| **Tóm tắt** | Chức năng khởi tạo bản ghi đơn hàng ở trạng thái `PENDING` và đồng thời trừ số lượng tồn kho theo cơ chế Khóa lạc quan (Optimistic Concurrency Control qua trường `version`) trong một Atomic Database Transaction an toàn. |
| **Dòng sự kiện chính** | 1. Next.js UI gửi request `POST /api/orders` kèm chi tiết giỏ hàng, `voucherCode` (nếu có) và Bearer JWT Token đến NestJS API.<br>2. NestJS API kiểm tra sự tồn tại của các sản phẩm và topping trong đơn hàng.<br>3. NestJS API mở Transaction nguyên tử trên PostgreSQL (`prisma.$transaction`).<br>4. Hệ thống truy vấn công thức `ProductRecipeItem` theo kích cỡ và kiểm tra tồn kho nguyên liệu `Ingredient.stock` cùng trường `Product.version`.<br>5. Nếu `Ingredient.stock >= needed`, hệ thống trừ tồn kho nguyên liệu (`stock = stock - needed`) và tăng phiên bản sản phẩm (`version = version + 1`) với điều kiện `version` khớp.<br>6. Hệ thống tính lại đơn giá từ DB, áp dụng chiết khấu thành viên + voucher, tạo bản ghi `Order` ở trạng thái `PENDING` cùng `OrderItem` và `OrderItemTopping`.<br>7. Database Transaction commit thành công; NestJS API phản hồi HTTP 201 Created kèm `orderId` và `total`. |
| **Dòng sự kiện phụ** | - **5a. Tồn kho không đủ (`stock < qty`)**: Transaction tự động Rollback 100%, API trả về HTTP 400 Bad Request kèm thông báo sản phẩm đã hết hàng.<br>- **5b. Xung đột ghi đồng thời (Optimistic Lock -- sai `version`)**: Transaction Rollback, trả về HTTP 409 Conflict yêu cầu khách hàng thử lại.<br>- **6a. Lỗi kết nối CSDL hoặc gián đoạn transaction**: Hệ thống Rollback toàn bộ, không có đơn hàng rác nào được lưu lại. |
| **Tiền điều kiện** | Khách hàng đã được xác thực danh tính (JWT hợp lệ); giỏ hàng có ít nhất một sản phẩm mở bán. |
| **Hậu điều kiện** | - **Thành công**: Đơn hàng mới được tạo ở trạng thái `PENDING`; tồn kho sản phẩm bị trừ chính xác và `version` tăng thêm 1.<br>- **Thất bại**: CSDL giữ nguyên trạng thái ban đầu, không phát sinh đơn hàng rác và tồn kho không bị trừ âm. |

---

### 3.4. UC-04: Giảm giá theo điểm tích lũy thành viên

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-04 -- Giảm giá theo điểm tích lũy thành viên** |
| **Tóm tắt** | Chức năng tự động xác định mức chiết khấu phần trăm trên tổng giá trị đơn hàng dựa trên số điểm tích lũy và hạng thành viên của khách hàng (Bạc $\ge 20$ điểm: 5%, Vàng $\ge 50$ điểm: 10%, Kim Cương $\ge 100$ điểm: 15%). |
| **Dòng sự kiện chính** | 1. Trong quá trình tính toán giá trị đơn hàng, NestJS API truy vấn điểm tích lũy (`loyaltyPoints`) của khách hàng từ bảng `User`.<br>2. Hệ thống đối chiếu điểm số với các mốc xếp hạng thành viên: Dưới 20 điểm (0%); Từ 20 đến 49 điểm (Bạc - 5%); Từ 50 đến 99 điểm (Vàng - 10%); Từ 100 điểm trở lên (Kim Cương - 15%).<br>3. Hệ thống tính số tiền giảm giá (`discountAmount`) và tính lại tổng tiền thanh toán: `finalAmount = totalAmount - discountAmount`.<br>4. Hệ thống lưu giá trị chiết khấu vào đơn hàng và phản hồi về cho Next.js UI hiển thị chi tiết số tiền được giảm cho khách hàng. |
| **Dòng sự kiện phụ** | - **2a. Khách hàng chưa đạt mốc 20 điểm**: Không áp dụng chiết khấu (`discountAmount = 0`), tổng tiền thanh toán giữ nguyên giá gốc.<br>- **3a. Lỗi truy xuất điểm tích lũy**: Hệ thống mặc định tính theo giá gốc để không gián đoạn quy trình đặt hàng của khách. |
| **Tiền điều kiện** | Khách hàng đã đăng nhập và đang trong bước tính giá trị đơn hàng; thỏa mãn điều kiện điểm tích lũy $\ge 20$. |
| **Hậu điều kiện** | - **Thành công**: Tổng số tiền khách hàng cần thanh toán được giảm trừ chính xác theo tỷ lệ chiết khấu của hạng thành viên.<br>- **Thất bại**: Không áp dụng chiết khấu, đơn hàng giữ nguyên giá trị niêm yết ban đầu. |

---

### 3.5. UC-05: Xử lý giao dịch thanh toán

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-05 -- Xử lý giao dịch thanh toán** |
| **Tóm tắt** | Chức năng tiếp nhận yêu cầu thanh toán cho đơn hàng đã tạo, kiểm tra Idempotency, chuyển tiếp giao dịch sang Cổng thanh toán (PayOS / MoMo), cập nhật trạng thái đơn hàng sang `PAID` và kích hoạt tích lũy điểm khi thành công. |
| **Dòng sự kiện chính** | 1. Next.js UI gửi yêu cầu `POST /api/payments` kèm `orderId`, phương thức thanh toán (`WALLET`/`CARD`), `amount` và `idempotencyKey` đến NestJS API.<br>2. NestJS API kiểm tra trạng thái đơn hàng trong CSDL (phải là `PENDING`, không phải `CANCELLED`/`PAID`/`COMPLETED`).<br>3. Kích hoạt kiểm tra Idempotency để xác minh `idempotencyKey` chưa từng được thực hiện.<br>4. NestJS API xử lý thanh toán mô phỏng hoặc gọi sang API Cổng thanh toán (PayOS / MoMo).<br>5. Khi giao dịch thành công (`SUCCESS`), NestJS API mở Transaction tạo bản ghi `Payment`, cập nhật trạng thái đơn hàng thành `PAID`.<br>6. Kích hoạt use-case tích lũy điểm thành viên vào `User.loyaltyPoints` và ghi bảng `LoyaltyTransaction`.<br>7. NestJS API phản hồi thành công để Next.js UI xóa giỏ hàng và chuyển sang `/orders/:id`. |
| **Dòng sự kiện phụ** | - **2a. Đơn hàng không tồn tại hoặc đã được thanh toán trước đó**: NestJS API từ chối và trả về HTTP 400 Bad Request.<br>- **5a. Cổng thanh toán từ chối hoặc giao dịch thất bại (Ví không đủ tiền, lỗi thẻ)**: Cổng thanh toán phản hồi `FAILED` $\rightarrow$ Kích hoạt use-case Hoàn trả tồn kho (Stock Rollback), đơn hàng chuyển sang `PAYMENT_FAILED`.<br>- **5b. Cổng thanh toán mất kết nối hoặc quá thời gian (Timeout)**: Giữ nguyên trạng thái đơn hàng là `PENDING` để phục vụ cơ chế đối soát sau. |
| **Tiền điều kiện** | Đơn hàng đã được tạo thành công ở trạng thái `PENDING`; có chuỗi `idempotencyKey` duy nhất. |
| **Hậu điều kiện** | - **Thành công**: Đơn hàng chuyển sang `PAID`, bản ghi thanh toán được lưu trữ, điểm thưởng được cộng cho khách hàng.<br>- **Thất bại**: Đơn hàng chuyển sang `PAYMENT_FAILED`, tồn kho được hoàn trả lại đầy đủ, khách hàng nhận thông báo thử lại. |

---

### 3.6. UC-06: Kiểm tra Idempotency (Chống trừ tiền trùng)

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-06 -- Kiểm tra Idempotency (Chống trừ tiền trùng)** |
| **Tóm tắt** | Chức năng kiểm tra tính duy nhất của mã khóa Idempotency trong CSDL trước khi thực hiện giao dịch tài chính, ngăn chặn tình trạng khách hàng bị trừ tiền hai lần khi mạng lag hoặc bấm gửi nhiều lần. |
| **Dòng sự kiện chính** | 1. PaymentsService tiếp nhận chuỗi `idempotencyKey` từ request thanh toán của Client.<br>2. Hệ thống thực hiện truy vấn bảng `Payment` trong PostgreSQL theo trường `idempotencyKey`.<br>3. Nếu khóa **CHƯA** tồn tại trong CSDL: Hệ thống ghi nhận khóa này và cho phép tiếp tục quy trình gọi sang Cổng thanh toán. |
| **Dòng sự kiện phụ** | - **3a. Khóa ĐÃ tồn tại với trạng thái `COMPLETED`**:<br>1. Hệ thống nhận diện đây là yêu cầu gửi lại (retry do mạng lag).<br>2. Hệ thống lập tức ngắt luồng gọi sang Cổng thanh toán (chặn hoàn toàn việc trừ tiền lần 2).<br>3. Hệ thống lấy dữ liệu kết quả thanh toán trước đó trong CSDL và phản hồi ngay HTTP 200 OK kèm thông tin giao dịch cũ.<br>- **3b. Khóa ĐÃ tồn tại với trạng thái `PROCESSING`**: Hệ thống trả về HTTP 409 Conflict thông báo giao dịch đang được xử lý, đề nghị khách hàng chờ kết quả. |
| **Tiền điều kiện** | Yêu cầu thanh toán gửi đến hệ thống có đính kèm tham số `idempotencyKey`. |
| **Hậu điều kiện** | - **Thành công**: Đảm bảo giao dịch chỉ được trừ tiền duy nhất một lần trên Cổng thanh toán bất kể số lần Client gửi lại request.<br>- **Thất bại**: Không có giao dịch trùng lặp nào được tạo trong hệ thống. |

---

### 3.7. UC-07: Hoàn trả tồn kho (Stock Rollback)

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-07 -- Hoàn trả tồn kho (Stock Rollback)** |
| **Tóm tắt** | Chức năng tự động cộng bù lại số lượng tồn kho của các sản phẩm đã tạm trừ trước đó khi giao dịch thanh toán bị từ chối hoặc thất bại, giải phóng hàng tồn ảo cho các khách hàng khác đặt mua. |
| **Dòng sự kiện chính** | 1. Khi nhận tín hiệu thanh toán thất bại (`FAILED`) từ Cổng thanh toán hoặc lỗi hệ thống:<br>2. NestJS API mở Transaction nguyên tử trong PostgreSQL.<br>3. Cập nhật trạng thái của đơn hàng `Order` sang `PAYMENT_FAILED`.<br>4. Hệ thống truy vấn danh sách các món và số lượng mua tương ứng từ bảng `OrderItem`.<br>5. Với từng sản phẩm, hệ thống thực hiện hoàn kho: `stock = stock + quantity`, đồng thời tăng `version = version + 1`.<br>6. Hệ thống commit Transaction hoàn kho và ghi log kiểm toán sự kiện (Audit Log: Stock Rollback Completed).<br>7. Phản hồi thông báo lỗi về Next.js UI để khách hàng có thể chọn phương thức thanh toán khác hoặc đặt lại. |
| **Dòng sự kiện phụ** | - **4a. Không tìm thấy chi tiết món trong đơn hàng**: Hệ thống phát tín hiệu cảnh báo khẩn cấp (Critical Log) để quản trị viên kiểm tra dữ liệu thủ công. |
| **Tiền điều kiện** | Đơn hàng đã trừ kho trước đó nhưng giao dịch thanh toán bị hủy, từ chối hoặc thất bại. |
| **Hậu điều kiện** | - **Thành công**: Toàn bộ số lượng sản phẩm được hoàn trả chính xác vào kho hàng; trạng thái đơn hàng là `PAYMENT_FAILED`.<br>- **Thất bại**: Transaction hoàn kho được tự động thử lại (retry queue) để đảm bảo không bị thất thoát hàng hóa. |

---

### 3.8. UC-08: Tích lũy điểm thành viên

| Thuộc tính | Chi tiết đặc tả Use-Case |
| :--- | :--- |
| **Usecase ID** | **UC-08 -- Tích lũy điểm thành viên** |
| **Tóm tắt** | Chức năng tính toán và tự động cộng điểm thưởng tích lũy vào tài khoản khách hàng sau khi đơn hàng được thanh toán thành công ($10.000\text{ VNĐ} = 1\text{ điểm}$). |
| **Dòng sự kiện chính** | 1. Sau khi Cổng thanh toán phản hồi `SUCCESS` và đơn hàng chuyển sang `PAID`:<br>2. NestJS API lấy giá trị thanh toán thực tế (`total`) của đơn hàng.<br>3. Hệ thống tính số điểm thưởng tích lũy: `pointsEarned = Math.floor(total / 10000)`.<br>4. NestJS API cộng điểm vào trường `loyaltyPoints` của người dùng trong bảng `User`: `loyaltyPoints = loyaltyPoints + pointsEarned`.<br>5. Hệ thống ghi lại bản ghi lịch sử cộng điểm vào bảng `LoyaltyTransaction` (`type: 'EARN'`, `balanceAfter`, `reason`).<br>6. Phản hồi số điểm mới tích lũy (`pointsEarned`) về Next.js UI để hiển thị thông báo trên màn hình chi tiết đơn hàng. |
| **Dòng sự kiện phụ** | - **3a. Tổng tiền đơn hàng dưới 10.000 VNĐ**: Số điểm tích lũy cộng thêm là 0 điểm.<br>- **4a. Gặp lỗi khi cộng điểm vào CSDL**: Không làm gián đoạn trạng thái đơn hàng (đơn hàng vẫn là `PAID`), tác vụ cộng điểm được đẩy vào hàng đợi retry để xử lý lại. |
| **Tiền điều kiện** | Đơn hàng đã được thanh toán thành công và chuyển sang trạng thái `PAID`. |
| **Hậu điều kiện** | - **Thành công**: Điểm thưởng của khách hàng được cập nhật tăng thêm tương ứng, khách hàng có thể dùng điểm để nâng hạng và nhận chiết khấu cho các đơn hàng tiếp theo.<br>- **Thất bại**: Không ảnh hưởng đến đơn hàng đã thanh toán thành công. |

---

---

## 4. Tiêu chí nghiệm thu: Hệ thống Làm gì và Không làm gì

| Hệ thống LÀM GÌ (In-Scope System Responsibilities) | Hệ thống KHÔNG LÀM GÌ (Out-of-Scope) |
| :--- | :--- |
| **Xác thực JWT token** bắt buộc trước khi tạo đơn và thanh toán. | **Không** cho phép thanh toán nặc danh / không tài khoản định danh. |
| **Kiểm soát tồn kho tức thời** bằng Khóa lạc quan (Optimistic Concurrency Control qua trường `version`) để ngăn ngừa bán âm kho (Overselling). | **Không** giữ hàng (hold stock) vô hạn định khi khách chưa bấm thanh toán. |
| **Đảm bảo tính toàn vẹn (ACID Transaction)**: Tạo Order, OrderItem và trừ kho trong một `$transaction`. Bất kỳ lỗi nào sẽ Rollback toàn bộ. | **Không** thực hiện tạo đơn và trừ kho thành 2 bước tách rời ngoài transaction. |
| **Chống thanh toán trùng lặp (Idempotency Key)**: Nếu client gửi lại cùng mã `idempotencyKey`, hệ thống trả về kết quả cũ mà không trừ tiền lần 2. | **Không** tích hợp ngân hàng thật phức tạp (dùng mock payment gateway chuẩn REST API). |
| **Tự động cộng điểm `loyaltyPoints`** khi đơn hàng chuyển sang trạng thái `PAID`. | **Không** hỗ trợ ship hàng bên thứ 3 (chỉ phục vụ nhận tại quán / take away). |

---

## 5. Các luồng sự kiện chi tiết (Khớp 1:1 với Sequence Diagram Task 2.2)

### 5.1. Luồng chính (Main Success Flow - Happy Path)
1. **Customer $\rightarrow$ Next.js UI**: Khách hàng xem lại giỏ hàng tại `/cart`, có thể nhập mã giảm giá (`voucherCode`) và bấm **"Thanh toán"**.
2. **Next.js UI $\rightarrow$ Next.js UI**: Kiểm tra JWT token trong `useAuthStore` (`LocalStorage`). Nếu hợp lệ, gửi `POST /api/orders` kèm Bearer JWT Token, `items` và `voucherCode` (nếu có).
3. **NestJS API $\rightarrow$ NestJS API**: Xác thực JWT token (`JwtAuthGuard`), validate dữ liệu giỏ hàng (`CreateOrderDto`), tính lại giá từ DB + giảm giá thành viên + voucher.
4. **NestJS API $\rightarrow$ Database**: Mở **Prisma `$transaction`**:
   - Truy vấn công thức `ProductRecipeItem` theo size, kiểm tra & trừ `Ingredient.stock`.
   - Cập nhật `Product.version` với điều kiện Optimistic Lock (`WHERE id = :id AND version = :v`).
   - `INSERT INTO "Order" (status: 'PENDING', subtotal, discountAmount, total, promotionId)`
   - `INSERT INTO "OrderItem"` và `"OrderItemTopping"`
   - Commit transaction và trả về `orderId`, `total`.
5. **NestJS API $\rightarrow$ Next.js UI**: Phản hồi HTTP `201 Created` kèm `orderId`. UI chuyển sang trang `/checkout` kèm đồng hồ giữ chỗ 5 phút.
6. **Customer $\rightarrow$ Next.js UI**: Khách chọn phương thức (`WALLET` / `CARD` / `PayOS` / `MoMo`) và bấm **"Xác nhận thanh toán"**.
7. **Next.js UI $\rightarrow$ NestJS API**: Sinh mã `idempotencyKey` (UUID v4) và gọi `POST /api/payments` kèm `{ orderId, method, idempotencyKey, amount }`.
8. **NestJS API $\rightarrow$ Payment Service**: Kiểm tra `idempotencyKey` trong DB (chưa có). Xử lý thanh toán mô phỏng hoặc gọi sang Cổng thanh toán PayOS / MoMo.
9. **Payment Service $\rightarrow$ NestJS API**: Phản hồi kết quả `{ status: "SUCCESS", transactionRef: "..." }`.
10. **NestJS API $\rightarrow$ Database**: Mở transaction cập nhật:
    - Lưu bản ghi `Payment` với `idempotencyKey`, `status: "SUCCESS"`.
    - Cập nhật đơn hàng `Order` sang trạng thái `PAID`.
    - Cộng điểm tích lũy vào `loyaltyPoints` của `User` và ghi lịch sử vào bảng `LoyaltyTransaction`.
11. **NestJS API $\rightarrow$ Next.js UI**: Phản hồi HTTP `200/201` (Thanh toán thành công).
12. **Next.js UI $\rightarrow$ Customer**: Gọi `clearCart()`, hiển thị thông báo thành công và chuyển hướng sang màn hình theo dõi đơn hàng (`/orders/:id`).

### 5.2. Luồng thay thế (Alternative Flows)
- **A1 - Đổi phương thức thanh toán**: Tại Bước 6, khách chuyển đổi giữa `WALLET`, `CARD`, `PayOS VietQR` hoặc `MoMo`.
- **A2 - Idempotency Retry (Mạng lag/khách bấm 2 lần)**: Tại Bước 8, NestJS API phát hiện `idempotencyKey` đã tồn tại trong DB $\rightarrow$ Trả về ngay kết quả giao dịch cũ, không gọi Cổng thanh toán và không trừ tiền lần 2.

### 5.3. Luồng ngoại lệ (Exception Flows)
- **E1 - Giỏ hàng rỗng**: UI phát hiện `items.length === 0` $\rightarrow$ Hiển thị trạng thái giỏ hàng trống.
- **E2 - Chưa đăng nhập hoặc Token hết hạn (HTTP 401)**: UI chuyển hướng sang `/login?redirect=/cart` (giữ nguyên giỏ hàng trong LocalStorage).
- **E3 - Nguyên liệu hết hàng / Xung đột tồn kho (HTTP 400/409)**: Tại Bước 4, nếu `Ingredient.stock < needed` hoặc xung đột `Product.version` $\rightarrow$ Rollback transaction, UI hiển thị banner cảnh báo đỏ (`cartAlert`).
- **E4 - Thanh toán bị hủy hoặc hết thời gian chờ (Timeout)**: Đơn hàng bị hủy (`CANCELLED`) hoặc đánh dấu `PAYMENT_FAILED`, hoàn trả lại tồn kho nguyên liệu (`Ingredient.stock`), và hoàn lại món vào giỏ hàng (`/cart?status=cancelled`).
- **E5 - Cổng thanh toán mất kết nối (HTTP 504 Gateway Timeout)**: Quá thời gian phản hồi $\rightarrow$ Giữ trạng thái đơn `PENDING` chờ đối soát.

---

## 6. Tiêu chí chấp nhận (Acceptance Criteria) để viết Test

- **AC-INT-01 (Tạo đơn trong Transaction)**: Given Khách hàng đăng nhập và nguyên liệu trong `Ingredient` đủ định mức `ProductRecipeItem`, `Product.version = 0`. When gửi `POST /api/orders`. Then trả về `201 Created`, đơn `PENDING`, nguyên liệu bị trừ đúng định mức và `Product.version = 1`.
- **AC-INT-02 (Chống bán âm kho - Optimistic Locking)**: Given Nguyên liệu chỉ đủ cho 1 ly. When gửi `POST /api/orders` đặt số lượng 2. Then trả về `400 Bad Request`, không tạo đơn nào, `Ingredient.stock` giữ nguyên.
- **AC-INT-03 (Chống trùng tiền - Idempotency Key)**: Given Đơn hàng đã thanh toán với mã `idempotencyKey = "uuid-01"`. When gửi lại `POST /api/payments` lần 2 với cùng key. Then trả về kết quả cũ với `idempotent: true`, không trừ tiền lần 2.
- **AC-INT-04 (Tích lũy điểm thưởng & Lưu vết)**: Given Khách hàng có 10 điểm, đơn hàng trị giá 50.000đ. When thanh toán thành công `PAID`. Then điểm `loyaltyPoints` tăng lên 15 điểm và bảng `LoyaltyTransaction` ghi 1 bản ghi `EARN` (+5 điểm, `balanceAfter = 15`).
- **AC-E2E-01 (Mua hàng thành công trên UI)**: Khách chọn món $\rightarrow$ vào giỏ hàng $\rightarrow$ bấm thanh toán $\rightarrow$ chọn Ví/Thẻ $\rightarrow$ xác nhận $\rightarrow$ giỏ hàng rỗng $\rightarrow$ chuyển hướng sang `/orders/:id` với trạng thái `PAID`.
