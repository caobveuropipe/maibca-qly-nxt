import React, { useState, useEffect } from 'react';
import { Product, Warehouse, Transaction, TransactionType } from '../types';
import { X, ArrowDownRight, ArrowUpRight, Plus, AlertCircle, Trash2, Table, FileSpreadsheet, CheckCircle2, CornerDownLeft } from 'lucide-react';
import { formatNum } from '../utils/storageUtils';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface TransactionItemRow {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  note?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: Omit<Transaction, 'id' | 'createdAt'>[], editingVoucherCode?: string) => void;
  products: Product[];
  warehouses: Warehouse[];
  transactions: Transaction[];
  initialType?: TransactionType;
  editingVoucherCode?: string | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  products,
  warehouses,
  transactions,
  initialType = 'IMPORT',
  editingVoucherCode,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [voucherCode, setVoucherCode] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [defaultWarehouseId, setDefaultWarehouseId] = useState('');
  const [partner, setPartner] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<TransactionItemRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCell, setActiveCell] = useState<string | null>(null);

  // Initial setup when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');

      if (editingVoucherCode) {
        const existingItems = transactions.filter((t) => t.voucherCode === editingVoucherCode);
        if (existingItems.length > 0) {
          const main = existingItems[0];
          setType(main.type);
          setVoucherCode(main.voucherCode);
          setDate(main.date);
          setPartner(main.partner);
          setNote(main.note || '');
          setDefaultWarehouseId(main.warehouseId);
          setItems(
            existingItems.map((t, idx) => ({
              id: t.id || `item-edit-${idx}-${Date.now()}`,
              warehouseId: t.warehouseId,
              productId: t.productId,
              quantity: t.quantity,
              note: t.note || '',
            }))
          );
          return;
        }
      }

      setType(initialType);
      const prefix = initialType === 'IMPORT' ? 'PN' : 'PX';
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(100 + Math.random() * 900);
      setVoucherCode(`${prefix}-${dateStr}-${randomNum}`);
      setDate(new Date().toISOString().split('T')[0]);
      setPartner('');
      setNote('');

      const defaultWh = warehouses.find((w) => w.isDefault) || warehouses[0];
      const initialWhId = defaultWh ? defaultWh.id : '';
      setDefaultWarehouseId(initialWhId);

      const firstProd = products[0];
      if (firstProd) {
        setItems([
          {
            id: `item-${Date.now()}-1`,
            warehouseId: initialWhId,
            productId: firstProd.id,
            quantity: 1,
            note: '',
          },
          {
            id: `item-${Date.now()}-2`,
            warehouseId: initialWhId,
            productId: products[1]?.id || firstProd.id,
            quantity: 1,
            note: '',
          },
        ]);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, initialType, editingVoucherCode, warehouses, products, transactions]);

  const handleTypeChange = (newType: TransactionType) => {
    if (editingVoucherCode) return;
    setType(newType);
    const prefix = newType === 'IMPORT' ? 'PN' : 'PX';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    setVoucherCode(`${prefix}-${dateStr}-${randomNum}`);
  };

  const handleDefaultWarehouseChange = (whId: string) => {
    setDefaultWarehouseId(whId);
    setItems((prev) => prev.map((item) => ({ ...item, warehouseId: whId })));
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    if (!firstProd) return;
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        warehouseId: defaultWarehouseId || (warehouses[0]?.id || ''),
        productId: firstProd.id,
        quantity: 1,
        note: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof TransactionItemRow,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  // Options for searchable selects
  const warehouseSelectOptions: SelectOption[] = warehouses.map((w) => ({
    value: w.id,
    label: `[${w.code}] ${w.name}`,
    sublabel: w.location || undefined,
  }));

  const productSelectOptions: SelectOption[] = products.map((p) => ({
    value: p.id,
    label: `[${p.code}] ${p.name}`,
    sublabel: `${p.unit} • ${p.category}`,
  }));

  const getWarehouseStock = (prodId: string, whId: string) => {
    if (!prodId || !whId) return 0;
    let stock = 0;
    transactions.forEach((t) => {
      // If editing an existing voucher, ignore its old items in current stock check
      if (editingVoucherCode && t.voucherCode === editingVoucherCode) return;
      if (t.productId === prodId && t.warehouseId === whId) {
        if (t.type === 'IMPORT') stock += Number(t.quantity);
        else stock -= Number(t.quantity);
      }
    });
    return stock;
  };

  // Calculations
  const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Vui lòng thêm ít nhất một dòng dữ liệu.');
      return;
    }

    // Validation for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.warehouseId) {
        setErrorMsg(`Dòng ${i + 1}: Vui lòng chọn kho hàng.`);
        return;
      }
      if (!item.productId) {
        setErrorMsg(`Dòng ${i + 1}: Vui lòng chọn mặt hàng.`);
        return;
      }
      if (item.quantity <= 0) {
        setErrorMsg(`Dòng ${i + 1}: Số lượng phải lớn hơn 0.`);
        return;
      }

      const prod = products.find((p) => p.id === item.productId);
      const wh = warehouses.find((w) => w.id === item.warehouseId);

      // Stock check for EXPORT
      if (type === 'EXPORT') {
        const stock = getWarehouseStock(item.productId, item.warehouseId);
        if (item.quantity > stock) {
          setErrorMsg(
            `Dòng ${i + 1}: Tồn kho mặt hàng "${prod?.name || item.productId}" tại kho "${wh?.name || item.warehouseId}" chỉ còn ${stock} ${prod?.unit || ''}, không đủ để xuất ${item.quantity}.`
          );
          return;
        }
      }
    }

    // Build transactions list
    const resultTransactions: Omit<Transaction, 'id' | 'createdAt'>[] = items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const wh = warehouses.find((w) => w.id === item.warehouseId)!;

      return {
        voucherCode: voucherCode.trim(),
        type,
        date,
        warehouseId: wh.id,
        warehouseCode: wh.code,
        warehouseName: wh.name,
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        unit: prod.unit,
        quantity: Number(item.quantity),
        unitPrice: 0,
        totalAmount: 0,
        partner: partner.trim() || (type === 'IMPORT' ? 'Nhà cung cấp vãng lai' : 'Khách lẻ'),
        note: item.note?.trim() || note.trim(),
      };
    });

    onSave(resultTransactions, editingVoucherCode || undefined);
    onClose();
  };

  if (!isOpen) return null;

  const isImport = type === 'IMPORT';
  const brandBg = isImport ? 'bg-[#0F7B40]' : 'bg-[#1A73E8]';
  const brandBorder = isImport ? 'border-[#0F7B40]' : 'border-[#1A73E8]';
  const brandText = isImport ? 'text-[#0F7B40]' : 'text-[#1A73E8]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 w-full sm:w-[96vw] max-w-7xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 font-sans">
        
        {/* Excel / Sheets Ribbon Bar Header */}
        <div className={`${brandBg} text-white px-4 py-2.5 flex items-center justify-between shrink-0 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded backdrop-blur-xs flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide uppercase">
                  {editingVoucherCode
                    ? isImport
                      ? `Chỉnh Sửa Phiếu Nhập [${editingVoucherCode}]`
                      : `Chỉnh Sửa Phiếu Xuất [${editingVoucherCode}]`
                    : isImport
                    ? 'Bảng Tính Lập Phiếu Nhập Kho'
                    : 'Bảng Tính Lập Phiếu Xuất Kho'}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-black/20 text-white rounded font-mono">
                  {editingVoucherCode ? 'EDIT MODE' : 'EXCEL GRID MODE'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 dark:text-blue-100 opacity-90">
                Giao diện dạng bảng tính điện tử - Nhập số liệu trực tiếp từng dòng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Spreadsheet Tabs (Sheet Selector) */}
        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 px-3 pt-2 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1 -mb-px">
            {(!editingVoucherCode || type === 'IMPORT') && (
              <button
                type="button"
                onClick={() => handleTypeChange('IMPORT')}
                disabled={Boolean(editingVoucherCode)}
                className={`px-4 py-1.5 font-bold rounded-t-md border-t border-x flex items-center gap-2 transition-all ${
                  editingVoucherCode ? 'cursor-default' : 'cursor-pointer'
                } ${
                  type === 'IMPORT'
                    ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-[#0F7B40] dark:text-emerald-400 border-b-2 border-b-[#0F7B40] dark:border-b-emerald-400 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-[#0F7B40]" />
                <span>Sheet 1: PHIẾU NHẬP KHO</span>
              </button>
            )}
            {(!editingVoucherCode || type === 'EXPORT') && (
              <button
                type="button"
                onClick={() => handleTypeChange('EXPORT')}
                disabled={Boolean(editingVoucherCode)}
                className={`px-4 py-1.5 font-bold rounded-t-md border-t border-x flex items-center gap-2 transition-all ${
                  editingVoucherCode ? 'cursor-default' : 'cursor-pointer'
                } ${
                  type === 'EXPORT'
                    ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-[#1A73E8] dark:text-blue-400 border-b-2 border-b-[#1A73E8] dark:border-b-blue-400 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#1A73E8]" />
                <span>Sheet 2: PHIẾU XUẤT KHO</span>
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 pb-1 text-[11px] font-mono text-slate-500">
            <span>Formula Bar (fx): <b className="text-slate-700 dark:text-slate-300 font-semibold">{voucherCode || 'PN-001'}</b></span>
          </div>
        </div>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Spreadsheet Voucher Property Header (Form Block) */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded border border-slate-300 dark:border-slate-700 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-slate-400" /> THÔNG TIN THUỘC TÍNH PHIẾU
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Mã Phiếu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Mã Phiếu (*)</span>
                </div>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:bg-white focus:ring-2 focus:ring-[#0F7B40] focus:border-[#0F7B40] outline-none transition-all"
                />
              </div>

              {/* Ngày Lập */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Ngày Lập (*)</span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:bg-white focus:ring-2 focus:ring-[#0F7B40] focus:border-[#0F7B40] outline-none transition-all"
                />
              </div>

              {/* Kho Mặc Định */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Kho Mặc Định Bảng</span>
                </div>
                <SearchableSelect
                  options={warehouseSelectOptions}
                  value={defaultWarehouseId}
                  onChange={handleDefaultWarehouseChange}
                  placeholder="Chọn kho..."
                  searchPlaceholder="Tìm mã/tên kho..."
                />
              </div>

              {/* Đối Tác */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Đối Tác ({isImport ? 'NCC' : 'Khách Hàng'})</span>
                </div>
                <input
                  type="text"
                  placeholder={isImport ? 'Nhà cung cấp ABC...' : 'Khách hàng / Bộ phận...'}
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:bg-white focus:ring-2 focus:ring-[#0F7B40] focus:border-[#0F7B40] outline-none transition-all"
                />
              </div>
            </div>

            {/* Note Row */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="Diễn giải lý do nhập/xuất hoặc ghi chú chung cho phiếu..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:bg-white focus:ring-2 focus:ring-[#0F7B40] outline-none"
              />
            </div>
          </div>

          {/* Spreadsheet Data Grid Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs overflow-hidden">
            
            {/* Grid Action Toolbar */}
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#0F7B40]" /> Chi Tiết Mặt Hàng ({items.length} dòng)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-[#0F7B40] hover:bg-[#0c6333] text-white font-semibold text-xs rounded border border-[#0F7B40] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Dòng Mới
                  <span className="text-[10px] opacity-80 hidden sm:inline ml-1 font-mono">(Enter)</span>
                </button>
              </div>
            </div>

            {/* Table Grid */}
            <div className="overflow-x-auto max-h-[55vh] min-h-[280px]">
              <table className="w-full text-left border-collapse min-w-[820px] text-xs font-sans">
                <thead>
                  {/* Header Titles Bar */}
                  <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-xs font-bold border-b border-slate-300 dark:border-slate-700 select-none">
                    <th className="p-2.5 text-center border-r border-slate-300 dark:border-slate-700 w-12 text-slate-500 font-mono">
                      STT
                    </th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 min-w-[200px] w-52">
                      Kho Hàng
                    </th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 min-w-[280px]">
                      Sản Phẩm (Mặt Hàng)
                    </th>
                    <th className="p-2.5 text-right border-r border-slate-300 dark:border-slate-700 min-w-[150px] w-40">
                      Số Lượng (*)
                    </th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 min-w-[220px] w-64">
                      Ghi Chú Dòng
                    </th>
                    <th className="p-2.5 text-center w-12">
                      
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {items.map((item, idx) => {
                    const selectedProd = products.find((p) => p.id === item.productId);
                    const stock = getWarehouseStock(item.productId, item.warehouseId);
                    const isOverStock = type === 'EXPORT' && item.quantity > stock;

                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/60 transition-colors group"
                      >
                        {/* STT Column */}
                        <td className="p-2 text-center font-mono text-xs text-slate-500 font-semibold border-r border-slate-200 dark:border-slate-800 w-12">
                          {idx + 1}
                        </td>

                        {/* Warehouse Cell */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 min-w-[200px]">
                          <SearchableSelect
                            options={warehouseSelectOptions}
                            value={item.warehouseId}
                            onChange={(val) => handleItemChange(item.id, 'warehouseId', val)}
                            placeholder="Chọn kho..."
                            searchPlaceholder="Tìm kho..."
                          />
                        </td>

                        {/* Product Cell */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 min-w-[280px]">
                          <SearchableSelect
                            options={productSelectOptions}
                            value={item.productId}
                            onChange={(val) => handleItemChange(item.id, 'productId', val)}
                            placeholder="Chọn sản phẩm..."
                            searchPlaceholder="Tìm mã/tên sản phẩm..."
                          />

                          {selectedProd && (
                            <div className="mt-1 text-[11px] flex items-center justify-between px-1">
                              <span className="text-slate-400 font-mono">Tồn hiện tại:</span>
                              <span className={`font-bold font-mono ${isOverStock ? 'text-red-600 dark:text-red-400' : 'text-[#0F7B40] dark:text-emerald-400'}`}>
                                {formatNum(stock)} {selectedProd.unit}
                                {isOverStock && ' (Vượt tồn!)'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Quantity Cell */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 min-w-[150px] w-40">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onFocus={() => setActiveCell(`qty-${item.id}`)}
                            onBlur={() => setActiveCell(null)}
                            onChange={(e) => handleItemChange(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddItem();
                              }
                            }}
                            className={`w-full px-3 py-1.5 text-right font-mono font-bold rounded text-xs outline-none transition-all ${
                              activeCell === `qty-${item.id}`
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-[#0F7B40] ring-2 ring-[#0F7B40]/20 text-[#0F7B40] dark:text-emerald-400'
                                : isOverStock
                                ? 'bg-red-50 dark:bg-red-950/40 border border-red-500 text-red-600'
                                : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                            }`}
                          />
                        </td>

                        {/* Line Note Cell */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 min-w-[220px] w-64">
                          <input
                            type="text"
                            placeholder="Ghi chú chi tiết dòng..."
                            value={item.note || ''}
                            onChange={(e) => handleItemChange(item.id, 'note', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded text-xs focus:bg-white focus:border-[#0F7B40] outline-none"
                          />
                        </td>

                        {/* Remove Action Cell */}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length <= 1}
                            className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded transition-colors cursor-pointer"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Excel Add Row Bar */}
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[#0F7B40] dark:text-emerald-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-emerald-50 dark:hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" /> + Thêm dòng sản phẩm tiếp theo
              </button>

              <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Mẹo: Nhấn <b>Enter</b> tại ô Số lượng để tự động thêm dòng mới</span>
              </div>
            </div>
          </div>

          {/* Spreadsheet Live Status Bar */}
          <div className="bg-[#0F7B40] text-white p-2.5 rounded flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs font-mono">
            <div className="flex flex-wrap items-center gap-4 text-emerald-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>COUNT = <b>{items.length}</b> dòng</span>
              </span>
              <span>|</span>
              <span>
                SUM(Số Lượng) = <b className="text-white text-sm font-bold">{formatNum(totalQuantity)}</b> đơn vị
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 text-xs font-bold text-[#0F7B40] bg-white hover:bg-emerald-50 rounded shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0F7B40]" />
                {isImport ? `LƯU PHIẾU NHẬP (${items.length} DÒNG)` : `LƯU PHIẾU XUẤT (${items.length} DÒNG)`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
