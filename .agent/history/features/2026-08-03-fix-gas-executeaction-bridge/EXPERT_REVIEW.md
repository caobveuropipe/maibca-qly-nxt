---
source: feature-review
feature: fix-gas-executeaction-bridge
round: 1
timestamp: 2026-08-02T07:35:00Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: fix-gas-executeaction-bridge

## Findings

### FR-01: `executeGasAction` phải return `string` JSON — không được return plain object
- **Severity**: High
- **Confidence**: High
- **Issue**: `gasProxy.ts:31` parse `result` nếu là `string`, dùng trực tiếp nếu là object. Nếu `executeGasAction` return plain object, GAS tự serialize → client nhận string → parse đúng. Nếu return `JSON.stringify(result)`, client cũng nhận string → parse đúng. Nhưng nếu có branch trả object và branch trả string trong cùng dispatcher, behavior sẽ không nhất quán. Plan phải chốt một kiểu duy nhất.
- **Evidence**: `gasProxy.ts:29-34` — `withSuccessHandler((result: string) => { resolve(typeof result === 'string' ? JSON.parse(result) : result) })`. Plan Task 1.4 ghi "trả `JSON.stringify(result)`" nhưng không ràng buộc toàn bộ dispatcher phải nhất quán.
- **Impact**: Nếu dispatcher mix return type → một số action bị parse double hoặc không parse → `freshUsers` bị lỗi → vẫn từ chối truy cập.
- **Required Fix**: Task 1.4 phải code `return JSON.stringify(result)` cho **tất cả** branches của dispatcher. Không để branch nào return plain object.
- **Status**: Điều kiện tiền-triển-khai — plan ✅ ĐỒNG Ý nhưng phải đảm bảo khi code.

### FR-02: `executeGasAction` là entry point không có HTTP auth guard
- **Severity**: Medium
- **Confidence**: Medium
- **Issue**: `google.script.run.executeGasAction()` có thể gọi được từ bất kỳ JS nào chạy trong WebApp (console injection). User đã mở WebApp có thể đọc toàn bộ dữ liệu qua SYNC_DOWN mà không cần thêm credential.
- **Evidence**: `doPost:36` chỉ guard khi `requirePinCheck === true`; SYNC_DOWN call từ `App.tsx:361` không set `requirePinCheck`. Risk ngang bằng `doPost` hiện tại — `executeGasAction` không tạo risk mới.
- **Impact**: Không tệ hơn trạng thái hiện tại. Risk đã tồn tại từ trước.
- **Required Fix**: Không block fix này. Đưa vào backlog — address ở feature riêng sau khi fix cơ bản ổn định.
- **Status**: Khuyến nghị không chặn rollout.

### FR-03: Task 2.2 không có bước verify URL trước/sau Update Deployment
- **Severity**: Medium
- **Confidence**: High
- **Issue**: Nếu user nhầm bấm "New Deployment", GAS WebApp URL thay đổi. Tất cả user mất truy cập cho đến khi URL được cập nhật trong app config. Plan cảnh báo nhưng không có task verify.
- **Evidence**: `FEATURE_TASKS.md` Task 2.2 không có sub-task "ghi lại URL trước/sau update".
- **Impact**: Nếu xảy ra, cần thêm bước sửa URL config và rebuild/redeploy frontend. Không irreversible nhưng gây gián đoạn.
- **Required Fix**: Bổ sung sub-task trong Task 2.2: "Copy URL hiện tại trước khi update. Sau khi update, xác nhận URL không đổi."
- **Status**: Khuyến nghị không chặn rollout — thêm khi thực thi.

## Khuyến nghị không chặn rollout
- FR-02: Lên backlog "Thêm access guard cho SYNC_DOWN" — address ở feature riêng.
- FR-03: Thêm sub-task verify URL vào Task 2.2 khi coordinator thực thi.

## Cần xác thực thêm
- Không có.
