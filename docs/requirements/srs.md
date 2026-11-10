# Đặc Tả Yêu Cầu Phần Mềm Rút Gọn (Software Requirements Specification - SRS)

> **Dự án**: BrewLite – Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Mã tài liệu**: SRS-VER-1.0  
> **Ngày cập nhật**: 20/10/2026  

---

## 1. Giới thiệu tổng quan (Introduction)

Tài liệu này xác định các **Yêu cầu chức năng (Functional Requirements - FR)** và **Yêu cầu phi chức năng (Non-Functional Requirements - NFR)** cho hệ thống đặt đồ uống BrewLite. Mọi yêu cầu được phân loại mức độ ưu tiên theo mô hình **MoSCoW** (*Must have, Should have, Could have, Won't have*), đi kèm các **Tiêu chí chấp nhận (Acceptance Criteria)** có thể kiểm chứng được để làm căn cứ thiết kế kiến trúc, hiện thực mã nguồn và xây dựng bộ kiểm thử (Test Cases).

---

## 2. Sơ đồ Use-case tổng quát hệ thống (Overall Use Case Diagram)

### 2.1. Sơ đồ Use-case tổng quát (UML Use Case Diagram)

Tệp nguồn PlantUML: [`docs/diagrams/usecase-general.puml`](../diagrams/usecase-general.puml)  
Tệp đồ họa vector: [`docs/diagrams/usecase-general.svg`](../diagrams/usecase-general.svg)

![Sơ đồ Use-case tổng quát BrewLite](../diagrams/usecase-general.svg)

```mermaid
flowchart LR
    %% Actors (Tất cả đều là Actor người que)
    Customer(["Khách hàng\n(Customer)"]):::actor
    Barista(["Nhân viên quầy\n(Barista)"]):::actor
    Manager(["Quản lý cửa hàng\n(Store Manager)"]):::actor
    PaymentService(["Cổng thanh toán\n(Payment Service)"]):::actor

    %% Subgraphs / Packages
    subgraph System ["HỆ THỐNG ĐẶT ĐỒ UỐNG TRỰC TUYẾN BREWLITE"]
        direction TB

        subgraph P1 ["Phân hệ Khách hàng (Ordering Flow)"]
            UC01(["UC-01: Xem menu đồ uống"]):::usecase
            UC02(["UC-02: Tìm kiếm & lọc món"]):::usecase
            UC03(["UC-03: Xem chi tiết sản phẩm"]):::usecase
            UC04(["UC-04: Tùy biến Size/Topping"]):::usecase
            UC05(["UC-05: Quản lý giỏ hàng"]):::usecase
            UC06(["UC-06: Đặt hàng mới"]):::usecase
            UC07(["UC-07: Thanh toán trực tuyến"]):::core
            UC08(["UC-08: Theo dõi trạng thái đơn"]):::usecase
            UC09(["UC-09: Xem lịch sử & tích điểm"]):::usecase
        end

        subgraph P2 ["Phân hệ Xác thực (Authentication)"]
            UC10(["UC-10: Đăng ký tài khoản"]):::usecase
            UC11(["UC-11: Đăng nhập cấp JWT"]):::usecase
        end

        subgraph P3 ["Phân hệ Quầy pha chế (Barista Operations)"]
            UC12(["UC-12: Tiếp nhận đơn đã thanh toán"]):::usecase
            UC13(["UC-13: Cập nhật tiến độ pha chế"]):::core
        end

        subgraph P4 ["Phân hệ Quản trị (Store Management)"]
            UC14(["UC-14: Bật/tắt món & topping"]):::usecase
            UC15(["UC-15: Xem báo cáo doanh thu"]):::usecase
        end

        %% Inside relations
        UC02 -. "<<extend>>" .-> UC01
        UC04 -. "<<extend>>" .-> UC03
        UC06 -. "<<include>>" .-> UC05
        UC07 -. "<<include>>" .-> UC06
        
        %% QUY TẮC ĐĂNG NHẬP:
        %% UC-05 & UC-06 KHÔNG cần đăng nhập
        %% UC-07 BẮT BUỘC đăng nhập trước khi thanh toán
        %% UC-13 BẮT BUỘC đăng nhập tài khoản Barista
        UC07 -. "<<include>>\n(Bắt buộc Login)" .-> UC11
        UC13 -. "<<include>>\n(Bắt buộc Login)" .-> UC11
        UC09 -. "<<include>>" .-> UC11
        UC13 -. "<<include>>" .-> UC12
    end

    %% Customer Connections
    Customer --- UC01
    Customer --- UC03
    Customer --- UC05
    Customer --- UC06
    Customer --- UC07
    Customer --- UC08
    Customer --- UC09
    Customer --- UC10
    Customer --- UC11

    %% Barista Connections
    Barista --- UC11
    Barista --- UC12
    Barista --- UC13

    %% Manager Connections
    Manager --- UC11
    Manager --- UC14
    Manager --- UC15

    %% Payment Connection (Tương tác cổng thanh toán)
    UC07 ==>|"<<interact>>"| PaymentService

    %% Styles
    classDef actor fill:#EBF8FF,stroke:#2B6CB0,stroke-width:2px,color:#1A365D;
    classDef usecase fill:#FFFFFF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef core fill:#FEF2F2,stroke:#DC2626,stroke-width:2px,color:#991B1B,font-weight:bold;
```

### 2.2. Bảng phân tích các Actor (Tác nhân)

| STT | Actor (Tác nhân) | Phân loại | Mô tả vai trò trong hệ thống |
| :---: | :--- | :--- | :--- |
| **1** | **Khách hàng** *(Customer)* | Primary Actor (Chính) | Người dùng truy cập qua thiết bị cá nhân (PWA / Responsive Web) để xem menu, chọn tùy biến món, thêm giỏ hàng, đặt đơn (không cần login) và đăng nhập khi thanh toán trực tuyến. |
| **2** | **Nhân viên quầy** *(Barista)* | Primary Actor (Chính) | Người dùng nội bộ tại quán chịu trách nhiệm tiếp nhận các đơn hàng đã thanh toán (`PAID`), thực hiện pha chế và cập nhật trạng thái đơn (`PREPARING` -> `READY` -> `COMPLETED`). |
| **3** | **Quản lý cửa hàng** *(Store Manager)* | Secondary / Admin | Quản lý danh mục menu, kiểm soát trạng thái món và topping (bật/tắt khi hết nguyên liệu), theo dõi lịch sử đơn và doanh thu. |
| **4** | **Cổng thanh toán** *(Payment Service)* | External Actor (Hệ thống ngoài) | Dịch vụ thanh toán mô phỏng (Mock Payment Gateway) xử lý xác thực giao dịch qua Ví điện tử (`WALLET`) hoặc Thẻ (`CARD`), hỗ trợ `idempotencyKey` chống trừ tiền trùng lặp. |

### 2.3. Bảng ánh xạ Use-case với Yêu cầu chức năng (Traceability)

| Mã Use-case | Tên Use-case | Actor chính | Mã Yêu cầu chức năng | Quan hệ liên kết |
| :---: | :--- | :--- | :---: | :--- |
| **UC-01** | Xem menu đồ uống | Customer | **FR-01, FR-12** | Use-case cơ sở hiển thị danh mục món và gợi ý. |
| **UC-02** | Tìm kiếm & lọc đồ uống | Customer | **FR-01** | `<<extend>>` UC-01 (khi người dùng có nhu cầu tìm kiếm nhanh). |
| **UC-03** | Xem chi tiết sản phẩm | Customer | **FR-02** | Use-case cơ sở xem mô tả, ảnh, giá gốc. |
| **UC-04** | Tùy biến Size & Topping | Customer | **FR-02** | `<<extend>>` UC-03 (chọn kích thước S/M/L, thêm topping, tính giá động). |
| **UC-05** | Quản lý giỏ hàng | Customer | **FR-03** | Lưu trữ, tăng/giảm số lượng, xóa món và tính tổng tiền (**Khách vãng lai không cần đăng nhập**). |
| **UC-06** | Đặt hàng mới | Customer | **FR-05, FR-10, FR-11** | `<<include>>` UC-05 (giỏ hàng); Tạo đơn hàng mới `PENDING`, áp dụng ưu đãi TV (**Khách vãng lai không cần đăng nhập**). |
| **UC-07** | **Thanh toán trực tuyến (Trọng tâm)** | Customer, Payment Service | **FR-06, FR-13** | `<<include>>` UC-06; `<<include>>` UC-11 (**BẮT BUỘC ĐĂNG NHẬP** trước khi thanh toán); gọi Payment Service đổi sang `PAID`. |
| **UC-08** | Theo dõi trạng thái đơn hàng | Customer | **FR-08** | Hiển thị tiến trình thời gian thực: `PENDING` -> `PAID` -> `PREPARING` -> `READY` -> `COMPLETED`. |
| **UC-09** | Xem lịch sử đơn & tích điểm | Customer | **FR-07, FR-11** | `<<include>>` UC-11; xem lại các đơn đã mua và điểm `loyaltyPoints`. |
| **UC-10** | Đăng ký tài khoản | Customer | **FR-04** | Đăng ký tài khoản khách hàng mới với mật khẩu mã hóa `bcrypt`. |
| **UC-11** | Đăng nhập hệ thống | Customer, Barista, Manager | **FR-04** | Cấp phát JWT Bearer Token chứa `userId` và `role`. |
| **UC-12** | Tiếp nhận đơn đã thanh toán | Barista | **FR-08** | Quầy pha chế nhận danh sách đơn hàng có trạng thái `PAID`. |
| **UC-13** | Cập nhật tiến độ pha chế | Barista | **FR-08** | `<<include>>` UC-12; `<<include>>` UC-11 (**BẮT BUỘC ĐĂNG NHẬP** tài khoản Barista); cập nhật trạng thái đơn theo máy trạng thái FSM. |
| **UC-14** | Bật/tắt món & topping | Store Manager | **FR-09** | Cập nhật trạng thái `isAvailable` khi quán hết nguyên liệu. |
| **UC-15** | Xem báo cáo doanh thu & đơn | Store Manager | Khác | Xem tổng kết số lượng đơn hàng và doanh thu theo thời gian. |

---

## 3. Danh sách Yêu cầu Chức năng (Functional Requirements - FR)

Mức ưu tiên phân bổ theo **MoSCoW**:
- **Must (M)**: Bắt buộc phải có để hệ thống hoạt động được trong MVP (Sprint 1 và Sprint 2).
- **Should (S)**: Cần thiết để trải nghiệm người dùng hoàn chỉnh.
- **Could (C)**: Tính năng bổ trợ nếu có thêm thời gian (Gợi ý món phổ biến).
- **Won't (W)**: Tạm hoãn, không triển khai trong phạm vi MVP (Thanh toán tiền mặt).

| Mã YC | Nhóm chức năng | Tên yêu cầu | Mô tả chi tiết | MoSCoW | Tiêu chí chấp nhận (Acceptance Criteria) |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **FR-01** | **Menu** | Xem danh sách đồ uống | Khách hàng có thể xem danh mục đồ uống với hình ảnh, tên món, giá cơ sở và trạng thái còn/hết hàng. | **Must** | **AC-01.1**: Trả về danh sách sản phẩm active kèm phân trang/danh mục qua `GET /products`.<br>**AC-01.2**: Hiển thị rõ nhãn "Hết hàng" nếu sản phẩm có `stock = 0` hoặc trạng thái `inactive`. |
| **FR-02** | **Chi tiết món** | Cấu hình Size & Topping | Khách hàng xem thông tin chi tiết món, chọn dung tích kích cỡ (Size S, M, L) và danh sách Topping đi kèm. | **Must** | **AC-02.1**: Lấy chi tiết món qua `GET /products/:id`.<br>**AC-02.2**: Lấy danh sách topping khả dụng qua `GET /api/toppings`.<br>**AC-02.3**: Khi đổi size (S: cơ sở, M: +5.000đ, L: +10.000đ) hoặc chọn thêm topping, tổng giá tạm tính cập nhật ngay tức thì trên giao diện. |
| **FR-03** | **Giỏ hàng** | Quản lý giỏ hàng cục bộ | Khách hàng có thể thêm món đã chọn vào giỏ, tăng/giảm số lượng, xóa món và xem tổng giá trị đơn hàng. | **Must** | **AC-03.1**: Giỏ hàng lưu trữ đúng cấu trúc: `productId, size, quantity, toppings[]`.<br>**AC-03.2**: Cho phép chỉnh sửa số lượng ($1 \le quantity \le 99$) hoặc xóa món khỏi giỏ.<br>**AC-03.3**: Dữ liệu giỏ hàng được duy trì sau khi tải lại trang (reload).<br>**AC-03.4**: Tổng tiền đơn hàng (`total`) tính đúng công thức: $\sum ((\text{Giá size} + \sum \text{Giá topping}) \times \text{Số lượng})$. |
| **FR-04** | **Xác thực** | Đăng ký & Đăng nhập (JWT) | Người dùng đăng ký tài khoản mới bằng Email/Mật khẩu và đăng nhập để nhận Token xác thực phiên làm việc. | **Must** | **AC-04.1**: Mật khẩu mã hóa một chiều an toàn bằng thư viện `bcrypt`.<br>**AC-04.2**: Đăng ký từ chối nếu Email đã tồn tại trong hệ thống.<br>**AC-04.3**: Đăng nhập thành công trả về `accessToken` JWT chứa `userId` và `role` (`customer` hoặc `barista`). Token có thời hạn hợp lệ. |
| **FR-05** | **Đặt đơn hàng** | Tạo đơn hàng mới | Khách hàng gửi thông tin giỏ hàng để tạo đơn hàng mới, kiểm tra tồn kho và chuyển trạng thái sang `PENDING`. | **Must** | **AC-05.1**: API `POST /orders` yêu cầu Bearer Token JWT.<br>**AC-05.2**: Toàn bộ quá trình tạo `Order`, các bản ghi `OrderItem`, `OrderItemTopping` và trừ số lượng `stock` của `Product` phải nằm trong một Database Transaction (Atomic).<br>**AC-05.3**: Áp dụng kiểm tra xung đột tồn kho (Optimistic Concurrency Control qua cột `version`). Báo lỗi `400 Bad Request` nếu không đủ hàng tồn. |
| **FR-06** | **Thanh toán** | Thanh toán đơn hàng mô phỏng | Khách hàng thực hiện thanh toán cho đơn hàng `PENDING` bằng phương thức Ví điện tử (`WALLET`) hoặc Thẻ (`CARD`). | **Must** | **AC-06.1**: API `POST /payments` nhận `orderId`, `method`, `amount` và `idempotencyKey`.<br>**AC-06.2**: Nếu `idempotencyKey` đã tồn tại, hệ thống trả về kết quả thanh toán cũ mà không thực hiện trừ tiền hay thay đổi trạng thái lần 2.<br>**AC-06.3**: Thanh toán thành công cập nhật trạng thái đơn thành `PAID`. Thanh toán thất bại chuyển đơn sang `PAYMENT_FAILED`. |
| **FR-07** | **Lịch sử & Điểm** | Xem lịch sử đơn & Tích điểm | Khách hàng xem danh sách các đơn hàng đã mua và số điểm thưởng thành viên tích lũy hiện có. | **Must** | **AC-07.1**: API `GET /orders` lọc theo `userId` của tài khoản đang đăng nhập.<br>**AC-07.2**: Mỗi đơn hàng thanh toán thành công (`PAID`) tự động cộng điểm tích lũy: $10.000\text{ VNĐ} = 1\text{ điểm}$ vào trường `loyaltyPoints` của `User`. |
| **FR-08** | **Quản lý đơn** | Cập nhật tiến độ pha chế | Nhân viên quầy / Pha chế (Barista) xem danh sách các đơn `PAID` và cập nhật lần lượt sang `PREPARING`, `READY`, `COMPLETED`. | **Must** | **AC-08.1**: API `PATCH /orders/:id/status` chỉ cho phép người dùng có `role = barista` truy cập.<br>**AC-08.2**: Chuyển trạng thái đơn tuần tự theo đúng quy tắc FSM (Finite State Machine). Không cho phép nhảy cóc trạng thái bất hợp lệ (ví dụ: từ `PENDING` nhảy thẳng lên `COMPLETED`). |
| **FR-09** | **Quản lý món** | Bật/tắt món & topping | Quản lý hoặc nhân viên có thể bật/tắt khả dụng của sản phẩm hoặc topping khi quán tạm hết nguyên liệu. | **Should** | **AC-09.1**: Cập nhật trạng thái `isAvailable` của topping qua `PATCH /api/toppings/:id`.<br>**AC-09.2**: Các món hoặc topping bị tắt khả dụng lập tức không xuất hiện trong danh sách lựa chọn của khách hàng. |
| **FR-10** | **Dọn dẹp đơn** | Hủy đơn quá hạn tự động | Tự động hủy đơn hàng `PENDING` quá hạn và hoàn trả tồn kho. | **Must** | **AC-10.1**: Tự động hủy các đơn `PENDING` quá thời hạn (15 phút) sang `CANCELLED`.<br>**AC-10.2**: Hoàn trả chính xác số lượng tồn kho (Stock Rollback) cho sản phẩm tương ứng. |
| **FR-11** | **Ưu đãi TV** | Giảm giá theo hạng thành viên | Áp dụng chiết khấu dựa trên hạng thành viên tích lũy của khách hàng. | **Should** | **AC-11.1**: Tính toán hạng Bạc (5%), Vàng (10%), Kim Cương (15%) dựa trên `loyaltyPoints`.<br>**AC-11.2**: Tự động trừ tiền giảm giá vào tổng đơn hàng khi đặt hàng. |
| **FR-12** | **Gợi ý món** | Gợi ý đồ uống phổ biến | Hiển thị danh sách top đồ uống được đặt nhiều nhất tại trang chủ. | **Could** | **AC-12.1**: Hiển thị mục "Món bán chạy" (Top trending) tại màn hình Menu.<br>**AC-12.2**: Cho phép người dùng chọn nhanh món từ danh mục gợi ý. |
| **FR-13** | **Tiền mặt** | Thanh toán tiền mặt tại quầy | Thanh toán bằng tiền mặt trực tiếp tại quầy thu ngân. | **Won't** | **AC-13.1**: Hệ thống hiển thị thông báo rõ ràng chỉ chấp nhận phương thức thanh toán trực tuyến mô phỏng trong phiên bản hiện tại. |

---

## 4. Danh sách Yêu cầu Phi Chức năng (Non-Functional Requirements - NFR)

| Mã YC | Phân loại | Tên yêu cầu | Mô tả kỹ thuật chi tiết | MoSCoW | Tiêu chí chấp nhận (Acceptance Criteria) |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **NFR-01** | **Hiệu năng** *(Performance)* | Thời gian đáp ứng hệ thống | Hệ thống phản hồi nhanh chóng, hạn chế tối đa độ trễ để phục vụ tốt vào giờ cao điểm. | **Must** | **AC-NFR-01.1**: Thời gian phản hồi (Response Time) của 95% các API truy vấn (`GET /products`, `GET /api/toppings`) $< 300\text{ms}$ trong điều kiện tải bình thường.<br>**AC-NFR-01.2**: Thời gian render trang chủ lần đầu (FCP - First Contentful Paint) trên trình duyệt mobile $< 2.0\text{s}$. |
| **NFR-02** | **Bảo mật** *(Security)* | An toàn dữ liệu & Xác thực | Bảo vệ thông tin tài khoản người dùng và ngăn chặn các lỗ hổng bảo mật phổ biến. | **Must** | **AC-NFR-02.1**: Mật khẩu người dùng được băm bằng thuật toán `bcrypt` với cost factor $\ge 10$. Tuyệt đối không lưu plain-text.<br>**AC-NFR-02.2**: API bảo vệ bằng JWT Bearer Token, kiểm tra quyền truy cập theo Role (RBAC) để chặn truy cập trái phép.<br>**AC-NFR-02.3**: Sử dụng Prisma ORM có Parameterized Queries giúp ngăn chặn triệt để tấn công SQL Injection. |
| **NFR-03** | **Toàn vẹn dữ liệu** *(Data Integrity)* | Xử lý tranh chấp & Chống trùng lặp | Đảm bảo tính nhất quán của dữ liệu kho và tiền tệ trong môi trường nhiều người dùng đồng thời. | **Must** | **AC-NFR-03.1**: Mọi thao tác cập nhật kho và tạo đơn phải tuân thủ chuẩn ACID thông qua `$transaction` của Prisma.<br>**AC-NFR-03.2**: Cơ chế Optimistic Lock qua cột `version` ngăn chặn hoàn toàn hiện tượng bán âm kho (Overselling).<br>**AC-NFR-03.3**: Trường `idempotencyKey` đảm bảo mỗi phiên giao dịch thanh toán là duy nhất (Unique Constraint). |
| **NFR-04** | **Tính khả dụng** *(Usability)* | Giao diện Mobile-first & Phản hồi lỗi | Ứng dụng web được tối ưu cho màn hình cảm ứng di động, hiển thị rõ ràng mọi trạng thái. | **Must** | **AC-NFR-04.1**: Giao diện đạt chuẩn Responsive, bố cục tối ưu cho tỷ lệ màn hình điện thoại (Mobile viewport $375\text{px} - 430\text{px}$).<br>**AC-NFR-04.2**: 100% các màn hình tải dữ liệu đều có hiệu ứng Loading (Skeleton/Spinner), thông báo Empty khi không có dữ liệu và hiển thị lỗi thân thiện (Toast/Alert) khi có sự cố. |
| **NFR-05** | **Khả năng triển khai** *(Deployability)* | Đóng gói Container & Tự động hóa CI/CD | Hệ thống dễ dàng triển khai, vận hành độc lập và tự động hóa quy trình kiểm thử. | **Must** | **AC-NFR-05.1**: Cung cấp file `docker-compose.yml` có thể khởi động đầy đủ: Frontend, Backend API và PostgreSQL chỉ bằng một câu lệnh `docker compose up`.<br>**AC-NFR-05.2**: Pipeline GitHub Actions tự động thực thi 4 bước: `Install -> Lint -> Unit Test -> Build` trên mỗi Pull Request và chặn merge nếu thất bại.<br>**AC-NFR-05.3**: Cung cấp endpoint `GET /health` trả về mã `200 OK` phục vụ giám sát trạng thái hoạt động (Health check). |

---

## 5. Quy tắc chuyển đổi trạng thái đơn hàng (Order State Machine)

Hệ thống quản lý vòng đời đơn hàng theo biểu đồ chuyển trạng thái nghiêm ngặt dưới đây:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Khách bấm Đặt hàng (POST /orders)
    PENDING --> PAID: Thanh toán thành công (POST /payments)
    PENDING --> PAYMENT_FAILED: Thanh toán thất bại / Hết thời gian
    PENDING --> CANCELLED: Khách hủy đơn trước thanh toán
    
    PAID --> PREPARING: Barista bắt đầu pha chế
    PREPARING --> READY: Barista hoàn thành pha chế
    READY --> COMPLETED: Khách nhận đồ uống tại quầy
    
    PAYMENT_FAILED --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]
```

- **PENDING**: Đơn vừa tạo, chờ thực hiện thanh toán (kho đã tạm giữ thông qua transaction).
- **PAID**: Đã thanh toán tiền thành công, hệ thống cộng điểm `loyaltyPoints` cho khách.
- **PREPARING**: Nhân viên Barista đang thực hiện làm đồ uống theo công thức.
- **READY**: Thức uống đã xong, sẵn sàng ở quầy chờ khách đến lấy.
- **COMPLETED**: Khách đã nhận đồ uống, quy trình hoàn tất.
- **PAYMENT_FAILED / CANCELLED**: Đơn hàng bị hủy bỏ; hệ thống hoàn trả lại số lượng tồn kho (Rollback stock).
