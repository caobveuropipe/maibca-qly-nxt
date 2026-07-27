---
source: feature-review
feature: formatted-number-input
round: 1
timestamp: 2026-07-28T06:51:50Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: formatted-number-input

## Findings

### FR-01: Định dạng số mượt mà chuẩn vi-VN
- **Severity**: Low
- **Confidence**: High
- **Issue**: HTML5 `<input type="number">` không cho phép hiển thị dấu chấm phân cách hàng nghìn.
- **Evidence**: Ảnh chụp người dùng gõ `1000` không có phân cách.
- **Impact**: Người dùng dễ nhầm lẫn số lượng 1.000 với 10.000 hoặc 100.000.
- **Required Fix**: Chuyển ô nhập thành `<input type="text" inputMode="numeric">` và sử dụng regex/Intl.NumberFormat để tự động chèn dấu chấm phân cách hàng nghìn (`1.000.000`).

## Khuyến nghị không chặn rollout
- Giữ nguyên sự kiện `onKeyDown` cho phím `Enter` để tính năng gõ Enter tự tạo dòng mới không bị ảnh hưởng.

## Cần xác thực thêm
- Không có.
