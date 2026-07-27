# Nhật Ký Công Việc & Trạng Thái Phát Triển (Quản Lý NXT)

Tài liệu này lưu trữ tiến độ thực hiện, cấu trúc mã nguồn và danh sách việc cần làm tiếp theo.

---

## 1. Trạng Thái Đã Hoàn Thành (Phiên Làm Việc Mới Nhất)

### A. Dọn dẹp & Reset Dữ Liệu Mẫu
- **Code mẫu khởi tạo**: Đã đưa các mảng dữ liệu mẫu `INITIAL_WAREHOUSES`, `INITIAL_PRODUCTS`, `INITIAL_TRANSACTIONS` trong `src/data/mockData.ts` về trống `[]`.
- **Nút Xóa Dữ Liệu Nhanh**: Thêm nút màu đỏ **Xóa Dữ Liệu** trên thanh Header cho phép xóa sạch LocalStorage trên máy người dùng bằng 1 click.
- **Đồng bộ GitHub**: Đã commit & push bản cập nhật lên repo gốc `QuanLyNXT`.

### B. Chuyển Đổi Sang Kiến Trúc Google Apps Script (GAS WebApp)
- **Tạo Dự Án Mới**: Đã nhân bản toàn bộ mã nguồn sang thư mục độc lập `d:\Project\QuanLyNXT_GAS`.
- **Mã nguồn GAS Backend (`google_apps_script.gs`)**: 
  - Tạo sẵn file script chứa toàn bộ logic xử lý `doPost`, `doGet`.
  - Tự động tạo và ghi dữ liệu lên 4 sheet: `DANH_MUC_KHO`, `DANH_MUC_SAN_PHAM`, `NHAP_XUAT_KHO`, `NHAT_KY_HOAT_DONG`.
  - Hỗ trợ kiểm tra **Mã PIN bảo mật** và tự động format ngày tháng.
- **Cập nhật Frontend trong `QuanLyNXT_GAS`**:
  - Thêm ô cấu hình **Google Apps Script WebApp URL** trong giao diện đồng bộ (`GoogleSheetsSyncView.tsx`).
  - Cập nhật logic `handleSyncUp` & `handleSyncDown` trong `App.tsx` gọi trực tiếp tới GAS WebApp endpoint mà không qua Server Vercel (khắc phục hoàn toàn lỗi CORS & Lỗi 500).
- **Kiểm tra Build**: Đã chạy `npm run build` thành công trên dự án `QuanLyNXT_GAS`.

---

## 2. Các Bước Cần Làm Tiếp Theo

### Bước 1: Deploy & Kết Nối Google Apps Script
1. Mở Google Sheet -> Chọn **Extensions** (Mở rộng) -> **Apps Script**.
2. Copy mã từ [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) dán vào Apps Script.
3. Chọn **Triển khai (Deploy)** -> **Web App**:
   - *Execute as*: `Me`
   - *Who has access*: `Anyone`
4. Lấy **Web App URL** paste vào ô cấu hình trong tab *Đồng bộ Google Sheets* trên ứng dụng web `QuanLyNXT_GAS`.

### Bước 2: Test Luồng Nhập/Xuất Dữ Liệu Thật
1. Thực hiện thêm sản phẩm mới / kho mới / tạo phiếu nhập kho thật trên giao diện web.
2. Bấm nút **Đẩy Dữ Liệu Lên Sheet** và kiểm tra các tab trang tính trên Google Sheet đã tự tạo và ghi nhận đầy đủ chưa.
3. Thử sửa 1 ô trên Google Sheet rồi bấm **Tải Dữ Liệu Từ Sheet Về App** để kiểm tra đồng bộ 2 chiều.

---

## 3. Ý Tưởng Phát Triển & Cải Tiến Tiếp Theo

1. **Phân Quyền Chi Tiết Theo Mã PIN trong GAS**:
   - Mở rộng hàm `doPost` trong file Apps Script để đọc tab `PHAN_QUYEN` (chứa cặp `Email` + `Mã PIN` + `Quyền: Admin/Edit/View`).
   - Nếu tài khoản chỉ có quyền `View` -> Chặn lệnh `SYNC_UP` (chỉ cho phép `SYNC_DOWN`).
2. **Đồng Bộ Tự Động (Auto-Sync Realtime)**:
   - Thêm tùy chọn "Tự động đẩy dữ liệu sau mỗi thao tác" (khi bấm lưu sản phẩm hoặc tạo phiếu nhập/xuất sẽ gọi API ngầm lên GAS).
3. **Quản Lý Lịch Sử & Undo (Khôi Phục Phiếu)**:
   - Lưu trữ vết chỉnh sửa chi tiết các dòng phiếu nhập/xuất trong tab `NHAT_KY_HOAT_DONG` để tra cứu khi cần.

