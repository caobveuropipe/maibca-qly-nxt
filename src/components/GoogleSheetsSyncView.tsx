import React, { useState } from 'react';
import { GoogleSyncConfig, Product, Warehouse, Transaction } from '../types';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowUp,
  ArrowDown,
  Layers,
  Copy,
  Link,
} from 'lucide-react';

interface GoogleSheetsSyncViewProps {
  config: GoogleSyncConfig;
  onUpdateConfig: (newConfig: GoogleSyncConfig) => void;
  products: Product[];
  warehouses: Warehouse[];
  transactions: Transaction[];
  onSyncUp: () => Promise<void>;
  onSyncDown: () => Promise<void>;
  isSyncing: boolean;
  syncMessage: string;
}

export const GoogleSheetsSyncView: React.FC<GoogleSheetsSyncViewProps> = ({
  config,
  onUpdateConfig,
  products,
  warehouses,
  transactions,
  onSyncUp,
  onSyncDown,
  isSyncing,
  syncMessage,
}) => {
  const [inputUrl, setInputUrl] = useState(config.spreadsheetUrl || '');

  const handleSaveSpreadsheetUrl = () => {
    onUpdateConfig({
      ...config,
      spreadsheetUrl: inputUrl.trim(),
      syncStatus: 'idle',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 shrink-0">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Đồng Bộ Dữ Liệu Google Sheets (GAS)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Realtime Chạy Ngầm
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Sử dụng Google Apps Script làm cầu nối đám mây. Đồng bộ danh mục nhóm hàng, sản phẩm, đối tác, kho hàng và các phiếu nhập xuất tự động giữa nhiều trình duyệt và tài khoản Google khác nhau.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Feedback */}
      {syncMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-3 ${
            config.syncStatus === 'error'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {config.syncStatus === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Configuration Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" /> Cấu Hình Liên Kết Google Sheet (Apps Script)
          </h3>

          {config.spreadsheetUrl && (
            <a
              href={config.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Mở Google Sheet Trực Tiếp <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="space-y-4">
          {/* Share Link Generator for Staff */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Link className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Link Chia Sẻ Cho Nhân Viên (Tự Động Kết Nối 0-Setup)
              </span>
              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}${window.location.pathname}?gasUrl=${encodeURIComponent(config.gasWebappUrl || '')}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('Đã copy Link Chia Sẻ! Hãy gửi link này cho nhân viên. Nhân viên chỉ cần mở link là tự động kết nối ngầm!');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Link Chia Sẻ
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Gửi đường link này cho nhân viên khác. Nhân viên mở link trên máy bất kỳ là ứng dụng **tự động lưu cấu hình và kết nối ngay lập tức**, không phải dán URL hay setup lại từ đầu!
            </p>
          </div>

          {/* Realtime Auto Sync Toggle */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <RefreshCw className={`w-5 h-5 ${config.autoSync ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Tự Động Đồng Bộ Realtime (Auto-Sync)</span>
                  {config.autoSync && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                      Đang Bật Realtime
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tự động đẩy ngầm lên Sheet khi Tạo/Sửa/Xóa dữ liệu (Debounce 1.5s) & Tự động tải ngầm về mỗi 30s.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={!!config.autoSync}
                onChange={(e) => onUpdateConfig({ ...config, autoSync: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Google Apps Script WebApp URL (Dùng để ghi/đọc dữ liệu trực tiếp):
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="VD: https://script.google.com/macros/s/AKfycbx.../exec"
                value={config.gasWebappUrl || ''}
                onChange={(e) => onUpdateConfig({ ...config, gasWebappUrl: e.target.value.trim() })}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Mã PIN Bảo Mật Admin (Mã PIN dùng để chuyển quyền Admin trên thiết bị):</span>
              <span className="text-[10px] text-amber-500 font-mono font-normal">* Mặc định: 123456</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nhập mã PIN Admin mới (VD: 654321)"
                value={config.adminPin || '123456'}
                onChange={(e) => onUpdateConfig({ ...config, adminPin: e.target.value.trim() })}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đường dẫn Google Sheet (Để click mở nhanh):
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="VD: https://docs.google.com/spreadsheets/d/1ABC123xyz/edit"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSaveSpreadsheetUrl}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-sm transition-all shrink-0"
              >
                Lưu Liên Kết
              </button>
            </div>
          </div>
        </div>


        {/* Sync Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Push Data to Google Sheet */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <ArrowUp className="w-4 h-4" /> Đẩy Dữ Liệu Lên Sheet (Sync Up)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ghi toàn bộ dữ liệu ứng dụng hiện tại ({products.length} sản phẩm, {warehouses.length} kho, {transactions.length} phiếu) vào các tab tương ứng trên Google Sheet.
            </p>
            <button
              onClick={onSyncUp}
              disabled={isSyncing || !config.gasWebappUrl}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Đang đẩy dữ liệu...' : 'Đẩy Dữ Liệu Lên Google Sheet'}
            </button>
          </div>

          {/* Pull Data from Google Sheet */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <ArrowDown className="w-4 h-4" /> Tải Dữ Liệu Từ Sheet Về (Sync Down)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cập nhật dữ liệu vào ứng dụng từ Google Sheet nếu bạn đã sửa trực tiếp các ô bảng tính trên Google Drive.
            </p>
            <button
              onClick={onSyncDown}
              disabled={isSyncing || !config.gasWebappUrl}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Đang tải dữ liệu...' : 'Tải Dữ Liệu Từ Sheet Về App'}
            </button>
          </div>
        </div>

        {/* Structure Preview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Layers className="w-4 h-4 text-blue-600" /> Cấu Trúc Các Tab Được Tạo Trong Google Sheet:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              1. DANH_MUC_KHO
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              2. DANH_MUC_SAN_PHAM
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              3. DANH_MUC_NHOM_HANG
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              4. DOI_TAC
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              5. NHAP_XUAT_KHO
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              6. PHAN_QUYEN
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
              7. NHAT_KY_HOAT_DONG
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
