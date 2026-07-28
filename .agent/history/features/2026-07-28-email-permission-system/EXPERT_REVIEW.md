---
source: feature-review
feature: email-permission-system
round: 1
timestamp: 2026-07-28T07:16:36Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: email-permission-system

## Findings

### FR-01: Phân Quyền Trực Tiếp Theo Email Đăng Nhập
- **Severity**: Low
- **Confidence**: High
- **Issue**: Người dùng muốn phân quyền theo đúng Email đăng nhập của nhân viên.
- **Evidence**: Yêu cầu của người dùng: "đăng nhập như vậy là sẽ lưu được email và phân quyền được theo từng email đúng không? Vậy hãy sửa lại giao diện và cách phân quyền theo email log được nhé"
- **Impact**: Minh bạch tuyệt đối. Đăng nhập Email nào lập tức nhận đúng quyền `ADMIN`, `EDITOR`, hoặc `VIEWER` của Email đó.
- **Required Fix**: Cập nhật `AppUser`, `UserManagementModal.tsx`, `App.tsx`, `Header.tsx`, `google_apps_script.gs`.

## Khuyến nghị không chặn rollout
- Tự động gán quyền `ADMIN` cho email chủ dự án `caobv.europipe@gmail.com` và các tài khoản Admin khác trong bảng.

## Cần xác thực thêm
- Không có.
