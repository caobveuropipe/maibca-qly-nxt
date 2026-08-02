import React from 'react';
import { Transaction } from '../types';
import { X, Printer, Trash2, Calendar, User, Warehouse as WarehouseIcon, FileSpreadsheet, ArrowDownRight, ArrowUpRight, Tag, Info, Pencil } from 'lucide-react';
import { formatNum } from '../utils/storageUtils';
import { generateVoucherPDF } from '../utils/pdfUtils';

interface VoucherDetailModalProps {
  voucherCode: string | null;
  transactions: Transaction[];
  onClose: () => void;
  onDeleteVoucher: (voucherCode: string) => void;
  onEditVoucher?: (voucherCode: string) => void;
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  voucherCode,
  transactions,
  onClose,
  onDeleteVoucher,
  onEditVoucher,
}) => {
  if (!voucherCode) return null;

  // Find all items belonging to this voucher code
  const voucherItems = transactions.filter((t) => t.voucherCode === voucherCode);

  if (voucherItems.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center max-w-md w-full space-y-4">
          <p className="text-sm text-slate-500">Không tìm thấy thông tin cho mã phiếu <b>{voucherCode}</b>.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-md hover:bg-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const mainItem = voucherItems[0];
  const isImport = mainItem.type === 'IMPORT';
  const totalQty = voucherItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa phiếu "${voucherCode}" gồm ${voucherItems.length} dòng sản phẩm không?`)) {
      onDeleteVoucher(voucherCode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 font-sans">
        
        {/* Header Ribbon */}
        <div className={`p-4 ${isImport ? 'bg-[#0F7B40]' : 'bg-[#1A73E8]'} text-white flex items-center justify-between shrink-0 shadow-xs`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xs flex items-center justify-center">
              {isImport ? <ArrowDownRight className="w-5 h-5 text-white" /> : <ArrowUpRight className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide uppercase">
                  {isImport ? 'CHI TIẾT PHIẾU NHẬP KHO' : 'CHI TIẾT PHIẾU XUẤT KHO'}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black/25 text-white rounded">
                  {voucherCode}
                </span>
              </div>
              <p className="text-xs text-emerald-100 dark:text-blue-100 opacity-90 mt-0.5">
                Ngày lập: {mainItem.date} &bull; Đối tác: {mainItem.partner}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* General Voucher Attributes Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Mã Số Phiếu</p>
                <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{voucherCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Ngày Phát Sinh</p>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{mainItem.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">{isImport ? 'Nhà Cung Cấp' : 'Khách Hàng / Bộ Phận'}</p>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{mainItem.partner}</p>
              </div>
            </div>

            {mainItem.note && (
              <div className="sm:col-span-3 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  <b>Diễn giải:</b> {mainItem.note}
                </p>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Danh Sách Mặt Hàng ({voucherItems.length} dòng)
              </span>
              <span className="text-slate-500">
                Tổng số lượng: <b className="text-slate-900 dark:text-white font-bold">{formatNum(totalQty)}</b> đơn vị
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5 w-10 text-center">STT</th>
                    <th className="p-2.5">Kho Hàng</th>
                    <th className="p-2.5">Mã SP</th>
                    <th className="p-2.5">Tên Mặt Hàng</th>
                    <th className="p-2.5 text-center">ĐVT</th>
                    <th className="p-2.5 text-right">Số Lượng</th>
                    <th className="p-2.5">Ghi Chú Dòng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {voucherItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">
                        {item.warehouseName} ({item.warehouseCode})
                      </td>
                      <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{item.productCode}</td>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{item.productName}</td>
                      <td className="p-2.5 text-center text-slate-500">{item.unit}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white font-mono text-sm">
                        {formatNum(item.quantity)}
                      </td>
                      <td className="p-2.5 text-slate-400 italic text-[11px]">{item.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Xóa Phiếu
            </button>
            {onEditVoucher && (
              <button
                type="button"
                onClick={() => {
                  onEditVoucher(voucherCode);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" /> Sửa Phiếu
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateVoucherPDF(voucherItems)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In Phiếu PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-md transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
