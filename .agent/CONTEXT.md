# Quản Lý Nhập Xuất Tồn Kho (IMS PRO) - Context for AI Assistants

---

## 1. Project Overview

- **Tên dự án**: Quản Lý Nhập Xuất Tồn Kho (IMS PRO V2.4)
- **Repo**: [caobveuropipe/maibca-qly-nxt](https://github.com/caobveuropipe/maibca-qly-nxt.git)
- **Trạng thái**: Đang chuyển đổi sang kiến trúc Thuần GAS (Pure GAS Integration)
- **Mô tả**: Ứng dụng web quản lý kho hàng (Nhập - Xuất - Tồn kho) đồng bộ dữ liệu 2 chiều với Google Sheets.

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite 6, TailwindCSS 4, Lucide React, Motion
- **Backend / Script:** Google Apps Script (`google_apps_script.gs`) (Thuần GAS Architecture)
- **Deployment:** Vercel Static Hosting (100% Static SPA Build)
- **Utilities:** JSPDF, AutoTable, XLSX (Xuất / Nhập Báo cáo & Chứng từ)

---

## 2. `.agent/` Directory Navigation

### Core Maps
| File | Mô tả |
|------|------|
| [CONTEXT.md](./CONTEXT.md) | Bản đồ nhanh để onboard và resume |
| [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) | Quyết định kiến trúc và lý do chiến lược |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Snapshot cấu trúc thư mục, entry points, services và commands |

### Changelog
| File | Mô tả |
|------|------|
| [changelog/CHANGELOG-FE.md](./changelog/CHANGELOG-FE.md) | Thay đổi frontend, UI, UX, client-side flow |
| [changelog/CHANGELOG-BE.md](./changelog/CHANGELOG-BE.md) | Thay đổi backend, Google Apps Script API, integration |

### Agent Skills
| Skill | Mô tả |
|------|------|
| [skills/project-init/SKILL.md](./skills/project-init/SKILL.md) | Chuẩn hóa, bổ sung, hoặc audit bộ `.agent/` |
| [skills/feature-plan/SKILL.md](./skills/feature-plan/SKILL.md) | Lập kế hoạch cho feature mới |
| [skills/feature-review/SKILL.md](./skills/feature-review/SKILL.md) | Review plan về kiến trúc, bảo mật, logic và rollout |
| [skills/feature-coordinator/SKILL.md](./skills/feature-coordinator/SKILL.md) | Triển khai feature theo phase và checklist |
| [skills/update-docs/SKILL.md](./skills/update-docs/SKILL.md) | Cập nhật docs sau khi code thay đổi |
| [skills/check-issue/SKILL.md](./skills/check-issue/SKILL.md) | Điều tra root cause của bug hoặc sự cố |

---

## 3. Critical Files

| File | Mức độ | Ghi chú |
|------|------|---------|
| [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | CRITICAL | Giao diện chính, quản lý state và logic đồng bộ Google Sheets |
| [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) | CRITICAL | Mã nguồn backend Google Apps Script xử lý đọc/ghi dữ liệu Sheet |
| [vercel.json](file:///d:/Project/QuanLyNXT/vercel.json) | HIGH | Cấu hình Vercel build & route rewrite cho SPA static deployment |
| [package.json](file:///d:/Project/QuanLyNXT/package.json) | HIGH | Khai báo dependencies và build scripts |

---

## 4. Quick Commands

```powershell
# Development (Local Dev Server)
npm run dev

# Build Static Application for Production
npm run build

# Type Check & Linting
npm run lint
```

---

*Last updated: 2026-08-03 | IMS PRO V2.4*
