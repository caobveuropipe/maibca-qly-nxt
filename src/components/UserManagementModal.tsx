import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import { X, Shield, Plus, Edit3, Trash2, Mail, CheckCircle2, User, Lock } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('EDITOR');
  const [status, setStatus] = useState<'ACTIVE' | 'LOCKED'>('ACTIVE');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOpenForm = (user?: AppUser) => {
    setError('');
    if (user) {
      setEditingUserId(user.id);
      setEmail(user.email);
      setName(user.name);
      setRole(user.role);
      setStatus(user.status);
    } else {
      setEditingUserId(null);
      setEmail('');
      setName('');
      setRole('EDITOR');
      setStatus('ACTIVE');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ Email hợp lệ!');
      return;
    }
    if (!name.trim()) {
      setError('Vui lòng nhập Họ tên nhân viên!');
      return;
    }

    onSaveUser(
      {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        pin: '123456',
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
              <h3 className="font-bold text-base text-white">Bảng Quản Lý Danh Sách Phân Quyền Theo Email Nhân Viên</h3>
              <p className="text-xs text-slate-400">Cấp quyền truy cập hệ thống trực tiếp cho từng địa chỉ Email (Chỉ Email được duyệt mới đăng nhập thành công)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">

          {/* Form Create / Edit User Permission */}
          <form onSubmit={handleSubmit} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-700 pb-2">
              <Plus className="w-4 h-4" /> {editingUserId ? 'Chỉnh Sửa Quyền Email Nhân Viên' : 'Thêm Email Nhân Viên & Phân Quyền Mới'}
            </div>

            {error && <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800 font-medium">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Nhân Viên (*)
                </label>
                <input
                  type="email"
                  placeholder="VD: nvkhoa@company.com..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Họ Tên / Đại Diện (*)
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vai Trò Được Cấp (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ADMIN">👑 ADMIN (Toàn Quyền Quản Trị)</option>
                  <option value="EDITOR">✏️ EDITOR (Tạo Phiếu Nhập / Xuất)</option>
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
                  <option value="ACTIVE">🟢 Cho phép truy cập</option>
                  <option value="LOCKED">🔴 Tạm khóa Email này</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
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
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors shadow-sm cursor-pointer"
              >
                {editingUserId ? 'Lưu Quyền Email' : '+ Cấp Quyền Cho Email Mới'}
              </button>
            </div>
          </form>

          {/* User Table List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Danh Sách Email Được Cấp Quyền Hiện Tại ({users.length})</h4>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs divide-y divide-slate-700">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3">Email Đăng Nhập</th>
                    <th className="p-3">Họ Tên Nhân Viên</th>
                    <th className="p-3">Vai Trò Phân Quyền</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center w-24">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((u, i) => (
                    <tr key={u.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3 text-center font-mono text-slate-400 font-semibold">{i + 1}</td>
                      <td className="p-3 font-mono font-bold text-blue-400">{u.email}</td>
                      <td className="p-3 font-semibold text-white">{u.name}</td>
                      <td className="p-3">
                        {u.role === 'ADMIN' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            👑 ADMIN (Toàn Quyền)
                          </span>
                        )}
                        {u.role === 'EDITOR' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            ✏️ EDITOR (Nhập / Xuất Kho)
                          </span>
                        )}
                        {u.role === 'VIEWER' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                            👁️ VIEWER (Chỉ Xem)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {u.status === 'ACTIVE' ? (
                          <span className="text-emerald-400 font-semibold">🟢 Cho phép</span>
                        ) : (
                          <span className="text-red-400 font-semibold">🔴 Tạm khóa</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenForm(u)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                            title="Sửa quyền Email"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {users.length > 1 && (
                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1.5 hover:bg-slate-700 rounded text-red-400 hover:text-red-300 transition-colors"
                              title="Thu hồi quyền Email"
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

          {/* Matrix Table: Bảng Chi Tiết Quyền Theo Role */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Bảng Ma Trận Phân Quyền Chi Tiết Theo Vai Trò (Role Matrix)
            </h4>

            <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs divide-y divide-slate-700">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Tính Năng / Thẻ Chức Năng</th>
                    <th className="p-3 text-center text-amber-400 bg-amber-950/30">👑 ADMIN</th>
                    <th className="p-3 text-center text-blue-400 bg-blue-950/30">✏️ EDITOR</th>
                    <th className="p-3 text-center text-slate-300 bg-slate-800/60">👁️ VIEWER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-bold text-slate-200">⚙️ Nút Cấu Hình & Chuyển Vai Trò (Header)</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Hiển thị</td>
                    <td className="p-2.5 text-center text-red-400 font-bold bg-blue-950/10">❌ Ẩn</td>
                    <td className="p-2.5 text-center text-red-400 font-bold">❌ Ẩn</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-bold text-slate-200">🛡️ Bảng Phân Quyền Email Nhân Viên (Sidebar)</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Hiển thị & Cấp quyền</td>
                    <td className="p-2.5 text-center text-red-400 font-bold bg-blue-950/10">❌ Ẩn</td>
                    <td className="p-2.5 text-center text-red-400 font-bold">❌ Ẩn</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-bold text-slate-200">📊 Tab & Nút Đồng Bộ Sheets</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Hiển thị & Cấu hình</td>
                    <td className="p-2.5 text-center text-red-400 font-bold bg-blue-950/10">❌ Ẩn</td>
                    <td className="p-2.5 text-center text-red-400 font-bold">❌ Ẩn</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-bold text-slate-200">🗑️ Nút Xóa Sạch Dữ Liệu (Clear All)</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Cho phép</td>
                    <td className="p-2.5 text-center text-red-400 font-bold bg-blue-950/10">❌ Ẩn</td>
                    <td className="p-2.5 text-center text-red-400 font-bold">❌ Ẩn</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 text-slate-300">📦 Lập Phiếu Nhập / Phiếu Xuất / Nhập Excel</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Cho phép</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-blue-950/10">✅ Cho phép</td>
                    <td className="p-2.5 text-center text-red-400 font-bold">❌ Ẩn / Khóa nút</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 text-slate-300">🤝 Thêm / Sửa / Xóa Sản Phẩm, Kho & Đối Tác</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Cho phép</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-blue-950/10">✅ Cho phép</td>
                    <td className="p-2.5 text-center text-red-400 font-bold">❌ Chỉ xem</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="p-2.5 text-slate-300">📈 Xem Báo Cáo NXT & Thẻ Kho Chi Tiết</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-amber-950/10">✅ Đầy đủ</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold bg-blue-950/10">✅ Đầy đủ</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold">✅ Đầy đủ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


        </div>
      </div>

    </div>
  );
};
