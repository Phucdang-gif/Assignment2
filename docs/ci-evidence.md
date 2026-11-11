# Báo Cáo & Minh Chứng Pipeline CI (Continuous Integration Report) - Task 4.4

> **Dự án**: BrewLite – Cashless Coffee Ordering System  
> **Học phần**: Công nghệ Phần mềm (Software Engineering) – Assignment 2  
> **Nhiệm vụ**: Task 4.4 – Thiết lập Continuous Integration  
> **Trạng thái**: Hoàn thành cấu hình & Sẵn sàng chạy tự động  

---

## 1. Mục tiêu & Nguyên tắc Hoạt động

Theo yêu cầu của đề bài mục **6.4 Task 4.4**, pipeline CI được thiết lập để tự động kích hoạt khi có:
* Thao tác **Push** lên nhánh `main` hoặc `develop`.
* Thao tác mở **Pull Request (PR)** hướng vào nhánh `main` hoặc `develop`.

Pipeline bắt buộc phải vượt qua 4 chặng kiểm soát chất lượng (Quality Gates) theo đúng thứ tự:

$$\textbf{Install} \longrightarrow \textbf{Lint} \longrightarrow \textbf{Unit Test} \longrightarrow \textbf{Build}$$

> [!IMPORTANT]
> **Quy tắc chặn nghiêm ngặt (Branch Protection)**: Pull Request tuyệt đối không được phép merge vào `main` nếu bất kỳ bước nào trong 4 bước trên thất bại.

---

## 2. Cấu trúc Pipeline CI (`.github/workflows/ci.yml`)

Pipeline được chia làm 2 jobs chạy song song tối ưu thời gian:

### Job 1: Backend CI (`apps/api` - NestJS)
1. **Khởi tạo dịch vụ PostgreSQL**: Chạy container PostgreSQL 16 trên runner làm CSDL kiểm thử độc lập.
2. **Install (`npm ci`)**: Cài đặt chính xác các phụ thuộc dựa trên `package-lock.json`.
3. **Lint (`npm run lint`)**: Sử dụng `oxlint` quét lỗi cú pháp, kiểu dữ liệu và code conventions.
4. **Prisma Migrate (`npx prisma migrate deploy`)**: Đồng bộ hóa schema vào database test.
5. **Unit Test (`npm test`)**: Chạy bộ kiểm thử tự động với Jest (`AppController` & `ProductsService` cho Sprint 1).
6. **Build (`npm run build`)**: Biên dịch mã nguồn NestJS sang JavaScript (`dist/`).

### Job 2: Frontend CI (`apps/web` - Next.js)
1. **Install (`npm ci`)**: Cài đặt phụ thuộc frontend.
2. **Lint (`npm run lint`)**: Kiểm tra ESLint cho Next.js App Router và TypeScript.
3. **Build (`npm run build`)**: Biên dịch và tối ưu hóa gói ứng dụng tĩnh Next.js production.

---

## 3. Hướng Dẫn Cấu Hình Branch Protection Trên GitHub

Để thỏa mãn tiêu chí *"Pull request không được merge nếu lint, test hoặc build thất bại"*, nhóm trưởng thực hiện thiết lập trên GitHub:

1. Vào repository trên GitHub: **Settings** ➔ **Branches**.
2. Nhấn **Add branch protection rule** (hoặc chọn nhánh `main`).
3. Đặt **Branch name pattern**: `main`.
4. Tích chọn các mục sau:
   - [x] **Require a pull request before merging**.
   - [x] **Require status checks to pass before merging**:
     - Tìm và gán check: `Backend CI (NestJS)`
     - Tìm và gán check: `Frontend CI (Next.js)`
   - [x] **Require branches to be up to date before merging**.
   - [x] **Do not allow bypassing the above settings**.
5. Nhấn **Save changes**.

---

## 4. Khu Vực Lưu Minh Chứng (Evidence Logs & Screenshots)

### 4.1. Minh chứng 1: Pipeline chạy thành công (Success / Passed)
* **Link Pull Request**: *(Cập nhật link PR Sprint 1 sau khi push lên GitHub)*
* **Kết quả**: Tất cả các bước Install ➔ Lint ➔ Unit Test ➔ Build đều có dấu tích xanh `✓ Passed`.
* **Ảnh minh chứng**:
  *(Chèn ảnh chụp màn hình tab Checks của Pull Request thành công vào thư mục `docs/screenshots/ci-success.png`)*

```text
✓ Backend CI (NestJS) - Passed (Install -> Lint -> Test -> Build)
✓ Frontend CI (Next.js) - Passed (Install -> Lint -> Build)
Result: All checks have passed. 1 successful check. Merging is allowed.
```

---

### 4.2. Minh chứng 2: Pipeline phát hiện lỗi và chặn Merge (Failure / Blocked)
* **Kịch bản kiểm thử lỗi**:
  1. Tạo nhánh thử nghiệm: `test/ci-failure-demo`.
  2. Tạo 1 commit cố tình làm fail (ví dụ: cố tình viết sai kiểu trong TypeScript hoặc làm sai 1 assertion trong `products.service.spec.ts`).
  3. Mở Pull Request vào `main`.
* **Kết quả**: GitHub Actions phát hiện lỗi ở bước Test hoặc Lint, đánh dấu `✕ Failed` và khóa nút **Merge pull request** màu xám (bị chặn).
* **Ảnh minh chứng**:
  *(Chèn ảnh chụp màn hình lỗi và nút Merge bị chặn vào thư mục `docs/screenshots/ci-failed.png`)*

```text
✕ Backend CI (NestJS) - Failed at step: Run Unit Tests
Result: Some checks were not successful. Merging is blocked.
```
