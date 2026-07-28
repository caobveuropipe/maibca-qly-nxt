# Feature Plan: Phân Quyền Vai Trò (ADMIN / EDITOR / VIEWER) & Tự Động Kết Nối Qua Link (RBAC & Auto Config)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: rbac-auto-config
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Hiện tại ứng dụng yêu cầu nhập cấu hình WebApp URL thủ công trên từng máy/trình duyệt và chưa có phân quyền. Khi nhân viên khác mở ứng dụng, họ phải thiết lập lại từ đầu và có nguy cơ lỡ tay xóa/sửa dữ liệu hệ thống.
- **Vấn đề cần giải quyết:**
  1. Loại bỏ hoàn toàn việc phải setup lại URL khi chuyển máy/trình duyệt bằng cơ chế **Auto-Connect qua URL Query Parameter**.
  2. Phân quyền người dùng thành 3 vai trò rõ ràng: **ADMIN** (Quản trị hệ thống), **EDITOR** (Nhân viên Nhập/Xuất kho), **VIEWER** (Xem báo cáo).
- **Mục tiêu:**
  1. **Link Chia Sẻ Tự Động Kết Nối:** Thêm nút "Copy Link Chia Sẻ Cho Nhân Viên". Khi nhân viên mở link, ứng dụng tự động lưu URL và kết nối ngầm 100%.
  2. **Hệ Thống Phân Quyền 3 Cấp (RBAC):**
     - **ADMIN:** Đầy đủ quyền quản trị (Cấu hình Sheet, Xóa dữ liệu, Quản lý tài khoản/PIN).
     - **EDITOR:** Quyền Tạo/Sửa phiếu nhập xuất & sản phẩm. Ẩn tab Cấu hình Sheet và nút Xóa dữ liệu.
     - **VIEWER:** Chế độ Read-Only (Chỉ xem Báo Cáo NXT, Thẻ Kho, Danh Mục). Ẩn tất cả nút Thêm/Sửa/Xóa.
  3. **Xác Thực Mã PIN Quản Trị:** Sử dụng Mã PIN Admin để chuyển đổi vai trò hoặc truy cập cài đặt nhạy cảm.

## 2. Phạm vi

### In scope
- Cập nhật [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts) bổ sung `UserRole` (`ADMIN` | `EDITOR` | `VIEWER`) và `adminPin`.
- Thêm logic đọc `?gasUrl=` trong `useEffect` khởi tạo của [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) để tự động lưu cấu hình khi nhân viên truy cập bằng link chia sẻ.
- Thêm Badge Vai Trò & Modal Đổi Vai Trò / Mã PIN trên thanh Header [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx).
- Ẩn/Hiện điều kiện các nút bấm Thêm/Sửa/Xóa/Cấu hình dựa trên vai trò hiện tại của người dùng.
- Thêm nút "Copy Link Chia Sẻ Cho Nhân Viên" trong [src/components/GoogleSheetsSyncView.tsx](file:///d:/Project/QuanLyNXT/src/components/GoogleSheetsSyncView.tsx).

### Out of scope
- Không dùng server OAuth đắt đỏ (Dùng hoàn toàn Client + GAS 0 đồng).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Tiếp tục duy trì Kiến trúc Thuần GAS (Pure GAS 0 đồng chi phí).
- **"Cấm kỵ" cần tránh:** Không làm rối trải nghiệm của nhân viên khi vừa vào app.

## 4. Giả định và câu hỏi mở

### Giả định
- Mã PIN Admin mặc định ban đầu là `123456` (có thể đổi trong tab Cấu hình).

## 5. Acceptance Criteria

- [ ] Nhân viên truy cập link `maibca-qly-nxt.vercel.app/?gasUrl=...` ➔ Tự động kết nối thành công, không cần dán URL thủ công.
- [ ] Nhân viên vai trò `VIEWER` ➔ Không thấy các nút Thêm phiếu, Sửa sản phẩm, Xóa phiếu.
- [ ] Nhân viên vai trò `EDITOR` ➔ Nhập/Xuất kho bình thường nhưng không thấy tab Cấu hình Sheet và nút Xóa Dữ Liệu.
- [ ] Admin nhập mã PIN đúng ➔ Chuyển đổi giữa các vai trò ADMIN / EDITOR / VIEWER mượt mà.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/types.ts](file:///d:/Project/QuanLyNXT/src/types.ts) | Sửa | Bổ sung type UserRole và adminPin | 🟢 Thấp | Type definition |
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Sửa | Đọc URL query `gasUrl`, lưu role state & lọc quyền UI | 🟢 Thấp | Keep existing state |
| [src/components/Header.tsx](file:///d:/Project/QuanLyNXT/src/components/Header.tsx) | Sửa | Thêm Role Badge & Modal Đổi Vai Trò | 🟢 Thấp | UI navigation |
| [src/components/GoogleSheetsSyncView.tsx](file:///d:/Project/QuanLyNXT/src/components/GoogleSheetsSyncView.tsx) | Sửa | Thêm nút Copy Link Chia Sẻ Cho Nhân Viên & Quản lý PIN | 🟢 Thấp | Sync UI |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Đảm bảo khi nhân viên vào bằng `gasUrl` từ link chia sẻ, ứng dụng tự lưu và làm sạch URL bar (avoid clutter).

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Auto Config Engine qua Link Query & Cấu trúc Type RBAC.
  - **Phase 2:** Tích hợp UI Phân Quyền (Role Badge, Scoped Buttons & Modal Đổi Vai Trò) & Build Verification.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Thử đổi vai trò sang VIEWER ➔ Kiểm tra các nút Thêm/Sửa/Xóa biến mất. Thử mở link chứa `gasUrl` ➔ Tự động lưu cấu hình.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/rbac-auto-config/FEATURE_TASKS.md)
