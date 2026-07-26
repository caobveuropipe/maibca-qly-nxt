import React from 'react';
import { Warehouse, Product, Transaction } from '../types';
import { calculateStockSummary, formatNum } from '../utils/storageUtils';
import { Warehouse as WarehouseIcon, Plus, MapPin, User, Phone, Edit3, Trash2, Boxes } from 'lucide-react';

interface WarehousesViewProps {
  warehouses: Warehouse[];
  products: Product[];
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenEditModal: (warehouse: Warehouse) => void;
  onDeleteWarehouse: (warehouseId: string) => void;
}

export const WarehousesView: React.FC<WarehousesViewProps> = ({
  warehouses,
  products,
  transactions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteWarehouse,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Quản Lý Danh Sách Kho ({warehouses.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi chi tiết tồn kho và vị trí quản lý theo từng chi nhánh / kho hàng
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Kho Hàng Mới
        </button>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => {
          // Calculate stock for this warehouse
          const whStock = calculateStockSummary(products, transactions, wh.id);
          const totalQty = whStock.reduce((acc, item) => acc + item.endingQty, 0);

          return (
            <div
              key={wh.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 rounded flex items-center justify-center font-bold text-xs shrink-0">
                      {wh.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        {wh.name}
                        {wh.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                            Mặc định
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">Mã kho: {wh.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(wh)}
                      title="Sửa kho"
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!wh.isDefault && (
                      <button
                        onClick={() => onDeleteWarehouse(wh.id)}
                        title="Xóa kho"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{wh.location || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Thủ kho: <b>{wh.manager || 'Chưa phân công'}</b></span>
                  </div>
                  {wh.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>ĐT: {wh.phone}</span>
                    </div>
                  )}
                </div>

                {/* Warehouse Stock Stats */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-blue-500" /> Số lượng tồn:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNum(totalQty)} SP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
