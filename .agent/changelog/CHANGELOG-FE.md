# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Giao Diện Bảng Quản Lý Danh Sách Phân Quyền Nhân Viên & Đăng Nhập PIN (`UserManagementModal`)
- Xây dựng **Bảng Quản Lý Danh Sách Phân Quyền (`UserManagementModal.tsx`)**: Cho phép Admin tạo tài khoản nhân viên, cấp vai trò (ADMIN / EDITOR / VIEWER), cài mã PIN riêng cho từng nhân viên và tạm khóa/kích hoạt tài khoản.
- Xây dựng **Modal Đăng Nhập Tài Khoản Nhân Viên (`AccountLoginModal.tsx`)**: Cho phép nhân viên chọn tên của mình từ danh sách và gõ Mã PIN cá nhân để tự động đăng nhập đúng vai trò được giao.
- Hiển thị tên Nhân Viên đang đăng nhập trên thanh Header kèm nút mở Bảng Phân Quyền.
- Files: `src/components/UserManagementModal.tsx`, `src/components/AccountLoginModal.tsx`, `src/components/Header.tsx`, `src/types.ts`, `src/utils/storageUtils.ts`, `src/App.tsx`

### feat: Phân Quyền 3 Cấp (ADMIN / EDITOR / VIEWER) & Tự Động Kết Nối Qua Link (0-Setup)
- Bổ sung tính năng **Auto-Connect qua Link Chia Sẻ**: Thêm nút `"📋 Copy Link Chia Sẻ Cho Nhân Viên"` trong tab Cấu hình.
- Files: `src/components/GoogleSheetsSyncView.tsx`, `src/App.tsx`

---

*Cập nhật tự động bởi update-docs*
