# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Chuyển đổi gọi trực tiếp Google Apps Script từ Frontend (Thuần GAS)
- Refactor `handleSyncUp` và `handleSyncDown` sang Simple Request `fetch()` tới GAS WebApp với `Content-Type: text/plain;charset=utf-8` và `redirect: 'follow'` để tránh kích hoạt CORS preflight `OPTIONS`.
- Cập nhật điều kiện kích hoạt các nút bấm đồng bộ trong `GoogleSheetsSyncView.tsx` khi người dùng nhập GAS WebApp URL.
- Bổ sung thông báo lỗi gợi ý tiếng Việt rõ ràng khi người dùng chưa cấp quyền `Anyone` cho WebApp GAS.
- Files: `src/App.tsx`, `src/components/GoogleSheetsSyncView.tsx`

### docs: Khởi tạo hệ thống tài liệu Core Docs & Skill Pack
- Thêm `.agent/CONTEXT.md`, `.agent/PROJECT_STRUCTURE.md`, `.agent/KNOWLEDGE_BASE.md` chuẩn hóa luồng làm việc.
- Files: `.agent/CONTEXT.md`, `.agent/PROJECT_STRUCTURE.md`, `.agent/KNOWLEDGE_BASE.md`

---

*Cập nhật tự động bởi update-docs*
