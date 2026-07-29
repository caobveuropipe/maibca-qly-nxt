import React, { useState } from 'react';
import { AppUser, UserRole, PermissionKey, RolePermissionsMap } from '../types';
import { X, Shield, Plus, Edit3, Trash2, Mail, User, CheckSquare, Square } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  onSaveUser: (user: Omit<AppUser, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteUser: (userId: string) => void;
  rolePermissions: RolePermissionsMap;
  onTogglePermission: (role: UserRole, key: PermissionKey) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onSaveUser,
  onDeleteUser,
  rolePermissions,
  onTogglePermission,
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

  const permissionRows: { key: PermissionKey; label: string; desc: string }[] = [
    { key: 'canConfig', label: '⚙️ Nút Cấu Hình & Chuyển Vai Trò', desc: 'Quyền xem nút bánh răng cấu hình trên Header' },
    { key: 'canManageUsers', label: '🛡️ Bảng Phân Quyền Email Nhân Viên', desc: 'Quyền xem và cấp quyền tài khoản nhân viên' },
    { key: 'canSyncSheets', label: '📊 Tab & Nút Đồng Bộ Sheets', desc: 'Quyền cài đặt link WebApp & đẩy/tải dữ liệu Google Sheets' },
    { key: 'canClearData', label: '🗑️ Nút Xóa Sạch Dữ Liệu (Clear All)', desc: 'Quyền reset sạch dữ liệu ứng dụng & Google Sheets' },
    { key: 'canCreateVoucher', label: '📦 Lập Phiếu Nhập / Xuất / Nhập Excel', desc: 'Quyền tạo mới phiếu nhập, xuất kho & tải tệp Excel' },
    { key: 'canManageMaster', label: '🤝 Thêm / Sửa / Xóa Sản Phẩm, Kho & Đối Tác', desc: 'Quyền quản lý danh mục master data' },
    { key: 'canViewReports', label: '📈 Xem Báo Cáo NXT & Thẻ Kho Chi Tiết', desc: 'Quyền xem tổng hợp nhập xuất tồn & thẻ kho' },
  ];

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
              <h3 className="font-bold text-base text-white">Bảng Quản Lý Danh Sách Phân Quyền & Bảng Ma Trận Tính Năng</h3>
              <p className="text-xs text-slate-400">Cấp quyền Email & Click tích mở/khóa từng tính năng cho từng vai trò</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Đăng Nhập (*):</label>
                <input
                  type="email"
                  placeholder="nhanvien@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Họ Và Tên (*):</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Vai Trò Hệ Thống:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="EDITOR">✏️ EDITOR (Nhân Viên Kho)</option>
                  <option value="VIEWER">👁️ VIEWER (Chỉ Xem Báo Cáo)</option>
                  <option value="ADMIN">👑 ADMIN (Chủ Quản Trị)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Trạng Thái Truy Cập:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'LOCKED')}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
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
                        {u.role === 'ADMIN' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">👑 ADMIN</span>}
                        {u.role === 'EDITOR' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">✏️ EDITOR</span>}
                        {u.role === 'VIEWER' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">👁️ VIEWER</span>}
                      </td>
                      <td className="p-3 text-center">{u.status === 'ACTIVE' ? <span className="text-emerald-400">🟢 Active</span> : <span className="text-red-400">🔴 Locked</span>}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenForm(u)} className="p-1 hover:bg-slate-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                          {users.length > 1 && <button onClick={() => onDeleteUser(u.id)} className="p-1 hover:bg-slate-600 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Checkbox Matrix Table */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Bảng Ma Trận Tùy Bật / Tắt Quyền Tính Năng Cho Từng Vai Trò
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">* Bấm trực tiếp vào các ô Checkbox để Bật/Tắt quyền</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs divide-y divide-slate-700">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Tính Năng / Thẻ Chức Năng</th>
                    <th className="p-3 text-center text-amber-400 bg-amber-950/30 w-32">👑 ADMIN</th>
                    <th className="p-3 text-center text-blue-400 bg-blue-950/30 w-36">✏️ EDITOR</th>
                    <th className="p-3 text-center text-slate-300 bg-slate-800/60 w-36">👁️ VIEWER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {permissionRows.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{row.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{row.desc}</div>
                      </td>

                      {/* ADMIN - Always Enabled */}
                      <td className="p-3 text-center bg-amber-950/10">
                        <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs select-none">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          <span>Toàn quyền</span>
                        </div>
                      </td>

                      {/* EDITOR Checkbox */}
                      <td className="p-3 text-center bg-blue-950/10">
                        <button
                          type="button"
                          onClick={() => onTogglePermission('EDITOR', row.key)}
                          className={`flex items-center justify-center gap-1.5 mx-auto px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs font-bold ${
                            rolePermissions.EDITOR[row.key]
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                          }`}
                        >
                          {rolePermissions.EDITOR[row.key] ? (
                            <>
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                              <span>Cho phép</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-4 h-4 text-red-400" />
                              <span>Đã khóa</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* VIEWER Checkbox */}
                      <td className="p-3 text-center bg-slate-800/40">
                        <button
                          type="button"
                          onClick={() => onTogglePermission('VIEWER', row.key)}
                          className={`flex items-center justify-center gap-1.5 mx-auto px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs font-bold ${
                            rolePermissions.VIEWER[row.key]
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                          }`}
                        >
                          {rolePermissions.VIEWER[row.key] ? (
                            <>
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                              <span>Cho phép</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-4 h-4 text-red-400" />
                              <span>Đã khóa</span>
                            </>
                          )}
                        </button>
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

