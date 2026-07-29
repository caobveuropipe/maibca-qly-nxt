# Feature Tasks: Strict Email Permission Enforcement & Zero-Fallback Authentication

> **Trạng thái**: 🔄 Đang thực hiện
> **Liên kết plan**: `FEATURE_PLAN.md`
> **Ngày tạo**: 2026-07-29

---

## Quy ước checklist

- `- [ ]`: Chưa làm
- `- [/]`: Đang làm
- `- [x]`: Hoàn thành
- Cuối mỗi phase bắt buộc có `Task X.Final: 🧪 Test & Verify Phase X`

## Phase 1: Cập nhật GAS Engine Backend (`google_apps_script.gs`)

**Mục tiêu:** Cập nhật `VERIFY_OTP` tra cứu sheet `PHAN_QUYEN` trả đúng role thực tế và xóa bypass OTP "123456".

- [ ] Task 1.1: Sửa `VERIFY_OTP` trong `google_apps_script.gs`: Tra cứu email trong sheet `PHAN_QUYEN` để lấy `role` thực tế. Nếu không thấy email trong sheet, trả `success: false` với lỗi "Email chưa được cấp quyền truy cập".
- [ ] Task 1.2: Xóa bỏ hoàn toàn nhánh bypass OTP `"123456"` trong `google_apps_script.gs`.
- [ ] Task 1.Final: 🧪 Test & Verify Phase 1 (Bắt buộc)

## Phase 2: Chuẩn hóa dữ liệu Email & Thắt chặt Logic Phân Quyền Phía Client

**Mục tiêu:** Loại bỏ hoàn toàn fallback VIEWER và từ chối đăng nhập nếu Email không khớp Bảng Phân Quyền.

- [ ] Task 2.1: Chuẩn hóa `trim().toLowerCase()` toàn bộ dữ liệu Email khi nạp và lưu trong `storageUtils.ts`.
- [ ] Task 2.2: Cập nhật `handleLoginSuccess` trong `App.tsx` để từ chối cấp session nếu Email không tìm thấy trong Bảng Phân Quyền `users`.
- [ ] Task 2.Final: 🧪 Test & Verify Phase 2 (Bắt buộc)

## Phase 3: Cập nhật Giao diện Đăng nhập & Dọn dẹp Code

**Mục tiêu:** Hiển thị thông báo rõ ràng cho người dùng khi bị từ chối truy cập và xóa OTP fallback phía Client.

- [ ] Task 3.1: Xóa OTP fallback `"123456"` và dead code `handleAdminPinLogin` trong `LoginScreen.tsx`.
- [ ] Task 3.2: Bổ sung xử lý lỗi từ chối đăng nhập do chưa cấp quyền tại `LoginScreen.tsx`.
- [ ] Task 3.Final: 🧪 Test & Verify Phase 3 (Bắt buộc)

## Phase 4: Kiểm thử toàn diện & Đóng gói

**Mục tiêu:** Đảm bảo toàn bộ các kịch bản phân quyền hoạt động 100% chuẩn xác.

- [ ] Task 4.1: Kiểm thử đăng nhập với Email Editor, Email Admin, và Email không được phép.
- [ ] Task 4.2: Chạy `npm run build` kiểm tra build tĩnh.
- [ ] Task 4.Final: 🧪 Test & Verify Phase 4 (Bắt buộc)

---

## Execution Log

| Thời gian | Phase | Task | Hành động | Trạng thái | Ghi chú |
|-----------|-------|------|-----------|-----------|---------|
| 2026-07-29 11:42 | Phase 1 | Task 1.1 | Chuyển trạng thái plan sang ĐỒNG Ý và cập nhật danh sách task | 🔄 in_progress | Bắt đầu Phase 1 |
