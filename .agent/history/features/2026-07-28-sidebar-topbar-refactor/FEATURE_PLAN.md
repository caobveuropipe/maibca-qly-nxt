# Feature Plan: Chuyển Tabs Chức Năng Ra Header & Đưa User Profile Xuống Đáy Sidebar (Top Header Tabs & Bottom User Card)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: sidebar-topbar-refactor
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Theo yêu cầu điều chỉnh UI mới nhất của người dùng:
  - **Ảnh 1 (Danh mục chức năng):** Chuyển các tab navigation (Báo Cáo NXT, Sản Phẩm, Danh Sách Kho, Nhật Ký NX, Đồng Bộ Sheets) ra ngoài **Top Header Bar** dạng các Tab ngang.
  - **Ảnh 2 (User Profile Card):** Đưa toàn bộ Khung thông tin người dùng đăng nhập (Email, Tên, Role Badge `ADMIN`, Nút `Thoát`) xuống **DƯỚI CÙNG CỦA SIDEBAR**.
- **Mục tiêu:**
  1. Cập nhật `Sidebar.tsx`: Chứa Branding top, Nhóm Nút Thao Tác Nhanh ở giữa, và **Khung User Profileở Đáy Sidebar** (`mt-auto`).
  2. Cập nhật `App.tsx`: Đưa các **Tab Chức Năng Ngang** ra ngoài Top Header Bar để người dùng bấm chuyển tab siêu nhanh trên Header.

## 2. Phạm vi

### In scope
- Cập nhật [src/components/Sidebar.tsx](file:///d:/Project/QuanLyNXT/src/components/Sidebar.tsx).
- Cập nhật [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx).

### Out of scope
- Không làm thay đổi logic phân quyền hay dữ liệu báo cáo.

## 3. Acceptance Criteria

- [ ] Các Tab "Báo Cáo NXT", "Sản Phẩm", "Danh Sách Kho", "Nhật Ký NX", "Đồng Bộ Sheets" hiển thị dạng Tab ngang trên Top Header.
- [ ] Khung người dùng (Email, Tên, Role Badge, Nút Thoát) nằm ở dưới cùng (đáy) Sidebar bên trái.
- [ ] Sidebar mở rộng / thu gọn mượt mà, khi thu gọn User Card co thành biểu tượng `UserCog` & Nút Thoát icon.

## 4. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/sidebar-topbar-refactor/FEATURE_TASKS.md)
