# Feature Plan: Chuyển Đổi Kiến Trúc Thuần GAS (Pure GAS Integration)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: pure-gas-integration
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Ứng dụng Quản Lý Nhập Xuất Tồn Kho hiện đang kết nối Google Sheets thông qua Vercel Express Node Backend Serverless Proxy (`/api/gas-proxy`, `/api/sheets/*`). Khi triển khai lên Vercel, Node serverless function bị crash `500 FUNCTION_INVOCATION_FAILED` do nạp thư viện `vite` ở top-level và thiếu Google Service Account Credentials.
- **Vấn đề cần giải quyết:** Loại bỏ sự phụ thuộc vào Vercel Node Backend, chuyển đổi kết nối Google Sheets sang mô hình **Thuần GAS (Pure GAS)** trực tiếp từ Frontend React tới Google Apps Script WebApp.
- **Mục tiêu:**
  1. Frontend gọi trực tiếp WebApp GAS bằng `fetch()` với `Content-Type: text/plain;charset=utf-8` để vượt qua rào cản CORS browser mà không cần Backend proxy.
  2. Bỏ các route `/api/*` trên Vercel, đơn giản hóa `vercel.json` thành 100% Static Web Site Host trên Vercel.
  3. Giữ nguyên toàn bộ tính năng Đồng Bộ Lên (`SYNC_UP`) và Đồng Bộ Về (`SYNC_DOWN`).
- **Kết quả mong đợi:** Người dùng nhập URL WebApp GAS vào ứng dụng và bấm "Đồng bộ" là dữ liệu cập nhật ngay lập tức thành công 100%, không còn bị lỗi HTTP 500 Vercel.

## 2. Phạm vi

### In scope
- Refactor logic gọi API trong [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) để gửi `fetch` trực tiếp tới `googleConfig.gasWebappUrl`.
- Xử lý định dạng `Content-Type: text/plain;charset=utf-8` và `redirect: 'follow'` để trình duyệt không kích hoạt CORS Preflight (`OPTIONS`).
- Cập nhật giao diện / thông báo cài đặt Google Sheet trong App để người dùng dễ sử dụng với GAS WebApp URL.
- Tối ưu [vercel.json](file:///d:/Project/QuanLyNXT/vercel.json) để deploy tĩnh 100% (Static SPA), loại bỏ `@vercel/node` serverless function.

### Out of scope
- Sửa đổi cấu trúc dữ liệu trong `google_apps_script.gs` (nút bấm và logic GAS đã chuẩn 100%).
- Khởi tạo tính năng tạo Sheet qua Google Drive API backend (yêu cầu OAuth Service Account).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Giữ nguyên quy trình đồng bộ dữ liệu Danh Mục Kho, Danh Mục Sản Phẩm và Nhập Xuất Kho theo chuẩn định dạng trong [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs).
- **"Cấm kỵ" cần tránh:** không dùng `Content-Type: application/json` khi fetch trực tiếp sang GAS từ Client (vì sẽ kích hoạt CORS preflight `OPTIONS` bị Google Apps Script chặn).
- **Ràng buộc kiến trúc:** Đảm bảo dữ liệu local (localStorage) luôn nhất quán trước và sau khi `SYNC_DOWN` / `SYNC_UP`.

## 4. Giả định và câu hỏi mở

### Giả định
- User triển khai ứng dụng Google Apps Script ở chế độ `Execute as: Me` và `Who has access: Anyone`.
- Đã có sẵn WebApp URL dạng `https://script.google.com/macros/s/.../exec`.

### Câu hỏi mở
- Không có câu hỏi blocking.

## 5. Acceptance Criteria

- [ ] Khi nhập GAS WebApp URL và nhấn "Đẩy dữ liệu lên Google Sheets", dữ liệu local xuất hiện đủ trong Google Sheet mà không qua `/api/gas-proxy`.
- [ ] Khi nhấn "Tải dữ liệu từ Google Sheets về", ứng dụng cập nhật đầy đủ Danh mục Kho, Sản phẩm và Nhật ký nhập xuất.
- [ ] Trình duyệt không xuất hiện lỗi CORS hay lỗi HTTP 500 Vercel Server Error.
- [ ] Vercel deploy tĩnh ổn định, nhanh chóng, 0% serverless invocation error.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Chuyển logic `fetch('/api/gas-proxy')` sang `fetch(gasUrl)` trực tiếp | 🟢 Thấp | Giữ nguyên format payload và state |
| [vercel.json](file:///d:/Project/QuanLyNXT/vercel.json) | Sửa | Loại bỏ `@vercel/node` builder, chuyển sang Static SPA | 🟢 Thấp | Đảm bảo client routing SPA `/.*` |
| [server.ts](file:///d:/Project/QuanLyNXT/server.ts) | Giữ / Sửa | Vẫn giữ cho môi trường chạy local dev (`npm run dev`) nếu cần | 🟢 Thấp | Không ảnh hưởng prod build |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo `fetch` handling parse đúng JSON response trả về từ redirect của GAS WebApp (`script.googleusercontent.com`).
- **Review focus areas:** 
  1. Xử lý ngoại lệ mạng khi fetch trực tiếp từ Client tới GAS URL.
  2. Cấu hình Vercel rewrite cho SPA React Router / Vite build.
- **Known pitfalls / historical issues:** Tránh gửi `Authorization` header hoặc custom header tới GAS URL vì sẽ làm CORS preflight bị fail.
- **Dependencies / rollout concerns:** Không cần migration database, chỉ cần update code Frontend và deploy lại lên Vercel.

## 8. Chiến lược triển khai

- **Phase strategy:** Chia 2 phase gọn gàng:
  - **Phase 1:** Refactor Frontend (`src/App.tsx`) để gọi trực tiếp GAS WebApp & Cấu hình `vercel.json` Static Build.
  - **Phase 2:** Kiểm thử End-to-End (`SYNC_UP` & `SYNC_DOWN`) và Verify trên Vercel environment.
- **Thứ tự triển khai:** Cập nhật `src/App.tsx` -> Cập nhật `vercel.json` -> Build test local -> Push & Verify Vercel.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra TypeScript compilation & Vite bundle success.
- **Manual verification:**
  1. Nhập URL GAS WebApp vào giao diện.
  2. Bấm "Đồng bộ lên Sheets" -> Kiểm tra Google Sheet cập nhật.
  3. Bấm "Đồng bộ về App" -> Kiểm tra dữ liệu App được refresh.

## 10. Rollback Plan

- Nếu có sự cố, revert commit về phiên bản trước trên Git.

## 11. Tham chiếu thực thi

- Checklist chi tiết theo phase: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/pure-gas-integration/FEATURE_TASKS.md)
