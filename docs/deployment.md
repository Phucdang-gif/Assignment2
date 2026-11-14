# Sơ Đồ Triển Khai & Hướng Dẫn Môi Trường Production (Deployment Architecture) - Task 3.2

> **Dự án**: BrewLite – Cashless Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Nhiệm vụ**: Task 3.2 – Thiết kế UML Deployment Diagram & Đặc tả môi trường triển khai thực tế  
> **Nền tảng sử dụng**:
> - **Frontend (`apps/web`)**: Triển khai trên **Vercel** (Global Edge Network & Serverless Runtime).
> - **Backend (`apps/api`)**: Đóng gói **Docker Container** (`apps/api/Dockerfile`) và triển khai trên **Render**.
> - **Database (`PostgreSQL 16`)**: Triển khai dưới dạng **Docker Container** (`postgres:16-alpine`) gắn **Persistent Disk Storage** trên **Render** (Private Network).
> - **CI/CD**: **GitHub Actions** (`.github/workflows/ci.yml`) kết hợp **GitHub Container Registry (GHCR)**.

---

## 1. Tổng Quan Kiến Trúc Triển Khai (Deployment Overview)

Mô hình triển khai của **BrewLite** tách biệt rõ ràng thành **3 ranh giới môi trường (Environment Boundaries)**:
1. **Ranh giới Local Development**: Dành cho lập trình viên chạy toàn bộ hệ thống (`frontend`, `backend`, `db`) độc lập trên máy cá nhân thông qua `docker-compose.yml`.
2. **Ranh giới CI/CD (GitHub Actions)**: Tự động kích hoạt khi có sự kiện `push` hoặc `pull_request` vào nhánh `main`/`develop`, thực thi chuỗi kiểm soát chất lượng **Install → Lint → Unit Test → Build** cùng container `postgres:16-alpine` kiểm thử độc lập, trước khi đóng gói Docker image và kích hoạt triển khai.
3. **Ranh giới Production (Vercel + Render Docker Containers)**:
   - **Vercel** phục vụ ứng dụng Next.js 16 (App Router / Mobile-first PWA) qua mạng lưới CDN toàn cầu với chứng chỉ HTTPS tự động.
   - **Render** vận hành hai **Docker Containers** nằm trong cùng một mạng nội bộ (**Render Private Network**):
     - Container **Backend NestJS API** (`apps/api/Dockerfile`) lắng nghe tại cổng nội bộ `3001`, nhận lưu lượng HTTPS từ Render Reverse Proxy (cổng `443`).
     - Container **PostgreSQL 16** (`postgres:16-alpine`) lắng nghe tại cổng nội bộ `5432` (không mở public ra ngoài internet) và gắn ổ đĩa cứng bền vững **Render Persistent Disk** tại `/var/lib/postgresql/data`.

---

## 2. Sơ Đồ Triển Khai UML (UML Deployment Diagram)

> **Tệp nguồn PlantUML & Vector SVG**:
> - PlantUML chi tiết ([N-xx] Node & [C-xx] Connection): [`docs/diagrams/deployment-diagram.puml`](diagrams/deployment-diagram.puml)
> - PlantUML kiến trúc rút gọn: [`docs/diagrams/deployment.puml`](diagrams/deployment.puml)
> - Ảnh vector chất lượng cao: [`docs/diagrams/deployment-diagram.svg`](diagrams/deployment-diagram.svg)

![Sơ Đồ Triển Khai Hệ Thống BrewLite](diagrams/deployment-diagram.svg)

### 2.1. Sơ đồ luồng kết nối tương tác (Interactive Mermaid Flowchart)

```mermaid
flowchart TB
    subgraph ClientTier["1. Thiết bị người dùng (Client Device)"]
        PWA["📱 Trình duyệt Di động / Ứng dụng PWA<br>(Next.js Client Bundle + Zustand Cart)"]
    end

    subgraph LocalEnv["2. Ranh giới Local Development (docker-compose.yml)"]
        direction LR
        LocalWeb["🐳 Container: brewlite-frontend<br>(apps/web/Dockerfile - Port 3000)"]
        LocalAPI["🐳 Container: brewlite-backend<br>(apps/api/Dockerfile - Port 3001)"]
        LocalDB[("🐳 Container: brewlite-db<br>(postgres:16-alpine - Port 5433:5432)<br>Volume: pgdata")]
        LocalWeb -->|"HTTP :3001"| LocalAPI
        LocalAPI -->|"TCP :5432"| LocalDB
    end

    subgraph CIEnv["3. Ranh giới CI/CD Pipeline (GitHub Actions - ubuntu-latest)"]
        direction LR
        GHActions["⚙️ GitHub Actions Workflow (ci.yml)<br>Install ➔ Lint ➔ Unit Test ➔ Build"]
        CITestDB[("🐳 Service: postgres:16-alpine<br>(brewlite_test :5432)")]
        GHCR["📦 Container Registry (GHCR / Docker Hub)<br>Image: brewlite-api:sha"]
        GHActions -->|"Prisma Migrate & Test (:5432)"| CITestDB
        GHActions -->|"docker build & push"| GHCR
    end

    subgraph ProdEnv["4. Ranh giới Production (Vercel + Render Cloud)"]
        subgraph VercelPlatform["☁️ Vercel Cloud (Frontend CDN)"]
            VercelEdge["🚀 Next.js 16 PWA / Edge Network<br>Artifact: apps/web (.next build)<br>Env: NEXT_PUBLIC_API_URL"]
        end

        subgraph RenderPlatform["☁️ Render Cloud Platform (Docker Container Runtime)"]
            RenderProxy["🔒 Render HTTPS Load Balancer / Reverse Proxy<br>(TLS 1.3 Termination - Port 443)"]

            subgraph RenderPrivateNet["🛡️ Render Private Network (Internal VPC)"]
                RenderAPI["🐳 Docker Container: brewlite-api<br>(apps/api/Dockerfile - Node 20 Alpine)<br>Internal Port: 3001 | Health: GET /health<br>Secrets: DATABASE_URL, JWT_SECRET, PORT"]
                RenderDB["🐳 Docker Container: brewlite-postgres<br>(Image: postgres:16-alpine)<br>Internal Port: 5432 (Private Only)"]
                RenderDisk[("💾 Render Persistent Disk<br>Mount: /var/lib/postgresql/data")]
                MockPay["💳 Mock Payment Subsystem<br>(VietQR / MoMo / Card + Idempotency Key)"]
            end
        end
    end

    PWA ==>|"HTTPS / TLS 1.3 (Port 443)<br>Tải UI PWA & Static Assets"| VercelEdge
    PWA ==>|"HTTPS / TLS 1.3 (Port 443)<br>REST API JSON + Bearer JWT"| RenderProxy
    VercelEdge ==>|"HTTPS (Port 443)<br>SSR Fetch Products"| RenderProxy
    RenderProxy ==>|"HTTP Forward (Port 3001)"| RenderAPI
    RenderProxy -.->|"Health Check (30s)<br>GET /health"| RenderAPI
    RenderAPI ==>|"TCP/IP (Port 5432)<br>Prisma Client + Optimistic Lock Tx"| RenderDB
    RenderDB ==>|"Read/Write WAL & Data"| RenderDisk
    RenderAPI -->|"In-Process / Internal Call"| MockPay

    GHActions -.->|"Vercel Git Integration"| VercelEdge
    GHCR -.->|"Pull Docker Image & Deploy"| RenderAPI
```

---

## 3. Đặc Tả Kết Nối, Giao Thức, Bảo Mật và Giám Sát

### 3.1. Giao thức mạng và Cổng kết nối (Network Protocols & Ports)

| Điểm đầu (Source) | Điểm cuối (Destination) | Giao thức | Cổng (Port) | Phạm vi mạng | Mục đích sử dụng |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Client Browser / PWA** | **Vercel Edge CDN** | `HTTPS` (TLS 1.3) | `443` | Public Internet | Tải giao diện Next.js PWA, static assets, manifest và caching. |
| **Client Browser / Vercel** | **Render Ingress Proxy** | `HTTPS` (TLS 1.3) | `443` | Public Internet | Gọi RESTful API (`/products`, `/auth/*`, `/orders`, `/payments`) kèm header `Authorization: Bearer <JWT>`. |
| **Render Ingress Proxy** | **Container `brewlite-api`** | `HTTP` | `3001` | Render Internal | Chuyển tiếp request đã giải mã SSL vào container NestJS và kiểm tra định kỳ `GET /health`. |
| **Container `brewlite-api`** | **Container `brewlite-postgres`** | `TCP/IP` (Postgres Wire) | `5432` | Render Private VPC | Thực thi truy vấn Prisma ORM, ACID Transaction tạo đơn và khóa lạc quan (`version`). **Tuyệt đối không mở public port 5432 ra internet.** |

### 3.2. Quản lý Biến Môi Trường & Bí Mật (Secrets & Environment Variables)

Không có bất kỳ mật khẩu hay khóa bí mật thực tế nào được lưu trong kho mã nguồn (`.env` đã được chặn trong `.gitignore`, chỉ cung cấp khuôn mẫu tại [`.env.example`](../.env.example)).

* **Trên Vercel (Frontend Settings → Environment Variables)**:
  * `NEXT_PUBLIC_API_URL`: Đường dẫn HTTPS trỏ tới dịch vụ Backend trên Render (ví dụ: `https://brewlite-api.onrender.com`).
* **Trên Render (Backend Container → Environment & Secret Files)**:
  * `DATABASE_URL`: Chuỗi kết nối nội bộ tới container PostgreSQL trên Render (`postgresql://brewlite:<password>@brewlite-postgres:5432/brewlite?schema=public`).
  * `JWT_SECRET`: Khóa bí mật 256-bit sinh ngẫu nhiên dùng để ký và xác thực JWT Token.
  * `PORT`: `3001` (cổng nội bộ mà NestJS lắng nghe trên `0.0.0.0:3001`).
* **Trên GitHub Actions (Repository Settings → Secrets and variables → Actions)**:
  * `RENDER_DEPLOY_HOOK_URL`: Webhook bí mật để kích hoạt Render kéo Docker image mới sau khi CI pass.
  * `VERCEL_TOKEN` / Git Integration: Tự động triển khai bản build Frontend khi PR được merge vào `main`.

### 3.3. Cơ chế Health Check, Migration An Toàn & Logging

1. **Health Check Endpoint (`GET /health`)**:
   * Được cài đặt tại [`apps/api/src/app.controller.ts`](../apps/api/src/app.controller.ts) và [`apps/api/src/app.service.ts`](../apps/api/src/app.service.ts).
   * Render cấu hình `Health Check Path: /health`. Nếu container mới khởi chạy không phản hồi `200 OK`, Render tự động hủy bản triển khai lỗi và giữ nguyên container phiên bản cũ đang chạy (Zero-downtime Rollback).
2. **Database Migration khi khởi chạy Container**:
   * Trong [`apps/api/Dockerfile`](../apps/api/Dockerfile), quá trình build thực thi `npx prisma generate` và khi khởi động container sẽ đồng bộ schema cơ sở dữ liệu trước khi khởi chạy `node dist/main.js`.
3. **Tập trung hóa Log (Structured Logging)**:
   * Toàn bộ log truy cập, lỗi xác thực JWT, xung đột khóa lạc quan tồn kho và đối soát `idempotencyKey` được ghi ra `stdout`/`stderr` của Docker container và thu thập trực tiếp trên **Render Log Streams** cũng như **Vercel Runtime Logs**.

---

## 4. Bảng Truy Vết Thành Phần Triển Khai (Deployment Traceability Matrix)

Đáp ứng tiêu chí nghiệm thu mục **5.2 Task 3.2**: *"Có thể truy vết mỗi container/dịch vụ trong deployment diagram đến một thành phần trong mô tả kiến trúc và mã nguồn"*.

| Node / Container trong Deployment Diagram | Nền tảng vận hành | Thành phần trong Mô tả Kiến trúc (`system-architecture.md`) | Tệp cấu hình & Mã nguồn tương ứng trong Repository |
| :--- | :--- | :--- | :--- |
| **`Client Device (Mobile Browser / PWA)`** | Thiết bị người dùng (iOS / Android / Desktop) | **Client Tier** & **C4 Level 1 Actor** (`Customer`, `Barista`) | [`apps/web/app/layout.tsx`](../apps/web/app/layout.tsx)<br>[`apps/web/store/cartStore.ts`](../apps/web/store/cartStore.ts) |
| **`Vercel Edge Network / BrewLite Web App`** | **Vercel Cloud** (Frontend Hosting & CDN) | **Presentation Tier** – Container `Web Application (PWA)` (Next.js) | [`apps/web/package.json`](../apps/web/package.json)<br>[`apps/web/next.config.ts`](../apps/web/next.config.ts)<br>[`apps/web/Dockerfile`](../apps/web/Dockerfile)<br>[`apps/web/app/page.tsx`](../apps/web/app/page.tsx) |
| **`Docker Container: brewlite-api`** | **Render Cloud** (Docker Web Service) | **Application Tier** – Container `API Application` (NestJS Modular Monolith: `AuthModule`, `ProductsModule`, `OrdersModule`, `PaymentsModule`) | [`apps/api/Dockerfile`](../apps/api/Dockerfile)<br>[`apps/api/src/main.ts`](../apps/api/src/main.ts)<br>[`apps/api/src/app.module.ts`](../apps/api/src/app.module.ts)<br>[`apps/api/src/app.controller.ts`](../apps/api/src/app.controller.ts) (`GET /health`) |
| **`Docker Container: brewlite-postgres` + `Render Persistent Disk`** | **Render Cloud** (Docker Private Service + Persistent Disk `/var/lib/postgresql/data`) | **Data Tier** – Container `Database` (PostgreSQL 16 + Prisma ORM + Optimistic Locking) | [`docker-compose.yml`](../docker-compose.yml) (`image: postgres:16-alpine`)<br>[`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma)<br>[`apps/api/prisma/migrations/`](../apps/api/prisma/migrations/)<br>[`apps/api/prisma/seed.js`](../apps/api/prisma/seed.js) |
| **`Mock Payment Subsystem`** | Nội bộ trong Container `brewlite-api` trên Render | **Integration Tier** – `Mock Payment Service` (VietQR / MoMo / Card + Idempotency Key) | [`apps/api/src/payments/payments.controller.ts`](../apps/api/src/payments/payments.controller.ts)<br>[`apps/api/src/payments/payments.service.ts`](../apps/api/src/payments/payments.service.ts)<br>[`docs/architecture/adr/004-payment-simulation-and-idempotency.md`](architecture/adr/004-payment-simulation-and-idempotency.md) |
| **`GitHub Actions Runner (ubuntu-latest)`** | **GitHub Actions** CI/CD | **NFR-05 (Deployability)** & [`ADR-001`](architecture/adr/001-monorepo.md), [`ADR-006`](architecture/adr/006-logging-healthcheck-and-configuration.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)<br>[`.github/workflows/cd.yml`](../.github/workflows/cd.yml)<br>[`docs/ci-evidence.md`](ci-evidence.md) |
| **`Local Docker Engine`** | Máy trạm Lập trình viên (Docker Desktop) | Môi trường phát triển & kiểm thử tích hợp cục bộ (Local Environment) | [`docker-compose.yml`](../docker-compose.yml)<br>[`.env.example`](../.env.example) |

---

## 5. Quy Trình Tự Động Hóa CD Pipeline (Continuous Delivery & Deployment - Task 5.3)

Quy trình phân phối và triển khai liên tục được hiện thực hóa qua workflow [`.github/workflows/cd.yml`](../.github/workflows/cd.yml), thỏa mãn 7 yêu cầu bắt buộc của mục 7.3:

```mermaid
flowchart LR
    A["1. Git Tag (v*.*.*)<br>/ Push main"] --> B["2. Quality Gate<br>(Lint + Test + Build)"]
    B --> C["3. Containerize & Push<br>(GHCR Docker Image)"]
    C --> D["4. Trigger Render<br>(Deploy Webhook)"]
    D --> E["5. Smoke Test<br>(GET /health on Prod)"]
    E -- Success --> F["✅ Release Live"]
    E -- Failure --> G["🚨 Disaster Recovery<br>& Auto/Manual Rollback"]
```

### 5.1. Bốn Chặng Kiểm Soát trong Pipeline CD

1. **Chặng 1 - Quality Gate Toàn diện**:
   * **Backend**: Chạy linter (`oxlint`), áp dụng Prisma migration trên container PostgreSQL dịch vụ, nạp test seed data, chạy toàn bộ Unit Tests (`npm test`), và chạy toàn bộ Integration & E2E Tests (`npm run test:e2e`).
   * **Frontend**: Chạy ESLint (`npm run lint`), kiểm thử luồng nghiệp vụ PWA (`npm test`), và biên dịch Next.js bundle (`npm run build`).
   * *Điều kiện chuyển chặng*: Bất kỳ bài test hoặc bước build nào thất bại, pipeline dừng ngay lập tức, ngăn ngừa đưa mã nguồn lỗi lên môi trường sản xuất.
2. **Chặng 2 - Đóng gói Docker & Đẩy lên GitHub Container Registry (GHCR)**:
   * Build image đa tầng (Multi-stage build) tối ưu dung lượng dựa trên Node 24 Alpine.
   * Gắn nhãn phiên bản theo Git SHA, Release Tag và nhãn `latest`.
3. **Chặng 3 - Kích hoạt Triển khai Production (Render Deploy Hook)**:
   * Gửi tín hiệu Webhook mã hóa an toàn qua HTTPS tới Render Cloud để kích hoạt kéo Docker image mới nhất và khởi tạo container.
4. **Chặng 4 - Smoke Test & Cơ chế Tự động Phát hiện Lỗi**:
   * Chờ container khởi động (45s grace period) và thực hiện kiểm tra sức khỏe lặp lại (retry 6 lần x 15s) tới endpoint sản xuất `GET /health`.
   * Nếu không đạt phản hồi `200 OK` (Healthy), pipeline báo lỗi và kích hoạt quy trình Rollback.

---

## 6. Chiến Lược Quản Lý Database Migration & Seeding An Toàn (Yêu cầu #5)

### 6.1. Nguyên tắc Không sử dụng `db push --accept-data-loss`
* Tuyệt đối **không** dùng `prisma db push` trên môi trường Production: lệnh này có thể tự động xóa cột, xóa bảng hoặc làm rớt dữ liệu thực tế nếu schema có thay đổi không tương thích ngược.
* **Chuẩn áp dụng**: `npx prisma migrate deploy` trong lệnh khởi chạy container của [`apps/api/Dockerfile`](../apps/api/Dockerfile). Lệnh này chỉ thực thi các file SQL migration đã được kiểm duyệt và lập phiên bản trong thư mục `prisma/migrations/`.

### 6.2. Cơ chế Ngăn ngừa Chạy Lặp Seeding khi Container Khởi động lại
* Trong [`apps/api/Dockerfile`](../apps/api/Dockerfile), lệnh `CMD` chỉ thực hiện di trú schema và chạy ứng dụng:
  ```dockerfile
  CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
  ```
* Script [`apps/api/prisma/seed.js`](../apps/api/prisma/seed.js) được tích hợp cờ kiểm tra dữ liệu tồn tại (**Idempotency Check**): Nếu các bảng danh mục, sản phẩm, người dùng đã có dữ liệu, quá trình seed sẽ tự động bỏ qua để bảo toàn dữ liệu người dùng và tránh xung đột khóa chính khi hệ thống khởi động lại.

---

## 7. Quy Trình Khôi Phục Sự Cố & Chiến Lược Rollback (Yêu cầu #7)

Khi chặng Smoke Test trong CD Pipeline thất bại (endpoint sản xuất không phản hồi hoặc phản hồi lỗi), hệ thống áp dụng cơ chế xử lý sự cố đa tầng:

```
                          ┌──────────────────────────┐
                          │   Smoke Test Thất bại    │
                          └─────────────┬────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
    [Tầng 1: Render Platform]                     [Tầng 2: Pipeline CD & SOP]
 ┌───────────────────────────────┐             ┌───────────────────────────────┐
 │ Zero-Downtime Deployment:     │             │ 1. Gọi Render Rollback API    │
 │ Tự động giữ container cũ      │             │    (nếu có RENDER_API_KEY)    │
 │ khi container mới fail health │             │ 2. SOP Rollback qua Dashboard │
 └───────────────────────────────┘             │ 3. Git Release Tag Revert     │
                                               └───────────────────────────────┘
```

### 7.1. Tầng 1: Tính năng Zero-Downtime Deployment & Built-in Rollback của Render
* Render Cloud chỉ chuyển hướng lưu lượng truy cập (Traffic Switching) sang container phiên bản mới khi container mới vượt qua kiểm tra sức khỏe tại cấu hình `Health Check Path: /health`.
* Nếu container mới bị crash loop, thiếu biến môi trường hoặc thất bại khi migrate, Render giữ nguyên container của phiên bản trước đó tiếp tục hoạt động, đảm bảo thời gian gián đoạn bằng không (Zero-downtime).

### 7.2. Tầng 2: Tự động hóa Rollback qua Render REST API trong CD Pipeline
Khi phát hiện Smoke Test thất bại, nếu cấu hình Secret `RENDER_API_KEY` và `RENDER_SERVICE_ID`, GitHub Actions sẽ tự động phát lệnh đảo ngược bản triển khai:
```bash
curl -s -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/rollback" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ${RENDER_API_KEY}"
```

### 7.3. Tầng 3: Quy trình Chuẩn Vận hành Thủ công (Runbook / SOP Rollback)
Nếu cần can thiệp khẩn cấp từ đội ngũ kỹ sư vận hành:
1. **Rollback qua Render Dashboard**:
   * Bước 1: Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
   * Bước 2: Chọn Web Service `brewlite-api` ➔ chọn mục **Deploys**.
   * Bước 3: Tìm bản triển khai thành công gần nhất trước đó (hiển thị trạng thái *Live* trước phiên bản lỗi).
   * Bước 4: Nhấn vào biểu tượng 3 chấm `...` và chọn **Rollback to this deploy**.
2. **Rollback phiên bản qua Git Tag & VCS**:
   * Bước 1: Revert commit lỗi: `git revert HEAD -m "revert: rollback broken release"`.
   * Bước 2: Xóa tag lỗi nếu cần: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`.
   * Bước 3: Đẩy bản vá ổn định với tag mới (ví dụ: `v1.0.1`) để pipeline CD kích hoạt lại quy trình triển khai phiên bản sạch.

---

## 8. Hướng Dẫn Kích Hoạt Thực Tế & Cấu Hình Secrets (Yêu cầu #4 & #6)

Để kích hoạt pipeline CD chạy thực tế trên môi trường sản xuất:

1. **Thiết lập GitHub Repository Secrets**:
   * Truy cập GitHub Repo: **Settings** ➔ **Secrets and variables** ➔ **Actions**.
   * Thêm các biến bí mật sau:
     * `PRODUCTION_API_URL`: URL Backend chính thức trên Render (ví dụ: `https://brewlite-api.onrender.com`).
     * `RENDER_DEPLOY_HOOK`: URL Deploy Hook do Render cấp tại mục Service Settings.
     * `RENDER_API_KEY` *(Tùy chọn)*: API Key của tài khoản Render để tự động hóa Rollback.
     * `RENDER_SERVICE_ID` *(Tùy chọn)*: ID định danh Web Service trên Render (dạng `srv-xxxxxxxxxxxxxxxxxxxx`).

2. **Gắn Git Release Tag để Kích hoạt CD**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   Pipeline `cd.yml` sẽ tự động thực thi chuỗi 4 chặng: kiểm thử chất lượng toàn diện, đóng gói Docker, kích hoạt triển khai và thực hiện smoke test trực tiếp trên endpoint sản xuất.
