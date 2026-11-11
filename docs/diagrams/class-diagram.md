# Thiết Kế Sơ Đồ Lớp Miền Nghiệp Vụ (Task 2.3 - Domain Class Diagram)

> **Dự án**: BrewLite – Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Nhiệm vụ**: **Task 2.3 – Vẽ Class Diagram ở mức Domain**  
> **Mã định danh truy vết**: `Class-01`  
> **Chuẩn thiết kế**: UML 2.5 Specification  
> **Tệp mã nguồn PlantUML**: [`docs/diagrams/class-diagram.puml`](./class-diagram.puml)  
> **Tệp ảnh Vector SVG**: [`docs/diagrams/class-diagram.svg`](./class-diagram.svg)  
> **Tệp ảnh Bitmap PNG**: [`docs/diagrams/class-diagram.png`](./class-diagram.png)  

---

## 1. Giới thiệu tổng quan & Mục tiêu thiết kế

Tài liệu này hiện thực hóa **Task 2.3** của đồ án BrewLite, xây dựng sơ đồ lớp ở mức **Domain Model** (mô hình miền nghiệp vụ). Sơ đồ biểu diễn cấu trúc thông tin tĩnh của hệ thống, bao gồm các thực thể cốt lõi, thuộc tính, hành vi nghiệp vụ, quan hệ cấu trúc, ràng buộc đa số (*multiplicity*), và các kiểu liệt kê trạng thái (*enumerations*).

### Yêu cầu tiên quyết từ đề bài (Assignment 2):
1. **Bắt buộc có tối thiểu 7 lớp**: `User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, và `LoyaltyTransaction`.
2. **Thể hiện đầy đủ**: Thuộc tính chính, quan hệ, multiplicity và enum trạng thái.
3. **Tiêu chí nghiệm thu khắt khe**: Ba loại sơ đồ (Activity, Sequence, Class) **tuyệt đối không mâu thuẫn với SRS, Use-case hoặc Mô hình dữ liệu thực tế**.

---

## 2. Sơ đồ trực quan (Domain Class Diagram)

![Sơ đồ lớp miền nghiệp vụ BrewLite](./class-diagram.svg)

---

## 3. Đặc tả chi tiết các Lớp Miền Nghiệp Vụ (Domain Entities)

Sơ đồ bao gồm **10 thực thể** (đáp ứng trọn vẹn 7 thực thể bắt buộc + 3 thực thể hỗ trợ phân loại và topping theo CSDL thực tế):

### 3.1. Nhóm Người dùng & Khách hàng thân thiết
1. **`User`**: Đại diện cho tài khoản người dùng trong hệ thống (khách hàng hoặc nhân viên quầy).
   * **Thuộc tính**: `id: BigInt [PK]`, `fullName: String`, `email: String [Unique]`, `phone: String [Unique]`, `passwordHash: String`, `loyaltyPoints: Int = 0`, `role: user_role = customer`, `createdAt: DateTime`, `updatedAt: DateTime`.
   * **Phương thức**: `verifyPassword(plain: String): Boolean`, `addLoyaltyPoints(pts: Int): Void`, `deductLoyaltyPoints(pts: Int): Boolean`.
2. **`LoyaltyTransaction`**: Lưu vết chi tiết từng biến động điểm thưởng của khách hàng (yêu cầu bắt buộc của đề bài).
   * **Thuộc tính**: `id: BigInt [PK]`, `userId: BigInt [FK]`, `orderId: BigInt [FK, Nullable]`, `points: Int`, `type: loyalty_type (EARN/REDEEM/ADJUST)`, `balanceAfter: Int`, `reason: String`, `createdAt: DateTime`.
   * **Phương thức**: `recordTransaction(): Void`.

### 3.2. Nhóm Danh mục & Sản phẩm
3. **`Category`**: Phân loại thức uống (Cà phê, Trà sữa, Freeze, Trà trái cây).
   * **Thuộc tính**: `id: Int [PK]`, `name: String [Unique]`, `createdAt: DateTime`, `updatedAt: DateTime`.
   * **Phương thức**: `getActiveProducts(): List<Product>`.
4. **`Product`**: Sản phẩm đồ uống kinh doanh tại quán.
   * **Thuộc tính**: `id: BigInt [PK]`, `categoryId: Int [FK]`, `name: String`, `price: Decimal(12,2)`, `imageUrl: String`, `description: String`, `stock: Int = 0`, `version: Int = 0 {Optimistic Lock}`, `status: ProductStatus = active`, `createdAt: DateTime`, `updatedAt: DateTime`.
   * **Phương thức**: `isAvailable(): Boolean`, `checkStock(qty: Int): Boolean`, `decrementStock(qty: Int, expectedVer: Int): Boolean`, `incrementStock(qty: Int): Void`.
5. **`Topping`**: Các loại nguyên liệu kèm theo (trân châu, thạch đào, kem phô mai).
   * **Thuộc tính**: `id: Int [PK]`, `name: String [Unique]`, `price: Int`, `isAvailable: Boolean = true`, `createdAt: DateTime`.
   * **Phương thức**: `toggleAvailability(available: Boolean): Void`.

### 3.3. Nhóm Đơn hàng & Chi tiết món
6. **`Order`**: Đơn đặt hàng được khởi tạo bởi khách hàng.
   * **Thuộc tính**: `id: BigInt [PK]`, `userId: BigInt [FK]`, `promotionId: BigInt [FK, Nullable]`, `status: order_status = PENDING`, `subtotal: Decimal(12,2)`, `discountAmount: Decimal(12,2) = 0`, `total: Decimal(12,2)`, `createdAt: DateTime`, `updatedAt: DateTime`.
   * **Phương thức**: `calculateTotal(): Decimal`, `applyPromotion(promo: Promotion): Void`, `transitionTo(newStatus: order_status): Boolean`, `cancelAndRollback(): Void`.
7. **`OrderItem`**: Từng dòng sản phẩm trong đơn hàng (kèm kích cỡ và số lượng).
   * **Thuộc tính**: `id: BigInt [PK]`, `orderId: BigInt [FK]`, `productId: BigInt [FK]`, `size: product_size = M`, `qty: Int >= 1`, `unitPrice: Decimal(12,2)`, `lineTotal: Decimal(12,2)`.
   * **Phương thức**: `calculateLineTotal(): Decimal`.
8. **`OrderItemTopping`**: Bảng kết hợp trung gian liên kết topping chọn cho từng món.
   * **Thuộc tính**: `orderItemId: BigInt [PK, FK]`, `toppingId: Int [PK, FK]`, `priceAtTime: Int`.

### 3.4. Nhóm Thanh toán & Khuyến mãi
9. **`Payment`**: Bản ghi giao dịch thanh toán cho đơn hàng.
   * **Thuộc tính**: `id: BigInt [PK]`, `orderId: BigInt [FK]`, `idempotencyKey: String [Unique, UUIDv4]`, `amount: Decimal(12,2)`, `method: payment_method`, `status: payment_status = SUCCESS`, `transactionRef: String`, `createdAt: DateTime`.
   * **Phương thức**: `processPayment(): Boolean`, `isIdempotentDuplicate(key: String): Boolean`.
10. **`Promotion`**: Chương trình ưu đãi, mã giảm giá hoặc chiết khấu thành viên (yêu cầu bắt buộc của đề bài).
    * **Thuộc tính**: `id: BigInt [PK]`, `code: String [Unique]`, `description: String`, `discountType: discount_type`, `discountValue: Decimal(12,2)`, `minOrderValue: Decimal(12,2) = 0`, `startDate: DateTime`, `endDate: DateTime`, `isActive: Boolean = true`.
    * **Phương thức**: `isValid(now: DateTime, orderVal: Decimal): Boolean`, `computeDiscount(subtotal: Decimal): Decimal`.

---

## 4. Các kiểu Liệt kê Trạng thái & Phân loại (Domain Enumerations)

| Tên Enum | Giá trị hợp lệ | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| `order_status` | `PENDING`, `PAID`, `PREPARING`, `READY`, `COMPLETED`, `PAYMENT_FAILED`, `CANCELLED` | Vòng đời 7 trạng thái của đơn hàng theo máy trạng thái hữu hạn FSM. |
| `payment_method` | `WALLET`, `CARD` | Phương thức thanh toán trực tuyến mô phỏng (Ví điện tử hoặc Thẻ ngân hàng). |
| `payment_status` | `SUCCESS`, `FAILED` | Trạng thái thực thi của giao dịch thanh toán. |
| `product_size` | `S`, `M`, `L` | Kích cỡ đồ uống (Size S cơ sở, M +5.000đ, L +10.000đ). |
| `ProductStatus` | `active`, `inactive` | Trạng thái bật/tắt kinh doanh của đồ uống. |
| `user_role` | `customer`, `barista`, `admin` | Phân quyền vai trò người dùng trong hệ thống (RBAC). |
| `loyalty_type` | `EARN`, `REDEEM`, `ADJUST` | Bản chất giao dịch điểm thưởng (Tích điểm khi đơn PAID, Đổi điểm, Điều chỉnh hệ thống). |
| `discount_type` | `PERCENTAGE`, `FIXED_AMOUNT`, `MEMBERSHIP_TIER` | Loại hình giảm giá của chương trình khuyến mãi. |

---

## 5. Quan hệ & Ràng buộc Đa số (Multiplicity & Relationships)

1. **`Category "1" -- "0..*" Product`**: Một danh mục chứa từ 0 đến nhiều sản phẩm. Một sản phẩm thuộc về duy nhất một danh mục.
2. **`Product "1" -- "0..*" OrderItem`**: Một sản phẩm có thể được tham chiếu trong nhiều mục đặt hàng.
3. **`User "1" -- "0..*" Order`**: Một người dùng có thể thực hiện 0 hoặc nhiều đơn hàng.
4. **`Order "1" *-- "1..*" OrderItem` (Composition)**: Quan hệ hợp thành sống còn. Một đơn hàng bắt buộc phải có từ 1 đến nhiều món. Khi đơn hàng bị hủy bỏ hoàn toàn hoặc xóa khỏi hệ thống, các `OrderItem` con tự động bị xóa theo (`onDelete: Cascade`).
5. **`OrderItem "1" *-- "0..*" OrderItemTopping` (Composition)**: Một món có thể có 0 hoặc nhiều loại topping đi kèm.
6. **`Topping "1" -- "0..*" OrderItemTopping`**: Một loại topping có thể được dùng trong nhiều mục đặt hàng.
7. **`Order "1" -- "0..*" Payment`**: Một đơn hàng liên kết với các lượt thanh toán. Multiplicity `0..*` cho phép lưu vết các lần thanh toán thất bại (`PAYMENT_FAILED`) trước khi có 1 lần thanh toán thành công (`PAID`).
8. **`Promotion "0..1" -- "0..*" Order`**: Một đơn hàng có thể không áp dụng hoặc áp dụng tối đa 1 mã khuyến mãi/chiết khấu thành viên.
9. **`User "1" -- "0..*" LoyaltyTransaction`**: Một tài khoản người dùng sở hữu lịch sử gồm nhiều giao dịch điểm thưởng.
10. **`Order "0..1" -- "0..1" LoyaltyTransaction`**: Mỗi đơn hàng thanh toán thành công tạo ra duy nhất một bản ghi cộng điểm tương ứng ($10.000\text{đ} = 1\text{ điểm}$).

---

## 6. Đối soát Tiêu chí Nghiệm thu Khắt khe (Acceptance Criteria Verification)

Đề bài yêu cầu: *"Ba loại sơ đồ không mâu thuẫn với SRS, use-case hoặc mô hình dữ liệu."* Dưới đây là ma trận chứng minh tính nhất quán tuyệt đối:

### 6.1. Nhất quán 100% với Mô hình Dữ liệu thực tế (`backend/prisma/schema.prisma`)
* Mọi kiểu dữ liệu đều ánh xạ chuẩn xác:
  * Kiểu ID: `BigInt` (khớp với PostgreSQL `bigserial/autoincrement`).
  * Tiền tệ: `Decimal(12,2)` (khớp với cột `total`, `lineTotal`, `amount` trong Prisma).
  * Khóa lạc quan: Cột `version: Int @default(0)` của `Product` hiện diện chính xác, bảo đảm cơ chế chống bán âm kho.
  * Chống trùng lặp: Thuộc tính `idempotencyKey: String @unique` của `Payment` hoàn toàn khớp với ràng buộc CSDL.
  * Khóa ngoại và quan hệ: `onDelete: Cascade` từ `Order` xuống `OrderItem` và `OrderItemTopping` khớp với quan hệ Composition.

### 6.2. Nhất quán 100% với Đặc tả SRS (Task 1.2)
* Khớp với **FR-01** & **FR-02**: Có `stock`, `status`, `product_size`, và thực thể `Topping`.
* Khớp với **FR-03**: Cấu trúc `OrderItem` và `OrderItemTopping` lưu giữ đúng danh sách món, topping và tính `lineTotal`.
* Khớp với **FR-04**: `User` có `passwordHash` (mã hóa bcrypt), `role` (`customer`, `barista`).
* Khớp với **FR-05** & **NFR-03**: `Order` khởi tạo `PENDING`, `Product.version` thực thi Optimistic Concurrency Control.
* Khớp với **FR-06**: `Payment` lưu `idempotencyKey`, `payment_method` (`WALLET`, `CARD`), chuyển `Order.status` sang `PAID`.
* Khớp với **FR-07** & **FR-11**: `LoyaltyTransaction` và `Promotion` đáp ứng đầy đủ cơ chế tích điểm $10.000\text{đ} = 1\text{ điểm}$ và chiết khấu hạng thành viên.
* Khớp với **FR-08**: `order_status` thể hiện đúng 7 bước của máy trạng thái FSM.

### 6.3. Nhất quán 100% với Sequence Diagram (Task 2.2)
* Sequence Diagram thể hiện tương tác thời gian thực giữa các lớp:
  * Bước gọi API `POST /orders` $\rightarrow$ sinh ra đối tượng `Order` và các `OrderItem`.
  * Bước gọi `POST /payments` kèm header `Idempotency-Key` $\rightarrow$ kiểm tra trường `Payment.idempotencyKey` trước khi trừ tiền.
  * Khi giao dịch thành công $\rightarrow$ cập nhật `Order.status = PAID` và nạp bản ghi `LoyaltyTransaction(type: EARN)`.

### 6.4. Nhất quán 100% với Activity Diagram (Task 2.1)
* Nhánh kiểm tra tồn kho (`stock > 0`) khớp với phương thức `Product.checkStock()`.
* Nhánh thanh toán thất bại $\rightarrow$ kích hoạt `Order.cancelAndRollback()` hoàn lại số lượng `Product.incrementStock()`.
