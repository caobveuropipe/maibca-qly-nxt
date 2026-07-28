# Feature Tasks: Đăng Nhập Bằng OTP Qua Email 0đ Chi Phí & Màn Hình Khóa Đăng Nhập Dài Hạn (Email OTP Auth Engine)

> **Trạng thái**: ✅ Hoàn thành
> **Liên kết plan**: [FEATURE_PLAN.md](file:///d:/Project/QuanLyNXT/.agent/active/email-otp-auth/FEATURE_PLAN.md)
> **Ngày tạo**: 2026-07-28

---

## Quy ước checklist

- `- [ ]`: Chưa làm
- `- [/]`: Đang làm
- `- [x]`: Hoàn thành
- Cuối mỗi phase bắt buộc có `Task X.Final: 🧪 Test & Verify Phase X`

## Phase 1: GAS Email OTP Engine & Login Screen Component

**Mục tiêu:** Viết backend xử lý gửi/xác minh OTP trong Google Apps Script và tạo giao diện Màn Hình Đăng Nhập.

- [x] Task 1.1: Cập nhật `google_apps_script.gs` bổ sung action `SEND_OTP` (sử dụng `MailApp.sendEmail`) và `VERIFY_OTP`.
- [x] Task 1.2: Tạo `src/components/LoginScreen.tsx` hỗ trợ gửi OTP qua Email, nhập 6 số OTP và fallback đăng nhập bằng PIN Admin.
- [x] Task 1.Final: 🧪 Test & Verify Phase 1 (Bắt buộc) - Chạy `npm run build` verify không có lỗi TypeScript compilation.

## Phase 2: Session Guard, Persistent Storage & Header Logout

**Mục tiêu:** Chặn truy cập khi chưa đăng nhập, lưu phiên lâu dài và thêm nút Đăng Xuất.

- [x] Task 2.1: Cập nhật `src/App.tsx` quản lý `isAuthenticated`, `sessionUser`, lưu phiên đăng nhập lâu dài vào LocalStorage.
- [x] Task 2.2: Cập nhật `src/components/Header.tsx` bổ sung nút Đăng Xuất và hiển thị thông tin Email đăng nhập.
- [x] Task 2.Final: 🧪 Test & Verify Phase 2 (Bắt buộc) - Chạy `npm run build` verify toàn bộ ứng dụng hoạt động mượt mà.

---

## Execution Log

| Thời gian | Phase | Task | Hành động | Trạng thái | Ghi chú |
|-----------|-------|------|-----------|-----------|---------|
| 2026-07-28 | Init | Task 0 | Khởi tạo kế hoạch Đăng Nhập Email OTP | done | Đã tạo FEATURE_PLAN.md và FEATURE_TASKS.md |
| 2026-07-28 | Phase 1 | Task 1.1 | Cập nhật GAS Engine cho SEND_OTP và VERIFY_OTP | done | MailApp.sendEmail trong google_apps_script.gs |
| 2026-07-28 | Phase 1 | Task 1.2 | Tạo LoginScreen.tsx | done | Màn hình Khóa Đăng nhập OTP bắt buộc |
| 2026-07-28 | Phase 2 | Task 2.1 | Cập nhật App.tsx với Session Guard | done | Lưu phiên lâu dài vào LocalStorage |
| 2026-07-28 | Phase 2 | Task 2.2 | Thêm nút Đăng Xuất vào Header.tsx | done | Hỗ trợ nút Đăng xuất an toàn |
| 2026-07-28 | Phase 2 | Task 2.Final | Build & verify production | done | Build thành công 100% trong 4.57s |
| 2026-07-28 | Done | Complete | Hoàn tất tính năng Đăng Nhập Email OTP | done | Đã hoàn thành |
