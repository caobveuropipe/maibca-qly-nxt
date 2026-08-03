# Project Structure - Quản Lý Nhập Xuất Tồn Kho (IMS PRO)

> Tạo ngày: 2026-07-28  
> Cập nhật gần nhất: 2026-08-03  
> Mục đích: Lưu snapshot cấu trúc codebase để AI Assistants có thể onboard và resume nhanh.

---

## 1. Snapshot cây thư mục

```text
QuanLyNXT/
├── .agent/                             # Hệ thống tài liệu điều phối AI & Skill pack
│   ├── skills/                         # Các kỹ năng chuẩn hóa (check-issue, feature-plan, ...)
│   ├── CONTEXT.md                      # Bản đồ dự án
│   ├── KNOWLEDGE_BASE.md               # Lưu trữ quyết định kiến trúc
│   └── PROJECT_STRUCTURE.md            # File snapshot này
├── src/                                # Mã nguồn Frontend chính
│   ├── App.tsx                         # Main Dashboard Component & State & Sync logic
│   ├── main.tsx                        # Entry point React
│   ├── index.css                       # Stylesheet Tailwind / Custom CSS
│   └── vite-env.d.ts                   # Types definition
├── google_apps_script.gs               # Mã nguồn backend Google Apps Script
├── firebase-applet-config.json         # OAuth Client ID & Firebase configuration
├── package.json                        # Khai báo thư viện và build scripts
├── vercel.json                         # Cấu hình routing & build deployment Vercel
├── vite.config.ts                      # Cấu hình Vite bundler
└── server.ts                           # Express Server cho local dev (đang refactor)
```

## 2. Entry Points

| Loại | File/Path | Vai trò | Ghi chú |
|------|-----------|---------|---------|
| Frontend Bootstrap | [src/main.tsx](file:///d:/Project/QuanLyNXT/src/main.tsx) | Mount React App vào DOM | Standard Vite SPA Entry |
| Frontend Dashboard | [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) | Quản lý toàn bộ UI, state, modal và sync | Component trung tâm |
| GAS Backend | [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) | Xử lý `doGet` / `doPost` trên Google Sheet | Độc lập không phụ thuộc Vercel |
| Local Server | [server.ts](file:///d:/Project/QuanLyNXT/server.ts) | Dev Server trợ giúp khi chạy local | Không dùng trên Production |

## 3. Services / Modules chính

| Module/Service | Path | Trách nhiệm | Phụ thuộc chính |
|----------------|------|-------------|------------------|
| Kho Hàng (Warehouses) | `src/App.tsx` | Tạo, sửa, xóa, quản lý danh sách Kho | LocalStorage, GAS |
| Sản Phẩm (Products) | `src/App.tsx` | Quản lý danh mục sản phẩm, giá nhập/xuất, tồn kho | LocalStorage, GAS |
| Nhập Xuất Kho (Transactions) | `src/App.tsx` | Lập phiếu nhập/xuất, tính thành tiền, lịch sử NX | LocalStorage, GAS |
| Đồng Bộ Google Sheet (Sync) | `src/App.tsx` & `google_apps_script.gs` | Đồng bộ 2 chiều dữ liệu giữa App và Sheet | GAS WebApp URL, Fetch API |
| Báo Cáo & In Ấn | `src/App.tsx` | Xuất PDF chứng từ, Excel báo cáo NXT | `jspdf`, `jspdf-autotable`, `xlsx` |

## 4. Config / Infra quan trọng

| File | Nhóm | Ý nghĩa | Lưu ý khi chỉnh sửa |
|------|------|---------|---------------------|
| `package.json` | Build/Deps | Quản lý dependencies & scripts (`dev`, `build`) | React 19 + Vite 6 |
| `vercel.json` | Infra | Điều hướng Vercel Deploy tĩnh | Đảm bảo SPA routing `/.*` -> `/index.html` |
| `google_apps_script.gs` | Backend | Engine đọc/ghi Google Sheet | Deploy ở chế độ "Anyone" |

## 5. Commands

| Mục đích | Lệnh | Điều kiện | Ghi chú |
|----------|------|-----------|---------|
| Chạy local | `npm run dev` | Node.js môi trường local | Chạy Vite Dev Server |
| Build Production | `npm run build` | Không có lỗi TypeScript | Tạo thư mục `dist/` |
| Type Check | `npm run lint` | TypeScript installed | Kiểm tra lỗi type trước khi commit |

## 6. Luồng đọc nhanh cho AI

- Khi sửa UI / Tính năng kho / Đồng bộ client: đọc [src/App.tsx](file:///d:/Project/QuanLyNXT/src/App.tsx) trước.
- Khi sửa logic ghi Sheet / API GAS: đọc [google_apps_script.gs](file:///d:/Project/QuanLyNXT/google_apps_script.gs) trước.
- Khi sửa cấu hình Vercel Host: đọc [vercel.json](file:///d:/Project/QuanLyNXT/vercel.json) trước.

## 7. Ghi chú từ lần quét đầu

- Package manager: npm
- Kiểu repo: single app React (Vite SPA)
- Điểm dễ nhầm: Tránh dùng `/api/gas-proxy` qua Node backend Vercel; ứng dụng đang ưu tiên sử dụng kiến trúc Thuần GAS trực tiếp từ Frontend.
