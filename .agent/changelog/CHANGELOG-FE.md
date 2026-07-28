# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Đăng Nhập Bằng OTP Qua Email 0đ Chi Phí & Màn Hình Khóa Đăng Nhập Dài Hạn (`LoginScreen`)
- Xây dựng **Màn Hình Đăng Nhập OTP Bắt Buộc (`LoginScreen.tsx`)**: Chặn 100% người dùng chưa đăng nhập tiếp cận giao diện hệ thống.
- **Tích hợp Email OTP Engine 0đ Chi Phí (Google Apps Script)**:
  - Gửi mã OTP 6 số ngẫu nhiên trực tiếp đến hộp thư Email người dùng qua API `MailApp.sendEmail` miễn phí của Google.
  - Hỗ trợ xác minh OTP và **Lưu phiên đăng nhập dài hạn** vào `localStorage` (`nxt_session_token_v1`) để giữ đăng nhập qua các lần đóng/mở trình duyệt.
- Bổ sung nút **"Đăng Xuất"** và Fallback Đăng nhập nhanh bằng PIN Admin khi không có kết nối internet.
- Files: `src/components/LoginScreen.tsx`, `google_apps_script.gs`, `src/App.tsx`, `src/components/Header.tsx`

### feat: Giao Diện Bảng Quản Lý Danh Sách Phân Quyền Nhân Viên (`UserManagementModal`)
- Xây dựng **Bảng Quản Lý Danh Sách Phân Quyền (`UserManagementModal.tsx`)**: Cho phép Admin tạo tài khoản nhân viên, cấp vai trò (ADMIN / EDITOR / VIEWER), cài mã PIN riêng cho từng nhân viên.
- Files: `src/components/UserManagementModal.tsx`, `src/components/AccountLoginModal.tsx`, `src/components/Header.tsx`

---

*Cập nhật tự động bởi update-docs*
