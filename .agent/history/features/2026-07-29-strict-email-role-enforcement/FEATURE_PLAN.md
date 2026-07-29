# Feature Plan: Strict Email Permission Enforcement & Zero-Fallback Authentication

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã được review qua gate (xem `EXPERT_REVIEW.md`)
> **Feature slug**: strict-email-role-enforcement
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-29

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Hiện tại khi người dùng xác thực OTP đăng nhập, ứng dụng tra cứu email trong danh sách `users` (đã lưu ở LocalStorage hoặc vừa tải từ Google Sheets). Tuy nhiên, nếu email chưa được chuẩn hóa (`trim()`, `toLowerCase()`) hoặc không tìm thấy trong Bảng Phân Quyền, hệ thống đang dùng fallback gán vai trò `VIEWER` để người dùng vẫn vào được hệ thống.
- **Vấn đề cần giải quyết:** 
  1. **Nguyên nhân gốc rễ chính (FR-01)**: Trong `google_apps_script.gs`, hàm `VERIFY_OTP` hardcode `userRole = "ADMIN"` cho MỌI email đăng nhập thành công.
  2. **Bypass bảo mật (FR-02 & FR-04)**: `google_apps_script.gs` và `LoginScreen.tsx` chấp nhận OTP `"123456"` để bypass xác thực thật.
  3. Người dùng phàn nàn email đăng nhập không được cấp đúng quyền `EDITOR` mà bị hạ xuống `VIEWER` do lệch định dạng email hoặc thiếu dữ liệu sync tức thời.
  4. Việc dùng fallback cho phép email không có trong Bảng Phân Quyền vào hệ thống gây rủi ro bảo mật và không đúng với mong muốn quản trị.
- **Mục tiêu:** 
  1. Sửa `google_apps_script.gs`: `VERIFY_OTP` phải tra cứu email trong sheet `PHAN_QUYEN` để lấy đúng role. Nếu email không có trong sheet → trả `success: false` với lỗi "Email chưa được cấp quyền truy cập".
  2. Xóa hoàn toàn bypass OTP `"123456"` ở cả GAS backend và React frontend (`LoginScreen.tsx`).
  3. Chuẩn hóa 100% việc so sánh email (`trim().toLowerCase()`).
  4. Loại bỏ hoàn toàn fallback vai trò mặc định (`VIEWER`). Nếu Email KHÔNG CÓ TRONG BẢNG PHÂN QUYỀN (Google Sheet / LocalStorage Users), hệ thống từ chối đăng nhập ngay tại bước OTP và hiển thị thông báo lỗi rõ ràng.
- **Kết quả mong đợi:** 
  1. Đăng nhập thành công 100% đúng vai trò (`ADMIN`, `EDITOR`, `VIEWER`) cho các Email đã được khai báo trong Bảng Phân Quyền.
  2. Chặn 100% các Email chưa được Admin cấp quyền trong Bảng Phân Quyền.

## 2. Phạm vi

### In scope
- Chuẩn hóa xử lý email khi lưu và khi tra cứu tại `src/App.tsx`, `src/components/LoginScreen.tsx`, và `src/utils/storageUtils.ts`.
- Cập nhật logic xác thực backend tại `google_apps_script.gs` (hàm `VERIFY_OTP`): tra cứu vai trò trực tiếp từ sheet `PHAN_QUYEN` và loại bỏ bypass OTP `"123456"`.
- Cập nhật logic xác thực tại `handleLoginSuccess` và `LoginScreen.tsx`: Bắt buộc kiểm tra email tồn tại trong danh sách phân quyền active. Nếu không khớp -> Báo lỗi "Email của bạn chưa được cấp quyền truy cập hệ thống. Vui lòng liên hệ Admin!" và không cấp session.

### Out of scope
- Thay đổi cấu trúc các sheet khác ngoài `PHAN_QUYEN`.

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Kế thừa kiến trúc Thuần GAS (Pure GAS Architecture), lưu Offline-First Cache ở LocalStorage và đồng bộ 2 chiều với Google Sheets.
- **"Cấm kỵ" cần tránh:** Không khôi phục các hardcode override role cố định cho bất kỳ email nào.

## 4. Giả định và câu hỏi mở

### Giả định
- Danh sách Bảng Phân Quyền `users` luôn chứa ít nhất 1 tài khoản `ADMIN`.
- Email tra cứu không phân biệt chữ hoa chữ thường.

### Câu hỏi mở
- Không có câu hỏi blocking.

## 5. Acceptance Criteria

- [ ] GAS `VERIFY_OTP` tra cứu email trong sheet `PHAN_QUYEN`, trả đúng `role` và từ chối nếu không có trong sheet.
- [ ] Không còn nhánh bypass OTP `"123456"` ở cả GAS và Client.
- [ ] Email nhập khi đăng nhập và Email trong Bảng Phân Quyền được so sánh chính xác sau khi `trim().toLowerCase()`.
- [ ] Nếu Email đã được gán vai trò `EDITOR` trong Bảng Phân Quyền, sau khi nhập đúng OTP, người dùng đăng nhập vào đúng vai trò `EDITOR` 100%.
- [ ] Nếu Email KHÔNG CÓ trong Bảng Phân Quyền, ứng dụng từ chối đăng nhập ngay lập tức và hiển thị thông báo lỗi "Email này chưa được cấp quyền truy cập hệ thống".
- [ ] Không còn tình trạng tự động gán fallback `VIEWER` cho email không xác định.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| `google_apps_script.gs` | Sửa | Tra cứu role từ sheet `PHAN_QUYEN`, xóa bypass OTP "123456" | 🔴 | Có |
| `src/App.tsx` | Sửa | Thắt chặt `handleLoginSuccess`, từ chối đăng nhập nếu email không khớp | 🟡 | Có |
| `src/components/LoginScreen.tsx` | Sửa | Hiển thị thông báo lỗi khi Email không được cấp quyền, xóa OTP fallback | 🟢 | Có |
| `src/utils/storageUtils.ts` | Sửa | Chuẩn hóa `loadAppUsers` và lưu trữ email chữ thường | 🟢 | Có |

## 7. Risk Triage và Review Focus

- **Review required:** Yes (Đã hoàn thành review gate - xem `EXPERT_REVIEW.md`)
- **Risk hotspots:** Luồng authentication GAS backend (`VERIFY_OTP`) & cấp session đăng nhập (`App.tsx`).
- **Review focus areas:** Đảm bảo không khóa nhầm tài khoản Admin chính và luồng xử lý offline/online luôn nhất quán.

## 8. Chiến lược triển khai

- **Phase strategy:** 
  - Phase 1: Cập nhật GAS Engine Backend (`google_apps_script.gs`) - Tra cứu sheet `PHAN_QUYEN` & Xóa bypass OTP "123456".
  - Phase 2: Chuẩn hóa dữ liệu Email & Logic kiểm tra phân quyền nghiêm ngặt phía React App.
  - Phase 3: Cập nhật giao diện thông báo từ chối truy cập & dọn dẹp tại `LoginScreen.tsx`.
  - Phase 4: Kiểm thử toàn bộ các kịch bản & Build tĩnh.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra TypeScript & Bundle.
- **Manual verification:** 
  1. Đăng nhập bằng Email đã gán `EDITOR` -> Kiểm tra quyền `EDITOR`.
  2. Đăng nhập bằng Email chưa gán quyền -> Kiểm tra hệ thống chặn và báo lỗi.

## 10. Rollback Plan

- Khôi phục lại commit trước đó trên Git nếu có sự cố ngắt kết nối không thể đăng nhập.

## 11. Tham chiếu thực thi

- Checklist chi tiết theo phase: `FEATURE_TASKS.md`
