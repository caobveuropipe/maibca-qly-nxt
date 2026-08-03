# Feature Plan: Fix GAS `executeGasAction` Bridge — Sửa Lỗi Từ Chối Truy Cập Oan

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã qua review — có thể handoff sang `feature-coordinator`. Xem `EXPERT_REVIEW.md` (round 1, 2026-08-02). Điều kiện: Task 1.4 phải return `JSON.stringify(result)` cho tất cả branches.
> **Feature slug**: `fix-gas-executeaction-bridge`
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-08-02

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Ứng dụng chạy theo kiến trúc Thuần GAS — khi mở qua GAS WebApp URL, frontend dùng `google.script.run` thay vì Vercel Proxy để gọi backend. Luồng này được điều phối bởi `callGasProxy()` trong `gasProxy.ts`.
- **Vấn đề cần giải quyết:** `callViaGoogleScriptRun()` tại `gasProxy.ts:39` gọi `google.script.run.executeGasAction(...)` nhưng hàm `executeGasAction` **không tồn tại** trong `google_apps_script.gs`. Kết quả: GAS runtime ném lỗi → bị `catch` ở `App.tsx:374` → `SYNC_DOWN` không chạy → `freshUsers` rỗng → email `caobuivan@vccorp.vn` không match → **"Từ Chối Truy Cập" oan**.
- **Mục tiêu:** Thêm hàm `executeGasAction(payloadStr)` vào `google_apps_script.gs` để `google.script.run` có entry point hợp lệ, đồng thời đảm bảo response trả `string` JSON thuần (không phải `TextOutput` object vì `google.script.run` không serialize được).
- **Kết quả mong đợi:** User hợp lệ trong PHAN_QUYEN mở GAS WebApp URL → tự động đăng nhập thành công, không thấy "Từ Chối Truy Cập".

---

## 2. Phạm vi

### In scope
- Thêm hàm top-level `executeGasAction(payloadStr)` vào `google_apps_script.gs`
- Refactor nội bộ `doPost()`: extract hàm `dispatchAction(data)` trả plain JS object, dùng chung cho cả `doPost` và `executeGasAction`
- `doPost` wrap kết quả từ `dispatchAction` qua `responseJSON()` như cũ
- `executeGasAction` wrap kết quả thành `JSON.stringify(...)` thuần (string)
- `clasp push` + update GAS deployment (không tạo deployment mới)
- Smoke test thực tế với tài khoản `caobuivan@vccorp.vn`

### Out of scope
- Thay đổi logic business của các action hiện có (`SYNC_UP`, `SYNC_DOWN`, `SEND_OTP`, v.v.)
- Thay đổi schema Google Sheet hay data model
- Thêm tính năng mới ngoài bridge này
- Rebuild `Index.html` (không cần trừ khi có thay đổi frontend)

---

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:**
  - [2026-07-28] Kiến trúc Thuần GAS — frontend gọi trực tiếp GAS, không qua Vercel backend proxy. Fix này không được đưa lại `/api/gas-proxy` vào GAS context flow.
  - [2026-07-28] Vercel chỉ là static SPA host — không có serverless function. Giữ nguyên.
- **"Cấm kỵ" cần tránh:**
  - `executeGasAction` **không được** return `ContentService.TextOutput` — `google.script.run` không serialize được, phải trả `string` thuần.
  - Không gọi `doPost(fakeEvent)` rồi lấy `.getContent()` — cách đó rối và dễ lỗi nếu `doPost` thay đổi signature.
- **Ràng buộc kiến trúc liên quan:**
  - GAS deployment phải giữ chế độ "Execute as: Me, Who has access: Anyone".
  - `GET_ACTIVE_USER` phải xử lý được qua `google.script.run` (không qua HTTP POST) để `Session.getActiveUser()` trả đúng email.

---

## 4. Giả định và câu hỏi mở

### Giả định
- Sheet `PHAN_QUYEN` đã có row `caobuivan@vccorp.vn` với status `ACTIVE` (xác nhận từ ảnh chụp).
- `googleConfig.gasPin` chưa được set → fallback về `'123456'` tại `App.tsx:361`. `SYNC_DOWN` payload không set `requirePinCheck: true` nên không bị PIN guard chặn ở `doPost` dòng 36.
- GAS deployment hiện tại vẫn active, URL không thay đổi nếu dùng "Update Deployment".

### Câu hỏi mở
- [Non-blocking] Sau khi push, user cần vào GAS IDE bấm "Manage deployments > Edit > Update" thủ công — clasp không tự động làm bước này.
- [Non-blocking] Có muốn thêm PIN guard vào `executeGasAction` không? Hiện tại `doPost` chỉ guard khi `requirePinCheck === true` trong payload, logic tương tự sẽ được giữ trong dispatcher chung.

---

## 5. Acceptance Criteria

- [ ] `executeGasAction` tồn tại ở top-level trong `google_apps_script.gs` và `google.script.run.executeGasAction` gọi được từ browser
- [ ] `executeGasAction` nhận `string` JSON, dispatch đúng action, trả về `string` JSON thuần
- [ ] `doPost` vẫn hoạt động bình thường — HTTP POST call từ bên ngoài không bị break
- [ ] Mở GAS WebApp URL bằng `caobuivan@vccorp.vn` → tự động đăng nhập, không thấy "Từ Chối Truy Cập"
- [ ] Mở bằng tài khoản chưa được cấp quyền → vẫn hiển thị đúng "Từ Chối Truy Cập"
- [ ] `clasp push` thành công, GAS deployment được update

---

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| `google_apps_script.gs` | Sửa — thêm `executeGasAction` + extract `dispatchAction` | Entry point bridge cho `google.script.run` | 🟡 Trung bình — chạm auth flow | Chưa có |
| `src/utils/gasProxy.ts` | Không đổi | Đã đúng, vẫn gọi `executeGasAction` | 🟢 | Không |
| `src/App.tsx` | Không đổi | Logic auto-login đúng, chờ GAS fix | 🟢 | Không |

---

## 7. Risk Triage và Review Focus

- **Review required:** Yes — chạm auth/permission path
- **Risk hotspots:**
  - `executeGasAction` là entry point mới không yêu cầu HTTP auth — bất kỳ script nào trong cùng GAS project đều gọi được. Cần `feature-review` đánh giá surface attack này.
  - Return type mismatch nếu extract dispatcher sai — `doPost` có thể bị break âm thầm.
- **Review focus areas:**
  - `executeGasAction` có cần PIN guard không, hay logic hiện tại (guard chỉ khi `requirePinCheck === true` trong payload) đã đủ?
  - Dispatcher extract có đảm bảo tất cả branches trong `doPost` đều được cover không?
  - `Session.getActiveUser()` có hoạt động khi gọi qua `google.script.run` ở chế độ "Execute as: Me" không?
- **Known pitfalls / historical issues:**
  - GAS không cho phép gọi `doPost` qua `google.script.run` (reserved) — bắt buộc phải tạo named function riêng.
  - Dùng "New Deployment" sẽ tạo URL mới, làm hỏng tất cả user đang dùng URL cũ → **bắt buộc dùng Update Deployment**.
  - `ContentService.TextOutput` không serialize được qua `google.script.run` — trả `string` thuần.
- **Dependencies / rollout concerns:**
  - Phải `clasp push` trước, sau đó update deployment trong GAS IDE.
  - Không cần migration sheet hay thay đổi data.

---

## 8. Chiến lược triển khai

- **Phase strategy:** 2 phase nhỏ, tuần tự.
- **Thứ tự triển khai:**
  1. **Phase 1 — GAS Backend:** Sửa `google_apps_script.gs`, `clasp push`
  2. **Phase 2 — Deploy & Verify:** User update GAS deployment, smoke test thực tế
- **Điểm cần phối hợp:** User cần bấm "Update Deployment" thủ công trong Google Apps Script IDE sau khi clasp push xong.
- **Yêu cầu migration / config / deploy:** Không cần migration. Chỉ cần update GAS deployment sau push.

---

## 9. Test Strategy

- **Automated tests:** Không có test framework GAS — kiểm tra thủ công
- **Manual verification:**
  1. Mở GAS WebApp URL bằng `caobuivan@vccorp.vn` → phải tự đăng nhập thành công
  2. Mở bằng tài khoản không có trong PHAN_QUYEN → phải thấy đúng "Từ Chối Truy Cập"
  3. Kiểm tra SYNC_DOWN: dữ liệu kho xuất hiện sau khi đăng nhập
  4. Kiểm tra SYNC_UP: ghi phiếu mới → xuất hiện trên Sheet
  5. Kiểm tra OTP login qua Vercel URL vẫn hoạt động (HTTP POST flow không bị break)
- **Data / env chuẩn bị:** Sheet PHAN_QUYEN đã có `caobuivan@vccorp.vn`, EDITOR, ACTIVE.

---

## 10. Rollback Plan

- `git checkout HEAD~1 -- google_apps_script.gs` để revert
- `clasp push` lại
- Trong GAS IDE: "Manage deployments → Edit → chọn version trước → Update"

---

## 11. Tham chiếu thực thi

- Checklist chi tiết theo phase: `FEATURE_TASKS.md`
