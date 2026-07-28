---
source: feature-review
feature: rbac-auto-config
round: 1
timestamp: 2026-07-28T06:58:30Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: rbac-auto-config

## Findings

### FR-01: Auto-Connect qua Link URL Query Parameter
- **Severity**: Low
- **Confidence**: High
- **Issue**: Nhân viên chuyển máy hoặc dùng thiết bị mới phải dán lại URL thủ công.
- **Evidence**: `localStorage` độc lập trên mỗi máy/trình duyệt.
- **Impact**: Loại bỏ 100% rào cản setup cho nhân viên. Nhân viên chỉ mở link là dùng được ngay.
- **Required Fix**: Thêm `URLSearchParams` đọc `gasUrl` khi `App.tsx` mount và gọi `window.history.replaceState` để giữ sạch URL.

### FR-02: Phân Quyền 3 Vai Trò (ADMIN, EDITOR, VIEWER)
- **Severity**: Medium
- **Confidence**: High
- **Issue**: Nhân viên có thể lỡ tay bấm Xóa dữ liệu hoặc đổi nhầm cấu hình Google Sheet.
- **Evidence**: Giao diện cũ hiển thị tất cả các nút Thêm/Sửa/Xóa cho mọi đối tượng.
- **Impact**: Bảo vệ sự an toàn và ổn định cho hệ thống dữ liệu.
- **Required Fix**: Áp dụng cờ `role` để ẩn các nút nhạy cảm khi vai trò là `EDITOR` hoặc `VIEWER`.

## Khuyến nghị không chặn rollout
- Mặc định vai trò ban đầu là `ADMIN` trên máy setup đầu tiên, mã PIN Admin mặc định là `123456`.

## Cần xác thực thêm
- Không có.
