import React, { useState } from 'react';
import { Transaction, Warehouse, Product } from '../types';
import { formatVND, formatNum } from '../utils/storageUtils';
import { generateVoucherPDF } from '../utils/pdfUtils';
import {
  ReceiptText,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Trash2,
  Filter,
  Plus,
  Eye,
  Pencil,
} from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface TransactionsViewProps {
  transactions: Transaction[];
  warehouses: Warehouse[];
  products: Product[];
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onDeleteTransaction: (id: string) => void;
  onSelectVoucher?: (voucherCode: string) => void;
  onEditVoucher?: (voucherCode: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  warehouses,
  products,
  onOpenImportModal,
  onOpenExportModal,
  onDeleteTransaction,
  onSelectVoucher,
  onEditVoucher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IMPORT' | 'EXPORT'>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const warehouseOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả các kho', sublabel: 'Toàn hệ thống' },
    ...warehouses.map((w) => ({
      value: w.id,
      label: `[${w.code}] ${w.name}`,
      sublabel: w.location || undefined,
    })),
  ];

  const typeOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả loại phiếu' },
    { value: 'IMPORT', label: 'Phiếu Nhập Kho' },
    { value: 'EXPORT', label: 'Phiếu Xuất Kho' },
  ];

  // Filtered ledger
  const filteredTxs = transactions
    .filter((t) => {
      const matchesSearch =
        t.voucherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.partner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchesWh = warehouseFilter === 'ALL' || t.warehouseId === warehouseFilter;
      const matchesFrom = !fromDate || t.date >= fromDate;
      const matchesTo = !toDate || t.date <= toDate;

      return matchesSearch && matchesType && matchesWh && matchesFrom && matchesTo;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Totals
  const totalAmount = filteredTxs.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalQty = filteredTxs.reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Nhật ký NX ({transactions.length} Phiếu)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xem danh sách các phiếu nhập xuất kho, in ấn phiếu và theo dõi nhật ký phát sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-sm shadow-emerald-900/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowDownRight className="w-4 h-4" /> + Phiếu Nhập
          </button>
          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" /> + Phiếu Xuất
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, mã SP, tên SP, đối tác..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type */}
            <div className="w-full sm:w-44">
              <SearchableSelect
                options={typeOptions}
                value={typeFilter}
                onChange={(val) => setTypeFilter(val as any)}
                placeholder="Loại phiếu..."
              />
            </div>

            {/* Warehouse */}
            <div className="w-full sm:w-52">
              <SearchableSelect
                options={warehouseOptions}
                value={warehouseFilter}
                onChange={setWarehouseFilter}
                placeholder="Chọn kho..."
                searchPlaceholder="Tìm kho..."
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-md shrink-0">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium text-xs w-[130px]"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium text-xs w-[130px]"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <b>{filteredTxs.length}</b> phiếu phát sinh
          </div>
          <div className="flex items-center gap-4">
            <span>Tổng số lượng: <b className="text-slate-900 dark:text-white font-bold">{formatNum(totalQty)}</b></span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Mã Phiếu</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Kho Hàng</th>
                <th className="px-4 py-3">Mặt Hàng</th>
                <th className="px-4 py-3 text-right">Số Lượng</th>
                <th className="px-4 py-3">Đối Tác</th>
                <th className="px-4 py-3 text-center">In / Xóa</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition-colors">
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
                      className="inline-flex items-center gap-1 hover:underline hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-left"
                      title="Xem chi tiết phiếu"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      {tx.voucherCode}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{tx.date}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{tx.warehouseName}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    <div>[{tx.productCode}] {tx.productName}</div>
                    {tx.note && <div className="text-[10px] text-slate-400 italic">{tx.note}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                    {formatNum(tx.quantity)} {tx.unit}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{tx.partner}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => generateVoucherPDF(tx, transactions)}
                        title="In phiếu PDF"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 rounded transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditVoucher?.(tx.voucherCode)}
                        title="Chỉnh sửa phiếu"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 hover:text-amber-700 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Xóa dòng phiếu"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
