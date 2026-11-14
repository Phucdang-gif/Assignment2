# Hướng Dẫn Cấu Hình Cổng Thanh Toán VietQR (PayOS) & MoMo Qua Ngrok

> **Mục đích tài liệu:**  
> Hướng dẫn từng bước cách thiết lập môi trường để tính năng thanh toán bằng **VietQR qua PayOS** và **MoMo** có thể hoạt động được trên máy cá nhân (`localhost`).  
> 
> *Do các cổng thanh toán cần gửi thông báo xác nhận tiền về (Webhook IPN) từ Internet về máy, nên cần sử dụng công cụ **Ngrok** để mở một đường dẫn cho Backend.*

---

## CÁC BƯỚC THỰC HIỆN

```mermaid
flowchart TD
    G1["Bước 1: Cài đặt Ngrok"] --> G2["Bước 2: Lấy Authtoken Ngrok"]
    G2 --> G3["Bước 3: Kích hoạt & Test Ngrok"]
    G3 --> G4["Bước 4: Chạy Backend & Frontend"]
    G4 --> G5["Bước 5: Đăng nhập PayOS"]
    G5 --> G6["Bước 6: Gắn Webhook URL vào PayOS"]
    G6 --> G7["Bước 7: Cập nhật file .env ở Backend"]
    G7 --> Done["Hoàn tất & Test thanh toán (3 Terminal)"]
```

---

### Bước 1: Cài đặt Ngrok trong VS Code

Mở PowerShell trong VS Code (hoặc Terminal Windows) và chạy lệnh sau:

```powershell
winget install ngrok
```
*(Nếu máy báo lỗi không tìm thấy package, hãy chạy: `winget install Ngrok.Ngrok`)*

> Sau khi cài đặt hoàn tất, **hãy tắt hẳn VS Code rồi mở lại** để hệ thống nhận diện môi trường của Ngrok.

---

### Bước 2: Đăng ký tài khoản Ngrok trên trình duyệt

1. Truy cập trang đăng ký: [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Chọn **Continue with GitHub** (đăng nhập bằng GitHub cho nhanh và tiện).
3. Sau khi đăng nhập thành công vào trang quản trị:
   - Nhìn sang menu bên trái, bấm vào mục **Your Authtoken**.
   - Bấm nút **Copy** để lưu đoạn mã token cá nhân.

---

### Bước 3: Kích hoạt Token trên VS Code & Lấy link công khai

1. Mở Terminal trong VS Code và chạy lệnh để nạp token vừa copy:
   ```bash
   ngrok config add-authtoken <dán_mã_token_vừa_copy_vào_đây>
   ```
   *(Ví dụ: `ngrok config add-authtoken 2tABCxyz...`)*

2. Chạy thử nghiệm cho cổng **3001** (cổng chạy Backend):
   ```bash
   ngrok http 3001
   ```

3. Kiểm tra màn hình terminal:
   - Khi chạy thành công, sẽ thấy thông tin tương tự như sau:
     ```text
     Session Status    online
     Forwarding        https://cusp-pager-velvet.ngrok-free.app -> http://localhost:3001
     ```
   - Hãy **copy lại đường dẫn `https://xxxx.ngrok-free.app`** này để dùng cho Bước 6.

> [!WARNING]
> **Xử lý sự cố nếu không thấy dòng `Forwarding`:**
> - Nếu màn hình không hiện dòng Forwarding hoặc báo phiên bản đã cũ:
>   1. Nhấn `Ctrl + C` để dừng.
>   2. Chạy lệnh: `ngrok update`
>   3. Sau đó chạy lại: `ngrok http 3001`

---

### Bước 4: Khởi động Backend và Frontend

Mở thêm 2 tab Terminal mới trong VS Code:
1. **Terminal chạy Backend:**
   ```bash
   cd apps/api
   npm run start:dev
   ```
2. **Terminal chạy Frontend:**
   ```bash
   cd apps/web
   npm run dev
   ```
*(Nếu trên trình duyệt mở ra trang thông báo kết nối của Ngrok với mã `ERR_NGROK_8012`, chỉ cần tắt tab đó đi sau khi Backend đã khởi chạy thành công).*

---

### Bước 5: Đăng nhập vào trang quản trị PayOS

1. Mở trình duyệt và truy cập: [https://payos.vn](https://payos.vn)
2. Đăng nhập bằng tài khoản PayOS Sandbox của nhóm (thông tin đăng nhập và mã OTP được quản trị viên nhóm cung cấp qua kênh nội bộ — **tuyệt đối không lưu mật khẩu hay khóa bí mật trong repository Git**).

---

### Bước 6: Cấu hình Webhook URL trên PayOS

1. Sau khi vào dashboard PayOS, nhìn menu bên trái và click vào **Kênh thanh toán**.
2. Chọn kênh thanh toán tên là **BrewLite**.
3. Bấm vào nút **Cài đặt** (hoặc icon Chỉnh sửa thông tin kênh thanh toán).
4. Tìm ô nhập **Webhook URL**:
   - Lấy đường dẫn `Forwarding` đã nhận được ở **Bước 3** (ví dụ: `https://cusp-pager-velvet.ngrok-free.dev`).
   - Thêm phần đuôi `/api/payments/payos-webhook` vào sau link đó.
   - **Ví dụ hoàn chỉnh:**
     ```text
     https://cusp-pager-velvet.ngrok-free.dev/api/payments/payos-webhook
     ```
   - Dán URL hoàn chỉnh này vào ô **Webhook URL** rồi bấm **Lưu**.

---

### Bước 7: Cập nhật file `.env` ở Backend

1. Tại trang **Kênh thanh toán** > **BrewLite** trên PayOS, tìm phần **Thông tin cấu hình**.
2. Bấm vào biểu tượng con mắt để hiển thị và copy 3 giá trị:
   - `Client ID`
   - `Api Key`
   - `Checksum Key`
3. Mở file `apps/api/.env` (tạo từ `apps/api/.env.example`):
   - Cập nhật các khóa của PayOS và cấu hình của MoMo bên dưới (giá trị Sandbox lấy từ tài khoản MoMo Developer / cấu hình nội bộ của nhóm):

```env
# ==========================================
# CẤU HÌNH PAYOS (VIETQR)
# ==========================================
PAYOS_CLIENT_ID="<dán_Client_ID_từ_PayOS_vào_đây>"
PAYOS_API_KEY="<dán_Api_Key_từ_PayOS_vào_đây>"
PAYOS_CHECKSUM_KEY="<dán_Checksum_Key_từ_PayOS_vào_đây>"

# ==========================================
# CẤU HÌNH VÍ MOMO (MÔI TRƯỜNG TEST / SANDBOX)
# ==========================================
MOMO_PARTNER_CODE="MOMO"
MOMO_ACCESS_KEY="<dán_Access_Key_MoMo_Sandbox>"
MOMO_SECRET_KEY="<dán_Secret_Key_MoMo_Sandbox>"
MOMO_API_URL="https://test-payment.momo.vn/v2/gateway/api/create"
MOMO_IPN_URL="https://<ngrok-domain>/api/payments/momo-ipn"
```

4. Lưu file `.env` lại.

---

## 🎯 QUY TRÌNH CHẠY KHI DEMO / TEST THANH TOÁN

> Để thanh toán thành công và đơn hàng tự động đổi từ trạng thái **`PENDING`** sang **`PAID`**, **BẮT BUỘC PHẢI CHẠY ĐỒNG THỜI 3 TERMINAL SAU ĐÂY:**

| Thứ tự Terminal | Nơi mở lệnh | Câu lệnh chạy | Mục đích |
| :---: | :--- | :--- | :--- |
| **Terminal 1** | Thư mục gốc repo | `ngrok http 3001` | Mở link công khai nhận Webhook từ ngân hàng / MoMo |
| **Terminal 2** | Thư mục `apps/api/` | `npm run start:dev` | Khởi chạy máy chủ Backend NestJS |
| **Terminal 3** | Thư mục `apps/web/` | `npm run dev` | Khởi chạy giao diện người dùng Next.js |