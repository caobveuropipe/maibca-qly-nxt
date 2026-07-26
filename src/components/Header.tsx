import React from 'react';
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
} from 'lucide-react';
import { GoogleSyncConfig } from '../types';

export type ActiveTab = 'reports' | 'products' | 'warehouses' | 'transactions' | 'sheets';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenExcelUpload: () => void;
  googleConfig: GoogleSyncConfig;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenImportModal,
  onOpenExportModal,
  onOpenExcelUpload,
  googleConfig,
  onQuickSync,
  isSyncing,
}) => {
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
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                  IMS PRO <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold tracking-wider uppercase">v2.4</span>
                </h1>
                <p className="text-[11px] text-slate-400">Quản lý Nhập Xuất Tồn & Đồng bộ Google Sheets</p>
              </div>
            </div>

            {/* Google Sync Quick Badge */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setActiveTab('sheets')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  googleConfig.spreadsheetId
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{googleConfig.spreadsheetId ? 'Sheets Connected' : 'Google Sheets'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Quick Google Sync Button */}
            {googleConfig.spreadsheetId && (
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

            <button
              onClick={onOpenExcelUpload}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Nhập Excel</span>
            </button>

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
        </nav>
      </div>
    </header>
  );
};
