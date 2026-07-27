# Feature Plan: Cải Tiến Giao Diện & Khắc Phục Khung Nhập Phiếu (Modal UX Improvement)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: modal-ux-improvement
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Khi lập phiếu Nhập/Xuất kho trong [TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx), không gian bảng nhập bị hạn chế (modal hẹp, chiều cao bảng ngắn) và danh sách chọn Kho/Sản phẩm trong `SearchableSelect` bị khung bảng (`overflow-x-auto`) cắt ngang làm ẩn một phần tùy chọn.
- **Vấn đề cần giải quyết:**
  1. Dropdown chọn Kho & Sản phẩm bị che/khuyết bởi khung viền bảng tính.
  2. Không gian lập phiếu bị hẹp, gây cảm giác tù túng cho người dùng.
- **Mục tiêu:**
  1. **Thoát Khung Dropdown (Fixed Floating Popover):** Nâng cấp `SearchableSelect` sử dụng `fixed` positioning theo vị trí `getBoundingClientRect()` để menu danh sách nổi hoàn toàn lên trên cùng (`z-[9999]`), không bao giờ bị cắt bởi viền bảng hay thanh cuộn.
  2. **Mở Rộng Không Gian Bảng Tính (Expanded Layout):** Mở rộng chiều rộng modal lên `max-w-7xl` (96% màn hình), tăng chiều cao bảng nhập chi tiết mặt hàng lên `max-h-[60vh]`, thu gọn header thuộc tính phiếu để tối ưu diện tích cho bảng dữ liệu.
- **Kết quả mong đợi:** Giao diện lập phiếu rộng rãi như Excel thật, danh sách chọn Kho/Sản phẩm mở ra mượt mà nổi lên trên mọi khung viền.

## 2. Phạm vi

### In scope
- Nâng cấp [src/components/SearchableSelect.tsx](file:///d:/Project/QuanLyNXT/src/components/SearchableSelect.tsx) hỗ trợ `fixed` floating position khi mở dropdown.
- Mở rộng kích thước container modal và bảng tính trong [src/components/TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx).
- Tối ưu hóa padding, spacing và responsive layout cho các thiết bị màn hình desktop và tablet.

### Out of scope
- Thay đổi cấu trúc dữ liệu phiếu nhập/xuất.

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Giữ nguyên quy trình chọn sản phẩm, tính tồn kho realtime và phím tắt `Enter` thêm dòng.
- **"Cấm kỵ" cần tránh:** Không làm vỡ layout responsive trên điện thoại di động.

## 4. Giả định và câu hỏi mở

### Giả định
- Sử dụng `fixed` position kết hợp với `window.addEventListener('scroll')` và `window.addEventListener('resize')` để tự động đóng/cập nhật vị trí popover.

## 5. Acceptance Criteria

- [ ] Danh sách chọn Kho và Sản phẩm trong bảng nhập phiếu nổi hoàn toàn lên trên, không bị khung bảng hay thanh cuộn cắt bớt.
- [ ] Modal lập phiếu rộng rãi (`max-w-7xl`), hiển thị tối thiểu 6-8 dòng hàng mà không phải cuộn nhiều.
- [ ] Khi cuộn trang hoặc cuộn bảng, dropdown tự động đóng hoặc cập nhật vị trí mượt mà.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/components/SearchableSelect.tsx](file:///d:/Project/QuanLyNXT/src/components/SearchableSelect.tsx) | Sửa | Nâng cấp Fixed Floating Dropdown Position | 🟢 Thấp | Giữ nguyên props interface |
| [src/components/TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx) | Sửa | Mở rộng khung modal `max-w-7xl`, tăng chiều cao bảng tính | 🟢 Thấp | Giữ nguyên form submit logic |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Vị trí `fixed` của dropdown khi cuộn bảng hoặc cuộn trang.
- **Review focus areas:** Đảm bảo popover tính toán đúng `top`, `left`, `width` dựa trên trigger element rect.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Refactor `SearchableSelect` với Fixed Floating Dropdown.
  - **Phase 2:** Mở rộng Modal layout `TransactionModal.tsx` & Verify UI.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Mở Modal lập phiếu -> Thử mở dropdown chọn Kho & Sản phẩm tại dòng cuối cùng -> Kiểm tra menu nổi mượt không bị ẩn.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/modal-ux-improvement/FEATURE_TASKS.md)
