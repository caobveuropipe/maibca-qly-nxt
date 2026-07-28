# Feature Plan: Phân Quyền Trực Tiếp Theo Email Đăng Nhập (Email-Based Role Permission System)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: email-permission-system
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Người dùng yêu cầu chuyển đổi toàn bộ cơ chế phân quyền sang **Cấp quyền trực tiếp theo Email Đăng Nhập** (Logged-in Email). Khi nhân viên nhập Email đăng nhập qua OTP, hệ thống sẽ tự động đối soát Email đó trong Bảng Danh Sách Phân Quyền để gán đúng vai trò (`ADMIN`, `EDITOR`, `VIEWER`).
- **Vấn đề cần giải quyết:**
  1. Loại bỏ các khái niệm Mã PIN cá nhân rườm rà. Nhân viên chỉ cần biết Email cá nhân của mình.
  2. Giao diện Bảng Phân Quyền chuyển sang quản lý theo danh sách Email.
  3. Khi đăng nhập bằng Email nào, hệ thống lập tức khóa/mở các tính năng ứng với vai trò đã cấp cho Email đó.
- **Mục tiêu:**
  1. **Bảng Phân Quyền Email (`UserManagementModal.tsx`):** Quản lý danh sách Email nhân viên, Tên đại diện, Vai trò (`ADMIN` / `EDITOR` / `VIEWER`) và Trạng thái (`ACTIVE` / `LOCKED`).
  2. **Tự Động Nhận Diện Vai Trò Khi Đăng Nhập (`App.tsx` & `LoginScreen.tsx`):** Khi nhập Email + OTP, hệ thống tìm Email trong danh sách ➔ Gán vai trò tương ứng và lưu phiên lâu dài.
  3. **Cập Nhật Giao Diện Header (`Header.tsx`):** Hiển thị Email đang đăng nhập (VD: `caobv.europipe@gmail.com`) cùng Badge Vai trò.

## 2. Phạm vi

### In scope
- Cập nhật interface `AppUser` trong [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts) loại bỏ `pin` không cần thiết, tập trung vào `email`, `name`, `role`, `status`.
- Cập nhật [src/components/UserManagementModal.tsx](file:///d:/Project/QuanLyNXT/src/components/UserManagementModal.tsx) thành Bảng Quản Lý Phân Quyền Theo Email.
- Cập nhật [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) trong `VERIFY_OTP` đối soát vai trò của Email từ danh sách.
- Cập nhật [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) và [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) hiển thị Email đăng nhập & gán quyền chuẩn xác.

### Out of scope
- Không dùng mật khẩu phức tạp (Auth thuần bằng OTP Email).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tiếp tục duy trì Kiến trúc Thuần GAS (Pure GAS 0 đồng chi phí).

## 4. Giả định và câu hỏi mở

### Giả định
- Email chính của chủ tài khoản (VD: `caobv.europipe@gmail.com`) luôn mặc định là `ADMIN`. Các email nhân viên khác do Admin thêm vào bảng phân quyền.

## 5. Acceptance Criteria

- [ ] Admin mở Bảng Phân Quyền ➔ Thấy danh sách các Email được cấp quyền (Email, Họ Tên, Vai trò ADMIN / EDITOR / VIEWER).
- [ ] Admin nhập Email mới (VD: `nvkhoa@company.com`), chọn vai trò `EDITOR` ➔ Bấm "Thêm Email Phân Quyền".
- [ ] Nhân viên mở web, gõ `nvkhoa@company.com` + OTP ➔ Hệ thống tự động nhận diện vai trò `EDITOR` và khóa các nút không có quyền.
- [ ] Email đăng nhập hiện rõ trên Header (VD: `caobv.europipe@gmail.com (ADMIN)`).

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts) | Sửa | Cập nhật AppUser theo Email | 🟢 Thấp | Type definition |
| [src/utils/storageUtils.ts](file:///d:/Project/QuanLyNXT/src/utils/storageUtils.ts) | Sửa | Cập nhật danh sách Email mẫu ban đầu | 🟢 Thấp | Storage utils |
| [src/components/UserManagementModal.tsx](file:///d:/Project/QuanLyNXT/src/components/UserManagementModal.tsx) | Sửa | Bảng Quản lý Phân quyền theo Email | 🟢 Thấp | Modal UI |
| [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) | Sửa | Hiển thị Email đang đăng nhập | 🟢 Thấp | Header UI |
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Khớp quyền theo Email đăng nhập | 🟢 Thấp | App state |
| [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) | Sửa | Xử lý VERIFY_OTP đối soát vai trò Email | 🟢 Thấp | GAS backend |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo email `caobv.europipe@gmail.com` luôn giữ quyền `ADMIN`.
- **Review focus areas:** Kiểm tra matching email chính xác không phân biệt hoa thường.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Update `AppUser` types, Storage utils & `UserManagementModal.tsx` theo Email.
  - **Phase 2:** Update Login Email Matching in `App.tsx`, `google_apps_script.gs`, Header UI & Verification.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Thêm email `test@company.com` quyền VIEWER ➔ Đăng nhập bằng `test@company.com` ➔ Hệ thống lập tức hiển thị giao diện VIEWER.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/email-permission-system/FEATURE_TASKS.md)
