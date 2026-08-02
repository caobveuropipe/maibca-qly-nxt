import React, { useState, useEffect } from 'react';
import { Warehouse } from '../types';
import { X, Warehouse as WarehouseIcon, Save, Plus } from 'lucide-react';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Omit<Warehouse, 'id'>) => void;
  initialWarehouse?: Warehouse | null;
  existingWarehouses: Warehouse[];
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWarehouse,
  existingWarehouses,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialWarehouse) {
        setCode(initialWarehouse.code);
        setName(initialWarehouse.name);
        setLocation(initialWarehouse.location);
        setManager(initialWarehouse.manager);
        setPhone(initialWarehouse.phone || '');
        setIsDefault(!!initialWarehouse.isDefault);
      } else {
        const nextNum = existingWarehouses.length + 1;
        setCode(`K${String(nextNum).padStart(2, '0')}`);
        setName('');
        setLocation('');
        setManager('');
        setPhone('');
        setIsDefault(existingWarehouses.length === 0);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialWarehouse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!cleanCode) {
      setErrorMsg('Mã kho không được để trống.');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Tên kho không được để trống.');
      return;
    }

    if (!initialWarehouse && existingWarehouses.some((w) => w.code.toLowerCase() === cleanCode.toLowerCase())) {
      setErrorMsg(`Mã kho "${cleanCode}" đã tồn tại. Vui lòng chọn mã kho khác.`);
      return;
    }

    onSave({
      code: cleanCode,
      name: cleanName,
      location: location.trim(),
      manager: manager.trim(),
      phone: phone.trim(),
      isDefault,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <WarehouseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialWarehouse ? 'Chỉnh Sửa Kho Hàng' : 'Thêm Kho Hàng Mới'}
              </h3>
              <p className="text-xs text-slate-400">Quản lý địa điểm lưu kho trong hệ thống</p>
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
                Mã Kho (*)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={!!initialWarehouse}
                placeholder="VD: K01"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0903..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên Kho (*)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="VD: Kho Tổng TP.HCM, Kho Hà Nội..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa Chỉ / Địa Điểm
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nhập địa chỉ vị trí kho..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thủ Kho / Người Quản Lý
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Họ và tên thủ kho..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultWh"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isDefaultWh" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              Đặt làm kho mặc định khi lập phiếu nhập xuất
            </label>
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
              {initialWarehouse ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {initialWarehouse ? 'Lưu Thay Đổi' : 'Tạo Kho Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
