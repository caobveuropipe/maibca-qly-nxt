import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập tên nhóm hàng.');
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Nhóm hàng này đã tồn tại!');
      return;
    }
    onUpdateCategories([...categories, trimmed]);
    setNewCategoryName('');
    setErrorMsg('');
  };

  const handleDelete = (cat: string) => {
    if (categories.length <= 1) {
      setErrorMsg('Phải có ít nhất 1 nhóm hàng.');
      return;
    }
    if (!window.confirm(`Xóa nhóm hàng "${cat}"? Các sản phẩm thuộc nhóm này sẽ vẫn giữ nguyên tên nhóm cũ.`)) return;
    onUpdateCategories(categories.filter((c) => c !== cat));
    setErrorMsg('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-500">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Quản Lý Nhóm Hàng</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{categories.length} nhóm hàng hiện có</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Add new */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Thêm Nhóm Hàng Mới
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="VD: Nguyên Vật Liệu, Phụ Tùng..."
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setErrorMsg(''); }}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                autoFocus
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shrink-0 shadow-sm shadow-violet-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* Category list */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Danh Sách Nhóm Hàng
            </label>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
              {categories.map((cat, idx) => (
                <div
                  key={cat}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg group hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-5 text-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{cat}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-md text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                    title={`Xóa nhóm "${cat}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
