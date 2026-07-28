# Feature Plan: Quản Lý Bảng Danh Sách Tài Khoản & Phân Quyền Nhân Viên (User Permission Management)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: user-permission-management
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Người dùng cần một nơi hiển thị rõ ràng **Danh sách phân quyền**, có giao diện xem/thêm/sửa/xóa quyền từng nhân viên và cho phép nhân viên chọn Tài khoản/Mã PIN để đăng nhập đúng vai trò của mình.
- **Vấn đề cần giải quyết:**
  1. Người dùng chưa thấy rõ Bảng Danh sách Phân quyền và nơi tạo/sửa quyền cho từng nhân viên.
  2. Cần cơ chế đăng nhập chọn tài khoản đơn giản bằng Tên Nhân Viên + Mã PIN cá nhân.
- **Mục tiêu:**
  1. **Bảng Quản Lý Tài Khoản Phân Quyền (`UserManagementModal.tsx`):** Hiển thị danh sách nhân viên gồm Tên, Email, Mã PIN, Vai trò (ADMIN / EDITOR / VIEWER), Trạng thái.
  2. **Đăng Nhập Cho Nhân Viên (`AccountLoginModal.tsx`):** Người dùng bấm vào Badge tài khoản ➔ Chọn Tên mình trong danh sách ➔ Nhập mã PIN cá nhân để đăng nhập đúng vai trò (`ADMIN` / `EDITOR` / `VIEWER`).
  3. **Tự Động Đồng Bộ Cấu Hình:** Cấu hình danh sách tài khoản lưu vào LocalStorage và sẵn sàng đẩy sang tab `DANH_SACH_TAI_KHOAN` trên Google Sheet.
- **Kết quả mong đợi:** Admin quản lý danh sách phân quyền minh bạch, nhân viên mở app chọn tên gõ PIN là vào đúng vai trò.

## 2. Phạm vi

### In scope
- Định nghĩa interface `AppUser` (`id`, `name`, `email`, `pin`, `role`, `status`) trong [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts).
- Tạo component `UserManagementModal.tsx` quản lý danh sách phân quyền (Thêm, Sửa, Xóa tài khoản).
- Tạo component `AccountLoginModal.tsx` cho nhân viên chọn tài khoản và đăng nhập bằng PIN.
- Cập nhật [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) bổ sung nút "Bảng Phân Quyền Nhân Viên" và Nút Đăng Nhập/Đổi Tài Khoản.
- Lưu danh sách tài khoản vào LocalStorage qua `storageUtils.ts`.

### Out of scope
- Không dùng server OAuth đắt đỏ (Dùng hoàn toàn Client + Local/Sheet Sync 0 đồng).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tiếp tục duy trì Kiến trúc Thuần GAS (Pure GAS 0 đồng chi phí).
- **"Cấm kỵ" cần tránh:** Không làm nhân viên thấy thao tác quá phức tạp; cho phép Admin cấp tài khoản trong 10 giây.

## 4. Giả định và câu hỏi mở

### Giả định
- Tài khoản Admin mặc định ban đầu: `Admin Quản Trị` (PIN `123456`).

## 5. Acceptance Criteria

- [ ] Admin bấm nút "Bảng Phân Quyền" ➔ Thấy bảng danh sách nhân viên chi tiết (Tên, Mã PIN, Vai Trò, Trạng thái).
- [ ] Admin có thể bấm "+ Thêm Nhân Viên Mới", gõ Tên, chọn Mã PIN và Vai Trò (ADMIN / EDITOR / VIEWER).
- [ ] Nhân viên bấm nút "Đăng Nhập" ➔ Chọn tên mình ➔ Nhập PIN ➔ Hệ thống tự động chuyển sang vai trò EDITOR hoặc VIEWER tương ứng.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts) | Sửa | Định nghĩa type AppUser | 🟢 Thấp | Type definition |
| [src/utils/storageUtils.ts](file:///d:/Project/QuanLyNXT/src/utils/storageUtils.ts) | Sửa | Thêm hàm load/saveAppUsers | 🟢 Thấp | Storage utils |
| [src/components/UserManagementModal.tsx](file:///d:/Project/QuanLyNXT/src/components/UserManagementModal.tsx) | Tạo mới | Bảng Quản Lý Danh Sách Phân Quyền | 🟢 Thấp | Modal UI |
| [src/components/AccountLoginModal.tsx](file:///d:/Project/QuanLyNXT/src/components/AccountLoginModal.tsx) | Tạo mới | Modal Đăng nhập/Đổi tài khoản | 🟢 Thấp | Modal UI |
| [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) | Sửa | Hiển thị thông tin user đang đăng nhập & nút Phân Quyền | 🟢 Thấp | Header UI |
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Quản lý state `users`, `currentUser` | 🟢 Thấp | App state |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo khi mới mở app luôn có ít nhất 1 tài khoản Admin mặc định.
- **Review focus areas:** Xử lý đăng nhập bằng PIN mượt mà.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Structuring `AppUser` types, Storage utils & `UserManagementModal.tsx`.
  - **Phase 2:** `AccountLoginModal.tsx`, Header Integration & Verification.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Mở Bảng Phân Quyền -> Thêm nhân viên "Nguyễn Văn A" quyền EDITOR, PIN `1111` -> Đăng xuất -> Đăng nhập bằng tài khoản "Nguyễn Văn A" -> Kiểm tra ứng dụng tự động mở giao diện EDITOR.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/user-permission-management/FEATURE_TASKS.md)
