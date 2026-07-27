# Nhật Ký Công Việc & Trạng Thái Phát Triển (Quản Lý NXT)

Tài liệu này lưu trữ tiến độ thực hiện, cấu trúc mã nguồn và danh sách việc cần làm tiếp theo.

---

## 1. Trạng Thái Đã Hoàn Thành

### A. Dọn dẹp & Reset Dữ Liệu Mẫu
- **Code mẫu khởi tạo**: Đã đưa các mảng `INITIAL_WAREHOUSES`, `INITIAL_PRODUCTS`, `INITIAL_TRANSACTIONS` về trống `[]`.
- **Nút Xóa Dữ Liệu Nhanh**: Thêm nút màu đỏ **Xóa Dữ Liệu** trên Header.

### B. Kiến Trúc Google Apps Script (GAS WebApp)
- **GAS Backend (`google_apps_script.gs`)**:
  - `doPost` xử lý `SYNC_UP`, `SYNC_DOWN`, `PING`.
  - `SYNC_UP`: Ghi dữ liệu lên 4 sheet: `DANH_MUC_KHO`, `DANH_MUC_SAN_PHAM`, `NHAP_XUAT_KHO`, `NHAT_KY_HOAT_DONG`.
  - `SYNC_DOWN`: Đọc dữ liệu từ sheet về app.
  - ✅ **Fix quan trọng**: Thêm cột `ID (Hệ Thống)` vào tất cả sheet để Sync Down khớp đúng `warehouseId`, `productId`. Backward compatible với format sheet cũ.
  - Header row tự động in đậm + nền đen + auto-resize cột.
  - Bảo mật PIN (`DEFAULT_AUTH_PIN = "123456"`).
- **GAS WebApp URL đang deploy**:
  ```
  https://script.google.com/macros/s/AKfycbzNuC3kUO_pYSSlB5XMUoIttKZoZo42dxxZKhf_Mg6j9tlbGpteqkG_-ZiBTQvZig0qmw/exec
  ```
- **Frontend**:
  - URL GAS nhúng sẵn trong code (App.tsx dòng 39 + storageUtils.ts).
  - Ô nhập URL GAS trên tab Đồng Bộ Google Sheets.
  - `handleSyncUp` / `handleSyncDown` gọi thẳng GAS endpoint (không qua Vercel server).

### C. Quản Lý Nhóm Hàng Động
- **CategoryManagerModal**: Modal thêm/xóa nhóm hàng từ UI.
- **Lưu localStorage**: Danh mục lưu vào `nxt_inventory_categories_v1`.
- **ProductModal**: Dropdown Nhóm Hàng dùng danh sách động từ state.
- **ProductsView**: Nút "Nhóm Hàng (N)" màu tím mở modal quản lý.

---

## 2. Cần Làm Ngay

### 🔴 Bước Quan Trọng: Cập nhật GAS Script trên Google
> **GAS Script đã được cải thiện**, bạn cần **paste lại** nội dung mới từ file
> [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs)
> vào Google Apps Script Editor và **Deploy lại** (New deployment) để áp dụng.

**Lý do quan trọng**: Script mới thêm cột ID vào sheet → Sync Down sẽ khớp đúng dữ liệu.

### Sau khi update GAS:
1. Vào tab **Đồng Bộ Google Sheets** trên app.
2. Bấm **Đẩy Dữ Liệu Lên Sheet** → kiểm tra Google Sheet có các cột mới chưa.
3. Bấm **Tải Dữ Liệu Từ Sheet Về** → kiểm tra dữ liệu trở về app đúng không.

---

## 3. Ý Tưởng Phát Triển Tiếp Theo

1. **Ô nhập Mã PIN** trong giao diện Đồng Bộ → gửi kèm khi sync để bảo mật.
2. **Quản lý Đơn Vị Tính (DVT) động** — giống Nhóm Hàng vừa làm.
3. **Auto-Sync**: Tự động đẩy dữ liệu sau mỗi lần lưu phiếu/sản phẩm.
4. **Cải thiện Báo Cáo NXT**: Thêm biểu đồ, xuất PDF đẹp hơn.
5. **Phân Quyền theo PIN**: Tab `PHAN_QUYEN` trên Sheet chứa `Email + PIN + Quyền`.
