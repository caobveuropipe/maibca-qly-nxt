import React, { useState } from 'react';
import { Product, Warehouse, Transaction } from '../types';
import { calculateStockSummary, calculateStockCard, formatVND, formatNum } from '../utils/storageUtils';
import {
  exportStockSummaryToExcel,
  exportStockCardToExcel,
} from '../utils/excelUtils';
import {
  generateStockSummaryPDF,
  generateStockCardPDF,
} from '../utils/pdfUtils';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Warehouse as WarehouseIcon,
  Search,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface ReportsViewProps {
  products: Product[];
  warehouses: Warehouse[];
  transactions: Transaction[];
  selectedProductIdForCard?: string;
  onSelectVoucher?: (voucherCode: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  warehouses,
  transactions,
  selectedProductIdForCard,
  onSelectVoucher,
}) => {
  const [reportType, setReportType] = useState<'SUMMARY' | 'STOCK_CARD'>(
    selectedProductIdForCard ? 'STOCK_CARD' : 'SUMMARY'
  );

  const [warehouseId, setWarehouseId] = useState<string>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    selectedProductIdForCard || (products[0] ? products[0].id : '')
  );

  React.useEffect(() => {
    if (selectedProductIdForCard) {
      setSelectedProductId(selectedProductIdForCard);
      setReportType('STOCK_CARD');
    }
  }, [selectedProductIdForCard]);

  const handleSelectProductForCard = (productId: string) => {
    setSelectedProductId(productId);
    setReportType('STOCK_CARD');
  };

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [hideZeroActivity, setHideZeroActivity] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const warehouseOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả các kho', sublabel: 'Toàn hệ thống' },
    ...warehouses.map((w) => ({
      value: w.id,
      label: `[${w.code}] ${w.name}`,
      sublabel: w.location || undefined,
    })),
  ];

  const productOptions: SelectOption[] = products.map((p) => ({
    value: p.id,
    label: `[${p.code}] ${p.name}`,
    sublabel: `${p.unit} • ${p.category}`,
  }));

  // Warehouse Name Helper
  const selectedWh = warehouses.find((w) => w.id === warehouseId);
  const warehouseName = warehouseId === 'ALL' ? 'Tất cả các kho' : (selectedWh ? selectedWh.name : 'Kho hàng');

  // Calculate Data
  const rawSummaryData = calculateStockSummary(products, transactions, warehouseId, fromDate, toDate);

  const summaryData = rawSummaryData.filter((item) => {
    // Check if item has any activity or inventory balance in period
    const hasActivityOrStock = !(
      item.beginningQty === 0 &&
      item.importQty === 0 &&
      item.exportQty === 0 &&
      item.endingQty === 0
    );

    if (hideZeroActivity && !hasActivityOrStock) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchCode = item.productCode.toLowerCase().includes(q);
      const matchName = item.productName.toLowerCase().includes(q);
      return matchCode || matchName;
    }

    return true;
  });
  const { product: stockCardProduct, cardItems, initialBalance } = calculateStockCard(
    selectedProductId,
    products,
    transactions,
    warehouseId,
    fromDate,
    toDate
  );

  // Handlers for Export
  const handleExportSummaryExcel = () => {
    exportStockSummaryToExcel(
      summaryData,
      warehouseName,
      fromDate || 'Đầu kỳ',
      toDate || new Date().toISOString().split('T')[0]
    );
  };

  const handleExportSummaryPDF = () => {
    generateStockSummaryPDF(
      summaryData,
      warehouseName,
      fromDate || 'Dau ky',
      toDate || new Date().toISOString().split('T')[0]
    );
  };

  const handleExportCardExcel = () => {
    if (!stockCardProduct) return;
    exportStockCardToExcel(
      stockCardProduct,
      cardItems,
      warehouseName,
      fromDate || 'Đầu kỳ',
      toDate || new Date().toISOString().split('T')[0]
    );
  };

  const handleExportCardPDF = () => {
    if (!stockCardProduct) return;
    generateStockCardPDF(
      stockCardProduct,
      cardItems,
      warehouseName,
      fromDate || 'Dau ky',
      toDate || new Date().toISOString().split('T')[0]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Báo Cáo Nhập Xuất Tồn & Thẻ Kho Chi Tiết
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng hợp dữ liệu tồn kho theo thời gian thực, hỗ trợ xuất báo cáo chuẩn Excel & PDF in ấn
          </p>
        </div>

        {/* Report Mode Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setReportType('SUMMARY')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all ${
              reportType === 'SUMMARY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Báo Cáo Tổng Hợp
          </button>
          <button
            onClick={() => setReportType('STOCK_CARD')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all ${
              reportType === 'STOCK_CARD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Thẻ Kho Chi Tiết
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Kho */}
          <div className="flex items-center gap-1.5 min-w-[200px]">
            <WarehouseIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <SearchableSelect
              options={warehouseOptions}
              value={warehouseId}
              onChange={setWarehouseId}
              placeholder="Chọn kho..."
              searchPlaceholder="Tìm tên/mã kho..."
              className="w-full"
            />
          </div>

          {/* If Stock Card, pick product */}
          {reportType === 'STOCK_CARD' ? (
            <div className="flex items-center gap-1.5 min-w-[260px]">
              <span className="font-semibold text-slate-600 dark:text-slate-400 shrink-0">Sản phẩm:</span>
              <SearchableSelect
                options={productOptions}
                value={selectedProductId}
                onChange={setSelectedProductId}
                placeholder="Chọn sản phẩm..."
                searchPlaceholder="Tìm tên/mã sản phẩm..."
                className="w-full"
              />
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="flex items-center gap-1.5 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                <input
                  type="text"
                  placeholder="Tìm mã, tên SP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none text-slate-800 dark:text-slate-200 font-medium w-36 focus:w-48 transition-all"
                />
              </div>

              {/* Hide Zero Activity Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold select-none bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={hideZeroActivity}
                  onChange={(e) => setHideZeroActivity(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span>Ẩn SP không có phát sinh / tồn</span>
              </label>
            </>
          )}

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none font-medium"
            />
            <span>&rarr;</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none font-medium"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          {reportType === 'SUMMARY' ? (
            <>
              <button
                onClick={handleExportSummaryExcel}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
              </button>
              <button
                onClick={handleExportSummaryPDF}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
              >
                <Printer className="w-4 h-4" /> Xuất PDF In
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExportCardExcel}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
              </button>
              <button
                onClick={handleExportCardPDF}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
              >
                <Printer className="w-4 h-4" /> Xuất PDF In
              </button>
            </>
          )}
        </div>
      </div>

      {/* REPORT CONTENT VIEW 1: SUMMARY TABLE */}
      {reportType === 'SUMMARY' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div>
              BÁO CÁO TỔNG HỢP NHẬP XUẤT TỒN KHO &bull; <span className="text-blue-600 dark:text-blue-400 font-bold">{warehouseName}</span>
            </div>
            <div>
              Kỳ báo cáo: {fromDate || 'Đầu kỳ'} &rarr; {toDate || 'Hiện tại'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">Mã SP</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">Tên Mặt Hàng</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">ĐVT</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-right">Tồn Đầu Kỳ</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-right">Nhập Trong Kỳ</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-right">Xuất Trong Kỳ</th>
                  <th className="p-3 text-right font-bold">Tồn Cuối Kỳ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaryData.length > 0 ? (
                  summaryData.map((item) => (
                    <tr
                      key={item.productId}
                      onClick={() => handleSelectProductForCard(item.productId)}
                      className="hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      title="Click để xem Thẻ Kho Chi Tiết của mặt hàng này"
                    >
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                        <span className="group-hover:underline">{item.productCode}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                        {item.productName}
                      </td>
                      <td className="p-3 text-slate-500 border-r border-slate-100 dark:border-slate-800">{item.unit}</td>
                      <td className="p-3 text-right border-r border-slate-100 dark:border-slate-800 text-slate-600">
                        {formatNum(item.beginningQty)}
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-600 border-r border-slate-100 dark:border-slate-800">
                        {formatNum(item.importQty)}
                      </td>
                      <td className="p-3 text-right font-semibold text-blue-600 border-r border-slate-100 dark:border-slate-800">
                        {formatNum(item.exportQty)}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatNum(item.endingQty)} {item.unit}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      Không có sản phẩm nào phát sinh nhập xuất hoặc tồn kho trong kỳ báo cáo này.
                    </td>
                  </tr>
                )}
              </tbody>
              {/* Total Row */}
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={3} className="p-3 text-center uppercase tracking-wider text-[10px]">
                    TỔNG CỘNG
                  </td>
                  <td className="p-3 text-right">
                    {formatNum(summaryData.reduce((acc, i) => acc + i.beginningQty, 0))}
                  </td>
                  <td className="p-3 text-right text-emerald-600">
                    {formatNum(summaryData.reduce((acc, i) => acc + i.importQty, 0))}
                  </td>
                  <td className="p-3 text-right text-blue-600">
                    {formatNum(summaryData.reduce((acc, i) => acc + i.exportQty, 0))}
                  </td>
                  <td className="p-3 text-right font-black">
                    {formatNum(summaryData.reduce((acc, i) => acc + i.endingQty, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT VIEW 2: DETAILED STOCK CARD */}
      {reportType === 'STOCK_CARD' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
          {stockCardProduct ? (
            <>
              {/* Product Info Summary Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    THẺ KHO CHI TIẾT: [{stockCardProduct.code}] - {stockCardProduct.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Đơn vị tính: <b>{stockCardProduct.unit}</b> &bull; Nhóm hàng: <b>{stockCardProduct.category}</b> &bull; Kho: <b>{warehouseName}</b>
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold text-xs">
                  Tồn Đầu Kỳ: {formatNum(initialBalance)} {stockCardProduct.unit}
                </div>
              </div>

              {/* Stock Ledger List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Ngày</th>
                      <th className="p-3">Mã Phiếu</th>
                      <th className="p-3">Kho Hàng</th>
                      <th className="p-3">Diễn Giải / Đối Tác</th>
                      <th className="p-3 text-right text-emerald-600">Số Lượng Nhập</th>
                      <th className="p-3 text-right text-blue-600">Số Lượng Xuất</th>
                      <th className="p-3 text-right font-bold">Tồn Sau Giao Dịch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 italic font-semibold text-slate-600 dark:text-slate-400">
                      <td className="p-3">{fromDate || 'Đầu kỳ'}</td>
                      <td className="p-3">-</td>
                      <td className="p-3">{warehouseName}</td>
                      <td className="p-3">Dư tồn đầu kỳ báo cáo</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatNum(initialBalance)}
                      </td>
                    </tr>
                    {cardItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <td className="p-3 text-slate-500">{item.date}</td>
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.voucherCode !== '-' ? (
                            <button
                              type="button"
                              onClick={() => onSelectVoucher?.(item.voucherCode)}
                              className="hover:underline hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-left"
                              title="Xem chi tiết phiếu"
                            >
                              {item.voucherCode}
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{item.warehouseName}</td>
                        <td className="p-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{item.partner}</span>
                          {item.note && <div className="text-[10px] text-slate-400 italic">{item.note}</div>}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          {item.importQty ? formatNum(item.importQty) : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-blue-600">
                          {item.exportQty ? formatNum(item.exportQty) : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatNum(item.runningBalance)} {stockCardProduct.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Vui lòng chọn 1 sản phẩm để xem thẻ kho chi tiết.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
