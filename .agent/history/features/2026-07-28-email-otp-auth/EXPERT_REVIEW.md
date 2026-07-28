---
source: feature-review
feature: email-otp-auth
round: 1
timestamp: 2026-07-28T07:08:30Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: email-otp-auth

## Findings

### FR-01: Gửi OTP Qua Email 0đ Chi Phí Bằng Google Apps Script
- **Severity**: Low
- **Confidence**: High
- **Issue**: Cần cơ chế gửi OTP qua Email miễn phí 100% không tốn tiền dịch vụ ngoài.
- **Evidence**: Google Apps Script có sẵn API `MailApp.sendEmail()` tích hợp sẵn theo tài khoản Google.
- **Impact**: Gửi email OTP xác thực trực tiếp về inbox của người dùng với chi phí 0đ.
- **Required Fix**: Thêm `SEND_OTP` và `VERIFY_OTP` vào `google_apps_script.gs`.

### FR-02: Màn Hình Khóa Đăng Nhập (Login Gate) & Lưu Phiên Lâu Dài
- **Severity**: Medium
- **Confidence**: High
- **Issue**: Khi truy cập ứng dụng lần đầu hoặc trên tab ẩn danh, chưa có màn hình đăng nhập nên mặc định vào giao diện Admin.
- **Evidence**: Ảnh chụp người dùng hiển thị thẳng màn hình IMS PRO v2.4 Admin.
- **Impact**: Đảm bảo an toàn tuyệt đối. Mọi người dùng phải xác thực OTP Email trước khi được vào hệ thống.
- **Required Fix**: Màn hình `LoginScreen.tsx` và lưu `sessionToken` lâu dài trong `localStorage`.

## Khuyến nghị không chặn rollout
- Cung cấp tính năng đăng nhập bằng Mã PIN Admin khi chưa kết nối Internet hoặc chưa thiết lập WebApp URL.

## Cần xác thực thêm
- Không có.
