# .agent/KNOWLEDGE_BASE.md - Bộ não của dự án Quản Lý Nhập Xuất Tồn Kho

Lưu trữ những **quyết định kiến trúc** quan trọng và **lý do chiến lược** của dự án.

> ⚠️ **QUY TẮC GHI:**
> - Chỉ ghi quyết định kiến trúc và lý do chiến lược (high-level decisions)
> - Tuyệt đối tránh liệt kê tính năng, changelog chi tiết, hoặc mô tả cấu hình thuần túy
> - Mỗi dòng phải trả lời được câu hỏi: "Tại sao chúng me quyết định làm vậy?"

---

## Initial Decisions From Repo Scan

- [2026-07-28] **Quyết định sử dụng Kiến Trúc Thuần GAS (Pure GAS Architecture) thay vì Node Vercel Backend Proxy.**  
  *Why:* Việc gọi thông qua Vercel Node Proxy (`/api/gas-proxy`) gây ra lỗi Vercel Serverless Function `500 FUNCTION_INVOCATION_FAILED` do nạp thư viện `vite` ở top-level serverless runtime và thiếu Google ADC credentials. Chuyển sang gọi trực tiếp từ Frontend Client React đến Google Apps Script WebApp bằng `Content-Type: text/plain;charset=utf-8` giúp loại bỏ hoàn toàn backend Node.js, miễn phí 100%, 0% rủi ro Vercel function crash, đồng thời bypass rào cản CORS preflight `OPTIONS` thành công.

- [2026-07-28] **Quyết định triển khai Vercel dưới dạng 100% Static SPA Host (Static Build).**  
  *Why:* Vercel chỉ đóng vai trò phân phối file tĩnh HTML/JS/CSS nhẹ nhàng và tối ưu tốc độ cho Client, loại bỏ sự cần thiết của `@vercel/node` hay Serverless Functions phức tạp.

- [2026-07-28] **Quyết định lưu trữ dữ liệu chính ở LocalStorage làm Offline First Cache và đồng bộ 2 chiều với Google Sheets khi có kết nối.**  
  *Why:* Giúp ứng dụng hoạt động ngay tức thì cho người dùng mà không bị trễ mạng, đồng thời Google Sheets đóng vai trò làm cơ sở dữ liệu lưu trữ bền vững (Persistence Cloud Store) miễn phí và dễ quản lý.

---

## Ongoing Decisions

- [2026-07-28] Đã khởi tạo bộ tài liệu `.agent/` hỗ trợ AI Assistants điều phối công việc chuẩn hóa theo quy chuẩn dự án.

- [2026-08-02] **Quyết định sử dụng Entry Point `executeGasAction` để cầu nối `google.script.run`.**  
  *Why:* Khi chạy trực tiếp ứng dụng React trong container của Google Apps Script (GAS WebApp URL), các cuộc gọi đến backend không đi qua HTTP POST thông thường mà gọi qua `google.script.run`. Việc thêm một hàm entrypoint `executeGasAction` chuyển tiếp (dispatch) payload động giúp đồng bộ mượt mà và cho phép `Session.getActiveUser()` lấy email thực tế của người dùng.

- [2026-08-01] **Quyết định triển khai cơ chế OTP dự phòng `123456` khi lỗi mạng / chưa cấu hình WebApp.**  
  *Why:* Tránh việc luồng đăng nhập bị chặn cứng (block) hoàn toàn khi người dùng chưa cấu hình đúng Google Sheet hoặc gặp sự cố CORS/mất mạng. Cho phép đăng nhập fallback nhanh để người dùng vào được màn hình cấu hình WebApp URL.
