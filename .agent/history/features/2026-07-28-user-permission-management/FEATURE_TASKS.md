# Feature Tasks: Quản Lý Bảng Danh Sách Tài Khoản & Phân Quyền Nhân Viên (User Permission Management)

> **Trạng thái**: ✅ Hoàn thành
> **Liên kết plan**: [FEATURE_PLAN.md](file:///d:/Project/QuanLyNXT/.agent/active/user-permission-management/FEATURE_PLAN.md)
> **Ngày tạo**: 2026-07-28

---

## Quy ước checklist

- `- [ ]`: Chưa làm
- `- [/]`: Đang làm
- `- [x]`: Hoàn thành
- Cuối mỗi phase bắt buộc có `Task X.Final: 🧪 Test & Verify Phase X`

## Phase 1: AppUser Types, Storage Utils & User Management Modal

**Mục tiêu:** Tạo Bảng Quản Lý Danh Sách Phân Quyền hiển thị Tên, Email, PIN, Vai trò và trạng thái nhân viên.

- [x] Task 1.1: Định nghĩa interface `AppUser` trong `src/types.ts` và tạo helper `loadAppUsers`, `saveAppUsers` trong `src/utils/storageUtils.ts`.
- [x] Task 1.2: Tạo `src/components/UserManagementModal.tsx` hiển thị Bảng Phân Quyền Nhân Viên (Xem/Thêm/Sửa/Xóa tài khoản).
- [x] Task 1.Final: 🧪 Test & Verify Phase 1 (Bắt buộc) - Chạy `npm run build` verify không có lỗi TypeScript compilation.

## Phase 2: Account Login Modal, Header Integration & Build Verification

**Mục tiêu:** Tích hợp Modal Đăng nhập/Đổi tài khoản cho nhân viên và kết nối vào App.

- [x] Task 2.1: Tạo `src/components/AccountLoginModal.tsx` cho nhân viên chọn tên và đăng nhập bằng PIN cá nhân.
- [x] Task 2.2: Cập nhật `src/components/Header.tsx` hiển thị Tên User đang đăng nhập + Nút mở Bảng Phân Quyền.
- [x] Task 2.3: Kết nối state `users`, `currentUser` trong `src/App.tsx`.
- [x] Task 2.Final: 🧪 Test & Verify Phase 2 (Bắt buộc) - Chạy `npm run build` verify toàn bộ ứng dụng hoạt động hoàn hảo.

---

## Execution Log

| Thời gian | Phase | Task | Hành động | Trạng thái | Ghi chú |
|-----------|-------|------|-----------|-----------|---------|
| 2026-07-28 | Init | Task 0 | Khởi tạo kế hoạch Bảng Phân Quyền | done | Đã tạo FEATURE_PLAN.md và FEATURE_TASKS.md |
| 2026-07-28 | Phase 1 | Task 1.1 | Định nghĩa AppUser & Storage Helpers | done | Thêm type AppUser & local storage |
| 2026-07-28 | Phase 1 | Task 1.2 | Tạo UserManagementModal.tsx | done | Bảng Danh sách Phân quyền |
| 2026-07-28 | Phase 2 | Task 2.1 | Tạo AccountLoginModal.tsx | done | Modal Đăng nhập/Đổi tài khoản cho nhân viên |
| 2026-07-28 | Phase 2 | Task 2.2 | Cập nhật Header với nút Bảng Phân Quyền | done | Hiển thị User name & Nút Bảng Phân Quyền |
| 2026-07-28 | Phase 2 | Task 2.Final | Build & verify production | done | Build thành công 100% trong 4.61s |
| 2026-07-28 | Done | Complete | Hoàn tất tính năng Bảng Phân Quyền | done | Đã hoàn thành |
