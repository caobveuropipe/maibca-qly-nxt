import React, { useState, useEffect } from 'react';
import { GoogleSyncConfig, Product, Warehouse, Transaction } from '../types';
import {
  FileSpreadsheet,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowUp,
  ArrowDown,
  Layers,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface GoogleSheetsSyncViewProps {
  config: GoogleSyncConfig;
  onUpdateConfig: (newConfig: GoogleSyncConfig) => void;
  products: Product[];
  warehouses: Warehouse[];
  transactions: Transaction[];
  onSyncUp: () => Promise<void>;
  onSyncDown: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
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
  onCreateNewSheet,
  isSyncing,
  syncMessage,
}) => {
  const [inputUrl, setInputUrl] = useState(config.spreadsheetUrl || config.spreadsheetId || '');

  useEffect(() => {
    // Initialize Google Sign-in button
    if (typeof window !== 'undefined' && (window as any).google && !config.idToken) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: firebaseConfig.oAuthClientId,
          callback: (response: any) => {
            const idToken = response.credential;
            try {
              const base64Url = idToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                window
                  .atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              onUpdateConfig({
                ...config,
                idToken,
                userEmail: payload.email,
                userName: payload.name,
                syncStatus: 'idle',
              });
            } catch (e) {
              console.error('Lỗi phân tích ID Token từ Google:', e);
            }
          },
        });

        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', text: 'signin_with' }
        );
      } catch (err) {
        console.error('Lỗi tải Google Identity Service SDK:', err);
      }
    }
  }, [config.idToken, onUpdateConfig, config]);

  const handleSaveSpreadsheetId = () => {
    let sheetId = inputUrl.trim();
    const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    onUpdateConfig({
      ...config,
      spreadsheetId: sheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      syncStatus: 'idle',
    });
  };

  const handleLogout = () => {
    onUpdateConfig({
      ...config,
      idToken: '',
      userEmail: '',
      userName: '',
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
                <h2 className="text-xl font-bold tracking-tight">Đồng Bộ Dữ Liệu Google Sheets</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Xác Thực OAuth 2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Sử dụng Google Sheet làm cơ sở dữ liệu lưu trữ đám mây. Bảo mật phân quyền theo từng email và tab trang tính được kiểm soát tự động.
              </p>
            </div>
          </div>

          <button
            onClick={onCreateNewSheet}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tự Động Tạo Sheet Mới</span>
          </button>
        </div>
      </div>

      {/* Google Login Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Xác Thực Tài Khoản Google (Tùy chọn)
        </h3>

        {!config.idToken ? (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đăng nhập Google nếu muốn phân quyền chi tiết. Bạn có thể sử dụng đầy đủ các tính năng Tạo/Đồng Bộ Sheet mà không bắt buộc phải đăng nhập.
            </p>
            <div id="google-signin-btn" className="transition-all shrink-0"></div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-850 dark:text-slate-200">
                  {config.userName || 'Người dùng Google'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {config.userEmail}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 font-semibold text-xs rounded-md flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng Xuất
            </button>
          </div>
        )}
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
            <Database className="w-4 h-4 text-blue-600" /> Cấu Hình Liên Kết Google Sheet
          </h3>

          {config.spreadsheetId && (
            <a
              href={config.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Mở Google Sheet Trực Tiếp <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Dán URL Google Sheet hoặc Spreadsheet ID:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="VD: https://docs.google.com/spreadsheets/d/1ABC123xyz/edit hoặc 1ABC123xyz"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleSaveSpreadsheetId}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-sm transition-all shrink-0"
            >
              Lưu Liên Kết
            </button>
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
              disabled={isSyncing || !config.spreadsheetId}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-all"
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
              disabled={isSyncing || !config.spreadsheetId}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-all"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              1. DANH_MUC_KHO
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              2. DANH_MUC_SAN_PHAM
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              3. NHAP_XUAT_KHO
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400">
              4. PHAN_QUYEN
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400">
              5. NHAT_KY_HOAT_DONG
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
