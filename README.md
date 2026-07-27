# IMS PRO V2.4 - Quản Lý Nhập Xuất Tồn Kho (Thuần GAS)

Ứng dụng Web quản lý kho hàng (Nhập - Xuất - Tồn kho) kết nối đồng bộ 2 chiều trực tiếp với Google Sheets thông qua **Google Apps Script (Thuần GAS)**.

---

## 🚀 Tính Năng Chính
- **Quản lý danh mục Kho & Sản phẩm:** Tạo, sửa, xóa, theo dõi tồn tối thiểu / tồn tối đa.
- **Lập phiếu Nhập / Xuất kho:** Tự động tạo mã phiếu, tính thành tiền, lưu nhật ký xuất nhập.
- **Đồng bộ 2 chiều Google Sheets (Thuần GAS):** 
  - `Đẩy dữ liệu lên Sheet (Sync Up)`: Đẩy toàn bộ dữ liệu từ ứng dụng lên Google Sheet.
  - `Tải dữ liệu từ Sheet về (Sync Down)`: Cập nhật dữ liệu từ Google Sheet về ứng dụng.
- **Xuất Báo cáo & Chứng từ:** In chi tiết phiếu nhập/xuất PDF và xuất danh mục Excel.

---

## 📋 Hướng Dẫn Triển Khai Backend Google Apps Script (Thuần GAS)

1. Mở trang Google Sheet của bạn trên Google Drive.
2. Vào menu **Tiện ích mở rộng (Extensions)** ➔ Chọn **Apps Script**.
3. Copy toàn bộ nội dung mã nguồn file [`google_apps_script.gs`](./google_apps_script.gs) trong dự án và dán vào cửa sổ làm việc Apps Script.
4. Bấm biểu tượng **Save (Lưu)**.
5. Nhấp nút **Triển khai (Deploy)** ở góc trên bên phải ➔ Chọn **Triển khai dưới dạng ứng dụng web (New deployment)**.
6. Cấu hình cài đặt triển khai:
   - **Loại triển khai (Select type):** `Ứng dụng web (Web app)`
   - **Thực thi dưới tên (Execute as):** `Tôi (Me)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)` ⚠️ *(Bắt buộc chọn Anyone để ứng dụng gửi request thành công)*
7. Bấm **Triển khai (Deploy)** và cấp quyền truy cập tài khoản Google nếu được yêu cầu.
8. Copy đường dẫn **URL ứng dụng web (Web App URL)** có dạng:
   `https://script.google.com/macros/s/AKfycbx.../exec`
9. Dán URL này vào mục **Cấu hình liên kết Google Sheet** trong ứng dụng để sử dụng đồng bộ.

---

## 💻 Hướng Dẫn Chạy Local (Development)

1. Cài đặt các thư viện:
   ```bash
   npm install
   ```
2. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt tại địa chỉ: `http://localhost:3000`

---

## 📦 Build Production (Deploy Static Host)

```bash
npm run build
```
Thư mục sau khi build là `dist/`. Bạn có thể deploy thư mục `dist/` trực tiếp lên Vercel, GitHub Pages, Netlify hoặc bất kỳ Web Server tĩnh nào.
