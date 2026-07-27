# Changelog BE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Backend, Google Apps Script API, integration, auth logic, routing
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Tối ưu hóa hạ tầng Vercel Static Build (Thuần GAS)
- Cập nhật `vercel.json` sang `@vercel/static-build`, loại bỏ Vercel `@vercel/node` serverless function proxy `/api/gas-proxy` để triệt tiêu lỗi HTTP 500 `FUNCTION_INVOCATION_FAILED`.
- Cập nhật tài liệu `README.md` với 9 bước chi tiết hướng dẫn deploy Google Apps Script WebApp ở chế độ `Anyone`.
- Files: `vercel.json`, `README.md`, `google_apps_script.gs`

### docs: Khởi tạo hệ thống tài liệu Core Docs & Kế hoạch Thuần GAS
- Thiết lập kế hoạch chuyển đổi kiến trúc từ Vercel Node Proxy sang Thuần GAS (Pure GAS Integration).
- Files: `.agent/history/features/2026-07-28-pure-gas-integration/FEATURE_PLAN.md`, `.agent/history/features/2026-07-28-pure-gas-integration/FEATURE_TASKS.md`

---

*Cập nhật tự động bởi update-docs*
