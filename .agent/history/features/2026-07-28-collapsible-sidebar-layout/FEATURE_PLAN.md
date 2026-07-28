# Feature Plan: Chuyển Thanh Menu & Thao Tác Sang Sidebar Thu Gọn / Ẩn Nhanh (Collapsible Sidebar Layout)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: collapsible-sidebar-layout
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Hiện tại ứng dụng sử dụng Header ngang cố định phía trên chiếm nhiều diện tích màn hình. Người dùng yêu cầu **chuyển toàn bộ Header, thanh Menu tab, thông tin phân quyền và các nút thao tác (+ Phiếu Nhập, + Phiếu Xuất, Bảng Phân Quyền, Nhập Excel...) sang Sidebar bên trái có thể thu gọn / ẩn đi khi cần** nhằm dành 95%+ diện tích màn hình cho nội dung các bảng dữ liệu.
- **Vấn đề cần giải quyết:**
  1. Header ngang dầy chiếm diện tích chiều cao hiển thị các bảng báo cáo và nhật ký kho.
  2. Cần thanh Sidebar dọc gọn gàng có nút Thu gọn/Mở rộng (`ChevronLeft` / `ChevronRight` / Hamburger).
  3. Khi thu gọn, Sidebar thu nhỏ về dạng icon (64px), nhường trọn không gian cho dữ liệu.
- **Mục tiêu:**
  1. **Component `Sidebar.tsx`:** Chứa Branding, Thông tin User Logged-in & Role Badge, Menu Chuyển Tab (Báo Cáo, Sản Phẩm, Kho Hàng, Nhật Ký, Đồng Bộ Sheets), và các Nút Thao Tác Nhanh (+ Phiếu Nhập, + Phiếu Xuất, Nhập Excel, Bảng Phân Quyền, Xóa Dữ Liệu).
  2. **Trạng Thái Thu Gọn (Collapse State):** Lưu trạng thái `isCollapsed` vào LocalStorage. Bấm nút thu gọn ➔ Sidebar co lại còn 64px icon, diện tích xem bảng tăng tối đa.
  3. **Tối Ưu Layout Trong `App.tsx`:** Thay thế Header ngang cũ bằng bố cục `Sidebar + Top Bar Nhẹ (48px) + Main Workspace Rộng`.

## 2. Phạm vi

### In scope
- Tạo mới component [src/components/Sidebar.tsx](file:///d:/Project/QuanLyNXT/src/components/Sidebar.tsx).
- Cập nhật [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) tích hợp Sidebar layout và Mini TopBar.
- Đảm bảo responsive mượt mà trên cả Desktop, Tablet và Mobile.
- Lưu trạng thái thu gọn Sidebar vào LocalStorage.

### Out of scope
- Không làm thay đổi logic các màn hình báo cáo, danh sách sản phẩm hay phiếu nhập xuất.

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tiếp tục duy trì Thiết kế Premium, Dark Mode mượt mà và Phân Quyền Scoped UI chuẩn xác.
- **"Cấm kỵ" cần tránh:** Không làm vỡ layout các bảng dữ liệu khi thu gọn/mở rộng Sidebar.

## 4. Giả định và câu hỏi mở

### Giả định
- Mặc định trên màn hình Desktop lớn Sidebar sẽ mở rộng, trên mobile tự động thu gọn để tối ưu không gian.

## 5. Acceptance Criteria

- [ ] Người dùng thấy thanh Sidebar bên trái gọn gàng chứa toàn bộ Menu và các Nút Thao Tác.
- [ ] Người dùng bấm nút **Thu Gọn (Collapse)** ➔ Sidebar co về 64px icon ➔ Bảng dữ liệu mở rộng tối đa màn hình.
- [ ] Các nút `+ Phiếu Nhập`, `+ Phiếu Xuất`, `Nhập Excel`, `Bảng Phân Quyền`, `Đồng Bộ Sheets`, `Đăng Xuất` hoạt động hoàn hảo từ Sidebar.
- [ ] Khi F5 làm mới trang ➔ Trạng thái ẩn/hiện Sidebar được giữ nguyên.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/components/Sidebar.tsx](file:///d:/Project/QuanLyNXT/src/components/Sidebar.tsx) | Tạo mới | Sidebar thu gọn chứa Menu & Actions | 🟢 Thấp | Sidebar UI |
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Tích hợp Sidebar layout mới | 🟢 Thấp | Main Layout |
| [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) | Giữ lại / Refactor | Dùng làm Mini TopBar nhẹ | 🟢 Thấp | TopBar UI |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo responsive tốt trên điện thoại di động (Drawer Overlay).
- **Review focus areas:** Trải nghiệm đóng mở Sidebar mượt mà với Tailwind transition.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Tạo `Sidebar.tsx` với giao diện Đóng/Mở mượt mà & đủ các chức năng.
  - **Phase 2:** Tích hợp Sidebar layout vào `App.tsx`, kiểm tra responsiveness & build verification.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Thao tác thu gọn Sidebar -> Bảng dữ liệu mở rộng -> Bấm các nút + Phiếu Nhập, + Phiếu Xuất từ Sidebar -> Verify hoạt động 100%.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/collapsible-sidebar-layout/FEATURE_TASKS.md)
