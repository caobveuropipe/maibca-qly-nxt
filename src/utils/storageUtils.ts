import { Product, Warehouse, Transaction, StockSummaryItem, StockCardItem, GoogleSyncConfig, AppUser, RolePermissionsMap } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_WAREHOUSES } from '../data/mockData';
import { formatVND, formatNum } from './pdfUtils';

export { formatVND, formatNum };

const LOCAL_STORAGE_KEY_PRODUCTS = 'nxt_inventory_products_v1';
const LOCAL_STORAGE_KEY_WAREHOUSES = 'nxt_inventory_warehouses_v1';
const LOCAL_STORAGE_KEY_TRANSACTIONS = 'nxt_inventory_transactions_v1';
const LOCAL_STORAGE_KEY_GOOGLE_CONFIG = 'nxt_inventory_google_config_v1';
const LOCAL_STORAGE_KEY_CATEGORIES = 'nxt_inventory_categories_v1';
const LOCAL_STORAGE_KEY_APP_USERS = 'nxt_inventory_app_users_v1';
const LOCAL_STORAGE_KEY_CURRENT_USER = 'nxt_inventory_current_user_v1';
const LOCAL_STORAGE_KEY_ROLE_PERMISSIONS = 'nxt_inventory_role_permissions_v1';

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  ADMIN: {
    canConfig: true,
    canManageUsers: true,
    canSyncSheets: true,
    canClearData: true,
    canCreateVoucher: true,
    canManageMaster: true,
    canViewReports: true,
  },
  EDITOR: {
    canConfig: false,
    canManageUsers: false,
    canSyncSheets: false,
    canClearData: false,
    canCreateVoucher: true,
    canManageMaster: true,
    canViewReports: true,
  },
  VIEWER: {
    canConfig: false,
    canManageUsers: false,
    canSyncSheets: false,
    canClearData: false,
    canCreateVoucher: false,
    canManageMaster: false,
    canViewReports: true,
  },
};

export const loadRolePermissions = (): RolePermissionsMap => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ROLE_PERMISSIONS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load role permissions:', e);
  }
  return DEFAULT_ROLE_PERMISSIONS;
};

export const saveRolePermissionsToLocal = (map: RolePermissionsMap) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ROLE_PERMISSIONS, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save role permissions:', e);
  }
};


export const DEFAULT_CATEGORIES = ['Thiết Bị', 'Vật Tư In Phụ Kiện', 'Bao Bì Đóng Gói', 'Linh Kiện', 'Khác'];

export const DEFAULT_APP_USERS: AppUser[] = [
  {
    id: 'usr-admin-primary',
    name: 'Cao Văn B (Chủ Quản Trị)',
    email: 'caobv.europipe@gmail.com',
    pin: 'A12b34D56',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-admin-default',
    name: 'Admin Quản Trị',
    email: 'admin@system.local',
    pin: 'A12b34D56',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-editor-sample',
    name: 'Nguyễn Văn A (Nhân Viên Kho)',
    email: 'nvkhoa@company.com',
    pin: '111111',
    role: 'EDITOR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-viewer-sample',
    name: 'Trần Thị B (Kế Toán / Xem Báo Cáo)',
    email: 'ketoanb@company.com',
    pin: '222222',
    role: 'VIEWER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

export const loadAppUsers = (): AppUser[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_APP_USERS);
    if (saved) {
      const parsed: AppUser[] = JSON.parse(saved);
      return parsed.map((u) => ({ ...u, email: (u.email || '').trim().toLowerCase() }));
    }
  } catch (e) {
    console.error('Failed to load app users:', e);
  }
  return DEFAULT_APP_USERS.map((u) => ({ ...u, email: (u.email || '').trim().toLowerCase() }));
};

export const saveAppUsersToLocal = (users: AppUser[]) => {
  const normalized = users.map((u) => ({ ...u, email: (u.email || '').trim().toLowerCase() }));
  localStorage.setItem(LOCAL_STORAGE_KEY_APP_USERS, JSON.stringify(normalized));
};


export const loadCurrentUser = (): AppUser => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load current user:', e);
  }
  return DEFAULT_APP_USERS[0];
};

export const saveCurrentUserToLocal = (user: AppUser) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
};

export const loadCategories = (): string[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load categories:', e);
  }
  return [...DEFAULT_CATEGORIES];
};

export const saveCategoriesToLocal = (categories: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
};

import { Partner } from '../types';

const LOCAL_STORAGE_KEY_PARTNERS = 'nxt_inventory_partners_v1';

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'part-1',
    code: 'NCC001',
    name: 'Công ty TNHH Nhựa & Bao bì An Phát',
    type: 'NHA_CUNG_CAP',
    phone: '0243.888.999',
    address: 'KCN Nam Sách, Hải Dương',
    note: 'Nhà cung cấp hạt nhựa & bao bì chính'
  },
  {
    id: 'part-2',
    code: 'KH001',
    name: 'Công ty CP Đầu tư & Phát triển Europipe',
    type: 'KHACH_HANG',
    phone: '0988.123.456',
    address: 'Phổ Yên, Thái Nguyên',
    note: 'Khách hàng chiến lược'
  }
];

export const loadPartners = (): Partner[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PARTNERS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load partners:', e);
  }
  return INITIAL_PARTNERS;
};

export const savePartnersToLocal = (partners: Partner[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_PARTNERS, JSON.stringify(partners));
};

// Initial state loader
export const loadInitialState = () => {
  let products: Product[] = INITIAL_PRODUCTS;
  let warehouses: Warehouse[] = INITIAL_WAREHOUSES;
  let transactions: Transaction[] = INITIAL_TRANSACTIONS;
  let partners: Partner[] = loadPartners();
  let googleConfig: GoogleSyncConfig = {
    spreadsheetId: '',
    spreadsheetUrl: '',
    gasWebappUrl: 'https://script.google.com/macros/s/AKfycbxNuC3kUO_pYSSlB5XMUoIttKZoZo42dxxZKhf_Mg6j9tlbGpteqkG_-ZiBTQvZig0qmw/exec',
    userRole: 'ADMIN',
    adminPin: 'A12b34D56',
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
      let loadedUrl = parsed.gasWebappUrl || googleConfig.gasWebappUrl;
      if (loadedUrl && loadedUrl.includes('pYSSIB')) {
        loadedUrl = loadedUrl.replace('pYSSIB', 'pYSSlB');
        parsed.gasWebappUrl = loadedUrl;
        localStorage.setItem(LOCAL_STORAGE_KEY_GOOGLE_CONFIG, JSON.stringify(parsed));
      }
      // Merge with default to ensure gasWebappUrl is always populated from code default
      googleConfig = {
        ...googleConfig,
        ...parsed,
        gasWebappUrl: loadedUrl,
      };
    }
  } catch (e) {
    console.error('Failed to load local storage state:', e);
  }

  return { products, warehouses, transactions, partners, googleConfig };
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
