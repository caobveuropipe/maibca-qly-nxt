# Feature Plan: Tự Động Đồng Bộ Realtime (Auto Realtime Sync)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: auto-realtime-sync
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Hiện tại ứng dụng yêu cầu người dùng bấm nút thủ công "Đẩy dữ liệu" hoặc "Tải dữ liệu" để đồng bộ với Google Sheets. Điều này khiến ứng dụng không đạt được trạng thái Realtime khi nhiều người cùng thao tác.
- **Vấn đề cần giải quyết:** Tự động hóa quá trình đồng bộ 2 chiều ngầm (Background Sync) mà không làm gián đoạn trải nghiệm người dùng hoặc gây tràn request.
- **Mục tiêu:**
  1. **Auto-Push Ngầm:** Tự động đẩy dữ liệu lên Google Sheets ngay sau khi Tạo/Sửa/Xóa Sản phẩm, Kho, Phiếu nhập xuất (với debounce 1.5s).
  2. **Auto-Pull Định Kỳ:** Tự động tải dữ liệu mới nhất từ Google Sheets về ứng dụng mỗi 30 giây ngầm.
  3. **Công Tắc Realtime:** Thêm Toggle công tắc `Tự Động Đồng Bộ Realtime` trên giao diện Cấu hình Google Sheet.
- **Kết quả mong đợi:** Người dùng bật công tắc Tự động đồng bộ là toàn bộ thao tác thêm/sửa/xóa tự nhảy dữ liệu lên Google Sheet và tự kéo dữ liệu mới về không cần bấm nút.

## 2. Phạm vi

### In scope
- Thêm logic Auto-Push ngầm (Debounced Auto-SyncUp) khi state thay đổi trong [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx).
- Thêm `useEffect` interval (Polling mỗi 30 giây) tự động gọi Auto-SyncDown ngầm.
- Thêm UI Toggle Switch `Tự Động Đồng Bộ Realtime` trong [src/components/GoogleSheetsSyncView.tsx](file:///d:/Project/QuanLyNXT/src/components/GoogleSheetsSyncView.tsx).
- Lưu trạng thái `autoSync: true/false` vào LocalStorage để ghi nhớ lựa chọn của người dùng.

### Out of scope
- Sử dụng WebSocket hay Server-Sent Events (Google Apps Script WebApp chỉ hỗ trợ REST HTTP polling/push).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tiếp tục duy trì Kiến trúc Thuần GAS (Pure GAS) kết nối trực tiếp Client sang WebApp GAS không qua Node backend proxy.
- **"Cấm kỵ" cần tránh:** Không gọi sync quá dày đặc gây nghẽn mạng; bắt buộc dùng Debounce (1.5s) cho Auto-Push để gom các thao tác liên tục.
- **Ràng buộc kiến trúc:** Bỏ qua báo lỗi nếu Auto-Pull ngầm gặp sự cố mạng chớp nhoáng (silent retry) để không quấy rầy người dùng đang thao tác.

## 4. Giả định và câu hỏi mở

### Giả định
- Người dùng đã điền đúng URL GAS WebApp hợp lệ và chọn `Anyone`.

### Câu hỏi mở
- Chu kỳ Auto-Pull ngầm: 30 giây là tối ưu.

## 5. Acceptance Criteria

- [ ] Khi bật "Tự Động Đồng Bộ Realtime", thêm phiếu nhập/xuất mới ➔ Dữ liệu tự động đẩy lên Google Sheet trong vòng 2 giây mà không cần bấm nút.
- [ ] Khi bật "Tự Động Đồng Bộ Realtime", mỗi 30s ứng dụng tự động kiểm tra và kéo dữ liệu mới từ Sheet về.
- [ ] Có biểu tượng indicator hiển thị trạng thái đồng bộ ngầm (Đang đồng bộ ngầm / Đã đồng bộ realtime).
- [ ] Người dùng có thể Tắt/Bật chế độ này bất kỳ lúc nào.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Thêm debounce auto-push & Polling useEffect | 🟢 Thấp | Giữ nguyên logic sync cũ |
| [src/components/GoogleSheetsSyncView.tsx](file:///d:/Project/QuanLyNXT/src/components/GoogleSheetsSyncView.tsx) | Sửa | Thêm Toggle Switch Realtime & Badge trạng thái | 🟢 Thấp | Giữ nguyên UI hiện tại |
| [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts) | Sửa | Đảm bảo `autoSync` type chuẩn trong GoogleSyncConfig | 🟢 Thấp | Type definition |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Tránh vòng lặp vô hạn (Infinite Loop Sync) giữa Auto-Push và Auto-Pull.
- **Review focus areas:** Đảm bảo flag `isSyncing` và `isBackgroundSync` phân biệt rõ ràng không gây giật lag UI.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Thêm UI Toggle Switch Auto Sync & Logic Debounce Auto-Push ngầm.
  - **Phase 2:** Thêm Auto-Pull Polling 30s ngầm & Kiểm thử End-to-End.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Thêm phiếu mới -> Quan sát Google Sheet cập nhật tự động trong 2s.

## 10. Rollback Plan

- Tắt công tắc `autoSync: false` hoặc revert commit.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/auto-realtime-sync/FEATURE_TASKS.md)
