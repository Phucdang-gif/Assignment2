# ☕ BrewLite - Ứng dụng đặt cà phê không dùng tiền mặt (Cashless Coffee Ordering)

> **BrewLite** là nền tảng đặt cà phê và thanh toán không tiền mặt hiện đại, giúp khách hàng trải nghiệm gọi đồ uống nhanh chóng, giảm thiểu thời gian chờ đợi tại quầy và quản lý đơn hàng liền mạch.
>
> ⚡ **Khởi chạy nhanh toàn bộ hệ thống bằng 1 lệnh duy nhất:**
> ```bash
> docker compose up --build
> ```
> *Tự động khởi tạo PostgreSQL, chạy migrations, nạp seed data mẫu, khởi chạy Backend NestJS (`http://localhost:3001`) và Frontend Next.js (`http://localhost:3000`).*

---

## 📑 Mục lục

1. [Giới thiệu dự án](#-giới-thiệu-dự-án)
2. [Công nghệ sử dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
3. [Kiến trúc hệ thống (Architecture)](#-kiến-trúc-hệ-thống-architecture)
4. [Thiết kế & Khởi tạo Cơ sở dữ liệu (Database Setup)](#-thiết-kế--khởi-tạo-cơ-sở-dữ-liệu-database-setup)
5. [Khởi chạy với Docker Compose (Cách dùng chính)](#-khởi-chạy-nhanh-với-docker-compose-cách-dùng-chính---khuyên-dùng)
6. [Khởi chạy môi trường phát triển cục bộ (Tùy chọn)](#-khởi-chạy-môi-trường-phát-triển-cục-bộ-tùy-chọn---optional-local-development)
   - [Cấu hình thanh toán trực tuyến VietQR & MoMo (Ngrok)](apps/api/PAYMENT_SETUP.md)
7. [Danh sách API Endpoints](#-danh-sách-api-endpoints)
8. [Máy trạng thái đơn hàng (Order State Machine)](#-máy-trạng-thái-đơn-hàng-order-state-machine)
9. [Cấu trúc thư mục dự án (Monorepo)](#-cấu-trúc-thư-mục-dự-án-monorepo)
10. [Nghiệp vụ Backend Nâng cao (Task 10) & Kiểm thử tự động](#-nghiệp-vụ-backend-nâng-cao-task-10--kiểm-thử-tự-động)
11. [Phân hệ Barista / Quầy Pha Chế](#-phân-hệ-barista--quầy-pha-chế-tính-năng-mở-rộng-ngoài-mvp)
12. [Kịch bản Demo (End-to-End Flow)](#-kịch-bản-demo-end-to-end-flow)
13. [Thành viên nhóm phát triển & Phân công công việc](#-thành-viên-nhóm-phát-triển--phân-công-công-việc-contributors--task-assignment)

---

## 📖 Giới thiệu dự án

Trong nhịp sống hiện đại, việc xếp hàng chờ đợi gọi món và thanh toán tiền mặt tại quán cà phê gây mất nhiều thời gian cho khách hàng và tăng tải vận hành cho nhân viên. **BrewLite** được thiết kế nhằm giải quyết bài toán này với các tính năng cốt lõi:

- **Thực đơn trực quan**: Xem danh mục sản phẩm, tùy biến size (S, M, L) và toppings.
- **Thanh toán không tiền mặt an toàn**: Tích hợp thanh toán qua Ví điện tử (WALLET) và Thẻ (CARD) với cơ chế chống giao dịch trùng lặp (**Idempotency Key**).
- **Xác thực bảo mật**: Quản lý phiên làm việc bằng JSON Web Token (JWT) qua Passport.
- **Cơ chế dữ liệu nhất quán**: Hệ thống sử dụng khóa định danh BigInt, ORM Prisma và ràng buộc giao dịch cơ sở dữ liệu PostgreSQL.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

| Tầng hệ thống | Công nghệ / Thư viện                                            | Mô tả                                                        |
| :------------ | :-------------------------------------------------------------- | :----------------------------------------------------------- |
| **Frontend**  | [Next.js 16](https://nextjs.org/) (App Router)                  | Framework React render phía server và client hiệu năng cao   |
|               | [React 19](https://react.dev/)                                  | Thư viện UI hiện đại                                         |
|               | [Tailwind CSS 4](https://tailwindcss.com/)                      | Styling giao diện linh hoạt, responsive                      |
|               | [Zustand](https://zustand-demo.pmnd.rs/)                        | Quản lý trạng thái giỏ hàng (Cart) và phiên đăng nhập (Auth) |
| **Backend**   | [NestJS 12](https://nestjs.com/)                                | Framework Node.js dạng module hướng đối tượng kiến trúc mở   |
|               | [TypeScript](https://www.typescriptlang.org/)                   | Ngôn ngữ tĩnh giúp hạn chế lỗi runtime                       |
|               | [Prisma ORM 5](https://www.prisma.io/)                          | Tương tác CSDL PostgreSQL với type-safety                    |
|               | [Passport & JWT](http://www.passportjs.org/)                    | Xác thực và phân quyền người dùng qua JSON Web Tokens        |
|               | [class-validator](https://github.com/typestack/class-validator) | Xác thực dữ liệu đầu vào (DTOs)                              |
|               | [bcrypt](https://github.com/kelektiv/node.bcrypt.js)            | Băm mật khẩu người dùng bảo mật                              |
| **Database**  | [PostgreSQL 16](https://www.postgresql.org/)                    | Cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ giao dịch ACID         |
| **DevOps**    | [Docker](https://www.docker.com/) & Docker Compose              | Đóng gói và điều phối toàn bộ các dịch vụ                    |

---

## 🏛 Kiến trúc hệ thống (Architecture)

```mermaid
flowchart TD
    subgraph Client["Trình duyệt người dùng (Client)"]
        UI["Next.js Frontend (Port: 3000)\n- App Router\n- Zustand State\n- Tailwind CSS"]
    end

    subgraph Server["Hệ thống Backend (NestJS - Port: 3001)"]
        API["REST API Router (/api/...)"]
        Auth["Auth Module\n(JWT Guard + Passport)"]
        OrderMod["Orders Module"]
        PayMod["Payments Module\n(Idempotency Handler)"]
        ProdMod["Products & Toppings Module"]
        Prisma["Prisma ORM Client"]
    end

    subgraph DataStore["Cơ sở dữ liệu"]
        Postgres[("PostgreSQL 16 Database\n(Port: 5432)")]
    end

    UI -->|"HTTP / REST API (JWT Bearer)"| API
    API --> Auth
    API --> OrderMod
    API --> PayMod
    API --> ProdMod
    OrderMod --> Prisma
    PayMod --> Prisma
    ProdMod --> Prisma
    Prisma -->|"Prisma Engine / SQL Queries"| Postgres
```

---

## 🗄️ Thiết kế & Khởi tạo Cơ sở dữ liệu (Database Setup)

Phần cơ sở dữ liệu của dự án được xây dựng trên **PostgreSQL 16**, đồng bộ 100% giữa tài liệu đề bài môn Công nghệ Phần mềm, Prisma ORM và các script SQL khởi tạo.

### 1. Sơ đồ quan hệ thực thể (ERD)

```mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : "chứa"
    USER ||--o{ ORDER : "đặt"
    ORDER ||--|{ ORDERITEM : "gồm"
    PRODUCT ||--o{ ORDERITEM : "được đặt trong"
    TOPPING ||--o{ ORDERITEMTOPPING : "được thêm vào"
    ORDERITEM ||--o{ ORDERITEMTOPPING : "chọn topping"
    ORDER ||--o{ PAYMENT : "thanh toán bằng"

    CATEGORY {
        SERIAL id PK
        VARCHAR name UK
        TIMESTAMPTZ createdAt
        TIMESTAMPTZ updatedAt
    }

    USER {
        BIGSERIAL id PK
        VARCHAR email UK
        VARCHAR passwordHash
        INTEGER loyaltyPoints
        ENUM role
        TIMESTAMPTZ createdAt
        TIMESTAMPTZ updatedAt
    }

    PRODUCT {
        BIGSERIAL id PK
        INTEGER categoryId FK
        VARCHAR name
        DECIMAL price
        VARCHAR imageUrl
        TEXT description
        INTEGER stock
        INTEGER version
        ENUM status
        TIMESTAMPTZ createdAt
        TIMESTAMPTZ updatedAt
    }

    TOPPING {
        SERIAL id PK
        VARCHAR name UK
        INTEGER price
        BOOLEAN isAvailable
        TIMESTAMPTZ createdAt
    }

    ORDER {
        BIGSERIAL id PK
        BIGINT userId FK
        ENUM status
        DECIMAL total
        TIMESTAMPTZ createdAt
        TIMESTAMPTZ updatedAt
    }

    ORDERITEM {
        BIGSERIAL id PK
        BIGINT orderId FK
        BIGINT productId FK
        ENUM size
        INTEGER qty
        DECIMAL lineTotal
    }

    ORDERITEMTOPPING {
        BIGINT orderItemId PK,FK
        INTEGER toppingId PK,FK
        INTEGER priceAtTime
    }

    PAYMENT {
        BIGSERIAL id PK
        BIGINT orderId FK
        VARCHAR idempotencyKey UK
        DECIMAL amount
        ENUM method
    }
```

### 2. Mô tả các bảng dữ liệu & Ràng buộc toàn vẹn

- **`Category`**: Quản lý danh mục đồ uống (Cà phê, Trà trái cây, Trà sữa, Đá xay & Khác).
- **`User`**: Quản lý người dùng, mật khẩu băm bcrypt, phân quyền (`role`: `customer`, `barista`), điểm thưởng tích lũy (`loyaltyPoints >= 0`).
- **`Product`**: Sản phẩm menu, liên kết `categoryId`, giá bán (`DECIMAL`), mô tả (`description`), tồn kho (`stock >= 0`), `version` (phục vụ Optimistic Locking ở Task 10), trạng thái kinh doanh (`status`: `active`, `inactive`).
- **`Topping`**: Món thêm cho ly nước (`name`, `price`, `isAvailable`).
- **`Order`**: Đơn hàng với mã tự tăng `id`, liên kết `userId`, trạng thái theo máy trạng thái (`PENDING`, `PAID`, `PREPARING`, `READY`, `COMPLETED`, `PAYMENT_FAILED`, `CANCELLED`), tổng tiền (`total >= 0`).
- **`OrderItem`**: Chi tiết từng món trong đơn (`orderId` ON DELETE CASCADE, `productId`, `size`, `qty > 0`, `lineTotal >= 0`).
- **`OrderItemTopping`**: Snapshot giá topping tại thời điểm đặt đơn (`priceAtTime >= 0`).
- **`Payment`**: Giao dịch thanh toán không tiền mặt, khóa chống trùng lặp (`idempotencyKey` UNIQUE), số tiền (`amount >= 0`), phương thức (`WALLET`, `CARD`).

---

### 3. Tài khoản kiểm thử có sẵn (Seeded Accounts)

Hệ thống đi kèm dữ liệu mẫu được nạp sẵn 3 tài khoản để kiểm thử ngay:

- **Barista**: `barista@brewlite.com` / Mật khẩu: `barista123` (Truy cập giao diện pha chế tại `/barista`)
- **Khách hàng thân thiết**: `customer@brewlite.com` / Mật khẩu: `customer123` (Đã có 50 điểm loyalty - Hạng Vàng được giảm giá 10%)
- **Khách hàng mới**: `khachhang2@example.com` / Mật khẩu: `password123` (Đã có 20 điểm loyalty - Hạng Bạc được giảm giá 5%)

---

## 🚀 Khởi chạy nhanh với Docker Compose (Cách dùng CHÍNH - Khuyên dùng)

Đây là **phương thức sử dụng chính thức và tiện lợi nhất của dự án**. Bạn **hoàn toàn không cần cài đặt hay cấu hình PostgreSQL trên máy tính cá nhân**. Chỉ với **1 câu lệnh duy nhất**, toàn bộ hệ sinh thái (Database, Backend, Frontend) sẽ được khởi chạy và nạp dữ liệu mẫu tự động từ con số 0:

```bash
docker compose up --build
```

### Quá trình khởi động tự động gồm:

1. **Dịch vụ `db`**: Khởi chạy PostgreSQL 16 Alpine, cấu hình volume lưu trữ bền vững `pgdata` và kiểm tra sức khỏe (`healthcheck`).
2. **Dịch vụ `backend` (`apps/api`)**: Chờ database sẵn sàng -> tự động tạo cấu trúc bảng (`npx prisma db push`) -> tự động chạy script `seed.js` để đọc và nạp toàn bộ dữ liệu từ file [`brewlite_seed_data.sql`](apps/api/prisma/database%20local/brewlite_seed_data.sql) (gồm 12 món đồ uống, 3 tài khoản, topping, đơn hàng) -> khởi chạy máy chủ NestJS tại cổng `3001`.
3. **Dịch vụ `frontend` (`apps/web`)**: Build mã nguồn Next.js đa tầng (multi-stage) -> phục vụ ứng dụng tại cổng `3000`.

### Truy cập các dịch vụ:

- 🌐 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend REST API**: [http://localhost:3001](http://localhost:3001)
- 🗄️ **PostgreSQL Port**: `localhost:5432`

### Dừng hệ thống & Reset dữ liệu:

```bash
# Dừng container nhưng giữ nguyên dữ liệu
docker compose down

# Dừng và xóa sạch volume để khởi tạo lại database mới hoàn toàn
docker compose down -v
```

---

## 💻 Khởi chạy môi trường phát triển cục bộ (Tùy chọn - Optional Local Development)

Phương thức này là **tùy chọn (optional)** dành cho trường hợp bạn muốn chạy trực tiếp mã nguồn trên máy và sử dụng máy chủ PostgreSQL cục bộ mà không thông qua Docker:

### Yêu cầu tiên quyết:

- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **PostgreSQL**: Đã cài đặt và đang chạy dịch vụ cục bộ trên máy (cổng mặc định `5432`).

### Bước 1: Khởi tạo Cơ sở dữ liệu cục bộ bằng File SQL

Bạn mở công cụ **pgAdmin 4**, **DBeaver** hoặc cửa sổ dòng lệnh `psql` để chạy 2 file SQL đã chuẩn bị sẵn trong thư mục `apps/api/prisma/database local/`:

1. Tạo một cơ sở dữ liệu mới tên là `brewlite`.
2. Mở file [`brewlite_schema.sql`](apps/api/prisma/database%20local/brewlite_schema.sql) và bấm thực thi (**F5**) để tạo bảng và ràng buộc.
3. Mở file [`brewlite_seed_data.sql`](apps/api/prisma/database%20local/brewlite_seed_data.sql) và bấm thực thi (**F5**) để nạp 12 món đồ uống và tài khoản mẫu.

_(Hoặc chạy nhanh bằng lệnh `psql`):_

```bash
psql -U postgres -d brewlite -f "apps/api/prisma/database local/brewlite_schema.sql"
psql -U postgres -d brewlite -f "apps/api/prisma/database local/brewlite_seed_data.sql"
```

### Bước 2: Chuẩn bị biến môi trường

Tạo file `.env` tại thư mục gốc từ mẫu `.env.example`:

```bash
cp .env.example .env
```

Nội dung cấu hình tiêu chuẩn:

```env
# Database URL kết nối vào PostgreSQL local
DATABASE_URL="postgresql://brewlite:brewlite123@localhost:5432/brewlite?schema=public"

# Auth Secret
JWT_SECRET="brewlite-super-secret-key-change-in-production"

# Ports
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Bước 3: Khởi chạy Backend (NestJS)

```bash
cd backend
npm install

# Tạo Prisma Client
npx prisma generate

# Khởi chạy chế độ Watch (Development)
npm run start:dev
```

Backend sẽ lắng nghe tại: `http://localhost:3001`

### Bước 4: Khởi chạy Frontend (Next.js)

Mở một cửa sổ terminal mới:

```bash
cd frontend
npm install

# Khởi chạy giao diện phát triển
npm run dev
```

Frontend sẽ lắng nghe tại: `http://localhost:3000`

### Bước 5: Các lệnh quản lý & Cập nhật Cơ sở dữ liệu (Database Management)

Dưới đây là các câu lệnh hữu ích khi làm việc với Database (chạy trong thư mục `backend`):

| Mục đích                         | Câu lệnh                                                    | Khi nào sử dụng?                                                                                |
| :------------------------------- | :---------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Nạp dữ liệu mẫu**              | `node prisma/seed.js`                                       | Tự động đọc và nạp 12 món đồ uống, topping và tài khoản từ file SQL.                            |
| **Xóa sạch & làm mới CSDL**      | `npx prisma db push --force-reset`<br>`node prisma/seed.js` | Khi muốn xóa toàn bộ đơn hàng test và đưa CSDL về trạng thái sạch ban đầu.                      |
| **Xem & chỉnh sửa dữ liệu (UI)** | `npx prisma studio`                                         | Mở giao diện Web quản trị dữ liệu trực quan tại [http://localhost:5555](http://localhost:5555). |
| **Tạo migration cho schema mới** | `npx prisma migrate dev --name <ten_thay_doi>`              | Sau khi chỉnh sửa `prisma/schema.prisma` (thêm cột, thêm bảng, đổi kiểu).                       |

### 5. Cấu hình cổng thanh toán trực tuyến (VietQR PayOS & MoMo qua Ngrok)

Hệ thống tích hợp cổng thanh toán thực tế thông qua **VietQR (PayOS)** và **Ví điện tử MoMo**. Do các nhà cung cấp cổng thanh toán cần gửi phản hồi xác nhận (Webhook IPN) từ Internet về máy chủ cục bộ (`localhost:3001`), cần thiết lập đường hầm Ngrok.

> 📖 **Xem hướng dẫn chi tiết từng bước:**  
> 👉 **[Tài liệu cấu hình thanh toán PayOS & MoMo (apps/api/PAYMENT_SETUP.md)](apps/api/PAYMENT_SETUP.md)**  
> _(Bao gồm: Cài đặt Ngrok, lấy Token, gắn Webhook URL trên PayOS, biến môi trường `.env` và quy trình mở 3 Terminal để test)_.

---

## 📡 Danh sách API Endpoints

Tất cả các route của ứng dụng đều sử dụng tiền tố chuẩn `/api/` (hoặc `/users`).

### 1. Xác thực & Tài khoản (`/api/auth`)

| Phương thức | Đường dẫn            |   Xác thực   | Mô tả chức năng                                        |
| :---------- | :------------------- | :----------: | :----------------------------------------------------- |
| `POST`      | `/api/auth/register` |    Không     | Đăng ký tài khoản người dùng mới (`email`, `password`) |
| `POST`      | `/api/auth/login`    |    Không     | Đăng nhập hệ thống, trả về JWT access token            |
| `GET`       | `/api/auth/me`       | Bearer Token | Kiểm tra thông tin người dùng đang đăng nhập           |

### 2. Thực đơn & Sản phẩm (`/api/products`)

| Phương thức | Đường dẫn           | Xác thực | Mô tả chức năng                                 |
| :---------- | :------------------ | :------: | :---------------------------------------------- |
| `GET`       | `/api/products`     |  Không   | Lấy danh sách toàn bộ món nước trong thực đơn   |
| `GET`       | `/api/products/:id` |  Không   | Tra cứu thông tin chi tiết một sản phẩm theo ID |
| `POST`      | `/api/products`     | Yêu cầu  | Thêm món mới vào thực đơn                       |
| `PATCH`     | `/api/products/:id` | Yêu cầu  | Cập nhật thông tin/giá/trạng thái sản phẩm      |
| `DELETE`    | `/api/products/:id` | Yêu cầu  | Xóa sản phẩm khỏi menu                          |

### 3. Toppings (`/api/toppings`)

| Phương thức | Đường dẫn           | Xác thực | Mô tả chức năng                |
| :---------- | :------------------ | :------: | :----------------------------- |
| `GET`       | `/api/toppings`     |  Không   | Lấy danh sách topping đính kèm |
| `GET`       | `/api/toppings/:id` |  Không   | Lấy chi tiết topping theo ID   |
| `POST`      | `/api/toppings`     | Yêu cầu  | Tạo topping mới                |
| `PATCH`     | `/api/toppings/:id` | Yêu cầu  | Chỉnh sửa thông tin topping    |
| `DELETE`    | `/api/toppings/:id` | Yêu cầu  | Xóa topping                    |

### 4. Đơn hàng (`/api/orders`)

| Phương thức | Đường dẫn     |   Xác thực   | Mô tả chức năng                                                     |
| :---------- | :------------ | :----------: | :------------------------------------------------------------------ |
| `POST`      | `/api/orders` | Bearer Token | Khởi tạo đơn hàng mới từ giỏ hàng (Khởi tạo ở trạng thái `PENDING`) |

### 5. Thanh toán (`/api/payments`)

| Phương thức | Đường dẫn                      |   Xác thực   | Mô tả chức năng                                          |
| :---------- | :----------------------------- | :----------: | :------------------------------------------------------- |
| `POST`      | `/api/payments`                | Bearer Token | Thực hiện thanh toán đơn hàng (sử dụng `idempotencyKey`) |
| `GET`       | `/api/payments/order/:orderId` | Bearer Token | Tra cứu lịch sử và trạng thái thanh toán của đơn hàng    |

### 6. Quản lý người dùng (`/users`)

| Phương thức | Đường dẫn    | Xác thực  | Mô tả chức năng                             |
| :---------- | :----------- | :-------: | :------------------------------------------ |
| `GET`       | `/users`     |   Admin   | Lấy danh sách tài khoản (hỗ trợ phân trang) |
| `GET`       | `/users/:id` | Tùy quyền | Lấy chi tiết tài khoản theo ID              |
| `PATCH`     | `/users/:id` | Tùy quyền | Cập nhật thông tin người dùng               |
| `DELETE`    | `/users/:id` |   Admin   | Xóa tài khoản người dùng                    |

---

## 🔄 Máy trạng thái đơn hàng (Order State Machine)

Trạng thái của mỗi đơn hàng tuân theo quy trình nghiêm ngặt, đảm bảo tính toàn vẹn dữ liệu:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Khách tạo đơn hàng (POST /api/orders)

    PENDING --> PAID: Thanh toán thành công (POST /api/payments)
    PENDING --> PAYMENT_FAILED: Thanh toán lỗi / Hết hạn
    PENDING --> CANCELLED: Khách hủy đơn

    PAID --> PREPARING: Barista xác nhận & bắt đầu pha chế
    PREPARING --> READY: Đồ uống hoàn tất tại quầy
    READY --> COMPLETED: Khách nhận món thành công

    PAYMENT_FAILED --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]
```

### Diễn giải các trạng thái:

- `PENDING`: Đơn hàng vừa được tạo từ giỏ hàng, chờ khách hàng hoàn tất thanh toán.
- `PAID`: Đơn hàng đã nhận tiền thành công qua giao dịch `Payment` được bảo vệ bởi khóa định danh chống trùng lặp.
- `PREPARING`: Nhân viên quầy bar tiếp nhận và thực hiện pha chế đồ uống.
- `READY`: Đồ uống đã sẵn sàng tại quầy nhận món, thông báo tới khách hàng.
- `COMPLETED`: Khách hàng đã nhận đồ uống và đơn hàng kết thúc chu trình.
- `PAYMENT_FAILED`: Giao dịch bị từ chối do lỗi thẻ hoặc ví không hợp lệ.
- `CANCELLED`: Đơn hàng bị hủy hợp lệ trước khi tiến hành pha chế.

---

## 📂 Cấu trúc thư mục dự án (Monorepo)

Dự án được cấu trúc theo mô hình **Monorepo** chuẩn hóa theo đúng yêu cầu đặc tả của Assignment 2 (Mục 9 - Cấu trúc repository):

```text
brewlite/
├── apps/
│   ├── web/                    # Phân hệ Frontend (Next.js 16 mobile-first/PWA, React 19, Tailwind CSS)
│   │   ├── app/                # Next.js App Router (Menu, Cart, Checkout, Auth, Orders, Barista)
│   │   ├── components/         # Các UI components tái sử dụng (Header, Footer, MobileNav, Icons...)
│   │   ├── hooks/              # Custom React hooks (useProducts, useProductDetail, useToppings...)
│   │   ├── services/           # Tầng giao tiếp REST API Backend (api.ts, productService...)
│   │   ├── store/              # Quản lý State toàn cục bằng Zustand (cartStore, authStore)
│   │   ├── types/              # Định nghĩa TypeScript interfaces & data types
│   │   ├── public/             # Tài nguyên tĩnh (ảnh đồ uống, hero banner, icons)
│   │   └── Dockerfile          # Multi-stage Docker build phục vụ Next.js tại cổng 3000
│   │
│   └── api/                    # Phân hệ Backend (NestJS 12, TypeScript, Prisma ORM, PostgreSQL)
│       ├── src/                # Mã nguồn nghiệp vụ chia theo Domain/Module
│       │   ├── auth/           # Module xác thực JWT, Password Hashing & Guard phân quyền
│       │   ├── categories/     # Module danh mục sản phẩm đồ uống
│       │   ├── products/       # Module thực đơn đồ uống & Optimistic Locking tồn kho
│       │   ├── toppings/       # Module quản lý toppings kèm theo
│       │   ├── orders/         # Module xử lý đơn hàng & State Machine
│       │   ├── payments/       # Module thanh toán (VietQR/MoMo) & cơ chế Idempotency Key
│       │   ├── users/          # Module người dùng, phân quyền Role & tích điểm Loyalty
│       │   ├── prisma/         # Prisma Database Service kết nối PostgreSQL
│       │   ├── app.module.ts   # Root Module kết nối toàn bộ hệ thống
│       │   └── main.ts         # Khởi chạy NestJS (Prefix: /api, CORS, Validation Pipe)
│       ├── prisma/             # Cấu hình ORM Prisma & Cơ sở dữ liệu
│       │   ├── schema.prisma   # Mô hình dữ liệu PostgreSQL Schema & Enums
│       │   ├── seed.js         # Kịch bản nạp dữ liệu mẫu tự động
│       │   ├── database local/ # File SQL khởi tạo schema và seed data cục bộ
│       │   └── migrations/     # Lịch sử các phiên bản migration cơ sở dữ liệu
│       ├── test/               # Unit tests & End-to-End tests
│       ├── PAYMENT_SETUP.md    # Hướng dẫn chi tiết cấu hình thanh toán VietQR & MoMo
│       └── Dockerfile          # Multi-stage Docker build phục vụ NestJS tại cổng 3001
│
├── docs/                       # Tài liệu kiểm soát phiên bản (Task 1 - 3 & Quản trị dự án)
│   ├── requirements/           # Task 1: SRS, Context & Scope, Use Case Specs
│   ├── diagrams/               # Task 2: Activity, Sequence, Class Diagrams (.puml & .svg)
│   ├── architecture/           # Task 3: Quyết định kiến trúc & Các tệp ADR (001 - 006)
│   ├── traceability-matrix.md  # Mục 8: Ma trận truy vết yêu cầu (FR/NFR ➔ Diagram ➔ Code ➔ Test)
│   └── deployment.md           # Hướng dẫn chi tiết quy trình triển khai môi trường Production
│
├── tests/                      # Tầng kiểm thử tích hợp (Integration & E2E)
├── .github/                    # Quy trình tự động hóa CI/CD & Quản trị mã nguồn
│   ├── workflows/ci.yml        # Task 4.4: Pipeline CI (Install ➔ Lint ➔ Test ➔ Build)
│   └── pull_request_template.md# Mẫu PR tiêu chuẩn tích hợp checklist Definition of Done (DoD)
│
├── docker-compose.yml          # Điều phối 3 dịch vụ (db, apps/api, apps/web) chỉ với 1 câu lệnh
├── .env.example                # File mẫu các biến môi trường cấu hình hệ thống
└── README.md                   # Tài liệu hướng dẫn sử dụng, cài đặt và bàn giao sản phẩm
```

---

## 🧪 Nghiệp vụ Backend Nâng cao (Task 10) & Kiểm thử tự động

Hệ thống đã triển khai đầy đủ 4 tiêu chí cốt lõi của Task 10 theo đúng đặc tả:

1. **Order State Machine (Máy trạng thái đơn hàng)**:
   - Quản lý quá trình chuyển trạng thái qua `OrdersService.assertTransition()`.
   - Luồng chính: `PENDING` ➔ `PAID` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`.
   - Các nhánh ngoại lệ: `PAYMENT_FAILED` (cho phép thử lại `PENDING`), `CANCELLED` (hủy đơn và hoàn tồn kho).
   - Tự động ném `BadRequestException` khi phát hiện các bước nhảy cóc không hợp lệ (ví dụ: `PENDING` nhảy thẳng lên `COMPLETED` hay `CANCELLED` ➔ `PAID`).

2. **Thanh toán Idempotent (Idempotency Key)**:
   - Endpoint `POST /api/payments` nhận `idempotencyKey` duy nhất.
   - Khi client gửi lại cùng một key (do retry mạng hoặc nhấn 2 lần), backend tự động nhận diện bản ghi thanh toán đã tồn tại và trả về kết quả trước đó với cờ `idempotent: true`, tuyệt đối không trừ tiền 2 lần hoặc tạo trùng giao dịch.

3. **Kiểm soát tồn kho đồng thời (Concurrency Inventory Control & Optimistic Locking)**:
   - Sử dụng Prisma Transaction kết hợp **Optimistic Locking** qua trường `version` và điều kiện `stock: { gte: item.qty }`.
   - Khi nhiều khách đặt mua sản phẩm cùng lúc, giao dịch sau có `version` không khớp sẽ bị chặn và ném `ConflictException` (409) hoặc `BadRequestException` (khi hết tồn kho), đảm bảo không bao giờ bán vượt quá số lượng hàng có sẵn.

4. **Giảm giá theo điểm tích lũy (Loyalty Points Discount) & Tích điểm thưởng**:
   - Tự động áp dụng giảm giá theo hạng điểm tích lũy (`loyaltyPoints`) của khách hàng:
     - **Hạng Đồng** (< 20 điểm): 0% giảm giá
     - **Hạng Bạc** (20 - 49 điểm): Tự động giảm **5%**
     - **Hạng Vàng** (50 - 99 điểm): Tự động giảm **10%**
     - **Hạng Kim Cương** (>= 100 điểm): Tự động giảm **15%**
   - Điểm tích lũy không bị trừ khi giảm giá, giúp khách hàng duy trì và thăng hạng.
   - Khi đơn chuyển sang `PAID`, hệ thống tự động tích lũy thêm điểm thưởng theo tỷ lệ 1 điểm / 10.000đ vào tài khoản khách hàng.

### 🏃 Chạy kiểm thử tự động (Unit Tests)

Toàn bộ 28 tests trong hệ thống (bao gồm 14 tests dành riêng cho Task 10) đều đã sẵn sàng:

```bash
cd backend
npm test
```

Hoặc chỉ chạy riêng bộ test kiểm chứng Task 10:

```bash
npm test -- src/orders/orders.task10.spec.ts
```

---

## ☕ Phân hệ Barista / Quầy Pha Chế (Tính năng mở rộng ngoài MVP)

- **Mục đích**: Nhân viên quầy tiếp nhận đơn đã thanh toán và cập nhật tiến độ pha chế theo thời gian thực.
- **Đường dẫn giao diện**: [http://localhost:3000/barista](http://localhost:3000/barista)
- **Tài khoản kiểm thử có sẵn (Seeded Data)**:
  - **Tài khoản Barista**: `barista@brewlite.com` / `barista123`
  - **Tài khoản Khách hàng**: `customer@brewlite.com` / `customer123`

---

## 🎬 Kịch bản Demo (End-to-End Flow)

1. **Khởi chạy ứng dụng**:
   Chạy lệnh `docker compose up --build` và chờ các dịch vụ hoạt động. Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).
2. **Chọn món & Giỏ hàng (Khách vãng lai)**:
   Khách hàng có thể thoải mái xem menu, tùy chọn size/toppings và thêm vào giỏ hàng mà **không cần đăng nhập trước**.
3. **Thanh toán & Đăng nhập**:
   Tại trang Giỏ hàng / Checkout, khi bấm "Thanh toán", nếu chưa đăng nhập hệ thống sẽ yêu cầu đăng nhập. Giỏ hàng được giữ nguyên sau khi đăng nhập thành công.
4. **Ưu đãi thành viên theo loyaltyPoints & Thanh toán**:
   Tại màn hình Checkout, hệ thống tự động nhận diện hạng thành viên và số điểm tích lũy (`loyaltyPoints`) của khách hàng để áp dụng chiết khấu tự động (ví dụ tài khoản `customer@brewlite.com` có 50 điểm -> Hạng Vàng được giảm ngay 10%). Chọn phương thức Ví điện tử (VietQR / MoMo) và nhấn Thanh toán. Hệ thống sinh `idempotencyKey` và chuyển đơn sang `PAID` _(Lưu ý: Để test quét mã QR thực tế, cần cấu hình Ngrok theo [PAYMENT_SETUP.md](apps/api/PAYMENT_SETUP.md))_.
5. **Xác nhận & Điểm thưởng**:
   Chuyển hướng đến trang xác nhận `/orders/:id`, hiển thị mã đơn, trạng thái và điểm thưởng vừa được tích lũy.
6. **Barista nhận đơn & Pha chế**:
   Đăng nhập tài khoản `barista@brewlite.com` tại `/barista`, nhận đơn (`PAID` ➔ `PREPARING`), báo hoàn thành (`PREPARING` ➔ `READY`), và giao khách (`READY` ➔ `COMPLETED`).

---

## 👥 Thành viên nhóm phát triển & Phân công công việc (Contributors & Task Assignment)

Dự án được thực hiện bởi nhóm sinh viên Khoa Công nghệ Thông tin – Trường Đại học Sài Gòn (SGU) trong khuôn khổ đồ án **Công nghệ Phần mềm (Assignment 2)**:

| STT | Họ và tên | MSSV | Vai trò chính | Phân công phụ trách chi tiết (Assignment 2) |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Châu Chí Hải** | *[Điền MSSV]* | **Project Lead / Backend Dev** | • Quản lý chung dự án & Product Backlog<br>• Thiết kế CSDL PostgreSQL, Prisma Schema & Migrations<br>• Xây dựng Backend API (Categories, Products, Stock control)<br>• Cấu hình Docker Compose và điều phối dịch vụ |
| **2** | **Đặng Hoàng Phúc** | *[Điền MSSV]* | **Fullstack Dev / DevOps** | • **Task 4.1**: Thiết lập Monorepo (`apps/web`, `apps/api`), Branch Strategy, PR Template, DoD<br>• **Task 4.4 & 5.3**: Thiết lập Pipeline CI/CD GitHub Actions<br>• Tối ưu hóa UI Mobile-first PWA & Responsive |
| **3** | **Lê Quốc Việt** | **3124410185** | **Backend Dev / Payments** | • **Task 1.3 & 2.2**: Đặc tả Use-case & Sequence Diagram Thanh toán<br>• Hiện thực Module Payments (VietQR, MoMo), cơ chế Idempotency Key<br>• Máy trạng thái đơn hàng (Order State Machine) & Unit Test Task 10 |
| **4** | **Trần Duy** | *[Điền MSSV]* | **Frontend Dev / UI-UX** | • **Task 2.1**: Thiết kế Activity Diagram luồng End-to-End<br>• **Task 4.3**: Hiện thực màn hình Menu mobile-first bằng Next.js (Loading, Empty, Error)<br>• Hiện thực giao diện Giỏ hàng, Chi tiết món & Phân hệ Barista |

---

### 📋 Quy ước Commit & Định nghĩa Hoàn thành (Conventions & Definition of Done)

Toàn bộ quy chuẩn phát triển phần mềm và quy trình làm việc của nhóm được quy định chi tiết tại:  
👉 **[Tài liệu Quy ước Phát triển & Definition of Done (docs/conventions.md)](docs/conventions.md)**  
👉 **[Hướng dẫn Quy trình Làm việc Nhóm & 6 bước thực hiện Task (docs/team-workflow.md)](docs/team-workflow.md)**

#### 1. Quy ước Commit (Conventional Commits):
Định dạng chuẩn: `<type>(<scope>): [<mã-task/FR>] <tiêu đề tóm tắt>`
* `feat`: Thêm tính năng mới (ví dụ: `feat(api): [FR-01] implement GET /products endpoint`)
* `fix`: Sửa lỗi (ví dụ: `fix(cart): [FR-03] fix price calculation when selecting toppings`)
* `docs`: Cập nhật tài liệu (ví dụ: `docs(srs): [TASK-4.2] add acceptance criteria`)
* `style`: Format code, chỉnh khoảng trắng (ví dụ: `style(web): format components with prettier`)
* `refactor`: Tái cấu trúc mã nguồn (ví dụ: `refactor(repo): [TASK-4.1] restructure to monorepo`)
* `test`: Thêm hoặc sửa test case (ví dụ: `test(orders): [FR-05] add optimistic locking unit tests`)
* `chore`: Cấu hình build, CI/CD (ví dụ: `chore(ci): [TASK-4.4] setup github actions pipeline`)

#### 2. Tiêu chí Definition of Done (DoD) để chuyển sang cột `Done` & Merge PR:
Một Task / User Story chỉ được chuyển sang cột **Done** trên board và merge vào nhánh chính khi đạt tất cả 6 tiêu chí:
1. **Chức năng (Functionality)**: Đáp ứng 100% Acceptance Criteria được mô tả trong Issue/User Story.
2. **Kiểm thử (Testing)**: Đã viết Unit Test / Integration Test bao phủ luồng chính và biên; pass 100%.
3. **Chất lượng (Code Quality)**: Vượt qua kiểm tra linting (`npm run lint`), không có lỗi TypeScript/syntax.
4. **Tích hợp liên tục (CI)**: Pipeline CI tự động kích hoạt và trả về kết quả màu xanh (Success).
5. **Đồng cấp kiểm tra (Peer Review)**: Có ít nhất 1 thành viên review code và Approve trên PR.
6. **Tài liệu & Ma trận truy vết**: Đã cập nhật tương ứng vào [`docs/traceability-matrix.md`](docs/traceability-matrix.md).

---

_Dự án được xây dựng trong khuôn khổ môn học Công nghệ phần mềm – Học kỳ I, Năm học 2026–2027._