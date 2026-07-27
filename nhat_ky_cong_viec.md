# Nhật Ký Công Việc & Trạng Thái Phát Triển (Quản Lý NXT)

Tài liệu này lưu trữ lại tiến độ thực hiện và phương án thiết kế để tiếp tục triển khai trong phiên làm việc tiếp theo.

---

## 1. Trạng Thái Hiện Tại (Đã Hoàn Thành)
* **Cấu hình Vercel**: Đã tạo file `vercel.json` và cập nhật `server.ts` để ứng dụng Express chạy được dưới dạng Serverless Functions trên Vercel.
* **Mã nguồn đã đồng bộ**: Toàn bộ code frontend và backend mới nhất đã được đẩy lên kho GitHub `https://github.com/caobveuropipe/maibca-qly-nxt.git` (nhánh `main`).
* **Hàm bổ trợ Backend**: Đã viết các hàm tự động tạo sheet `PHAN_QUYEN`, `NHAT_KY_HOAT_DONG` (giới hạn 100 dòng log để tiết kiệm dung lượng) khi thực hiện đồng bộ.

---

## 2. Vấn Đề Gặp Phải (OAuth Google Sign-in)
* Khi deploy lên Vercel, việc sử dụng nút đăng nhập Google OAuth bị lỗi `Lỗi 400: origin_mismatch` vì domain Vercel thực tế chưa được khai báo/ủy quyền trong mục *Authorized JavaScript origins* của Google Cloud Client ID (`955514155607-...`).
* Do Client ID mặc định thuộc quản lý của hệ thống AI Studio mẫu, người dùng không có quyền truy cập trực tiếp vào Google Cloud Console tương ứng để thêm domain mới.

---

## 3. Giải Pháp Đề Xuất Cho Bước Tiếp Theo

### Phương án: Thay thế đăng nhập Google OAuth bằng xác thực Email + Mã PIN bí mật (Passcode)
Thay vì sử dụng luồng đăng nhập Google OAuth phức tạp, hệ thống sẽ xác thực người dùng dựa trên thông tin khớp từ sheet `PHAN_QUYEN`.

#### Kịch bản hoạt động:
1. **Trong sheet `PHAN_QUYEN`**:
   * Thêm một cột mới đặt tên là `Mã PIN` (chứa các mã PIN tương ứng cho từng email, ví dụ: `123456`).
2. **Tại Frontend (Ứng dụng)**:
   * Loại bỏ nút "Đăng nhập bằng Google".
   * Thêm một form đăng nhập đơn giản gồm 2 ô nhập: **Email** và **Mã PIN**.
   * Khi người dùng điền thông tin và nhấn "Xác thực", thông tin Email và Mã PIN sẽ được lưu vào `localStorage`.
3. **Tại Backend (API)**:
   * Khi nhận request đồng bộ (Sync Up/Sync Down), backend sẽ đọc sheet `PHAN_QUYEN`.
   * So sánh Email và Mã PIN gửi lên từ client với danh sách trong sheet:
     * Nếu **khớp**: Cho phép thực hiện đồng bộ và tiến hành phân quyền (Admin/Edit) tương ứng theo từng tab.
     * Nếu **không khớp hoặc sai mã PIN**: Trả về lỗi chặn truy cập `403 Forbidden`.
   * Ghi log thao tác thành công/thất bại kèm theo email người thực hiện vào sheet `NHAT_KY_HOAT_DONG`.
