---
source: feature-review
feature: modal-ux-improvement
round: 1
timestamp: 2026-07-28T06:49:10Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: modal-ux-improvement

## Findings

### FR-01: Tính toán vị trí Popover khi dùng Position Fixed
- **Severity**: Medium
- **Confidence**: High
- **Issue**: Khi dùng `fixed` position, nếu trang web hoặc container cuộn, popover cần được tính toán đúng tọa độ `top` và `left` dựa trên `getBoundingClientRect()` của nút kích hoạt.
- **Evidence**: `SearchableSelect.tsx` trước đây dùng `absolute` nên bị `overflow-x-auto` của container bảng tính che khuất.
- **Impact**: Loại bỏ hoàn toàn lỗi bị ẩn/khuyết danh sách chọn Kho & Sản phẩm.
- **Required Fix**: Tính toán `coords` khi `isOpen` thay đổi và gắn listener lắng nghe `scroll` & `resize`.

## Khuyến nghị không chặn rollout
- Mở rộng chiều rộng modal lên `max-w-7xl` để tận dụng màn hình máy tính lớn.

## Cần xác thực thêm
- Không có.
