import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Package, Save, Plus } from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';
import { FormattedNumberInput } from './FormattedNumberInput';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  initialProduct?: Product | null;
  existingProducts: Product[];
  categories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  existingProducts,
  categories,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [category, setCategory] = useState('Thiết Bị');
  const [minStock, setMinStock] = useState<number>(10);
  const [maxStock, setMaxStock] = useState<number>(100);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        setCode(initialProduct.code);
        setName(initialProduct.name);
        setUnit(initialProduct.unit);
        setCategory(initialProduct.category);
        setMinStock(initialProduct.minStock);
        setMaxStock(initialProduct.maxStock || 100);
        setCostPrice(initialProduct.costPrice);
        setSellingPrice(initialProduct.sellingPrice);
        setDescription(initialProduct.description || '');
      } else {
        // Auto-generate code
        const nextNum = existingProducts.length + 1;
        setCode(`SP${String(nextNum).padStart(3, '0')}`);
        setName('');
        setUnit('Cái');
        setCategory('Thiết Bị');
        setMinStock(5);
        setMaxStock(100);
        setCostPrice(0);
        setSellingPrice(0);
        setDescription('');
      }
      setErrorMsg('');
    }
  }, [isOpen, initialProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!cleanCode) {
      setErrorMsg('Mã sản phẩm không được để trống.');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Tên sản phẩm không được để trống.');
      return;
    }

    // Check duplicate code if new product
    if (!initialProduct && existingProducts.some((p) => p.code.toLowerCase() === cleanCode.toLowerCase())) {
      setErrorMsg(`Mã sản phẩm "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác.`);
      return;
    }

    onSave({
      code: cleanCode,
      name: cleanName,
      unit: unit.trim() || 'Cái',
      category: category.trim() || 'Khác',
      minStock: Number(minStock) || 0,
      maxStock: Number(maxStock) || 0,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      description: description.trim(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialProduct ? 'Chỉnh Sửa Mặt Hàng' : 'Thêm Mặt Hàng Mới'}
              </h3>
              <p className="text-xs text-slate-400">Quản lý danh mục sản phẩm nhập xuất tồn kho</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã Sản Phẩm (*)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={!!initialProduct}
                placeholder="VD: SP001"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Đơn Vị Tính (*)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="Cái, Cuộn, Hộp, Bộ, Thùng, Kg..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên Sản Phẩm (*)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nhập tên đầy đủ của mặt hàng..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nhóm Hàng
              </label>
              <SearchableSelect
                options={categories.map(c => ({ value: c, label: c }))}
                value={category}
                onChange={setCategory}
                placeholder="Chọn nhóm hàng..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tồn Tối Thiểu (Cảnh báo)
              </label>
              <FormattedNumberInput
                min={0}
                value={minStock}
                onChange={setMinStock}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tồn Tối Đa
              </label>
              <FormattedNumberInput
                min={0}
                value={maxStock}
                onChange={setMaxStock}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
              />
            </div>
          </div>

          {/* Description */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mô Tả / Chi Tiết
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập quy cách, xuất xứ hoặc mô tả thêm..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              {initialProduct ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {initialProduct ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
