import React, { useState } from 'react';
import { Product, Warehouse, Transaction, StockSummaryItem } from '../types';
import { calculateStockSummary, formatVND, formatNum } from '../utils/storageUtils';
import {
  Package,
  Warehouse as WarehouseIcon,
  DollarSign,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Boxes,
  Plus,
} from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface DashboardViewProps {
  products: Product[];
  warehouses: Warehouse[];
  transactions: Transaction[];
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenProductModal: () => void;
  onNavigateTab: (tab: 'products' | 'transactions' | 'reports' | 'sheets') => void;
  onSelectVoucher?: (voucherCode: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  warehouses,
  transactions,
  onOpenImportModal,
  onOpenExportModal,
  onOpenProductModal,
  onNavigateTab,
  onSelectVoucher,
}) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');

  // Calculate stock summary
  const summaryItems = calculateStockSummary(products, transactions, selectedWarehouseId);

  // Key Metrics
  const totalValuation = summaryItems.reduce((acc, item) => acc + item.endingValue, 0);
  const totalQuantity = summaryItems.reduce((acc, item) => acc + item.endingQty, 0);
  const lowStockItems = summaryItems.filter((item) => item.stockStatus === 'LOW');
  const highStockItems = summaryItems.filter((item) => item.stockStatus === 'HIGH');

  // Total imports & exports in last 30 days
  const totalImportAmount = transactions
    .filter((t) => t.type === 'IMPORT')
    .reduce((acc, t) => acc + t.totalAmount, 0);

  const totalExportAmount = transactions
    .filter((t) => t.type === 'EXPORT')
    .reduce((acc, t) => acc + t.totalAmount, 0);

  // Top 5 items by total stock value
  const topValuedItems = [...summaryItems]
    .sort((a, b) => b.endingValue - a.endingValue)
    .slice(0, 5);

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter & Quick Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Quản Lý Nhập Xuất Tồn Kho
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng quan biến động hàng hóa, tồn kho và các cảnh báo định mức thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3 min-w-[220px]">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0">
            Chọn Kho:
          </label>
          <SearchableSelect
            options={[
              { value: 'ALL', label: `Tất cả kho (${warehouses.length} kho)`, sublabel: 'Toàn hệ thống' },
              ...warehouses.map((w) => ({
                value: w.id,
                label: `[${w.code}] ${w.name}`,
                sublabel: w.location || undefined,
              })),
            ]}
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            placeholder="Chọn kho..."
            searchPlaceholder="Tìm kho..."
            className="w-full"
          />
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Stock Quantity */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tổng Tồn Kho</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {formatNum(totalQuantity)} <span className="text-sm font-normal text-slate-400">đơn vị</span>
          </h3>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span>↑ Tình trạng tồn ổn định</span>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Mặt Hàng Quản Lý</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {products.length} <span className="text-sm font-normal text-slate-400">sản phẩm</span>
          </h3>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">Toàn hệ thống danh mục</div>
        </div>

        {/* Card 3: Total Warehouses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Kho Hàng Trực Thuộc</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
            {warehouses.length} <span className="text-sm font-normal text-slate-400">kho</span>
          </h3>
          <div className="mt-2 text-[11px] text-blue-500 font-medium">Đang hoạt động lưu trữ</div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Cảnh Báo Tồn Thấp</p>
          <h3 className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
            {lowStockItems.length < 10 ? `0${lowStockItems.length}` : lowStockItems.length}
          </h3>
          <div className={`mt-2 text-[11px] font-medium ${lowStockItems.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {lowStockItems.length > 0 ? 'Dưới định mức an toàn' : 'An toàn kho'}
          </div>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert Table & Recent Activity Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Warnings */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Mặt hàng dưới định mức tồn ({lowStockItems.length})
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Xem báo cáo NXT &rarr;
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <Boxes className="w-5 h-5" />
              </div>
              Tất cả các mặt hàng hiện đều đang ở mức tồn kho an toàn!
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Mã SP</th>
                    <th className="px-4 py-3">Tên Sản Phẩm</th>
                    <th className="px-4 py-3 text-right">Tồn Kho</th>
                    <th className="px-4 py-3 text-right">Mức An Toàn</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {lowStockItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                        {item.productCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {item.productName}
                        <span className="text-[10px] text-slate-400 block">{item.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">
                        {formatNum(item.endingQty)} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatNum(item.minStock)} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full text-[10px] font-bold">
                          CẦN NHẬP
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Activity Sidebar Card */}
        <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Biến Động Gần Đây
            </h4>
            <div className="space-y-4">
              {recentTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-start gap-3">
                  <div
                    className={`w-1 h-8 rounded shrink-0 ${
                      tx.type === 'IMPORT' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">
                      {formatNum(tx.quantity)} {tx.productName}
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      {tx.type === 'IMPORT' ? 'Nhập' : 'Xuất'} {tx.warehouseName} &bull; {tx.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => onNavigateTab('transactions')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold uppercase transition-colors text-center"
            >
              Xem tất cả nhật ký &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
              Nhật Ký NX Mới Nhất
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Xem toàn bộ nhật ký NX &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Mã Phiếu</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Kho</th>
                <th className="px-4 py-3">Mặt Hàng</th>
                <th className="px-4 py-3 text-right">Số Lượng</th>
                <th className="px-4 py-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === 'IMPORT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {tx.type === 'IMPORT' ? 'NHẬP' : 'XUẤT'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    <button
                      type="button"
                      onClick={() => onSelectVoucher?.(tx.voucherCode)}
                      className="hover:underline hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-left"
                      title="Xem chi tiết phiếu"
                    >
                      {tx.voucherCode}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{tx.date}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{tx.warehouseName}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    [{tx.productCode}] {tx.productName}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{formatNum(tx.quantity)} {tx.unit}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                      ĐÃ LƯU
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
