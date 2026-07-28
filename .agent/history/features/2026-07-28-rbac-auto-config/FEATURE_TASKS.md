# Feature Tasks: Phân Quyền Vai Trò (ADMIN / EDITOR / VIEWER) & Tự Động Kết Nối Qua Link (RBAC & Auto Config)

> **Trạng thái**: ✅ Hoàn thành
> **Liên kết plan**: [FEATURE_PLAN.md](file:///d:/Project/QuanLyNXT/.agent/active/rbac-auto-config/FEATURE_PLAN.md)
> **Ngày tạo**: 2026-07-28

---

## Quy ước checklist

- `- [ ]`: Chưa làm
- `- [/]`: Đang làm
- `- [x]`: Hoàn thành
- Cuối mỗi phase bắt buộc có `Task X.Final: 🧪 Test & Verify Phase X`

## Phase 1: Auto Config Engine & Type Definitions

**Mục tiêu:** Tự động kết nối WebApp URL từ Link chia sẻ và định nghĩa cấu trúc phân quyền 3 cấp.

- [x] Task 1.1: Cập nhật `src/types.ts` bổ sung `UserRole` ('ADMIN' | 'EDITOR' | 'VIEWER') và `adminPin` trong `GoogleSyncConfig`.
- [x] Task 1.2: Thêm logic tự động đọc `?gasUrl=` từ URL bar trong `src/App.tsx`, tự lưu cấu hình và làm sạch URL.
- [x] Task 1.Final: 🧪 Test & Verify Phase 1 (Bắt buộc) - Chạy `npm run build` verify không có lỗi TypeScript compilation.

## Phase 2: Role-Based UI Scoping & Role Switcher Modal

**Mục tiêu:** Hiển thị Badge Vai Trò trên Header, bảo vệ các nút chức năng theo quyền hạn và tạo nút Copy Link Chia Sẻ.

- [x] Task 2.1: Thêm Role Badge ('ADMIN', 'EDITOR', 'VIEWER') và Modal Đổi Vai Trò bằng mã PIN trên `src/components/Header.tsx`.
- [x] Task 2.2: Ẩn/Hiện các nút Thêm phiếu, Sửa, Xóa, Cấu hình trong `App.tsx`, `ProductsView.tsx`, `WarehousesView.tsx`, `TransactionsView.tsx` dựa trên vai trò người dùng.
- [x] Task 2.3: Thêm nút "Copy Link Chia Sẻ Cho Nhân Viên" trong `src/components/GoogleSheetsSyncView.tsx`.
- [x] Task 2.Final: 🧪 Test & Verify Phase 2 (Bắt buộc) - Chạy `npm run build` verify toàn bộ ứng dụng hoạt động hoàn hảo.

---

## Execution Log

| Thời gian | Phase | Task | Hành động | Trạng thái | Ghi chú |
|-----------|-------|------|-----------|-----------|---------|
| 2026-07-28 | Init | Task 0 | Khởi tạo kế hoạch RBAC & Auto Config | done | Đã tạo FEATURE_PLAN.md và FEATURE_TASKS.md |
| 2026-07-28 | Phase 1 | Task 1.1 | Định nghĩa UserRole & adminPin | done | Bổ sung type v2.4 |
| 2026-07-28 | Phase 1 | Task 1.2 | Auto Connect từ Link Query ?gasUrl=... | done | Tự lưu cấu hình 0-setup |
| 2026-07-28 | Phase 2 | Task 2.1 | Thêm Role Badge & Modal Đổi Vai Trò | done | Chuyển vai trò với Mã PIN Admin |
| 2026-07-28 | Phase 2 | Task 2.2 | Scoped UI theo 3 vai trò (ADMIN, EDITOR, VIEWER) | done | Bảo vệ các nút nhạy cảm |
| 2026-07-28 | Phase 2 | Task 2.3 | Nút Copy Link Chia Sẻ Cho Nhân Viên | done | Copy link gửi nhân viên 0-setup |
| 2026-07-28 | Phase 2 | Task 2.Final | Build & verify production | done | Build thành công 100% trong 4.60s |
| 2026-07-28 | Done | Complete | Hoàn tất tính năng RBAC & Auto Connect | done | Đã hoàn thành |
