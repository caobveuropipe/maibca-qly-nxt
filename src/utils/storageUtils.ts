import { Product, Warehouse, Transaction, StockSummaryItem, StockCardItem, GoogleSyncConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_WAREHOUSES } from '../data/mockData';
import { formatVND, formatNum } from './pdfUtils';

export { formatVND, formatNum };

const LOCAL_STORAGE_KEY_PRODUCTS = 'nxt_inventory_products_v1';
const LOCAL_STORAGE_KEY_WAREHOUSES = 'nxt_inventory_warehouses_v1';
const LOCAL_STORAGE_KEY_TRANSACTIONS = 'nxt_inventory_transactions_v1';
const LOCAL_STORAGE_KEY_GOOGLE_CONFIG = 'nxt_inventory_google_config_v1';

// Initial state loader
export const loadInitialState = () => {
  let products: Product[] = INITIAL_PRODUCTS;
  let warehouses: Warehouse[] = INITIAL_WAREHOUSES;
  let transactions: Transaction[] = INITIAL_TRANSACTIONS;
  let googleConfig: GoogleSyncConfig = {
    spreadsheetId: '',
    spreadsheetUrl: '',
    gasWebappUrl: 'https://script.google.com/macros/s/AKfycbxNuC3kUO_pYSSlB5XMUoIttKZoZo42dxxZKhf_Mg6j9tlbGpteqkG_-ZiBTQvZig0qmw/exec',
    autoSync: false,
    syncStatus: 'idle',
    idToken: '',
    userEmail: '',
    userName: '',
  };

  try {
    const savedProducts = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
    if (savedProducts) products = JSON.parse(savedProducts);

    const savedWh = localStorage.getItem(LOCAL_STORAGE_KEY_WAREHOUSES);
    if (savedWh) warehouses = JSON.parse(savedWh);

    const savedTx = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSACTIONS);
    if (savedTx) transactions = JSON.parse(savedTx);

    const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY_GOOGLE_CONFIG);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Merge with default to ensure gasWebappUrl is always populated from code default
      googleConfig = {
        ...googleConfig,
        ...parsed,
        gasWebappUrl: parsed.gasWebappUrl || googleConfig.gasWebappUrl,
      };
    }
  } catch (e) {
    console.error('Failed to load local storage state:', e);
  }

  return { products, warehouses, transactions, googleConfig };
};

// Save helpers
export const saveProductsToLocal = (products: Product[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products));
};

export const saveWarehousesToLocal = (warehouses: Warehouse[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_WAREHOUSES, JSON.stringify(warehouses));
};

export const saveTransactionsToLocal = (transactions: Transaction[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
};

export const saveGoogleConfigToLocal = (config: GoogleSyncConfig) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_GOOGLE_CONFIG, JSON.stringify(config));
};

/**
 * Calculate Stock Summary (Báo cáo Nhập Xuất Tồn)
 * Handles filter by warehouseId ('ALL' or specific ID) and Date Range (fromDate, toDate)
 */
export const calculateStockSummary = (
  products: Product[],
  transactions: Transaction[],
  warehouseId: string = 'ALL',
  fromDate: string = '',
  toDate: string = ''
): StockSummaryItem[] => {
  return products.map((prod) => {
    // 1. Filter transactions for this product & warehouse
    const prodTransactions = transactions.filter((t) => {
      const matchProduct = t.productId === prod.id || t.productCode === prod.code;
      const matchWarehouse = warehouseId === 'ALL' || t.warehouseId === warehouseId;
      return matchProduct && matchWarehouse;
    });

    // 2. Separate into Beginning (before fromDate), Period (between fromDate and toDate), and After
    let beginningQty = 0;
    let importQty = 0;
    let exportQty = 0;

    prodTransactions.forEach((t) => {
      const isImport = t.type === 'IMPORT';
      const qty = Number(t.quantity || 0);

      if (fromDate && t.date < fromDate) {
        // Before period -> Beginning Stock
        if (isImport) beginningQty += qty;
        else beginningQty -= qty;
      } else if (!toDate || t.date <= toDate) {
        // Within period
        if (isImport) importQty += qty;
        else exportQty += qty;
      }
    });

    const beginningValue = beginningQty * prod.costPrice;
    const importValue = importQty * prod.costPrice;
    const exportValue = exportQty * prod.costPrice;

    const endingQty = beginningQty + importQty - exportQty;
    const endingValue = endingQty * prod.costPrice;

    let stockStatus: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL';
    if (endingQty <= prod.minStock) {
      stockStatus = 'LOW';
    } else if (prod.maxStock && endingQty >= prod.maxStock) {
      stockStatus = 'HIGH';
    }

    return {
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      unit: prod.unit,
      category: prod.category,
      minStock: prod.minStock,
      costPrice: prod.costPrice,
      beginningQty,
      beginningValue,
      importQty,
      importValue,
      exportQty,
      exportValue,
      endingQty,
      endingValue,
      stockStatus,
    };
  });
};

/**
 * Calculate Stock Card (Thẻ kho chi tiết cho 1 mặt hàng)
 */
export const calculateStockCard = (
  productId: string,
  products: Product[],
  transactions: Transaction[],
  warehouseId: string = 'ALL',
  fromDate: string = '',
  toDate: string = ''
): { product: Product | undefined; cardItems: StockCardItem[]; initialBalance: number } => {
  const product = products.find((p) => p.id === productId || p.code === productId);
  if (!product) {
    return { product: undefined, cardItems: [], initialBalance: 0 };
  }

  // Filter transactions for this product & warehouse
  const allProductTxs = transactions
    .filter((t) => {
      const matchProduct = t.productId === product.id || t.productCode === product.code;
      const matchWarehouse = warehouseId === 'ALL' || t.warehouseId === warehouseId;
      return matchProduct && matchWarehouse;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.voucherCode.localeCompare(b.voucherCode);
    });

  // Calculate Initial Balance before fromDate
  let initialBalance = 0;
  const periodTxs: Transaction[] = [];

  allProductTxs.forEach((t) => {
    const isImport = t.type === 'IMPORT';
    const qty = Number(t.quantity || 0);

    if (fromDate && t.date < fromDate) {
      if (isImport) initialBalance += qty;
      else initialBalance -= qty;
    } else if (!toDate || t.date <= toDate) {
      periodTxs.push(t);
    }
  });

  // Build card ledger items with running balance
  let currentBalance = initialBalance;
  const cardItems: StockCardItem[] = periodTxs.map((t) => {
    const isImport = t.type === 'IMPORT';
    const qty = Number(t.quantity || 0);

    if (isImport) {
      currentBalance += qty;
    } else {
      currentBalance -= qty;
    }

    return {
      date: t.date,
      voucherCode: t.voucherCode,
      type: t.type,
      partner: t.partner,
      note: t.note || '',
      warehouseName: t.warehouseName,
      importQty: isImport ? qty : 0,
      exportQty: !isImport ? qty : 0,
      runningBalance: currentBalance,
      unitPrice: t.unitPrice,
      totalAmount: t.totalAmount,
    };
  });

  return { product, cardItems, initialBalance };
};
