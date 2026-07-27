import React, { useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  Transaction,
  GoogleSyncConfig,
  TransactionType,
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
} from './utils/storageUtils';

import { Header, ActiveTab } from './components/Header';
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

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('reports');
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [googleConfig, setGoogleConfig] = useState<GoogleSyncConfig>({
    spreadsheetId: '',
    spreadsheetUrl: '',
    gasWebappUrl: 'https://script.google.com/macros/s/AKfycbxNuC3kUO_pYSSlB5XMUoIttKZoZo42dxxZKhf_Mg6j9tlbGpteqkG_-ZiBTQvZig0qmw/exec',
    autoSync: false,
    syncStatus: 'idle',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [selectedProductIdForCard, setSelectedProductIdForCard] = useState<string>('');
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [editingVoucherCode, setEditingVoucherCode] = useState<string | null>(null);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('IMPORT');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(() => loadCategories());

  // Initial Load
  useEffect(() => {
    const { products: p, warehouses: w, transactions: t, googleConfig: g } = loadInitialState();
    setProducts(p);
    setWarehouses(w);
    setTransactions(t);
    setGoogleConfig(g);
  }, []);

  // Save changes to localStorage
  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveProductsToLocal(newProducts);
  };

  const updateWarehouses = (newWarehouses: Warehouse[]) => {
    setWarehouses(newWarehouses);
    saveWarehousesToLocal(newWarehouses);
  };

  const updateTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    saveTransactionsToLocal(newTransactions);
  };

  const updateGoogleConfig = (newConfig: GoogleSyncConfig) => {
    setGoogleConfig(newConfig);
    saveGoogleConfigToLocal(newConfig);
  };

  const updateCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    saveCategoriesToLocal(newCategories);
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

  // --- GOOGLE SHEETS API SYNC ---
  const handleCreateNewGoogleSheet = async () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối API và khởi tạo Google Sheet mới...');

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (googleConfig.idToken) {
        headers['Authorization'] = `Bearer ${googleConfig.idToken}`;
      }

      const res = await fetch('/api/sheets/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Quản Lý Nhập Xuất Tồn Kho' }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server phản hồi lỗi (HTTP ${res.status}): ${text.substring(0, 150)}...`);
      }

      if (data.success) {
        const newConfig: GoogleSyncConfig = {
          ...googleConfig,
          spreadsheetId: data.spreadsheetId,
          spreadsheetUrl: data.spreadsheetUrl,
          autoSync: true,
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
          syncStatus: 'success',
        };
        updateGoogleConfig(newConfig);
        setSyncMessage(`Tạo Google Sheet thành công! ID: ${data.spreadsheetId}`);

        // Automatically push current data
        await handleSyncUpWithId(data.spreadsheetId, headers);
      } else {
        setSyncMessage(`Lỗi: ${data.error || 'Không thể tạo Google Sheet.'}`);
        updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
      }
    } catch (err: any) {
      setSyncMessage(`Lỗi kết nối: ${err.message}`);
      updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncUpWithId = async (sheetId: string, customHeaders?: HeadersInit) => {
    try {
      const headers: HeadersInit = customHeaders || { 'Content-Type': 'application/json' };
      if (!customHeaders && googleConfig.idToken) {
        headers['Authorization'] = `Bearer ${googleConfig.idToken}`;
      }

      const res = await fetch('/api/sheets/sync-up', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          spreadsheetId: sheetId,
          warehouses,
          products,
          transactions,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server phản hồi lỗi HTML (HTTP ${res.status}): ${text.substring(0, 150)}...`);
      }
      if (data.success) {
        setSyncMessage(`Đã đồng bộ ${products.length} SP và ${transactions.length} phiếu lên Google Sheet!`);
        updateGoogleConfig({
          ...googleConfig,
          spreadsheetId: sheetId,
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
          syncStatus: 'success',
        });
      } else {
        setSyncMessage(`Lỗi đồng bộ lên Sheet: ${data.error}`);
        updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
      }
    } catch (err: any) {
      setSyncMessage(`Lỗi kết nối: ${err.message}`);
      updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
    }
  };

  const handleSyncUp = async () => {
    if (!googleConfig.gasWebappUrl && !googleConfig.spreadsheetId) {
      setActiveTab('sheets');
      alert('Vui lòng nhập Google Apps Script WebApp URL!');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Đang đẩy dữ liệu lên Google Sheets...');

    try {
      if (googleConfig.gasWebappUrl) {
        // Direct Client fetch to Google Apps Script WebApp (Simple Request avoids CORS preflight)
        const payload = {
          action: 'SYNC_UP',
          pin: googleConfig.gasPin || '123456',
          userEmail: googleConfig.userEmail || 'admin@system.local',
          warehouses,
          products,
          transactions,
        };

        const res = await fetch(googleConfig.gasWebappUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Không thể đọc dữ liệu trả về từ Google Apps Script WebApp. Vui lòng kiểm tra đã chọn "Anyone" (Bất kỳ ai) khi Deploy WebApp chưa.');
        }

        if (data.success) {
          setSyncMessage(data.message || `Đã đồng bộ ${products.length} SP và ${transactions.length} phiếu!`);
          updateGoogleConfig({
            ...googleConfig,
            lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
            syncStatus: 'success',
          });
        } else {
          setSyncMessage(`Lỗi đồng bộ GAS: ${data.error}`);
          updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
        }
      } else {
        await handleSyncUpWithId(googleConfig.spreadsheetId);
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
    if (!googleConfig.gasWebappUrl && !googleConfig.spreadsheetId) {
      setActiveTab('sheets');
      alert('Vui lòng nhập Google Apps Script WebApp URL!');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Đang tải dữ liệu từ Google Sheets về ứng dụng...');

    try {
      if (googleConfig.gasWebappUrl) {
        // Direct Client fetch to Google Apps Script WebApp (Simple Request avoids CORS preflight)
        const payload = {
          action: 'SYNC_DOWN',
          pin: googleConfig.gasPin || '123456',
        };

        const res = await fetch(googleConfig.gasWebappUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Không thể đọc dữ liệu trả về từ Google Apps Script WebApp. Vui lòng kiểm tra đã chọn "Anyone" (Bất kỳ ai) khi Deploy WebApp chưa.');
        }

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
      } else {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (googleConfig.idToken) {
          headers['Authorization'] = `Bearer ${googleConfig.idToken}`;
        }

        const res = await fetch('/api/sheets/sync-down', {
          method: 'POST',
          headers,
          body: JSON.stringify({ spreadsheetId: googleConfig.spreadsheetId }),
        });

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(`Server phản hồi lỗi (HTTP ${res.status}): ${text.substring(0, 150)}...`);
        }
        if (data.success && data.data) {
          if (data.data.products && data.data.products.length > 0) {
            updateProducts(data.data.products);
          }
          if (data.data.warehouses && data.data.warehouses.length > 0) {
            updateWarehouses(data.data.warehouses);
          }
          if (data.data.transactions && data.data.transactions.length > 0) {
            updateTransactions(data.data.transactions);
          }

          setSyncMessage('Cập nhật dữ liệu từ Google Sheet thành công!');
          updateGoogleConfig({
            ...googleConfig,
            lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
            syncStatus: 'success',
          });
        } else {
          setSyncMessage(`Lỗi tải dữ liệu: ${data.error}`);
          updateGoogleConfig({ ...googleConfig, syncStatus: 'error' });
        }
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
    if (window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu mẫu/hiện tại trên máy không? (Sản phẩm, Kho hàng, Phiếu nhập xuất sẽ về 0)')) {
      updateProducts([]);
      updateWarehouses([]);
      updateTransactions([]);
      alert('Đã xóa sạch dữ liệu! Bạn có thể bắt đầu nhập dữ liệu thực mới.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImportModal={handleOpenImportModal}
        onOpenExportModal={handleOpenExportModal}
        onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
        googleConfig={googleConfig}
        onQuickSync={handleSyncUp}
        isSyncing={isSyncing}
        onClearData={handleClearAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
            onOpenImportModal={handleOpenImportModal}
            onOpenExportModal={handleOpenExportModal}
            onDeleteTransaction={handleDeleteTransaction}
            onSelectVoucher={(code) => setSelectedVoucherCode(code)}
            onEditVoucher={handleEditVoucher}
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
            onCreateNewSheet={handleCreateNewGoogleSheet}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Phần mềm Quản Lý Nhập Xuất Tồn Kho (NXT) - Kết Nối Google Sheets Real-time</span>
          <span className="font-mono text-[11px]">Trạng Thái Dữ Liệu: Local & Google Drive Sync Ready</span>
        </div>
      </footer>

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
    </div>
  );
}
