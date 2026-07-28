import React, { useState } from 'react';
import { AppUser } from '../types';
import { X, UserCheck, KeyRound, Shield, LogIn } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

interface AccountLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  onSelectUser: (user: AppUser) => void;
}

export const AccountLoginModal: React.FC<AccountLoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onSelectUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = users.find((u) => u.id === selectedUserId);
    if (!found) {
      setError('Vui lòng chọn nhân viên đăng nhập!');
      return;
    }

    if (found.status === 'LOCKED') {
      setError('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Admin!');
      return;
    }

    if (found.pin !== pin.trim()) {
      setError('Mã PIN không chính xác. Vui lòng thử lại!');
      return;
    }

    onSelectUser(found);
    onClose();
    setPin('');
  };

  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.name,
    sublabel: u.role === 'ADMIN' ? '👑 Admin Quản Trị' : u.role === 'EDITOR' ? '✏️ Nhân Viên Kho' : '👁️ Chỉ Xem Báo Cáo',
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 text-white">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <LogIn className="w-5 h-5 text-blue-400" />
            <span>Đăng Nhập Tài Khoản Nhân Viên</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800 font-medium">{error}</p>}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Chọn Tên / Tài Khoản Nhân Viên:
            </label>
            <SearchableSelect
              options={userOptions}
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Chọn tên nhân viên..."
              searchPlaceholder="Tìm tên..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Nhập Mã PIN Cá Nhân:
            </label>
            <input
              type="password"
              placeholder="Nhập mã PIN cá nhân..."
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs font-mono font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-md shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> Đăng Nhập Hệ Thống
          </button>
        </form>
      </div>
    </div>
  );
};
