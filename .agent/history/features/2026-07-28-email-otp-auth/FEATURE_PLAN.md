# Feature Plan: Đăng Nhập Bằng OTP Qua Email 0đ Chi Phí & Màn Hình Khóa Đăng Nhập Dài Hạn (Email OTP Auth Engine)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: email-otp-auth
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Hiện tại ứng dụng chưa có màn hình đăng nhập bắt buộc (Login Gate). Khi mở trang web trên máy khác, ứng dụng mặc định hiển thị vai trò ADMIN khiến bất kỳ ai cũng vào được giao diện quản trị. Người dùng yêu cầu sử dụng **Đăng Nhập Bằng OTP Qua Email (0đ chi phí)** và **Lưu Phiên Đăng Nhập Dài Hạn**.
- **Vấn đề cần giải quyết:**
  1. Người dùng chưa đăng nhập có thể xem toàn bộ hệ thống.
  2. Cần màn hình Đăng Nhập bắt buộc bằng Email + OTP 6 số gửi về hộp thư.
  3. Cần lưu phiên đăng nhập dài hạn trong LocalStorage để người dùng không phải đăng nhập lại mỗi lần tắt mở trình duyệt.
- **Mục tiêu:**
  1. **Màn Hình Đăng Nhập Bắt Buộc (`LoginScreen.tsx`):** Khi chưa đăng nhập, hiển thị màn hình Login Gate chặn toàn bộ giao diện app.
  2. **Động Cơ Gửi/Xác Nhận OTP Qua Email 0đ (Google Apps Script):** Bổ sung action `SEND_OTP` và `VERIFY_OTP` trong [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) sử dụng `MailApp.sendEmail()` của Google (miễn phí 100%).
  3. **Lưu Phiên Dài Hạn (Persistent Session):** Lưu `sessionToken`, `email`, `role` vào LocalStorage để ghi nhớ trạng thái đăng nhập.
  4. **Chế Độ Khách / Thử Nghiệm Nhanh (Demo Mode):** Cho phép Admin hoặc Người dùng gửi OTP thử nghiệm hoặc dùng mã OTP cố định khi chưa cài đặt email.

## 2. Phạm vi

### In scope
- Cập nhật [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) xử lý `SEND_OTP` và `VERIFY_OTP`.
- Tạo mới component [src/components/LoginScreen.tsx](file:///d:/Project/QuanLyNXT/src/components/LoginScreen.tsx) làm Màn hình Đăng Nhập OTP bắt buộc.
- Cập nhật [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) thêm cờ `isAuthenticated`, lưu phiên dài hạn trong LocalStorage và chỉ mở App sau khi đăng nhập thành công.
- Cập nhật [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) bổ sung nút Đăng Xuất.

### Out of scope
- Sử dụng các dịch vụ gửi SMS đắt tiền (Chỉ sử dụng Email OTP miễn phí của Google).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tiếp tục duy trì Kiến trúc Thuần GAS (Pure GAS 0 đồng chi phí).
- **"Cấm kỵ" cần tránh:** Không làm đứt phiên đăng nhập khi F5 làm mới trình duyệt.

## 4. Giả định và câu hỏi mở

### Giả định
- Email của Admin ban đầu sẽ được nhận vai trò `ADMIN`, các email nhân viên được phân quyền trong tab `DANH_SACH_TAI_KHOAN` trên Google Sheet.

## 5. Acceptance Criteria

- [ ] Khi chưa đăng nhập, người dùng mở app lập tức nhìn thấy **Màn Hình Đăng Nhập OTP Qua Email**.
- [ ] Người dùng gõ Email ➔ Bấm "Gửi Mã OTP" ➔ Mã OTP 6 số được gửi về hộp thư Email.
- [ ] Người dùng nhập đúng OTP ➔ Đăng nhập thành công, lưu phiên lâu dài và chuyển vào đúng vai trò (`ADMIN`, `EDITOR`, `VIEWER`).
- [ ] Khi F5 hoặc tắt trình duyệt mở lại ➔ Vẫn giữ nguyên phiên đăng nhập không bắt gõ lại OTP.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) | Sửa | Bổ sung action `SEND_OTP` và `VERIFY_OTP` | 🟢 Thấp | GAS backend |
| [src/components/LoginScreen.tsx](file:///d:/Project/QuanLyNXT/src/components/LoginScreen.tsx) | Tạo mới | Màn hình Đăng Nhập OTP Bắt Buộc | 🟢 Thấp | Login UI |
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Session guard & persistent login | 🟢 Thấp | Auth flow |
| [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) | Sửa | Bổ sung nút Đăng Xuất | 🟢 Thấp | Header UI |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo khi người dùng chưa có kết nối Internet hoặc URL WebApp chưa đúng vẫn có chế độ đăng nhập bằng PIN Admin trực tiếp để không bị khóa app.
- **Review focus areas:** Xử lý fallback login khi chưa setup WebApp URL.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Backend Email OTP (`google_apps_script.gs`) & UI `LoginScreen.tsx`.
  - **Phase 2:** App Session Guard Integration, Persistent Storage & Verification.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Mở Incognito tab -> Thấy Màn hình Đăng Nhập -> Nhập Email & OTP -> Đăng nhập thành công -> F5 kiểm tra phiên còn nguyên.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/email-otp-auth/FEATURE_TASKS.md)
