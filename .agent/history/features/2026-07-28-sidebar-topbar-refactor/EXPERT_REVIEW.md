---
source: feature-review
feature: sidebar-topbar-refactor
round: 1
timestamp: 2026-07-28T09:00:14Z
verdict: ✅ ĐỒNG Ý
---

# Expert Review: sidebar-topbar-refactor

## Findings

### FR-01: Tabs Chức Năng Ra Top Header & User Card Xuống Đáy Sidebar
- **Severity**: Low
- **Confidence**: High
- **Issue**: Người dùng yêu cầu chỉnh vị trí UI:
  - Tab Danh mục chức năng -> đưa ra Header.
  - Khung User Email / Role / Nút Thoát -> đưa xuống dưới cùng của Sidebar.
- **Evidence**: Ảnh 1 + Ảnh 2 kèm USER_REQUEST.
- **Impact**: Bố cục cực kỳ cân đối, tiện thao tác chuyển tab trên Top Header và nhìn User Card dưới đáy Sidebar.
- **Required Fix**: Refactor `Sidebar.tsx` và `App.tsx`.
