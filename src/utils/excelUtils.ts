import * as XLSX from 'xlsx';
import { Product, Transaction, StockSummaryItem, StockCardItem, Warehouse } from '../types';

/**
 * Generate and download sample Excel Template for Import/Export Transactions
 */
export const downloadTransactionExcelTemplate = () => {
  const sampleData = [
    {
      'Mã Phếu (*)': 'PN-20260720-01',
      'Loại (* Nhập/Xuất)': 'Nhập',
      'Ngày (* YYYY-MM-DD)': '2026-07-20',
      'Mã Kho (*)': 'K01',
      'Mã Sản Phẩm (*)': 'SP001',
      'Số Lượng (*)': 10,
      'Đối Tác / Nhà Cung Cấp / KH': 'Công ty ABC',
      'Ghi Chú': 'Nhập bổ sung kho',
    },
    {
      'Mã Phếu (*)': 'PX-20260720-01',
      'Loại (* Nhập/Xuất)': 'Xuất',
      'Ngày (* YYYY-MM-DD)': '2026-07-20',
      'Mã Kho (*)': 'K01',
      'Mã Sản Phẩm (*)': 'SP003',
      'Số Lượng (*)': 25,
      'Đối Tác / Nhà Cung Cấp / KH': 'Khách hàng XYZ',
      'Ghi Chú': 'Xuất bán lẻ',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Xuat');

  // Auto column widths
  worksheet['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 16 },
    { wch: 14 }, { wch: 28 }, { wch: 24 }
  ];

  XLSX.writeFile(workbook, 'Mau_Nhap_File_Nhap_Xuat_Kho.xlsx');
};

/**
 * Download Product Catalog Excel Template
 */
export const downloadProductExcelTemplate = () => {
  const sampleData = [
    {
      'Mã SP (*)': 'SP009',
      'Tên Sản Phẩm (*)': 'Chuột không dây Logitech M330',
      'Đơn Vị Tính (*)': 'Cái',
      'Nhóm Hàng': 'Thiết Bị',
      'Tồn Tối Thiểu': 10,
      'Mô Tả': 'Chuột yên tĩnh không tiếng click',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Muc_SP');
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 35 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 30 }
  ];

  XLSX.writeFile(workbook, 'Mau_Danh_Muc_San_Pham.xlsx');
};

/**
 * Parse uploaded Excel file for Import/Export transactions
 */
export const parseTransactionExcel = async (
  file: File,
  products: Product[],
  warehouses: Warehouse[]
): Promise<{ validRecords: Partial<Transaction>[]; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const validRecords: Partial<Transaction>[] = [];
        const errors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // Excel row numbering
          const rawVoucher = row['Mã Phếu (*)'] || row['Mã Phiếu'] || row['Mã phiếu'] || row['VoucherCode'];
          const rawType = (row['Loại (* Nhập/Xuất)'] || row['Loại'] || row['Type'] || '').toString().toLowerCase();
          const rawDate = row['Ngày (* YYYY-MM-DD)'] || row['Ngày'] || row['Date'];
          const rawWhCode = (row['Mã Kho (*)'] || row['Mã Kho'] || row['Kho'] || '').toString().trim();
          const rawProdCode = (row['Mã Sản Phẩm (*)'] || row['Mã SP'] || row['Mã sản phẩm'] || '').toString().trim();
          const rawQty = Number(row['Số Lượng (*)'] || row['Số Lượng'] || row['Số lượng'] || 0);
          const rawPrice = Number(row['Đơn Giá (VND)'] || row['Đơn Giá'] || row['Đơn giá'] || 0);
          const partner = row['Đối Tác / Nhà Cung Cấp / KH'] || row['Đối tác'] || row['Nhà cung cấp'] || '';
          const note = row['Ghi Chú'] || row['Diễn giải'] || '';

          if (!rawWhCode || !rawProdCode || !rawQty) {
            errors.push(`Dòng ${rowNum}: Thiếu Mã Kho, Mã Sản Phẩm hoặc Số Lượng.`);
            return;
          }

          const warehouse = warehouses.find(w => w.code.toLowerCase() === rawWhCode.toLowerCase());
          if (!warehouse) {
            errors.push(`Dòng ${rowNum}: Không tìm thấy Kho có mã "${rawWhCode}".`);
            return;
          }

          const product = products.find(p => p.code.toLowerCase() === rawProdCode.toLowerCase());
          if (!product) {
            errors.push(`Dòng ${rowNum}: Không tìm thấy Sản phẩm có mã "${rawProdCode}".`);
            return;
          }

          const isImport = rawType.includes('nhập') || rawType.includes('import') || rawType === 'in';
          const type = isImport ? 'IMPORT' : 'EXPORT';

          let formattedDate = new Date().toISOString().split('T')[0];
          if (rawDate) {
            if (typeof rawDate === 'number') {
              // Excel serial date
              const parsedDate = XLSX.SSF.parse_date_code(rawDate);
              formattedDate = `${parsedDate.y}-${String(parsedDate.m).padStart(2, '0')}-${String(parsedDate.d).padStart(2, '0')}`;
            } else {
              formattedDate = String(rawDate).trim();
            }
          }

          const unitPrice = rawPrice > 0 ? rawPrice : (isImport ? product.costPrice : product.sellingPrice);
          const voucherCode = rawVoucher || (isImport ? `PN-${Date.now()}` : `PX-${Date.now()}`);

          validRecords.push({
            voucherCode,
            type,
            date: formattedDate,
            warehouseId: warehouse.id,
            warehouseCode: warehouse.code,
            warehouseName: warehouse.name,
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            unit: product.unit,
            quantity: Math.abs(rawQty),
            unitPrice: unitPrice,
            totalAmount: Math.abs(rawQty) * unitPrice,
            partner,
            note,
            createdAt: new Date().toISOString(),
          });
        });

        resolve({ validRecords, errors });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export Stock Summary Report to Excel
 */
export const exportStockSummaryToExcel = (
  items: StockSummaryItem[],
  warehouseName: string,
  fromDate: string,
  toDate: string
) => {
  const exportData = items.map((item, idx) => ({
    'STT': idx + 1,
    'Mã Sản Phẩm': item.productCode,
    'Tên Sản Phẩm': item.productName,
    'Đơn Vị Tính': item.unit,
    'Nhóm Hàng': item.category,
    'Tồn Đầu Kỳ (SL)': item.beginningQty,
    'Nhập Trong Kỳ (SL)': item.importQty,
    'Xuất Trong Kỳ (SL)': item.exportQty,
    'Tồn Cuối Kỳ (SL)': item.endingQty,
    'Trạng Thái Tồn Kho': item.stockStatus === 'LOW' ? 'Tồn thấp (Cảnh báo)' : (item.stockStatus === 'HIGH' ? 'Tồn cao' : 'Bình thường')
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao_Cao_NXT');

  // Format columns
  worksheet['!cols'] = [
    { wch: 6 }, { wch: 15 }, { wch: 35 }, { wch: 12 }, { wch: 18 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 22 }
  ];

  XLSX.writeFile(workbook, `Bao_Cao_NXT_${warehouseName.replace(/\s+/g, '_')}_${fromDate}_den_${toDate}.xlsx`);
};

/**
 * Export Detailed Stock Card (Thẻ kho) to Excel
 */
export const exportStockCardToExcel = (
  product: Product,
  cardItems: StockCardItem[],
  warehouseName: string,
  fromDate: string,
  toDate: string
) => {
  const exportData = cardItems.map((item, idx) => ({
    'STT': idx + 1,
    'Ngày Phiếu': item.date,
    'Mã Phiếu': item.voucherCode,
    'Loại Phiếu': item.type === 'IMPORT' ? 'Nhập Kho' : 'Xuất Kho',
    'Kho Hàng': item.warehouseName,
    'Đối Tác / Người Giao Nhận': item.partner,
    'Diễn Giải / Ghi Chú': item.note,
    'Số Lượng Nhập': item.importQty || 0,
    'Số Lượng Xuất': item.exportQty || 0,
    'Số Lượng Tồn Sau': item.runningBalance,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'The_Kho_Chi_Tiet');

  worksheet['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 20 },
    { wch: 25 }, { wch: 25 }, { wch: 14 }, { wch: 14 }, { wch: 16 }
  ];

  XLSX.writeFile(workbook, `The_Kho_${product.code}_${fromDate}_den_${toDate}.xlsx`);
};
