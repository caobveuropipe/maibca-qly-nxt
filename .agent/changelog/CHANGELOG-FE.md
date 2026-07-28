# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Hệ Thống Phân Quyền Trực Tiếp Theo Email Đăng Nhập (`Email-Based Role Engine`)
- **Tự động đối soát vai trò theo Email**: Khi người dùng/nhân viên đăng nhập bằng Email qua OTP, ứng dụng tự động kiểm tra Email trong Bảng Danh Sách Phân Quyền để cấp đúng quyền (`ADMIN`, `EDITOR`, `VIEWER`).
- **Tùy chỉnh Bảng Phân Quyền Theo Email (`UserManagementModal.tsx`)**: Admin dễ dàng thêm Email nhân viên mới, gán vai trò (`ADMIN` / `EDITOR` / `VIEWER`) và bật/tắt trạng thái truy cập của từng Email.
- Hiển thị địa chỉ Email đang đăng nhập nổi bật trên thanh Header (VD: `caobv.europipe@gmail.com (ADMIN)`).
- Email chính `caobv.europipe@gmail.com` mặc định luôn sở hữu toàn quyền `ADMIN`.
- Files: `src/components/UserManagementModal.tsx`, `src/components/Header.tsx`, `src/App.tsx`, `src/utils/storageUtils.ts`

---

*Cập nhật tự động bởi update-docs*
