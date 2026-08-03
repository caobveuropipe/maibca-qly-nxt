# Feature Plan: Phục hồi cơ chế Đăng nhập OTP Dự phòng & Đồng bộ Thuần GAS

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: ✅ Đã thông qua review bởi Chief Architect
> **Feature slug**: vercel-pure-gas-fix
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-08-01

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Dự án đang chuyển đổi sang kiến trúc Thuần GAS (Pure GAS Integration). Việc sử dụng Vercel Serverless Proxy `/api/gas-proxy` gặp lỗi 405 Method Not Allowed do môi trường deploy trên Vercel là Static SPA.
- **Vấn đề cần giải quyết:** 
  1. Yêu cầu kết nối WebApp trực tiếp từ client (Pure GAS) thay vì qua `/api/gas-proxy`.
  2. Khi WebApp URL chưa cấu hình hoặc bị lỗi mạng (CORS/404), luồng đăng nhập Email OTP bị chặn cứng và báo lỗi, không cho phép dùng OTP dự phòng `123456` để trải nghiệm/cài đặt lại.
- **Mục tiêu:** 
  1. Phục hồi kết nối trực tiếp đến Google Apps Script từ Client React (Content-Type: text/plain).
  2. Bổ sung cơ chế fallback tự động sang mã OTP dự phòng `123456` khi kết nối WebApp thất bại để người dùng luôn đăng nhập được bằng Email của họ.
- **Kết quả mong đợi:** Người dùng đăng nhập được bằng bất kỳ Email nào qua OTP dự phòng `123456` khi chưa cấu hình Sheet, và đồng bộ dữ liệu hoạt động bình thường khi dán link Sheet chính xác.

## 2. Phạm vi

### In scope
- Revert các hàm fetch trong `LoginScreen.tsx` và `App.tsx` về gọi trực tiếp WebApp URL (Content-Type: text/plain).
- Cải tiến luồng `handleSendOtp` và `handleVerifyOtp` trong `LoginScreen.tsx` để tự động chuyển sang bước nhập OTP dự phòng `123456` khi kết nối thất bại (thay vì chặn lỗi).

### Out of scope
- Sửa đổi các tính năng nghiệp vụ kho bãi khác.

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tôn trọng quyết định dùng Kiến Trúc Thuần GAS (Pure GAS) để không phụ thuộc vào backend Node.js của Vercel và chạy tốt trên môi trường Static SPA.
- **"Cấm kỵ" cần tránh:** Không cố gắng viết thêm hoặc gọi các API backend `/api/*` trên Vercel.

## 4. Giả định và câu hỏi mở

### Giả định
- Vercel chỉ phục vụ static file tĩnh, do đó mọi kết nối API bên thứ ba bắt buộc chạy trực tiếp từ client.

### Câu hỏi mở
- Không có câu hỏi blocking.

## 5. Acceptance Criteria

- [ ] Người dùng nhập Email -> Bấm Gửi OTP -> Nếu kết nối GAS lỗi, hiển thị thông báo chuyển sang mã OTP dự phòng `123456` và chuyển sang màn hình nhập OTP.
- [ ] Người dùng nhập đúng Email và mã OTP `123456` -> Đăng nhập thành công vào hệ thống với Email đã nhập.
- [ ] Các kết nối đồng bộ dữ liệu (Sync Up / Sync Down) chạy trực tiếp đến WebApp URL của người dùng.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| `src/components/LoginScreen.tsx` | Sửa | Cập nhật luồng fallback OTP và kết nối trực tiếp | 🟢 Thấp | Có |
| `src/App.tsx` | Sửa | Revert các lệnh sync về gọi trực tiếp | 🟢 Thấp | Có |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo luồng fallback OTP hoạt động trơn tru cả khi có mạng và mất mạng.
- **Review focus areas:** Kiểm tra việc định dạng kiểu dữ liệu truyền nhận dạng `text/plain` để tránh lỗi CORS.

## 8. Chiến lược triển khai

- **Phase strategy:**
  - **Phase 1**: Cập nhật lại frontend React kết nối trực tiếp thuần GAS và cơ chế fallback OTP.
  - **Phase 2**: Kiểm tra và triển khai lên Git/Vercel.

## 9. Test Strategy

- **Manual verification:**
  - Đăng nhập bằng email `caobv.europipe@gmail.com` với một link WebApp lỗi (404) -> Kiểm tra xem có nhận được thông báo dùng OTP dự phòng `123456` và đăng nhập thành công hay không.
  - Sau khi vào trong, cấu hình WebApp URL chuẩn và thử đồng bộ dữ liệu.

## 10. Rollback Plan

- Sử dụng `git checkout` hoặc `git revert` để quay lại commit trước đó nếu xảy ra lỗi nghiêm trọng.

## 11. Tham chiếu thực thi

- Checklist chi tiết theo phase: `FEATURE_TASKS.md`

## 12. Review Notes

- **2026-08-01 - Chief Architect**: Kế hoạch hoàn toàn tương thích và kế thừa tốt quyết định kiến trúc Pure GAS của dự án. Không phát hiện rủi ro bảo mật hay xung đột tài nguyên. Phê duyệt triển khai.

