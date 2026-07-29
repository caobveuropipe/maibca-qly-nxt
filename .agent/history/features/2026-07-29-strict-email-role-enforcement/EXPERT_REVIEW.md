---
source: feature-review
feature: strict-email-role-enforcement
round: 1
timestamp: 2026-07-29T04:41:00Z
verdict: ⚠️ CẦN SỬA
---

# Expert Review: strict-email-role-enforcement

## Findings

### FR-01: GAS VERIFY_OTP hardcode `userRole = "ADMIN"` cho mọi email
- **Severity**: Critical
- **Confidence**: High
- **Issue**: `google_apps_script.gs` dòng 88 gán `var userRole = "ADMIN"` cứng sau khi xác minh OTP thành công, không tra cứu sheet `PHAN_QUYEN`.
- **Evidence**: `google_apps_script.gs:88` — `var userRole = "ADMIN";`
- **Impact**: Mọi email đăng nhập thành công đều nhận role ADMIN từ GAS server, bất kể Bảng Phân Quyền ghi gì. Đây là nguyên nhân gốc rễ chính.
- **Required Fix**: GAS `VERIFY_OTP` phải tra cứu email trong sheet `PHAN_QUYEN` để lấy role thực tế. Nếu email không có trong sheet → trả `success: false`.

### FR-02: GAS VERIFY_OTP chấp nhận OTP bypass "123456"
- **Severity**: Critical
- **Confidence**: High
- **Issue**: `google_apps_script.gs` dòng 80 cho phép OTP "123456" bypass kiểm tra OTP thật.
- **Evidence**: `google_apps_script.gs:80` — `if (inputOtp !== "123456") { return error; }` nghĩa là "123456" luôn pass.
- **Impact**: Bất kỳ ai biết email hợp lệ + nhập "123456" đều vào được hệ thống không cần OTP thật.
- **Required Fix**: Xóa hoàn toàn nhánh bypass "123456" trong GAS.

### FR-03: Plan thiếu `google_apps_script.gs` trong bảng Files bị ảnh hưởng
- **Severity**: High
- **Confidence**: High
- **Issue**: `FEATURE_PLAN.md` mục 6 chỉ liệt kê 3 file Client, thiếu `google_apps_script.gs` — file chứa nguyên nhân gốc rễ.
- **Evidence**: Plan mục 2 (In scope) đề cập GAS nhưng mục 6 (Files) không có.
- **Impact**: Triển khai theo plan hiện tại sẽ bỏ qua backend GAS → bug vẫn tồn tại.
- **Required Fix**: Bổ sung `google_apps_script.gs` vào bảng Files và thêm task sửa GAS vào `FEATURE_TASKS.md`.

### FR-04: `LoginScreen.tsx` vẫn có fallback OTP "123456" phía Client
- **Severity**: Medium
- **Confidence**: High
- **Issue**: `LoginScreen.tsx` dòng 104, khi JSON parse thất bại, nếu OTP là "123456" thì Client tự tạo fake success response.
- **Evidence**: `LoginScreen.tsx:104-116`
- **Impact**: Bypass OTP verification phía Client.
- **Required Fix**: Xóa hoàn toàn nhánh fallback "123456" trong `LoginScreen.tsx`.

### FR-05: Dead code `handleAdminPinLogin` vẫn tồn tại
- **Severity**: Low
- **Confidence**: Medium
- **Issue**: Hàm `handleAdminPinLogin` (dòng 144-157) và state `adminInputPin` vẫn tồn tại dù nút UI đã bị xóa.
- **Evidence**: `LoginScreen.tsx:144-157`
- **Impact**: Dead code, không ảnh hưởng runtime.
- **Required Fix**: Xóa hàm và state liên quan.

## Khuyến nghị không chặn rollout
- FR-04: Nên sửa cùng lúc nhưng không block nếu GAS đã sửa xong.
- FR-05: Có thể làm sau.

## Cần xác thực thêm
- Không có.
