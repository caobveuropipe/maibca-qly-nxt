import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import { X, Shield, Plus, Edit3, Trash2, KeyRound, UserCheck, Eye, Lock, CheckCircle } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  onSaveUser: (user: Omit<AppUser, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onSaveUser,
  onDeleteUser,
}) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<UserRole>('EDITOR');
  const [status, setStatus] = useState<'ACTIVE' | 'LOCKED'>('ACTIVE');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOpenForm = (user?: AppUser) => {
    setError('');
    if (user) {
      setEditingUserId(user.id);
      setName(user.name);
      setEmail(user.email);
      setPin(user.pin);
      setRole(user.role);
      setStatus(user.status);
    } else {
      setEditingUserId(null);
      setName('');
      setEmail('');
      setPin('123456');
      setRole('EDITOR');
      setStatus('ACTIVE');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập Tên nhân viên!');
      return;
    }
    if (!pin.trim()) {
      setError('Vui lòng nhập Mã PIN!');
      return;
    }

    onSaveUser(
      {
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@system.local`,
        pin: pin.trim(),
        role,
        status,
      },
      editingUserId || undefined
    );

    handleOpenForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Bảng Quản Lý Danh Sách Phân Quyền Nhân Viên</h3>
              <p className="text-xs text-slate-400">Tạo tài khoản, cấp vai trò ADMIN / EDITOR / VIEWER và đặt mã PIN cho từng người dùng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">

          {/* Form Create / Edit User */}
          <form onSubmit={handleSubmit} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-700 pb-2">
              <Plus className="w-4 h-4" /> {editingUserId ? 'Chỉnh Sửa Tài Khoản Nhân Viên' : 'Thêm Nhân Viên / Cấp Quyền Mới'}
            </div>

            {error && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Nhân Viên (*)</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mã PIN Cá Nhân (*)</label>
                <input
                  type="text"
                  placeholder="VD: 123456..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded font-mono font-bold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vai Trò (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ADMIN">👑 ADMIN (Quản Trị Viên)</option>
                  <option value="EDITOR">✏️ EDITOR (Nhập / Xuất Kho)</option>
                  <option value="VIEWER">👁️ VIEWER (Chỉ Xem Báo Cáo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trạng Thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ACTIVE">🟢 Hoạt động</option>
                  <option value="LOCKED">🔴 Tạm khóa</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingUserId && (
                <button
                  type="button"
                  onClick={() => handleOpenForm()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded transition-colors"
                >
                  Hủy Sửa
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-colors shadow-sm"
              >
                {editingUserId ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản Mới'}
              </button>
            </div>
          </form>

          {/* User Table List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Danh Sách Người Dùng Hiện Tại ({users.length})</h4>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-700">
                <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3">Tên Nhân Viên</th>
                    <th className="p-3">Mã PIN</th>
                    <th className="p-3">Vai Trò Phân Quyền</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center w-24">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((u, i) => (
                    <tr key={u.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3 text-center font-mono text-slate-400 font-semibold">{i + 1}</td>
                      <td className="p-3 font-bold text-white">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{u.email}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-400">{u.pin}</td>
                      <td className="p-3">
                        {u.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            👑 ADMIN (Quản Trị)
                          </span>
                        )}
                        {u.role === 'EDITOR' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            ✏️ EDITOR (Nhập / Xuất Kho)
                          </span>
                        )}
                        {u.role === 'VIEWER' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                            👁️ VIEWER (Chỉ Xem)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {u.status === 'ACTIVE' ? (
                          <span className="text-emerald-400 font-semibold">🟢 Hoạt động</span>
                        ) : (
                          <span className="text-red-400 font-semibold">🔴 Tạm khóa</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenForm(u)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                            title="Sửa quyền/PIN"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {users.length > 1 && (
                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
