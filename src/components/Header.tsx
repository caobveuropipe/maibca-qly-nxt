import React, { useState } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Package,
  Warehouse as WarehouseIcon,
  ReceiptText,
  BarChart3,
  FileSpreadsheet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Upload,
  RefreshCw,
  Trash2,
  Shield,
  UserCheck,
  Eye,
  KeyRound,
  X,
  Lock,
} from 'lucide-react';
import { GoogleSyncConfig, UserRole } from '../types';

export type ActiveTab = 'reports' | 'products' | 'warehouses' | 'transactions' | 'sheets';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenExcelUpload: () => void;
  googleConfig: GoogleSyncConfig;
  onUpdateGoogleConfig: (config: GoogleSyncConfig) => void;
  onQuickSync: () => void;
  isSyncing: boolean;
  onClearData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenImportModal,
  onOpenExportModal,
  onOpenExcelUpload,
  googleConfig,
  onUpdateGoogleConfig,
  onQuickSync,
  isSyncing,
  onClearData,
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('ADMIN');
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');

  const currentRole: UserRole = googleConfig.userRole || 'ADMIN';
  const isAdmin = currentRole === 'ADMIN';
  const isEditor = currentRole === 'EDITOR';
  const isViewer = currentRole === 'VIEWER';

  const handleSwitchRole = (role: UserRole) => {
    setPinError('');
    if (role === 'ADMIN' && currentRole !== 'ADMIN') {
      const correctPin = googleConfig.adminPin || '123456';
      if (inputPin !== correctPin) {
        setPinError('Mã PIN Admin không đúng (Mặc định: 123456)');
        return;
      }
    }

    onUpdateGoogleConfig({
      ...googleConfig,
      userRole: role,
    });
    setIsRoleModalOpen(false);
    setInputPin('');
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30 transition-all">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>ADMIN</span>
          </span>
        );
      case 'EDITOR':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-500/30 transition-all">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>NHẬP XUẤT (Editor)</span>
          </span>
        );
      case 'VIEWER':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-600 transition-all">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>CHỈ XEM (Viewer)</span>
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: App Branding & Quick Actions */}
        <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center shadow-sm">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
                    IMS PRO <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold tracking-wider uppercase">v2.4</span>
                  </h1>
                  <div onClick={() => setIsRoleModalOpen(true)}>
                    {getRoleBadge()}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Quản lý Nhập Xuất Tồn & Đồng bộ Google Sheets</p>
              </div>
            </div>
          </div>

          {/* Action buttons (Scoped by Role) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Quick Google Sync Button */}
            {isAdmin && googleConfig.spreadsheetId && (
              <button
                onClick={onQuickSync}
                disabled={isSyncing}
                title="Đồng bộ nhanh lên Google Sheets"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Sheets'}</span>
              </button>
            )}

            {!isViewer && (
              <button
                onClick={onOpenExcelUpload}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Nhập Excel</span>
              </button>
            )}

            {!isViewer && (
              <>
                <button
                  onClick={onOpenImportModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm shadow-emerald-900/20 flex items-center gap-1.5 transition-all"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>+ Phiếu Nhập</span>
                </button>

                <button
                  onClick={onOpenExportModal}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+ Phiếu Xuất</span>
                </button>
              </>
            )}

            {isAdmin && onClearData && (
              <button
                onClick={onClearData}
                title="Xóa sạch dữ liệu trong kho & máy"
                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa Dữ Liệu</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Báo Cáo NXT
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Sản Phẩm
          </button>

          <button
            onClick={() => setActiveTab('warehouses')}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'warehouses'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <WarehouseIcon className="w-4 h-4" /> Danh Sách Kho
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ReceiptText className="w-4 h-4" /> Nhật ký NX
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('sheets')}
              className={`py-2 px-3.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'sheets'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Đồng Bộ Google Sheets
              {googleConfig.spreadsheetId && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Role Switcher Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 text-white font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Phân Quyền & Chuyển Vai Trò
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Chọn Vai Trò Bảng Điều Khiển:
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSwitchRole('ADMIN')}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                    currentRole === 'ADMIN'
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> ADMIN (Quản Trị Viên)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đầy đủ quyền Cấu hình Google Sheet, Xóa dữ liệu, Phân quyền hệ thống.
                    </p>
                  </div>
                  {currentRole === 'ADMIN' && <span className="text-xs font-bold text-amber-400">Đang chọn</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchRole('EDITOR')}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                    currentRole === 'EDITOR'
                      ? 'bg-blue-950/40 border-blue-500/80 text-blue-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" /> EDITOR (Nhân Viên Nhập/Xuất Kho)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cho phép Tạo/Sửa phiếu nhập xuất, thêm sản phẩm. Ẩn Cấu hình & Xóa dữ liệu.
                    </p>
                  </div>
                  {currentRole === 'EDITOR' && <span className="text-xs font-bold text-blue-400">Đang chọn</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchRole('VIEWER')}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                    currentRole === 'VIEWER'
                      ? 'bg-slate-800 border-slate-500 text-white'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> VIEWER (Chỉ Xem Báo Cáo)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Chỉ được xem báo cáo NXT, Thẻ kho. Không có quyền Thêm/Sửa/Xóa.
                    </p>
                  </div>
                  {currentRole === 'VIEWER' && <span className="text-xs font-bold text-slate-400">Đang chọn</span>}
                </button>
              </div>
            </div>

            {currentRole !== 'ADMIN' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Nhập Mã PIN Admin để lên quyền ADMIN:
                </label>
                <input
                  type="password"
                  placeholder="Mã PIN Admin (Mặc định: 123456)"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs font-mono font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pinError && <p className="text-xs text-red-400">{pinError}</p>}

                <button
                  type="button"
                  onClick={() => handleSwitchRole('ADMIN')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs rounded transition-colors"
                >
                  Xác Nhận Lên Quyền Admin
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

