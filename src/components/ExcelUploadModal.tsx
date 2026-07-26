import React, { useState } from 'react';
import { Product, Warehouse, Transaction } from '../types';
import {
  parseTransactionExcel,
  downloadTransactionExcelTemplate,
  downloadProductExcelTemplate,
} from '../utils/excelUtils';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, X, FileText } from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (records: Partial<Transaction>[]) => void;
  products: Product[];
  warehouses: Warehouse[];
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
  products,
  warehouses,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<Partial<Transaction>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsLoading(true);
    setErrors([]);
    setParsedRecords([]);

    try {
      const res = await parseTransactionExcel(selectedFile, products, warehouses);
      setParsedRecords(res.validRecords);
      setErrors(res.errors);
    } catch (e: any) {
      setErrors([`Lỗi đọc file Excel: ${e.message || 'File không đúng định dạng.'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRecords.length === 0) return;
    onImportTransactions(parsedRecords);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Upload Data Nhập / Xuất Từ File Excel</h3>
              <p className="text-xs text-slate-400">Đồng bộ danh sách phiếu nhập xuất nhanh chóng từ file mẫu .xlsx</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Action to Download Templates */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Chưa có file mẫu chuẩn?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tải file mẫu Excel (.xlsx) chuẩn để nhập dữ liệu đúng cột và không bị lỗi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={downloadTransactionExcelTemplate}
                className="flex-1 md:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Mẫu Nhập Xuất Kho
              </button>
              <button
                onClick={downloadProductExcelTemplate}
                className="flex-1 md:flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Mẫu Sản Phẩm
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              id="excelFileInput"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="excelFileInput" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Kéo thả file Excel vào đây hoặc <span className="text-blue-600 dark:text-blue-400 underline">Bấm để chọn file</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hỗ trợ các định dạng .xlsx, .xls, .csv
              </p>
            </label>
          </div>

          {isLoading && (
            <div className="text-center py-4 text-xs text-blue-600 font-medium animate-pulse">
              Đang đọc và phân tích dữ liệu từ file Excel...
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Phát hiện {errors.length} cảnh báo/lỗi trong file Excel:</span>
              </div>
              <ul className="text-xs text-amber-700 dark:text-amber-400 list-disc list-inside max-h-32 overflow-y-auto space-y-0.5 pt-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Parsed Records */}
          {parsedRecords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Sẵn sàng nhập {parsedRecords.length} dòng phiếu hợp lệ:
                </span>
                <span>File: {file?.name}</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="p-2.5">Loại</th>
                      <th className="p-2.5">Ngày</th>
                      <th className="p-2.5">Mã Kho</th>
                      <th className="p-2.5">Mã SP</th>
                      <th className="p-2.5">Tên Mặt Hàng</th>
                      <th className="p-2.5 text-right">Số Lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.type === 'IMPORT' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.type === 'IMPORT' ? 'NHẬP' : 'XUẤT'}
                          </span>
                        </td>
                        <td className="p-2.5">{r.date}</td>
                        <td className="p-2.5 font-mono">{r.warehouseCode}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-600">{r.productCode}</td>
                        <td className="p-2.5 truncate max-w-[180px] font-medium">{r.productName}</td>
                        <td className="p-2.5 text-right font-bold">{r.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedRecords.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Xác Nhận Import ({parsedRecords.length}) Dòng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
