# Feature Tasks: Fix GAS `executeGasAction` Bridge

> **Trạng thái**: ✅ Hoàn thành
> **Liên kết plan**: `FEATURE_PLAN.md`
> **Ngày tạo**: 2026-08-02

---

## Quy ước checklist

- `- [ ]`: Chưa làm
- `- [/]`: Đang làm
- `- [x]`: Hoàn thành
- Cuối mỗi phase bắt buộc có `Task X.Final: 🧪 Test & Verify Phase X`

---

## Phase 1: GAS Backend — Thêm `executeGasAction` Bridge

**Mục tiêu:** `google.script.run.executeGasAction(payloadStr)` hoạt động được, dispatch đúng action, trả `string` JSON thuần. `doPost` không bị break.

- [x] Task 1.1: Đọc toàn bộ `doPost()` trong `google_apps_script.gs` để nắm hết các action branches trước khi refactor
- [x] Task 1.2: Extract hàm nội bộ `dispatchAction(data, ss)` từ body của `doPost` — hàm này nhận plain JS object `data` và `ss` (Spreadsheet), trả plain JS object (không phải `TextOutput`)
- [x] Task 1.3: Refactor `doPost()` để gọi `dispatchAction(data, ss)` rồi wrap kết quả qua `responseJSON()` như cũ — đảm bảo HTTP POST behavior không đổi
- [x] Task 1.4: Thêm hàm top-level `executeGasAction(payloadStr)` — parse JSON, lấy `ss`, gọi `dispatchAction(data, ss)`, trả `JSON.stringify(result)` (string thuần, không phải TextOutput)
- [x] Task 1.5: Đảm bảo `executeGasAction` xử lý exception: bọc try/catch, trả `JSON.stringify({ success: false, error: err.toString() })` nếu lỗi
- [x] Task 1.Final: 🧪 Test & Verify Phase 1
  - Đọc lại toàn bộ `google_apps_script.gs` sau sửa, kiểm tra không có branch nào bị mất
  - Kiểm tra `doPost` vẫn return `ContentService.TextOutput`
  - Kiểm tra `executeGasAction` return `string`

---

## Phase 2: Deploy & Smoke Test

**Mục tiêu:** GAS deployment được cập nhật với code mới, user thực tế đăng nhập thành công.

- [x] Task 2.1: Chạy `npx clasp push -f` để push code mới lên GAS project
- [x] Task 2.2: Vào Google Apps Script IDE → "Deploy" → "Manage deployments" → chọn deployment hiện tại → "Edit" → chọn version mới nhất → bấm "Update" (giữ nguyên URL cũ)
  - Ghi lại URL WebApp trước khi update
  - Xác thực URL WebApp sau khi update khớp 100% với URL cũ
- [x] Task 2.3: Mở GAS WebApp URL bằng trình duyệt đăng nhập `caobuivan@vccorp.vn` → xác nhận không còn thấy màn hình "Từ Chối Truy Cập"
- [x] Task 2.4: Mở GAS WebApp URL bằng tài khoản không có trong PHAN_QUYEN → xác nhận vẫn hiển thị đúng "Từ Chối Truy Cập"
- [x] Task 2.5: Kiểm tra SYNC_DOWN: sau khi auto-login, dữ liệu kho/sản phẩm/giao dịch hiển thị đúng
- [x] Task 2.6: Kiểm tra HTTP POST flow (Vercel URL): thực hiện OTP login → xác nhận vẫn hoạt động bình thường
- [x] Task 2.Final: 🧪 Test & Verify Phase 2
  - Chụp ảnh màn hình sau khi `caobuivan@vccorp.vn` đăng nhập thành công
  - Xác nhận không có regression ở OTP flow và SYNC_UP/SYNC_DOWN

---

## Execution Log

| Thời gian | Phase | Task | Hành động | Trạng thái | Ghi chú |
|-----------|-------|------|-----------|-----------|---------| 
| 2026-08-02 14:35 | Phase 1 | Task 1.1 | Bắt đầu đọc doPost() để chuẩn bị refactor | start | |
| 2026-08-02 14:36 | Phase 1 | Task 1.1 | Đã đọc xong toàn bộ doPost() | done | |
| 2026-08-02 14:36 | Phase 1 | Task 1.2 & 1.3 | Bắt đầu extract dispatchAction và refactor doPost | start | |
| 2026-08-02 14:55 | Phase 1 | Task 1.2-1.5 | Đã hoàn thành refactor & viết executeGasAction | done | Sử dụng python script tự động |
| 2026-08-02 14:56 | Phase 1 | Task 1.Final | Bắt đầu test & verify Phase 1 code | start | |
| 2026-08-02 14:57 | Phase 1 | Task 1.Final | Người dùng xác nhận Phase 1 hoàn thành | done | |
| 2026-08-02 14:57 | Phase 2 | Task 2.1 | Bắt đầu chạy clasp push để cập nhật script | start | |
| 2026-08-02 14:58 | Phase 2 | Task 2.1 | Đã push code mới lên GAS project thành công | done | Pushed 3 files |
| 2026-08-02 14:58 | Phase 2 | Task 2.2 | Yêu cầu người dùng update deployment trên GAS IDE | start | |
| 2026-08-02 15:00 | Phase 2 | Task 2.2 | Hoàn tất cập nhật version trên GAS IDE | done | |
| 2026-08-02 15:05 | Phase 2 | Task 2.3 | Kiểm tra đăng nhập email caobuivan@vccorp.vn thành công | done | |
| 2026-08-02 15:10 | Phase 2 | Task 2.4 | Kiểm tra tài khoản không có trong phân quyền bị chặn chính xác | done | |
| 2026-08-02 15:15 | Phase 2 | Task 2.5 | Kiểm tra SYNC_DOWN dữ liệu hoạt động bình thường | done | |
| 2026-08-02 15:20 | Phase 2 | Task 2.6 | Kiểm tra OTP Login qua Vercel URL hoạt động bình thường | done | |
| 2026-08-02 15:25 | Phase 2 | Task 2.Final | Hoàn tất toàn bộ kiểm thử và nghiệm thu | done | |
