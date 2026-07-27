---
source: feature-review
feature: auto-realtime-sync
round: 1
timestamp: 2026-07-28T06:42:10Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: auto-realtime-sync

## Findings

### FR-01: Ngăn ngừa Vòng Lặp Đồng Bộ Vô Hạn (Infinite Sync Loop)
- **Severity**: Medium
- **Confidence**: High
- **Issue**: Khi Auto-Pull 30s lấy dữ liệu mới từ Sheet về, nếu update state triggers Auto-Push lại ngay lập tức, sẽ tạo thành vòng lặp vô hạn.
- **Evidence**: State setter (`updateProducts`, `updateWarehouses`, `updateTransactions`) kích hoạt hiệu ứng phụ.
- **Impact**: Tốn tài nguyên mạng và quota Google Apps Script.
- **Required Fix**: Sử dụng flag `isSyncingRef` hoặc cờ `skipAutoPush` khi dữ liệu được nạp từ Auto-Pull về.

### FR-02: Debounce 1.5 giây cho Auto-Push
- **Severity**: Low
- **Confidence**: High
- **Issue**: Người dùng tạo nhiều phiếu nhập liên tiếp trong vài giây.
- **Impact**: Nếu không debounce, sẽ phát sinh nhiều HTTP requests dồn dập sang GAS WebApp.
- **Required Fix**: Sử dụng `setTimeout` debounce 1500ms gom tất cả thay đổi trong 1.5s thành 1 request duy nhất.

## Khuyến nghị không chặn rollout
- Mặc định chọn `autoSync: true` khi đã điền URL WebApp GAS hợp lệ.

## Cần xác thực thêm
- Không có issue nghi ngờ nào.
