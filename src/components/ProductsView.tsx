import { Product, Warehouse, Transaction, UserRole } from '../types';
import { formatVND, formatNum, calculateStockSummary } from '../utils/storageUtils';
import { Search, Plus, Edit3, Trash2, Package, Filter, FileText, Tag } from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface ProductsViewProps {
  products: Product[];
  warehouses: Warehouse[];
  transactions: Transaction[];
  categories: string[];
  userRole?: UserRole;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onViewStockCard: (productId: string) => void;
  onManageCategories: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  warehouses,
  transactions,
  categories,
  userRole = 'ADMIN',
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onViewStockCard,
  onManageCategories,
}) => {
  const isViewer = userRole === 'VIEWER';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Compute live stock quantities per product
  const stockSummary = calculateStockSummary(products, transactions, 'ALL');

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Build filter options from categories prop (managed list) + any extra in products
  const allCatsInProducts = Array.from(new Set(products.map((p) => p.category)));
  const filterCategories = Array.from(new Set([...categories, ...allCatsInProducts]));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Danh Mục Mặt Hàng ({products.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý mã hàng, quy cách, đơn vị tính, giá nhập xuất và định mức tồn kho
          </p>
        </div>

        {!isViewer && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onManageCategories}
              className="px-3 py-2 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-semibold text-xs rounded-md flex items-center gap-1.5 transition-all"
              title="Quản lý danh sách nhóm hàng"
            >
              <Tag className="w-3.5 h-3.5" />
              Nhóm Hàng ({categories.length})
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm Mặt Hàng Mới
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã SP hoặc tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 sm:w-64">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <SearchableSelect
            options={[
              { value: 'ALL', label: 'Tất cả nhóm hàng' },
              ...filterCategories.map((cat) => ({ value: cat, label: cat })),
            ]}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Chọn nhóm hàng..."
            searchPlaceholder="Tìm nhóm hàng..."
            className="w-full"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">Mã SP</th>
                <th className="px-4 py-3">Tên Sản Phẩm</th>
                <th className="px-4 py-3">ĐVT</th>
                <th className="px-4 py-3">Nhóm Hàng</th>
                <th className="px-4 py-3 text-right">Tồn Hiện Tại</th>
                <th className="px-4 py-3 text-right">Định Mức An Toàn</th>
                <th className="px-4 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const stockItem = stockSummary.find((s) => s.productId === p.id);
                const currentQty = stockItem ? stockItem.endingQty : 0;
                const isLow = currentQty <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <button
                        type="button"
                        onClick={() => onViewStockCard(p.id)}
                        className="hover:underline hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-left"
                        title="Xem Thẻ Kho mặt hàng này"
                      >
                        {p.code}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      <div>{p.name}</div>
                      {p.description && (
                        <div className="text-[10px] text-slate-400 font-normal">{p.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {p.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {formatNum(currentQty)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      Min: {formatNum(p.minStock)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewStockCard(p.id)}
                          title="Xem thẻ kho chi tiết"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <>
                            <button
                              onClick={() => onOpenEditModal(p)}
                              title="Sửa mặt hàng"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              title="Xóa mặt hàng"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
