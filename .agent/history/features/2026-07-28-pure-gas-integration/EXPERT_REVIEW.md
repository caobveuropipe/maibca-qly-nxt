---
source: feature-review
feature: pure-gas-integration
round: 1
timestamp: 2026-07-28T06:29:30Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: pure-gas-integration

## Findings

### FR-01: Cấu hình Content-Type khi gửi request trực tiếp tới Google Apps Script WebApp
- **Severity**: High
- **Confidence**: High
- **Issue**: Nếu Frontend gửi `fetch(gasUrl)` với `Content-Type: application/json`, trình duyệt sẽ bắn request CORS Preflight (`OPTIONS`). GAS WebApp không phản hồi OPTIONS preflight chuẩn, sẽ gây ra lỗi CORS trên Client.
- **Evidence**: [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx#L349) trước đây gửi `application/json` qua proxy.
- **Impact**: Request trực tiếp sang GAS bị lỗi CORS nếu không dùng Simple Request Header.
- **Required Fix**: Sử dụng `headers: { 'Content-Type': 'text/plain;charset=utf-8' }` và `redirect: 'follow'` trong Task 1.1.

### FR-02: Thông báo lỗi thân thiện khi GAS trả về HTML (chưa phân quyền "Anyone")
- **Severity**: Low
- **Confidence**: High
- **Issue**: Nếu người dùng chưa mở quyền WebApp sang "Anyone", Google sẽ trả về trang HTML Đăng nhập thay vì JSON.
- **Evidence**: Catch block `JSON.parse(text)` trong [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx#L367).
- **Impact**: Người dùng khó nhận biết lý do đồng bộ thất bại.
- **Required Fix**: Trong catch block `JSON.parse`, hiển thị thông báo hướng dẫn người dùng kiểm tra lại quyền Deploy WebApp ở chế độ "Anyone".

## Khuyến nghị không chặn rollout
- Cập nhật file `vercel.json` sang 100% `@vercel/static-build` loại bỏ hoàn toàn backend Node.js.

## Cần xác thực thêm
- Không có issue nào có độ tin cậy thấp.
