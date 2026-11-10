# Quy ước Phát triển & Định nghĩa Hoàn thành (Conventions & Definition of Done)

> **Dự án**: BrewLite – Cashless Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Tài liệu**: CONV-VER-1.0  
> **Áp dụng**: Sprint 1 & Sprint 2  

---

## 1. Chiến lược phân nhánh & Quy trình Pull Request (Branch & PR Strategy)

### 1.1. Chiến lược phân nhánh (Branching Model)
Dự án áp dụng mô hình **GitHub Flow cải tiến** kết hợp **Trunk-based development with short-lived feature branches**:

* **`main`**: Nhánh chính chứa mã nguồn ổn định, đã qua kiểm thử và sẵn sàng triển khai môi trường Production. Không được phép push trực tiếp vào `main`.
* **`develop`**: Nhánh tích hợp toàn bộ các tính năng trong từng Sprint trước khi nghiệm thu release.
* **Feature/Task branches**: Phân nhánh từ `develop` (hoặc `main`) và có vòng đời ngắn (short-lived, hoàn thành trong 1-3 ngày):
  * `feat/<mã-task>-<mô-tả-ngắn>`: Xây dựng tính năng mới (ví dụ: `feat/TASK-4.3-menu-api`).
  * `fix/<mã-task>-<mô-tả-ngắn>`: Sửa lỗi (ví dụ: `fix/TASK-5.1-cart-total`).
  * `docs/<mã-task>-<mô-tả-ngắn>`: Viết hoặc cập nhật tài liệu (ví dụ: `docs/TASK-4.2-requirements`).
  * `chore/<mã-task>-<mô-tả-ngắn>`: Cấu hình hệ thống, CI/CD, dependencies (ví dụ: `chore/TASK-4.1-monorepo-setup`).

### 1.2. Quy trình Pull Request (PR) & Code Review
Mọi thay đổi đưa vào nhánh `main` / `develop` **bắt buộc** phải tuân thủ quy trình:
1. **Tạo PR**: Mở Pull Request từ branch tính năng vào `main`/`develop`.
2. **Biểu mẫu PR Template**: Tự động áp dụng mẫu `.github/pull_request_template.md` (mô tả thay đổi, liên kết Issue, mã FR liên quan).
3. **CI Pipeline Pass**: Pipeline GitHub Actions (`.github/workflows/ci.yml`) phải chạy tự động và đạt trạng thái **Green (Success)** gồm 4 bước: `Install ➔ Lint ➔ Unit Test ➔ Build`.
4. **Peer Review**: Tối thiểu **1 thành viên khác trong nhóm** phải review mã nguồn, để lại nhận xét và bấm **Approve**.
5. **Merge**: Sử dụng hình thức **Squash and Merge** hoặc **Rebase and Merge** để giữ lịch sử commit tinh gọn, có ý nghĩa.

> 📖 **Xem hướng dẫn thực hành 6 bước chi tiết:** [`docs/team-workflow.md`](team-workflow.md)

---

## 2. Quy ước đặt tên Commit (Conventional Commits)

Toàn bộ các commit trong repository bắt buộc tuân theo chuẩn **[Conventional Commits v1.0.0](https://www.conventionalcommits.org/)**:

### 2.1. Cấu trúc Commit Message
```text
<type>(<scope>): [<mã-task/FR>] <tiêu đề tóm tắt ngắn gọn>

[Tùy chọn: Thân commit (Body) giải thích lý do thay đổi và giải pháp]

[Tùy chọn: Chân commit (Footer) ghi chú issue đóng lại hoặc breaking changes]
```

### 2.2. Danh sách các `type` chuẩn

| Type | Ý nghĩa | Ví dụ thực tế |
| :--- | :--- | :--- |
| **`feat`** | Thêm một tính năng mới cho hệ thống | `feat(api): [FR-01] implement GET /products and GET /products/:id` |
| **`fix`** | Sửa một lỗi/bug trong mã nguồn | `fix(cart): [FR-03] fix price calculation when selecting toppings` |
| **`docs`** | Thêm mới hoặc chỉnh sửa tài liệu | `docs(srs): [TASK-4.2] add acceptance criteria for order state machine` |
| **`style`** | Định dạng mã nguồn (khoảng trắng, dấu chấm phẩy, không đổi logic) | `style(web): format components with prettier and tailwind class sorting` |
| **`refactor`**| Tái cấu trúc mã nguồn (không thêm tính năng, không sửa bug) | `refactor(repo): [TASK-4.1] restructure to monorepo apps/web and apps/api` |
| **`test`** | Thêm mới hoặc cập nhật các ca kiểm thử (Unit, Integration, E2E) | `test(orders): [FR-05] add optimistic locking concurrency unit tests` |
| **`chore`** | Thay đổi cấu hình build, công cụ, thư viện, Docker, CI/CD | `chore(ci): [TASK-4.4] setup github actions CI pipeline` |
| **`perf`** | Cải thiện hiệu năng xử lý | `perf(api): [NFR-01] add caching for categories endpoint` |

### 2.3. Danh sách các `scope` quy định

* **Ứng dụng**: `web` (Next.js frontend), `api` (NestJS backend), `repo` (toàn bộ repo).
* **Module nghiệp vụ**: `auth`, `products`, `categories`, `toppings`, `orders`, `payments`, `cart`.
* **Hạ tầng & Tài liệu**: `db` (Prisma/Postgres), `docker`, `ci`, `docs`, `config`.

---

## 3. Định nghĩa Hoàn thành (Definition of Done - DoD)

Một User Story, Tính năng hoặc Task kỹ thuật chỉ được đánh dấu là **`Done`** trên Kanban Board và được chấp thuận merge vào nhánh chính khi đáp ứng đầy đủ **6 tiêu chí kiểm soát chất lượng** dưới đây:

### 3.1. Bảng tiêu chí Definition of Done (DoD)

| STT | Tiêu chí | Nội dung chi tiết cần đạt | Phương thức kiểm chứng |
| :-: | :--- | :--- | :--- |
| **1** | **Chức năng (Functionality)** | Đáp ứng 100% các **Tiêu chí chấp nhận (Acceptance Criteria - AC)** đã đặc tả trong Issue/User Story tương ứng. Xử lý đúng luồng chính, luồng thay thế và các trường hợp lỗi ngoại lệ (400, 404, 409). | Chạy thử nghiệm thực tế trên trình duyệt và Postman/cURL |
| **2** | **Kiểm thử tự động (Automated Testing)** | Đã viết Unit Test hoặc Integration Test bao phủ mã nguồn mới tạo/sửa đổi. Toàn bộ test suites chạy pass 100% (`npm test`). Không làm gãy các test cases sẵn có. | Kết quả chạy Jest test runner pass 100% |
| **3** | **Chất lượng mã nguồn (Code Quality)** | Mã nguồn tuân thủ coding convention, TypeScript type-safety (không lạm dụng `any`). Chạy công cụ Linting (`npm run lint` / `oxlint`) không có lỗi hoặc cảnh báo nghiêm trọng. | Lệnh `npm run lint` thoát với mã 0 (Clean) |
| **4** | **Tích hợp liên tục (CI Gate)** | Pipeline GitHub Actions CI tự động kích hoạt trên Pull Request và trả về trạng thái màu xanh (**Success**) cho cả 4 bước: `Install ➔ Lint ➔ Test ➔ Build`. | Checkmark xanh của GitHub Actions trên PR |
| **5** | **Đồng cấp kiểm tra (Peer Review)** | PR được mở đầy đủ thông tin theo mẫu `.github/pull_request_template.md`. Có ít nhất **1 thành viên khác trong nhóm** review mã nguồn, thảo luận phản biện và bấm **Approve**. | Lịch sử Review & Approve trên giao diện PR của GitHub |
| **6** | **Tài liệu & Ma trận truy vết (Traceability)** | Đã cập nhật mã yêu cầu (`FR-xx`, `NFR-xx`) tương ứng vào bảng ma trận truy vết [`docs/traceability-matrix.md`](traceability-matrix.md). Cập nhật README hoặc tài liệu API nếu có thay đổi cấu hình/endpoint. | Tệp `docs/traceability-matrix.md` có commit thay đổi |

---

## 4. Bảng kiểm tra nhanh Definition of Done cho Developer (DoD Checklist)

Trước khi gửi Pull Request cho đồng đội review, mỗi developer tự rà soát theo checklist sau:

```markdown
- [ ] 1. Tôi đã tự kiểm tra chức năng chạy đúng 100% Acceptance Criteria của Story.
- [ ] 2. Tôi đã chạy `npm run lint` ở cả `apps/web` và `apps/api` không có lỗi.
- [ ] 3. Tôi đã chạy `npm test` và toàn bộ unit test đều pass.
- [ ] 4. Tôi đã chạy thử `docker compose up --build` để chắc chắn không gãy build Docker.
- [ ] 5. Tôi đã kiểm tra git diff, không có file thừa (.env, node_modules, log, cache).
- [ ] 6. Commit message của tôi tuân thủ chuẩn Conventional Commits.
- [ ] 7. Tôi đã điền đầy đủ form Pull Request và gán Reviewer.
```

---

_Tài liệu này là quy chuẩn bắt buộc của nhóm BrewLite phục vụ công tác nghiệm thu đồ án môn Công nghệ Phần mềm._
