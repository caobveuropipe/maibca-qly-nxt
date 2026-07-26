export type TransactionType = 'IMPORT' | 'EXPORT';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string; // Đơn vị tính: Cái, Hộp, Bộ, Thùng, Kg, M mét...
  category: string; // Nhóm hàng: Điện tử, Vật tư, Thực phẩm, Bao bì...
  minStock: number; // Định mức tồn tối thiểu
  maxStock: number; // Định mức tồn tối đa
  costPrice: number; // Giá nhập tham chiếu (VND)
  sellingPrice: number; // Giá xuất tham chiếu (VND)
  description?: string;
}

export interface Transaction {
  id: string;
  voucherCode: string; // Mã phiếu (e.g. PN001, PX001)
  type: TransactionType;
  date: string; // YYYY-MM-DD
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number; // quantity * unitPrice
  partner: string; // Nhà cung cấp hoặc Khách hàng / Bộ phận
  note?: string;
  createdAt: string;
}

export interface StockSummaryItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  category: string;
  minStock: number;
  costPrice: number;
  
  beginningQty: number;   // Tồn đầu kỳ
  beginningValue: number; // Giá trị tồn đầu kỳ
  
  importQty: number;      // Nhập trong kỳ
  importValue: number;    // Giá trị nhập
  
  exportQty: number;      // Xuất trong kỳ
  exportValue: number;    // Giá trị xuất
  
  endingQty: number;      // Tồn cuối kỳ
  endingValue: number;    // Giá trị tồn cuối kỳ
  
  stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
}

export interface StockCardItem {
  date: string;
  voucherCode: string;
  type: TransactionType;
  partner: string;
  note: string;
  warehouseName: string;
  
  importQty: number;
  exportQty: number;
  runningBalance: number;
  
  unitPrice: number;
  totalAmount: number;
}

export interface GoogleSyncConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  idToken?: string;
  userEmail?: string;
  userName?: string;
}
