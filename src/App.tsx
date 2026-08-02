import React, { useState, useEffect, useRef } from 'react';
import {
  Product,
  Warehouse,
  Transaction,
  GoogleSyncConfig,
  TransactionType,
  AppUser,
} from './types';
import {
  loadInitialState,
  saveProductsToLocal,
  saveWarehousesToLocal,
  saveTransactionsToLocal,
  saveGoogleConfigToLocal,
  loadCategories,
  saveCategoriesToLocal,
  DEFAULT_CATEGORIES,
  loadAppUsers,
  saveAppUsersToLocal,
  loadCurrentUser,
  saveCurrentUserToLocal,
  loadRolePermissions,
  saveRolePermissionsToLocal,
} from './utils/storageUtils';
import { PermissionKey, RolePermissionsMap, UserRole } from './types';


import { PartnersView } from './components/PartnersView';
import { Partner } from './types';
import { savePartnersToLocal } from './utils/storageUtils';
import { Users } from 'lucide-react';

import { ProductsView } from './components/ProductsView';
import { WarehousesView } from './components/WarehousesView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { GoogleSheetsSyncView } from './components/GoogleSheetsSyncView';

import { TransactionModal } from './components/TransactionModal';
import { ProductModal } from './components/ProductModal';
import { WarehouseModal } from './components/WarehouseModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { VoucherDetailModal } from './components/VoucherDetailModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { UserManagementModal } from './components/UserManagementModal';
import { AccountLoginModal } from './components/AccountLoginModal';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { callGasProxy } from './utils/gasProxy';
import { PanelLeft, RefreshCw, Zap, Circle, PieChart, Package, Warehouse as WarehouseIcon, ReceiptText, FileSpreadsheet, Settings, Shield, KeyRound, X, UserCheck, Eye } from 'lucide-react';


const LOCAL_STORAGE_KEY_AUTH_TOKEN = 'nxt_session_token_v1';
const LOCAL_STORAGE_KEY_AUTH_USER = 'nxt_session_user_v1';

export default function App() {
  // Sidebar State (Persistent in LocalStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('nxt_sidebar_collapsed_v1') === 'true';
  });

  const handleToggleSidebar = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('nxt_sidebar_collapsed_v1', String(collapsed));
  };

  // Session State (Long-term persistent)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY_AUTH_TOKEN);
  });
  const [sessionUser, setSessionUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse auth user:', e);
    }
    return null;
  });

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('reports');
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<AppUser[]>(() => loadAppUsers());
  const [currentUser, setCurrentUser] = useState<AppUser>(() => loadCurrentUser());


  const [googleConfig, setGoogleConfig] = useState<GoogleSyncConfig>({
    spreadsheetId: '',
    spreadsheetUrl: '',
    gasWebappUrl: 'https://script.google.com/macros/s/AKfycbxNuC3kUO_pYSSlB5XMUoIttKZoZo42dxxZKhf_Mg6j9tlbGpteqkG_-ZiBTQvZig0qmw/exec',
    autoSync: true,
    syncStatus: 'idle',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [selectedProductIdForCard, setSelectedProductIdForCard] = useState<string>('');
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [editingVoucherCode, setEditingVoucherCode] = useState<string | null>(null);

  // Auto Sync Engine References
  const autoSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSyncingRef = useRef(false);

  // Latest refs to prevent interval recreation and stale closures
  const googleConfigRef = useRef(googleConfig);
  googleConfigRef.current = googleConfig;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const isSyncingRef = useRef(isSyncing);
  isSyncingRef.current = isSyncing;

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('IMPORT');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [categories, setCategories] = useState<string[]>(() => loadCategories());
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() => loadRolePermissions());

  const handleTogglePermission = (role: UserRole, key: PermissionKey) => {
    if (role === 'ADMIN') return; // Admin always has full access
    const updated = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [key]: !rolePermissions[role][key],
      },
    };
    setRolePermissions(updated);
    saveRolePermissionsToLocal(updated);
  };



  // User Handlers
  const handleSaveUser = (userData: Omit<AppUser, 'id' | 'createdAt'>, editId?: string) => {
    let updated: AppUser[];
    if (editId) {
      updated = users.map((u) => (u.id === editId ? { ...userData, id: u.id, createdAt: u.createdAt } : u));
    } else {
      const newUser: AppUser = {
        ...userData,
        id: `usr-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [...users, newUser];
    }
    setUsers(updated);
    saveAppUsersToLocal(updated);
    triggerAutoPush(products, warehouses, transactions, partners, updated);

    // Find edited user before update to compare email
    const editedUserBefore = editId ? users.find((u) => u.id === editId) : null;
    const currentEmail = (currentUser?.email || '').trim().toLowerCase();

    // Check if edited user was the current logged in user (by ID or former email)
    const isEditingCurrentUser = !!(
      (editId && currentUser.id === editId) ||
      (editedUserBefore && editedUserBefore.email.trim().toLowerCase() === currentEmail) ||
      userData.email.trim().toLowerCase() === currentEmail
    );

    if (isEditingCurrentUser) {
      const updatedUserObj: AppUser = {
        ...currentUser,
        ...userData,
        id: editId || currentUser.id,
      };
      setCurrentUser(updatedUserObj);
      saveCurrentUserToLocal(updatedUserObj);
      updateGoogleConfig({ ...googleConfig, userRole: userData.role });
    }
  };



  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản nhân viên này không?')) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      saveAppUsersToLocal(updated);
      triggerAutoPush(products, warehouses, transactions, partners, updated);
    }
  };


  const handleSelectUserLogin = (user: AppUser) => {
    setCurrentUser(user);
    saveCurrentUserToLocal(user);
    updateGoogleConfig({ ...googleConfig, userRole: user.role });
  };

  // Login Success Handler (Matches Email Permission Role)
  const handleLoginSuccess = (user: { email: string; name: string; role: any; token: string }) => {
    const userEmail = (user.email || '').trim().toLowerCase();

    // Check if email exists in local AppUsers list (Bảng phân quyền)
    const foundUser = users.find((u) => u.email.trim().toLowerCase() === userEmail);

    // Ưu tiên role từ Server GAS (vừa tra cứu trực tiếp từ Google Sheet); nếu không có mới dùng local cache
    let assignedRole: UserRole | null = null;
    let displayName = user.name || userEmail.split('@')[0];

    if (user.role && ['ADMIN', 'EDITOR', 'VIEWER'].includes(user.role)) {
      assignedRole = user.role as UserRole;
      if (foundUser) displayName = foundUser.name;
    } else if (foundUser) {
      assignedRole = foundUser.role;
      displayName = foundUser.name;
    }


    // Nếu KHÔNG CÓ TRONG BẢNG PHÂN QUYỀN -> Từ chối đăng nhập 100%, không cấp session
    if (!assignedRole) {
      alert(`Đăng nhập thất bại: Email (${userEmail}) chưa được cấp quyền truy cập hệ thống. Vui lòng liên hệ Admin!`);
      return;
    }

    const updatedUserObj: AppUser = {
      id: foundUser ? foundUser.id : `usr-${Date.now()}`,
      email: userEmail,
      name: displayName,
      pin: 'A12b34D56',
      role: assignedRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    // Nếu user chưa có trong danh sách local, thêm vào để lưu đồng bộ
    if (!foundUser) {
      const newUsersList = [...users, updatedUserObj];
      setUsers(newUsersList);
      saveAppUsersToLocal(newUsersList);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH_TOKEN, user.token);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH_USER, JSON.stringify(updatedUserObj));
    setIsAuthenticated(true);
    setSessionUser(updatedUserObj);
    setCurrentUser(updatedUserObj);
    saveCurrentUserToLocal(updatedUserObj);

    // Sync role with googleConfig
    updateGoogleConfig({
      ...googleConfig,
      userRole: assignedRole,
    });
  };


  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH_USER);
      setIsAuthenticated(false);
      setSessionUser(null);
    }
  };

  // Initial Load & Auto Connect via Link Query Parameter (?gasUrl=... or ?appUrl=...)
  useEffect(() => {
    const { products: p, warehouses: w, transactions: t, partners: pt, googleConfig: g } = loadInitialState();

    // Read URL Search Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gasUrlParam = urlParams.get('gasUrl') || urlParams.get('appUrl') || urlParams.get('url');
    const roleParam = urlParams.get('role') as any;

    let updatedConfig = { ...g };
    let hasUrlUpdate = false;

    if (gasUrlParam && gasUrlParam.trim().startsWith('http')) {
      let sanitizedUrl = gasUrlParam.trim();
      if (sanitizedUrl.includes('pYSSIB')) {
        sanitizedUrl = sanitizedUrl.replace('pYSSIB', 'pYSSlB');
      }
      updatedConfig.gasWebappUrl = sanitizedUrl;
      hasUrlUpdate = true;
    }

    if (roleParam && ['ADMIN', 'EDITOR', 'VIEWER'].includes(roleParam)) {
      updatedConfig.userRole = roleParam;
      hasUrlUpdate = true;
    }

    if (hasUrlUpdate) {
      setGoogleConfig(updatedConfig);
      saveGoogleConfigToLocal(updatedConfig);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setGoogleConfig(g);
    }

    setProducts(p);
    setWarehouses(w);
    setTransactions(t);
    setPartners(pt);
  }, []);

  const updatePartners = (newPartners: Partner[]) => {
    setPartners(newPartners);
    savePartnersToLocal(newPartners);
    triggerAutoPush(products, warehouses, transactions, newPartners);
  };

  // Trigger Debounced Auto-Push (1.5s) when data is mutated
  const triggerAutoPush = (
    updatedProducts = products,
    updatedWarehouses = warehouses,
    updatedTransactions = transactions,
    updatedPartners = partners,
    updatedUsers = users,
    updatedCategories = categories
  ) => {
    if (!googleConfig.autoSync || !googleConfig.gasWebappUrl || isAutoSyncingRef.current) {
      return;
    }

    if (autoSyncDebounceRef.current) {
      clearTimeout(autoSyncDebounceRef.current);
    }

    autoSyncDebounceRef.current = setTimeout(async () => {
      if (isAutoSyncingRef.current) return;
      isAutoSyncingRef.current = true;
      try {
        setSyncMessage('⚡ [Realtime] Đang tự động đẩy ngầm dữ liệu lên Google Sheets...');
        const payload = {
          action: 'SYNC_UP',
          pin: googleConfig.gasPin || '123456',
          userEmail: googleConfig.userEmail || 'admin@system.local',
          warehouses: updatedWarehouses,
          products: updatedProducts,
          transactions: updatedTransactions,
          partners: updatedPartners,
          users: updatedUsers,
          categories: updatedCategories,
        };

        const data = await callGasProxy(googleConfig.gasWebappUrl, payload);

        if (!data || data.error) {
          setSyncMessage(`⚠️ [Cảnh báo đồng bộ] ${data?.error || 'URL WebApp chưa đúng hoặc chưa kết nối đến Google Sheet.'}`);
          updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
          return;
        }

        if (data.success) {
          const timeStr = new Date().toLocaleTimeString('vi-VN');
          setSyncMessage(`⚡ [Realtime] Đã tự động đẩy thành công ${updatedProducts.length} SP và ${updatedTransactions.length} phiếu lên Google Sheet lúc ${timeStr}!`);
          updateGoogleConfig({
            ...googleConfig,
            lastSyncedAt: timeStr,
            syncStatus: 'success',
          });
        } else {
          setSyncMessage(`⚠️ Lỗi từ Google Sheet: ${data.error}`);
          updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
        }
      } catch (e) {
        console.warn('Background auto-push skipped:', e);
      } finally {
        isAutoSyncingRef.current = false;
      }
    }, 1500);
  };

  // Auto-Pull Polling (every 30 seconds when autoSync is enabled)
  useEffect(() => {
    if (!googleConfig.autoSync || !googleConfig.gasWebappUrl) {
      return;
    }

    const interval = setInterval(async () => {
      if (isSyncingRef.current || isAutoSyncingRef.current) return;
      isAutoSyncingRef.current = true;

      try {
        const currentConf = googleConfigRef.current;
        const currentUsr = currentUserRef.current;

        const payload = {
          action: 'SYNC_DOWN',
          pin: currentConf.gasPin || '123456',
        };

        let data: any;
        try {
          data = await callGasProxy(currentConf.gasWebappUrl, payload);
        } catch {
          return;
        }

        if (data.success && data.data) {
          if (data.data.products && data.data.products.length >= 0) {
            setProducts(data.data.products);
            saveProductsToLocal(data.data.products);
          }
          if (data.data.warehouses && data.data.warehouses.length >= 0) {
            setWarehouses(data.data.warehouses);
            saveWarehousesToLocal(data.data.warehouses);
          }
          if (data.data.transactions && data.data.transactions.length >= 0) {
            setTransactions(data.data.transactions);
            saveTransactionsToLocal(data.data.transactions);
          }
          if (data.data.partners && data.data.partners.length >= 0) {
            setPartners(data.data.partners);
            savePartnersToLocal(data.data.partners);
          }
          if (data.data.users && data.data.users.length >= 0) {
            setUsers(data.data.users);
            saveAppUsersToLocal(data.data.users);

            // Re-evaluate current logged-in user's role from newly pulled users list
            const activeUserEmail = (currentUsr?.email || '').trim().toLowerCase();
            const matchedActiveUser = data.data.users.find(
              (u: AppUser) => u.email.trim().toLowerCase() === activeUserEmail
            );
            if (matchedActiveUser && matchedActiveUser.role !== currentUsr?.role) {
              const updatedCurrUser = { ...currentUsr, role: matchedActiveUser.role };
              setCurrentUser(updatedCurrUser);
              saveCurrentUserToLocal(updatedCurrUser);
              updateGoogleConfig({ ...currentConf, userRole: matchedActiveUser.role });
            }
          }
          if (data.data.categories && data.data.categories.length >= 0) {
            setCategories(data.data.categories);
            saveCategoriesToLocal(data.data.categories);
          }

          const timeStr = new Date().toLocaleTimeString('vi-VN');
          setSyncMessage(`⚡ [Realtime] Đã tự động làm mới dữ liệu từ Google Sheet lúc ${timeStr}!`);

          updateGoogleConfig({
            ...currentConf,
            lastSyncedAt: timeStr,
            syncStatus: 'success',
          });
        }
      } catch (e) {
        console.warn('Background auto-pull skipped:', e);
      } finally {
        isAutoSyncingRef.current = false;
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [googleConfig.autoSync, googleConfig.gasWebappUrl]);

  // Save changes to localStorage & trigger auto push
  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveProductsToLocal(newProducts);
    triggerAutoPush(newProducts, warehouses, transactions);
  };

  const updateWarehouses = (newWarehouses: Warehouse[]) => {
    setWarehouses(newWarehouses);
    saveWarehousesToLocal(newWarehouses);
    triggerAutoPush(products, newWarehouses, transactions);
  };

  const updateTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    saveTransactionsToLocal(newTransactions);
    triggerAutoPush(products, warehouses, newTransactions);
  };

  const updateGoogleConfig = (newConfig: GoogleSyncConfig) => {
    setGoogleConfig(newConfig);
    saveGoogleConfigToLocal(newConfig);
  };

  const updateCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    saveCategoriesToLocal(newCategories);
    triggerAutoPush(products, warehouses, transactions, partners, users, newCategories);
  };

  // Transaction Handlers
  const handleOpenImportModal = () => {
    setEditingVoucherCode(null);
    setTransactionType('IMPORT');
    setIsTransactionModalOpen(true);
  };

  const handleOpenExportModal = () => {
    setEditingVoucherCode(null);
    setTransactionType('EXPORT');
    setIsTransactionModalOpen(true);
  };

  const handleEditVoucher = (voucherCode: string) => {
    setEditingVoucherCode(voucherCode);
    const found = transactions.find((t) => t.voucherCode === voucherCode);
    if (found) {
      setTransactionType(found.type);
    }
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransactions = (
    txDataList: Omit<Transaction, 'id' | 'createdAt'>[],
    editVoucherCode?: string
  ) => {
    const timestamp = Date.now();
    const newTxs: Transaction[] = txDataList.map((txData, index) => ({
      ...txData,
      id: `tx-${timestamp}-${index}`,
      createdAt: new Date().toISOString(),
    }));

    let updated: Transaction[];
    if (editVoucherCode) {
      const filtered = transactions.filter((t) => t.voucherCode !== editVoucherCode);
      updated = [...newTxs, ...filtered];
    } else {
      updated = [...newTxs, ...transactions];
    }
    updateTransactions(updated);
    setEditingVoucherCode(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập/xuất này không?')) {
      const updated = transactions.filter((t) => t.id !== id);
      updateTransactions(updated);
    }
  };

  const handleDeleteVoucher = (voucherCode: string) => {
    const updated = transactions.filter((t) => t.voucherCode !== voucherCode);
    updateTransactions(updated);
  };

  const handleImportExcelTransactions = (records: Partial<Transaction>[]) => {
    const newTxs: Transaction[] = records.map((r, i) => ({
      id: `tx-excel-${Date.now()}-${i}`,
      voucherCode: r.voucherCode || `PN-${Date.now()}`,
      type: r.type || 'IMPORT',
      date: r.date || new Date().toISOString().split('T')[0],
      warehouseId: r.warehouseId || '',
      warehouseCode: r.warehouseCode || '',
      warehouseName: r.warehouseName || '',
      productId: r.productId || '',
      productCode: r.productCode || '',
      productName: r.productName || '',
      unit: r.unit || 'Cái',
      quantity: r.quantity || 1,
      unitPrice: r.unitPrice || 0,
      totalAmount: r.totalAmount || 0,
      partner: r.partner || '',
      note: r.note || '',
      createdAt: new Date().toISOString(),
    }));

    const updated = [...newTxs, ...transactions];
    updateTransactions(updated);
  };

  // Product Handlers
  const handleSaveProduct = (prodData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id ? { ...prodData, id: p.id } : p
      );
      updateProducts(updated);
    } else {
      const newProd: Product = {
        ...prodData,
        id: `prod-${Date.now()}`,
      };
      updateProducts([...products, newProd]);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mặt hàng này khỏi danh mục?')) {
      updateProducts(products.filter((p) => p.id !== productId));
    }
  };

  // Warehouse Handlers
  const handleSaveWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    if (editingWarehouse) {
      const updated = warehouses.map((w) =>
        w.id === editingWarehouse.id ? { ...whData, id: w.id } : w
      );
      updateWarehouses(updated);
    } else {
      const newWh: Warehouse = {
        ...whData,
        id: `wh-${Date.now()}`,
      };
      // If new warehouse is default, unset previous default
      let currentWhs = warehouses;
      if (whData.isDefault) {
        currentWhs = warehouses.map((w) => ({ ...w, isDefault: false }));
      }
      updateWarehouses([...currentWhs, newWh]);
    }
    setEditingWarehouse(null);
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kho hàng này không?')) {
      updateWarehouses(warehouses.filter((w) => w.id !== warehouseId));
    }
  };

  // View Stock Card for a specific product
  const handleViewStockCard = (productId: string) => {
    setSelectedProductIdForCard(productId);
    setActiveTab('reports');
  };

  // --- GOOGLE APPS SCRIPT WEBAPP SYNC ---
  const handleSyncUp = async () => {
    if (!googleConfig.gasWebappUrl) {
      setActiveTab('sheets');
      alert('Vui lòng nhập Google Apps Script WebApp URL!');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Đang đẩy dữ liệu lên Google Sheets...');

    try {
      // Direct Client fetch to Google Apps Script WebApp (Simple Request avoids CORS preflight)
      const payload = {
        action: 'SYNC_UP',
        pin: googleConfig.gasPin || '123456',
        userEmail: googleConfig.userEmail || 'admin@system.local',
        warehouses,
        products,
        transactions,
        partners,
        users,
        categories,
      };

      const data = await callGasProxy(googleConfig.gasWebappUrl, payload);

      if (data.success) {
        setSyncMessage(data.message || `Đã đồng bộ ${products.length} SP, ${transactions.length} phiếu, ${users.length} tài khoản và ${categories.length} nhóm hàng lên Google Sheet!`);
        updateGoogleConfig({
          ...googleConfig,
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
          syncStatus: 'success',
        });
      } else {
        setSyncMessage(`Lỗi đồng bộ GAS: ${data.error}`);
        updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
      }
    } catch (err: any) {
      let msg = err.message || '';
      if (msg.includes('Failed to fetch')) {
        msg = 'Không thể kết nối đến Google Apps Script WebApp (ERR 404 / Failed to fetch). Vui lòng kiểm tra lại đường dẫn WebApp URL đã đúng chưa, hoặc tiến hành Triển khai (Deploy) lại WebApp trên Google Sheet ở chế độ "Anyone".';
      }
      setSyncMessage(`Lỗi kết nối: ${msg}`);
      updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncDown = async () => {
    if (!googleConfig.gasWebappUrl) {
      setActiveTab('sheets');
      alert('Vui lòng nhập Google Apps Script WebApp URL!');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Đang tải dữ liệu từ Google Sheets về ứng dụng...');

    try {
      const payload = {
        action: 'SYNC_DOWN',
        pin: googleConfig.gasPin || '123456',
      };

      const data = await callGasProxy(googleConfig.gasWebappUrl, payload);

      if (data.success && data.data) {
        if (data.data.products && data.data.products.length >= 0) {
          updateProducts(data.data.products);
        }
        if (data.data.warehouses && data.data.warehouses.length >= 0) {
          updateWarehouses(data.data.warehouses);
        }
        if (data.data.transactions && data.data.transactions.length >= 0) {
          updateTransactions(data.data.transactions);
        }
        if (data.data.partners && data.data.partners.length >= 0) {
          updatePartners(data.data.partners);
        }
        if (data.data.users && data.data.users.length >= 0) {
          setUsers(data.data.users);
          saveAppUsersToLocal(data.data.users);
        }
        if (data.data.categories && data.data.categories.length >= 0) {
          updateCategories(data.data.categories);
        }

        setSyncMessage('Cập nhật dữ liệu từ Google Sheet (GAS WebApp) thành công!');
        updateGoogleConfig({
          ...googleConfig,
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
          syncStatus: 'success',
        });
      } else {
        setSyncMessage(`Lỗi tải dữ liệu GAS: ${data.error}`);
        updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
      }
    } catch (err: any) {
      let msg = err.message || '';
      if (msg.includes('Failed to fetch')) {
        msg = 'Không thể kết nối đến Google Apps Script WebApp (ERR 404 / Failed to fetch). Vui lòng kiểm tra lại đường dẫn WebApp URL đã đúng chưa, hoặc tiến hành Triển khai (Deploy) lại WebApp trên Google Sheet ở chế độ "Anyone".';
      }
      setSyncMessage(`Lỗi kết nối: ${msg}`);
      updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu mẫu/hiện tại trên máy và trên Google Sheet không? (Sản phẩm, Kho hàng, Phiếu nhập xuất, Đối tác sẽ về 0)')) {
      setProducts([]);
      saveProductsToLocal([]);
      setWarehouses([]);
      saveWarehousesToLocal([]);
      setTransactions([]);
      saveTransactionsToLocal([]);
      setPartners([]);
      savePartnersToLocal([]);
      triggerAutoPush([], [], [], []);
      alert('Đã xóa sạch dữ liệu trên máy và tự động đồng bộ xóa trắng Google Sheet!');
    }
  };


  // If not authenticated, render full-screen mandatory Email OTP Login Screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        gasWebappUrl={googleConfig.gasWebappUrl}
        onLoginSuccess={handleLoginSuccess}
        adminPin={googleConfig.adminPin}
        onUpdateGasUrl={(url) => updateGoogleConfig({ ...googleConfig, gasWebappUrl: url })}
      />
    );
  }

  return (
    <div className="w-full min-w-full min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex selection:bg-emerald-500 selection:text-white">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleSidebar}
        currentUser={currentUser}
        googleConfig={googleConfig}
        rolePermissions={rolePermissions}
        onOpenImportModal={handleOpenImportModal}

        onOpenExportModal={handleOpenExportModal}
        onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onQuickSync={handleSyncUp}
        isSyncing={isSyncing}
        onClearData={handleClearAllData}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area (Maximized Width & Space for Tables) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Modern Header Bar with Horizontal Navigation Tabs */}
        <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleToggleSidebar(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar (Ẩn để xem bảng rộng)'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Top Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 no-scrollbar">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" /> Báo Cáo NXT
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Sản Phẩm
              </button>

              <button
                onClick={() => setActiveTab('warehouses')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'warehouses'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <WarehouseIcon className="w-3.5 h-3.5" /> Danh Sách Kho
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'transactions'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" /> Nhật Ký NX
              </button>

              <button
                onClick={() => setActiveTab('partners')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'partners'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Quản Lý Đối Tác
              </button>


              {(rolePermissions[currentUser?.role || googleConfig.userRole || 'ADMIN']?.canSyncSheets) && (
                <button
                  onClick={() => setActiveTab('sheets')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'sheets'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Đồng Bộ Sheets
                </button>
              )}

            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0 ml-2">
            {googleConfig.autoSync && (
              <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                <Zap className="w-3 h-3 text-emerald-500" /> Auto-Sync Realtime
              </span>
            )}

            {/* Settings / Role Switcher Button (Bánh Răng Cấu Hình) */}
            {(rolePermissions[currentUser?.role || googleConfig.userRole || 'ADMIN']?.canConfig) && (
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Cấu Hình Phân Quyền & Chuyển Vai Trò"
              >
                <Settings className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span className="hidden sm:inline text-amber-600 dark:text-amber-400 font-bold">Cấu Hình</span>
              </button>
            )}

          </div>
        </header>



        {/* Maximized Data Tables Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
          {activeTab === 'reports' && (
            <ReportsView
              products={products}
              warehouses={warehouses}
              transactions={transactions}
              selectedProductIdForCard={selectedProductIdForCard}
              onSelectVoucher={(code) => setSelectedVoucherCode(code)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              warehouses={warehouses}
              transactions={transactions}
              categories={categories}
              userRole={googleConfig.userRole}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onOpenEditModal={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onViewStockCard={handleViewStockCard}
              onManageCategories={() => setIsCategoryManagerOpen(true)}
            />
          )}

          {activeTab === 'warehouses' && (
            <WarehousesView
              warehouses={warehouses}
              products={products}
              transactions={transactions}
              userRole={googleConfig.userRole}
              onOpenAddModal={() => {
                setEditingWarehouse(null);
                setIsWarehouseModalOpen(true);
              }}
              onOpenEditModal={(wh) => {
                setEditingWarehouse(wh);
                setIsWarehouseModalOpen(true);
              }}
              onDeleteWarehouse={handleDeleteWarehouse}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              warehouses={warehouses}
              products={products}
              userRole={googleConfig.userRole}
              onOpenImportModal={handleOpenImportModal}
              onOpenExportModal={handleOpenExportModal}
              onDeleteTransaction={handleDeleteTransaction}
              onSelectVoucher={(code) => setSelectedVoucherCode(code)}
              onEditVoucher={handleEditVoucher}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersView
              partners={partners}
              isReadOnly={googleConfig.userRole === 'VIEWER'}
              onAddPartner={(p) => {
                const newPartner: Partner = {
                  ...p,
                  id: `part-${Date.now()}`,
                };
                updatePartners([...partners, newPartner]);
              }}
              onUpdatePartner={(updatedP) => {
                const updated = partners.map((p) => (p.id === updatedP.id ? updatedP : p));
                updatePartners(updated);
              }}
              onDeletePartner={(id) => {
                updatePartners(partners.filter((p) => p.id !== id));
              }}
            />
          )}


          {activeTab === 'sheets' && (
            <GoogleSheetsSyncView
              config={googleConfig}
              onUpdateConfig={updateGoogleConfig}
              products={products}
              warehouses={warehouses}
              transactions={transactions}
              onSyncUp={handleSyncUp}
              onSyncDown={handleSyncDown}
              isSyncing={isSyncing}
              syncMessage={syncMessage}
            />
          )}
        </main>

        {/* Bottom Footer (Located strictly at bottom of main column) */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 mt-auto shrink-0">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Phần mềm Quản Lý Nhập Xuất Tồn Kho (NXT) &bull; Kết Nối Google Sheets Real-time</span>
            <span className="font-mono text-[10px] text-slate-400">Trạng Thái: Local & Google Drive Sync Ready</span>
          </div>
        </footer>
      </div>

      {/* Interactive Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingVoucherCode(null);
        }}
        onSave={handleSaveTransactions}
        products={products}
        warehouses={warehouses}
        transactions={transactions}
        initialType={transactionType}
        editingVoucherCode={editingVoucherCode}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        existingProducts={products}
        categories={categories}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onUpdateCategories={updateCategories}
      />

      <WarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => {
          setIsWarehouseModalOpen(false);
          setEditingWarehouse(null);
        }}
        onSave={handleSaveWarehouse}
        initialWarehouse={editingWarehouse}
        existingWarehouses={warehouses}
      />

      <ExcelUploadModal
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        onImportTransactions={handleImportExcelTransactions}
        products={products}
        warehouses={warehouses}
      />

      <VoucherDetailModal
        voucherCode={selectedVoucherCode}
        transactions={transactions}
        onClose={() => setSelectedVoucherCode(null)}
        onDeleteVoucher={handleDeleteVoucher}
        onEditVoucher={handleEditVoucher}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        rolePermissions={rolePermissions}
        onTogglePermission={handleTogglePermission}
      />


      <AccountLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        onSelectUser={handleSelectUserLogin}
      />

      {/* Role Switcher Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 text-white font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Phân Quyền & Chuyển Vai Trò
              </h3>
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setPinError('');
                  setInputPin('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Chọn Vai Trò Bảng Điều Khiển:
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const currentRole = currentUser?.role || googleConfig.userRole || 'ADMIN';
                    if (currentRole !== 'ADMIN') {
                      const correctPin = googleConfig.adminPin || '123456';
                      if (inputPin !== correctPin) {
                        setPinError('Mã PIN Admin không đúng (Mặc định: 123456)');
                        return;
                      }
                    }
                    const updatedUser = { ...currentUser, role: 'ADMIN' as const };
                    setCurrentUser(updatedUser);
                    saveCurrentUserToLocal(updatedUser);
                    updateGoogleConfig({ ...googleConfig, userRole: 'ADMIN' });
                    setIsRoleModalOpen(false);
                    setInputPin('');
                    setPinError('');
                  }}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                    (currentUser?.role || googleConfig.userRole) === 'ADMIN'
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> ADMIN (Quản Trị Viên)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đầy đủ quyền Cấu hình Google Sheet, Xóa dữ liệu, Phân quyền hệ thống.
                    </p>
                  </div>
                  {(currentUser?.role || googleConfig.userRole) === 'ADMIN' && <span className="text-xs font-bold text-amber-400">Đang chọn</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updatedUser = { ...currentUser, role: 'EDITOR' as const };
                    setCurrentUser(updatedUser);
                    saveCurrentUserToLocal(updatedUser);
                    updateGoogleConfig({ ...googleConfig, userRole: 'EDITOR' });
                    setIsRoleModalOpen(false);
                    setInputPin('');
                    setPinError('');
                  }}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                    (currentUser?.role || googleConfig.userRole) === 'EDITOR'
                      ? 'bg-blue-950/40 border-blue-500/80 text-blue-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" /> EDITOR (Nhân Viên Nhập/Xuất Kho)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cho phép Tạo/Sửa phiếu nhập xuất, thêm sản phẩm. Ẩn Cấu hình & Xóa dữ liệu.
                    </p>
                  </div>
                  {(currentUser?.role || googleConfig.userRole) === 'EDITOR' && <span className="text-xs font-bold text-blue-400">Đang chọn</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updatedUser = { ...currentUser, role: 'VIEWER' as const };
                    setCurrentUser(updatedUser);
                    saveCurrentUserToLocal(updatedUser);
                    updateGoogleConfig({ ...googleConfig, userRole: 'VIEWER' });
                    setIsRoleModalOpen(false);
                    setInputPin('');
                    setPinError('');
                  }}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                    (currentUser?.role || googleConfig.userRole) === 'VIEWER'
                      ? 'bg-slate-800 border-slate-500 text-white'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> VIEWER (Chỉ Xem Báo Cáo)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Chỉ được xem báo cáo NXT, Thẻ kho. Không có quyền Thêm/Sửa/Xóa.
                    </p>
                  </div>
                  {(currentUser?.role || googleConfig.userRole) === 'VIEWER' && <span className="text-xs font-bold text-slate-400">Đang chọn</span>}
                </button>
              </div>
            </div>

            {(currentUser?.role || googleConfig.userRole) !== 'ADMIN' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Nhập Mã PIN Admin để lên quyền ADMIN:
                </label>
                <input
                  type="password"
                  placeholder="Mã PIN Admin (Mặc định: 123456)"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs font-mono font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pinError && <p className="text-xs text-red-400">{pinError}</p>}

                <button
                  type="button"
                  onClick={() => {
                    const correctPin = googleConfig.adminPin || '123456';
                    if (inputPin !== correctPin) {
                      setPinError('Mã PIN Admin không đúng (Mặc định: 123456)');
                      return;
                    }
                    const updatedUser = { ...currentUser, role: 'ADMIN' as const };
                    setCurrentUser(updatedUser);
                    saveCurrentUserToLocal(updatedUser);
                    updateGoogleConfig({ ...googleConfig, userRole: 'ADMIN' });
                    setIsRoleModalOpen(false);
                    setInputPin('');
                    setPinError('');
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs rounded transition-colors"
                >
                  Xác Nhận Lên Quyền Admin
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

