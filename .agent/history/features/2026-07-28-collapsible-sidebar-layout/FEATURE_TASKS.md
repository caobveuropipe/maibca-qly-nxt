# Feature Tasks: Chuyển Thanh Menu & Thao Tác Sang Sidebar Thu Gọn / Ẩn Nhanh (Collapsible Sidebar Layout)

> **Trạng thái**: ✅ Hoàn thành
> **Liên kết plan**: [FEATURE_PLAN.md](file:///d:/Project/QuanLyNXT/.agent/active/collapsible-sidebar-layout/FEATURE_PLAN.md)
> **Ngày tạo**: 2026-07-28

---

## Quy ước checklist

- `- [ ]`: Chưa làm
- `- [/]`: Đang làm
- `- [x]`: Hoàn thành
- Cuối mỗi phase bắt buộc có `Task X.Final: 🧪 Test & Verify Phase X`

## Phase 1: Sidebar Component Development & Collapsible State Engine

**Mục tiêu:** Xây dựng component `Sidebar.tsx` chuyển toàn bộ Header, Menu tabs, User profile & Action buttons sang dạng thu gọn 64px / mở rộng 256px.

- [x] Task 1.1: Tạo `src/components/Sidebar.tsx` tích hợp Menu Chuyển Tab, Role Badge, Email Profile, Nút Thao Tác Nhanh và Nút Thu Gọn/Mở Rộng.
- [x] Task 1.Final: 🧪 Test & Verify Phase 1 (Bắt buộc) - Chạy `npm run build` verify không có lỗi TypeScript compilation.

## Phase 2: App Layout Integration & Responsive Verification

**Mục tiêu:** Tích hợp Sidebar layout vào `src/App.tsx`, thay thế Header dầy cũ bằng Mini TopBar nhẹ và kiểm tra build.

- [x] Task 2.1: Cập nhật `src/App.tsx` thay thế Header ngang cũ bằng layout `Sidebar + Mini TopBar + Wide Content Area`.
- [x] Task 2.2: Tích hợp nút Thu Gọn / Mở Rộng Sidebar mượt mà và lưu trạng thái vào LocalStorage.
- [x] Task 2.Final: 🧪 Test & Verify Phase 2 (Bắt buộc) - Chạy `npm run build` verify toàn bộ ứng dụng hoạt động mượt mà.

---

## Execution Log

| Thời gian | Phase | Task | Hành động | Trạng thái | Ghi chú |
|-----------|-------|------|-----------|-----------|---------|
| 2026-07-28 | Init | Task 0 | Khởi tạo kế hoạch Collapsible Sidebar Layout | done | Đã tạo FEATURE_PLAN.md và FEATURE_TASKS.md |
| 2026-07-28 | Phase 1 | Task 1.1 | Tạo Sidebar.tsx với Đóng/Mở mượt mà | done | Tích hợp Menu, Actions, User Email |
| 2026-07-28 | Phase 2 | Task 2.1 | Thay thế Header cũ bằng Sidebar layout | done | Tối ưu không gian hiển thị cho các bảng |
| 2026-07-28 | Phase 2 | Task 2.2 | Lưu trạng thái thu gọn vào LocalStorage | done | nxt_sidebar_collapsed_v1 |
| 2026-07-28 | Phase 2 | Task 2.Final | Build & verify production | done | Build thành công 100% trong 18.77s |
| 2026-07-28 | Done | Complete | Hoàn tất tính năng Sidebar Layout | done | Đã hoàn thành |
