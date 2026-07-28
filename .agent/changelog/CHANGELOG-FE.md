# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Phân Quyền 3 Cấp (ADMIN / EDITOR / VIEWER) & Tự Động Kết Nối Qua Link (0-Setup)
- Bổ sung tính năng **Auto-Connect qua Link Chia Sẻ**: Thêm nút `"📋 Copy Link Chia Sẻ Cho Nhân Viên"` trong tab Cấu hình. Nhân viên mở đường link được gửi trên bất kỳ thiết bị/trình duyệt nào ➔ Ứng dụng **tự động kết nối ngầm với Google Sheet ngay lập tức (0-Setup)**, không cần dán URL hay cấu hình lại từ đầu.
- Tích hợp **Hệ thống Phân Quyền 3 Vai Trò (RBAC)**:
  - **👑 ADMIN (Quản Trị Viên):** Toàn quyền truy cập, cài đặt Google Sheet, quản lý mã PIN Admin và chức năng Xóa Dữ Liệu.
  - **✏️ EDITOR (Nhân Viên Kho):** Quyền Tạo/Sửa phiếu nhập xuất, thêm sản phẩm. Ẩn hoàn toàn tab Cấu hình Sheet và nút Xóa Dữ Liệu.
  - **👁️ VIEWER (Chỉ Xem Báo Cáo):** Chế độ Read-Only chỉ được xem Báo Cáo NXT & Thẻ Kho. Ẩn tất cả nút Thêm/Sửa/Xóa.
- Thêm Badge Vai Trò & Modal Đổi Vai Trò bằng mã PIN Admin trên Header (`Header.tsx`).
- Files: `src/types.ts`, `src/App.tsx`, `src/components/Header.tsx`, `src/components/GoogleSheetsSyncView.tsx`, `src/components/ProductsView.tsx`, `src/components/WarehousesView.tsx`, `src/components/TransactionsView.tsx`

### feat: Định dạng số hàng nghìn và thập phân Realtime khi nhập liệu (`FormattedNumberInput`)
- Tạo mới component `FormattedNumberInput.tsx` tự động chèn **dấu chấm phân cách hàng nghìn (`.`)** và **dấu phẩy thập phân (`,`)** trực tiếp trong lúc người dùng gõ phím.
- Files: `src/components/FormattedNumberInput.tsx`, `src/components/TransactionModal.tsx`, `src/components/ProductModal.tsx`

---

*Cập nhật tự động bởi update-docs*
