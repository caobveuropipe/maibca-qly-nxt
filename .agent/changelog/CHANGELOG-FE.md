# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### fix: Khắc phục menu chọn Kho/Sản phẩm bị che khuất & Mở rộng không gian Lập Phiếu
- Nâng cấp `SearchableSelect.tsx` sử dụng **Fixed Floating Popover Position Engine** (`position: fixed`, `z-index: 9999`). Danh sách chọn Kho và Sản phẩm nay **nổi hoàn toàn lên trên cùng**, không bao giờ bị cắt/ẩn bởi khung bảng hay thanh cuộn.
- Mở rộng kích thước Modal Lập Phiếu (`TransactionModal.tsx`) lên `max-w-7xl` (`96vw`), tăng chiều cao tối đa của Bảng tính chi tiết lên `max-h-[55vh]` giúp hiển thị 8-10 dòng hàng rộng rãi mượt mà.
- Files: `src/components/SearchableSelect.tsx`, `src/components/TransactionModal.tsx`

### feat: Tự Động Đồng Bộ Realtime (Auto-Sync Engine)
- Thêm cơ chế **Auto-Push ngầm (Debounce 1.5s)**: Tự động đẩy dữ liệu lên Google Sheet ngay sau khi Tạo/Sửa/Xóa Sản phẩm, Kho, Phiếu nhập xuất mà không cần bấm nút thủ công.
- Thêm cơ chế **Auto-Pull Polling 30s ngầm**: Tự động tải dữ liệu mới từ Sheet về định kỳ mỗi 30 giây.
- Thêm Toggle Switch `Tự Động Đồng Bộ Realtime` và Badge trạng thái sinh động trong `GoogleSheetsSyncView.tsx`.
- Files: `src/App.tsx`, `src/components/GoogleSheetsSyncView.tsx`

### feat: Chuyển đổi gọi trực tiếp Google Apps Script từ Frontend (Thuần GAS)
- Refactor `handleSyncUp` và `handleSyncDown` sang Simple Request `fetch()` tới GAS WebApp với `Content-Type: text/plain;charset=utf-8` và `redirect: 'follow'` để tránh kích hoạt CORS preflight `OPTIONS`.
- Cập nhật điều kiện kích hoạt các nút bấm đồng bộ trong `GoogleSheetsSyncView.tsx` khi người dùng nhập GAS WebApp URL.
- Bổ sung thông báo lỗi gợi ý tiếng Việt rõ ràng khi người dùng chưa cấp quyền `Anyone` cho WebApp GAS.
- Files: `src/App.tsx`, `src/components/GoogleSheetsSyncView.tsx`

---

*Cập nhật tự động bởi update-docs*
