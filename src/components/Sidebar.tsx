import React from 'react';
import {
  Boxes,
  PieChart,
  Package,
  Warehouse,
  ReceiptText,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  Upload,
  Shield,
  RefreshCw,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { GoogleSyncConfig, UserRole, AppUser } from '../types';
import { ActiveTab } from './Header';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentUser?: AppUser;
  googleConfig: GoogleSyncConfig;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenExcelUpload: () => void;
  onOpenUserManagement: () => void;
  onQuickSync: () => void;
  isSyncing: boolean;
  onClearData: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  currentUser,
  googleConfig,
  onOpenImportModal,
  onOpenExportModal,
  onOpenExcelUpload,
  onOpenUserManagement,
  onQuickSync,
  isSyncing,
  onClearData,
  onLogout,
}) => {
  const currentRole: UserRole = currentUser?.role || googleConfig.userRole || 'ADMIN';
  const isAdmin = currentRole === 'ADMIN';
  const isViewer = currentRole === 'VIEWER';

  const menuItems = [
    {
      id: 'reports' as ActiveTab,
      label: 'Báo Cáo NXT',
      icon: PieChart,
    },
    {
      id: 'products' as ActiveTab,
      label: 'Sản Phẩm',
      icon: Package,
    },
    {
      id: 'warehouses' as ActiveTab,
      label: 'Danh Sách Kho',
      icon: Warehouse,
    },
    {
      id: 'transactions' as ActiveTab,
      label: 'Nhật Ký NX',
      icon: ReceiptText,
    },
    {
      id: 'sheets' as ActiveTab,
      label: 'Đồng Bộ Sheets',
      icon: FileSpreadsheet,
      badge: googleConfig.autoSync ? 'Auto' : undefined,
    },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-all duration-300 z-40 shrink-0 sticky top-0 h-screen select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header Branding & Toggle Button */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight truncate">
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                IMS PRO <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase">v2.4</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Quản Lý Nhập Xuất Tồn</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 shrink-0">
            <Boxes className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar (Ẩn để rộng bảng)'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info Card */}
      {currentUser && (
        <div className={`p-3 border-b border-slate-800/80 bg-slate-950/40 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-300 font-bold truncate max-w-[140px]" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    currentRole === 'ADMIN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : currentRole === 'EDITOR'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {currentRole}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{currentUser.name}</span>
                <button
                  onClick={onLogout}
                  className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  title="Đăng xuất khỏi thiết bị này"
                >
                  <LogOut className="w-3 h-3" /> Thoát
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <UserCog className="w-4 h-4 text-blue-400" title={currentUser.email} />
              <button
                onClick={onLogout}
                className="p-1 text-red-400 hover:text-red-300"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div className="p-2 flex-1 overflow-y-auto space-y-1">
        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? 'Danh Mục Chức Năng' : 'Menu'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Action Buttons Section */}
        <div className="pt-4 space-y-1.5 border-t border-slate-800 mt-4">
          <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? 'Thao Tác Nhanh' : 'Thao Tác'}
          </div>

          {!isViewer && (
            <>
              <button
                onClick={onOpenImportModal}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Tạo Phiếu Nhập Kho Mới"
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isCollapsed && <span>+ Phiếu Nhập</span>}
              </button>

              <button
                onClick={onOpenExportModal}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Tạo Phiếu Xuất Kho Mới"
              >
                <ArrowUpRight className="w-4 h-4 text-blue-400 shrink-0" />
                {!isCollapsed && <span>+ Phiếu Xuất</span>}
              </button>

              <button
                onClick={onOpenExcelUpload}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Nhập Dữ Liệu Từ Excel"
              >
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                {!isCollapsed && <span>Nhập Excel</span>}
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                onClick={onOpenUserManagement}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Bảng Quản Lý Phân Quyền Email Nhân Viên"
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                {!isCollapsed && <span>Bảng Phân Quyền</span>}
              </button>

              {googleConfig.spreadsheetId && (
                <button
                  onClick={onQuickSync}
                  disabled={isSyncing}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-50 ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                  title="Đồng Bộ Nhanh Lên Google Sheets"
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  {!isCollapsed && <span>{isSyncing ? 'Đang Đồng Bộ...' : 'Đồng Bộ Sheets'}</span>}
                </button>
              )}

              <button
                onClick={onClearData}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 text-xs font-medium transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Xóa Sạch Dữ Liệu Mẫu / Hiện Tại"
              >
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                {!isCollapsed && <span>Xóa Dữ Liệu</span>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer Toggle bar info */}
      <div className="p-2 border-t border-slate-800 text-center text-[10px] text-slate-500">
        {!isCollapsed ? 'Bấm nút < trên cùng để ẩn Sidebar' : 'IMS'}
      </div>
    </aside>
  );
};
