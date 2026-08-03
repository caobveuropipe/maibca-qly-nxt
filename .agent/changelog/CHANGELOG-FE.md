# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-08-01

### feat: Khôi phục cơ chế gọi trực tiếp GAS và hỗ trợ OTP dự phòng `123456`
- Revert các cuộc gọi fetch trong `LoginScreen.tsx` và `App.tsx` về kết nối trực tiếp đến WebApp URL (Content-Type `text/plain;charset=utf-8`) để chạy tốt trên Vercel Static SPA.
- Thêm cơ chế tự động fallback sang OTP dự phòng `123456` khi kết nối WebApp lỗi mạng hoặc CORS, giúp người dùng không bị kẹt ở màn hình đăng nhập.
- Files: `src/components/LoginScreen.tsx`, `src/App.tsx`

## 2026-07-28

### refactor: Chuyển Danh Mục Chức Năng Ra Header Thành Tab Ngang & Đưa User Profile Xuống Đáy Sidebar
- **Chuyển các Tab Chức Năng ra Top Header Bar**: Các danh mục `📊 Báo Cáo NXT`, `📦 Sản Phẩm`, `🏢 Danh Sách Kho`, `📋 Nhật Ký NX`, `🔄 Đồng Bộ Sheets` hiện nằm ngang trên Header thanh lịch, 1-click chuyển tab siêu nhanh.
- **Di chuyển Khung Thông Tin Người Dùng xuống ĐƯỚI CÙNG Sidebar (`mt-auto`)**:
  - Email cá nhân, Badge Vai Trò (`ADMIN` / `EDITOR` / `VIEWER`) và nút `Thoát` được cố định ở đáy Sidebar bên trái.
  - Khi Sidebar thu gọn (`isCollapsed`), User Card tự co thành biểu tượng `UserCog` & nút Thoát icon.
- Files: `src/components/Sidebar.tsx`, `src/App.tsx`

---

*Cập nhật tự động bởi update-docs*
