---
source: feature-review
feature: collapsible-sidebar-layout
round: 1
timestamp: 2026-07-28T08:53:51Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: collapsible-sidebar-layout

## Findings

### FR-01: Chuyển Toàn Bộ Header & Actions Sang Sidebar Thu Gọn
- **Severity**: Low
- **Confidence**: High
- **Issue**: Header ngang dầy chiếm nhiều diện tích chiều cao. Người dùng cần thu gọn lại để tăng tối đa không gian cho các bảng dữ liệu.
- **Evidence**: Ảnh chụp màn hình đỏ khoanh toàn bộ Header + Yêu cầu "đưa toàn bộ vào sidebar để ẩn đi khi cần, dùng diện tích hiển thị cho nội dung các bảng".
- **Impact**: Tối ưu 95%+ diện tích màn hình hiển thị bảng báo cáo, danh sách sản phẩm và nhật ký kho.
- **Required Fix**: Tạo `Sidebar.tsx` và nâng cấp layout trong `App.tsx`.

## Khuyến nghị không chặn rollout
- Lưu trạng thái thu gọn vào LocalStorage (`nxt_sidebar_collapsed_v1`).

## Cần xác thực thêm
- Không có.
