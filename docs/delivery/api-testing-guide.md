# 🧪 Hướng Dẫn Kiểm Thử API với Thunder Client (BrewLite)

Tài liệu này tổng hợp toàn bộ các **Endpoint chính theo Mục 12.1 của đề bài môn Công nghệ Phần mềm**, kèm theo mẫu dữ liệu JSON thực tế để kiểm thử trực tiếp trên công cụ **Thunder Client** (VS Code) hoặc **Postman**.

---

## ⚙️ 1. Cấu hình Môi trường Chung

* **Base URL:** `http://localhost:3001` *(Cổng dịch vụ backend NestJS đang chạy qua Docker hoặc Local)*
* **Header mặc định:**
  ```http
  Content-Type: application/json
  ```
* **Authentication Header:**
  ```http
  Authorization: Bearer <access_token_nhan_duoc_khi_login>
  ```

---

## 📑 2. Danh Sách Endpoint Cốt Lõi (Mục 12.1 Đề bài)

| STT | Endpoint | Method | Chức năng theo Đề bài | Yêu cầu Auth (Token) |
| :-: | :--- | :---: | :--- | :---: |
| **1** | `/api/auth/register` | `POST` | Đăng ký tài khoản người dùng mới | ❌ Không |
| **2** | `/api/auth/login` | `POST` | Đăng nhập hệ thống, cấp mã JWT | ❌ Không |
| **3** | `/api/products` | `GET` | Danh sách sản phẩm menu (*Task 2*) | ❌ Không |
| **4** | `/api/products/:id` | `GET` | Tra cứu chi tiết một sản phẩm | ❌ Không |
| **5** | `/api/orders` | `POST` | Tạo đơn hàng mới trạng thái `PENDING` (*Task 6*) | ✅ **Bearer Token** |
| **6** | `/api/payments` | `POST` | Thanh toán đơn hàng chống trùng lặp (*Task 8 & 10*) | ❌ Tùy chọn |
| **7** | `/api/orders/me` | `GET` | Xem lịch sử các đơn hàng của người dùng | ✅ **Bearer Token** |

---

## 🚀 3. Kịch Bản Kiểm Thử Tuần Tự (End-to-End Test Flow)

Hãy thực hiện tuần tự từ **Bước 1 đến Bước 7** để đảm bảo có đủ dữ liệu (Token, ID đơn hàng) cho các bước tiếp theo.

---

### Bước 1: Đăng ký tài khoản (`POST /api/auth/register`)
Tạo một tài khoản khách hàng mới vào hệ thống.

* **Method:** `POST`
* **URL:** `http://localhost:3001/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
```json
{
  "email": "nguyenvana@gmail.com",
  "password": "Password123@",
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321"
}
```
* **Mã phản hồi mong đợi:** `201 Created`
* **Kết quả trả về mẫu:**
```json
{
  "id": "4",
  "email": "nguyenvana@gmail.com",
  "fullName": "Nguyễn Văn A",
  "loyaltyPoints": 0,
  "role": "customer"
}
```

---

### Bước 2: Đăng nhập hệ thống (`POST /api/auth/login`)
Đăng nhập để nhận chuỗi JWT Access Token.

* **Method:** `POST`
* **URL:** `http://localhost:3001/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
```json
{
  "email": "customer@brewlite.com",
  "password": "customer123"
}
```
*(Bạn cũng có thể đăng nhập bằng tài khoản vừa tạo ở Bước 1).*

* **Mã phản hồi mong đợi:** `200 OK` (hoặc `201`)
* **Kết quả trả về mẫu:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiY3VzdG9tZXJAYnJld2xpdGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzM...",
  "user": {
    "id": 2,
    "email": "customer@brewlite.com",
    "role": "customer",
    "loyaltyPoints": 50
  }
}
```
> 📌 **Hành động quan trọng:** Sao chép chuỗi giá trị trong `access_token` để sử dụng cho Bước 5 và Bước 7.

---

### Bước 3: Lấy danh sách thực đơn (`GET /api/products`) — *Task 2*
Lấy danh sách các món đồ uống đang kích hoạt (`status: 'active'`).

* **Method:** `GET`
* **URL:** `http://localhost:3001/api/products`
* **Headers:** *(Trống)*
* **Body:** *(Trống)*
* **Mã phản hồi mong đợi:** `200 OK`
* **Kết quả trả về mẫu:** Danh sách gồm 12 món đồ uống được seed sẵn:
```json
[
  {
    "id": "1",
    "categoryId": 1,
    "name": "Cà phê sữa đá",
    "price": "35000",
    "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60",
    "stock": 100,
    "version": 0,
    "status": "active"
  },
  {
    "id": "2",
    "categoryId": 1,
    "name": "Americano",
    "price": "40000",
    "imageUrl": "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=60",
    "stock": 80,
    "version": 0,
    "status": "active"
  }
]
```

---

### Bước 4: Xem chi tiết một sản phẩm (`GET /api/products/:id`)
Lấy thông tin của sản phẩm cụ thể theo `id`.

* **Method:** `GET`
* **URL:** `http://localhost:3001/api/products/1`
* **Headers:** *(Trống)*
* **Body:** *(Trống)*
* **Mã phản hồi mong đợi:** `200 OK`
* **Kết quả trả về mẫu:**
```json
{
  "id": "1",
  "categoryId": 1,
  "name": "Cà phê sữa đá",
  "price": "35000",
  "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60",
  "stock": 100,
  "version": 0,
  "status": "active",
  "category": {
    "id": 1,
    "name": "Cà phê"
  }
}
```

---

### Bước 5: Tạo đơn hàng mới (`POST /api/orders`) — *Task 6 & Task 10*
Tạo một đơn hàng mới từ giỏ hàng. Đơn hàng sẽ được khởi tạo với trạng thái ban đầu là `PENDING`.

* **Method:** `POST`
* **URL:** `http://localhost:3001/api/orders`
* **Auth:** 
  * Trong Thunder Client, chuyển sang tab **Auth**
  * Chọn kiểu: **Bearer Token**
  * Dán mã `access_token` thu được từ Bước 2 vào ô Token.
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
```json
{
  "items": [
    {
      "productId": 1,
      "size": "M",
      "qty": 2,
      "price": 35000,
      "toppings": [
        "Trân châu đen hoàng gia"
      ]
    },
    {
      "productId": 3,
      "size": "L",
      "qty": 1,
      "price": 45000
    }
  ]
}
```
* **Mã phản hồi mong đợi:** `201 Created`
* **Kết quả trả về mẫu:**
```json
{
  "message": "Tạo đơn hàng thành công",
  "orderId": 4,
  "total": 103500,
  "rawTotal": 115000,
  "discount": 11500,
  "loyaltyPoints": 50,
  "membershipTier": "Vàng"
}
```
> 📌 **Hành động quan trọng:** Lưu ý giá trị `orderId` (ví dụ `4`) và `total` (ví dụ `103500`) để dùng thanh toán ở Bước 6.

---

### Bước 6: Thanh toán đơn hàng (`POST /api/payments`) — *Task 8 & Task 10*
Thực hiện thanh toán không tiền mặt (mô phỏng ví điện tử `WALLET` hoặc thẻ ngân hàng `CARD`). Hỗ trợ cơ chế chống trừ tiền 2 lần qua `idempotencyKey`.

* **Method:** `POST`
* **URL:** `http://localhost:3001/api/payments`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
```json
{
  "orderId": 4,
  "amount": 103500,
  "method": "WALLET",
  "idempotencyKey": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
}
```
> ⚠️ **Lưu ý:**
> 1. Điền chính xác `orderId` và `amount` từ Bước 5.
> 2. `idempotencyKey` phải là định dạng **UUID v4** hợp lệ (ví dụ: `550e8400-e29b-41d4-a716-446655440000`).

* **Mã phản hồi mong đợi:** `201 Created` (hoặc `200 OK`)
* **Kết quả trả về mẫu:**
```json
{
  "payment": {
    "id": "4",
    "orderId": "4",
    "amount": "103500.00",
    "method": "WALLET",
    "idempotencyKey": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
  },
  "order": {
    "id": "4",
    "userId": "2",
    "status": "PAID",
    "total": "103500.00"
  },
  "pointsEarned": 10
}
```

#### 🛡️ Kiểm thử tính Idempotent (Chống thanh toán 2 lần):
* Bấm **Send** lại một lần nữa với cùng `idempotencyKey` vừa gửi.
* **Kết quả:** Hệ thống lập tức trả về giao dịch cũ với cờ `"idempotent": true`, không trừ thêm tiền hay nhân đôi bản ghi.

---

### Bước 7: Xem lịch sử đơn hàng của tôi (`GET /api/orders/me`)
Kiểm tra danh sách đơn hàng của người dùng hiện tại và trạng thái của chúng.

* **Method:** `GET`
* **URL:** `http://localhost:3001/api/orders/me`
* **Auth:** Chọn **Bearer Token** và dán token ở Bước 2.
* **Headers:** *(Trống)*
* **Body:** *(Trống)*
* **Mã phản hồi mong đợi:** `200 OK`
* **Kết quả trả về mẫu:**
```json
[
  {
    "id": "4",
    "userId": "2",
    "status": "PAID",
    "total": "103500.00",
    "createdAt": "2026-11-02T01:45:00.000Z",
    "OrderItem": [
      {
        "id": "5",
        "productId": "1",
        "size": "M",
        "qty": 2,
        "lineTotal": "70000.00"
      }
    ]
  }
]
```

---

## 🛠️ 4. Xử Lý Các Mã Lỗi Thường Gặp Khi Test

| Mã lỗi | Nguyên nhân | Cách khắc phục |
| :---: | :--- | :--- |
| **`401 Unauthorized`** | Chưa truyền hoặc truyền sai Bearer Token tại Bước 5 hoặc Bước 7. | Kiểm tra tab **Auth**, chọn **Bearer Token** và dán đúng token từ Bước 2. |
| **`400 Bad Request`** | Dữ liệu Body JSON sai định dạng (thiếu trường, số lượng <= 0, v.v.). | Xem kỹ thông báo lỗi trong response để sửa lại các trường JSON đúng DTO. |
| **`400 Bad Request`** *(Payment)* | Số tiền `amount` không khớp với `total` của đơn hàng. | Lấy đúng giá trị `total` từ Bước 5 điền vào `amount` ở Bước 6. |
| **`409 Conflict`** | Xung đột phiên bản tồn kho (Optimistic Locking) do nhiều request cùng lúc. | Thử lại request sau vài giây. |
