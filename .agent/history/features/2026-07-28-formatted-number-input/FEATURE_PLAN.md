# Feature Plan: Định Dạng Số Hàng Nghìn & Thập Phân Khi Nhập Liệu (Formatted Number Input)

> **Trạng thái**: ✅ ĐỒNG Ý
> **Review gate**: Đã thông qua review hội đồng (Sẵn sàng triển khai qua `feature-coordinator`)
> **Feature slug**: formatted-number-input
> **Tạo bởi**: feature-plan
> **Ngày tạo**: 2026-07-28

---

## 1. Bối cảnh và mục tiêu

- **Bối cảnh:** Hiện tại các ô nhập số lượng trong [TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx) và [ProductModal.tsx](file:///d:/Project/QuanLyNXT/src/components/ProductModal.tsx) đang dùng thẻ HTML5 `<input type="number">`. Loại ô nhập này chỉ hiển thị chuỗi số thô (VD: `100000` thay vì `100.000`), làm người dùng rất dễ gõ thừa/thiếu số 0 dẫn đến sai lệch kho hàng.
- **Vấn đề cần giải quyết:** Tự động định dạng dấu chấm phân cách hàng nghìn (`.`) và dấu phẩy thập phân (`,`) trực tiếp trong lúc gõ và khi hiển thị ô nhập liệu.
- **Mục tiêu:**
  1. Xây dựng component `FormattedNumberInput` tự động hiển thị số theo chuẩn Việt Nam (`100.000`, `1.000,5`).
  2. Thay thế tất cả các ô nhập số trong [TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx) và [ProductModal.tsx](file:///d:/Project/QuanLyNXT/src/components/ProductModal.tsx) bằng `FormattedNumberInput`.
- **Kết quả mong đợi:** Nhập `100000` lập tức hiển thị `100.000` rõ ràng, gõ phím `Enter` thêm dòng bình thường.

## 2. Phạm vi

### In scope
- Tạo mới component [src/components/FormattedNumberInput.tsx](file:///d:/Project/QuanLyNXT/src/components/FormattedNumberInput.tsx).
- Tích hợp `FormattedNumberInput` vào ô Số lượng trong [src/components/TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx).
- Tích hợp `FormattedNumberInput` vào ô Tồn tối thiểu/Tồn tối đa trong [src/components/ProductModal.tsx](file:///d:/Project/QuanLyNXT/src/components/ProductModal.tsx).

### Out of scope
- Thay đổi cấu trúc dữ liệu lưu trữ (vẫn lưu dạng `number` chuẩn trong JavaScript).

## 3. Đối chiếu Knowledge Base

- **Quyết định kế thừa:** Giữ nguyên hàm `formatNum` trong [pdfUtils.ts](file:///d:/Project/QuanLyNXT/src/utils/pdfUtils.ts).
- **"Cấm kỵ" cần tránh:** Không làm lỗi phím tắt `Enter` khi người dùng nhập số lượng xong bấm Enter để thêm dòng mới.

## 4. Giả định và câu hỏi mở

### Giả định
- Dấu phân cách hàng nghìn là dấu chấm `.`, dấu phân cách thập phân là dấu phẩy `,` (Chuẩn `vi-VN`).

## 5. Acceptance Criteria

- [ ] Khi nhập `1000`, ô hiển thị `1.000`.
- [ ] Khi nhập `100000`, ô hiển thị `100.000`.
- [ ] Khi gõ `1000,5`, ô hiển thị `1.000,5` và trả về giá trị số `1000.5`.
- [ ] Nhấn phím `Enter` tại ô Số Lượng vẫn tự động thêm dòng mới mượt mà.

## 6. Files và modules bị ảnh hưởng

| File/Module | Hành động | Lý do chạm vào | Rủi ro | Contract |
|-------------|-----------|----------------|--------|----------|
| [src/components/FormattedNumberInput.tsx](file:///d:/Project/QuanLyNXT/src/components/FormattedNumberInput.tsx) | Tạo mới | Component ô nhập số chuẩn vi-VN | 🟢 Thấp | `value: number`, `onChange: (val: number) => void` |
| [src/components/TransactionModal.tsx](file:///d:/Project/QuanLyNXT/src/components/TransactionModal.tsx) | Sửa | Thay input number bằng FormattedNumberInput | 🟢 Thấp | Giữ nguyên prop & Enter keydown handler |
| [src/components/ProductModal.tsx](file:///d:/Project/QuanLyNXT/src/components/ProductModal.tsx) | Sửa | Thay input minStock/maxStock | 🟢 Thấp | Giữ nguyên minStock/maxStock state |

## 7. Risk Triage và Review Focus

- **Review required:** Yes
- **Risk hotspots:** Tránh mất vị trí con trỏ chuột (Cursor Jump) khi định dạng lại chuỗi trong lúc gõ.
- **Review focus areas:** Xử lý chuỗi nhập mượt mà không bị khựng cursor.

## 8. Chiến lược triển khai

- **Phase strategy:** 2 Phase:
  - **Phase 1:** Xây dựng `FormattedNumberInput.tsx` & Helper format.
  - **Phase 2:** Tích hợp vào `TransactionModal.tsx`, `ProductModal.tsx` & Verify.

## 9. Test Strategy

- **Automated tests:** `npm run build` kiểm tra compilation.
- **Manual verification:** Thử nhập số lớn `100000` và `1000000` -> Xác nhận hiển thị `100.000` và `1.000.000`.

## 10. Rollback Plan

- Revert commit về phiên bản trước.

## 11. Tham chiếu thực thi

- Checklist chi tiết: [FEATURE_TASKS.md](file:///d:/Project/QuanLyNXT/.agent/active/formatted-number-input/FEATURE_TASKS.md)
