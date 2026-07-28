# Changelog FE - Quản Lý Nhập Xuất Tồn Kho

> Phạm vi: Frontend, UI, UX, state client, routing, hiển thị, validation phía client
> Format: [Conventional Commits](https://www.conventionalcommits.org/)
> Ngôn ngữ: Tiếng Việt

---

## 2026-07-28

### feat: Giao Diện Sidebar Thu Gọn / Ẩn Nhanh Tối Ưu Diện Tích Hiển Thị Bảng (`Sidebar.tsx`)
- **Chuyển đổi toàn bộ Header dầy cũ sang Sidebar dọc bên trái**:
  - Tích hợp Branding Logo, Email Người Dùng, Badge Vai Trò, Menu Chuyển Tab (Báo Cáo, Sản Phẩm, Kho Hàng, Nhật Ký NX, Đồng Bộ Sheets).
  - Tích hợp các Nút Thao Tác Nhanh (`+ Phiếu Nhập`, `+ Phiếu Xuất`, `Nhập Excel`, `Bảng Phân Quyền`, `Đồng Bộ Sheets`, `Xóa Dữ Liệu`).
- **Cơ chế Thu Gọn / Mở Rộng 1-Click (Collapsible State Engine)**:
  - Bấm nút thu gọn ➔ Sidebar co về 64px icon ➔ Tăng diện tích hiển thị cho các bảng dữ liệu lên 95%+.
  - Lưu trạng thái thu gọn vào `localStorage` (`nxt_sidebar_collapsed_v1`) để giữ nguyên bố cục khi F5 làm mới trang.
- Thay thế Header ngang cũ bằng **Mini TopBar siêu nhẹ (44px)**.
- Files: `src/components/Sidebar.tsx`, `src/App.tsx`

---

*Cập nhật tự động bởi update-docs*
