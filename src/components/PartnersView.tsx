import React, { useState } from 'react';
import { Partner, PartnerType } from '../types';
import { Plus, Search, Edit2, Trash2, Users, Building2, UserCheck, Phone, MapPin, X, CheckCircle2 } from 'lucide-react';

interface PartnersViewProps {
  partners: Partner[];
  onAddPartner: (partner: Omit<Partner, 'id'>) => void;
  onUpdatePartner: (partner: Partner) => void;
  onDeletePartner: (id: string) => void;
  isReadOnly?: boolean;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  onAddPartner,
  onUpdatePartner,
  onDeletePartner,
  isReadOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | PartnerType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<PartnerType>('NHA_CUNG_CAP');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingPartner(null);
    setCode(`DT${String(partners.length + 1).padStart(3, '0')}`);
    setName('');
    setType('NHA_CUNG_CAP');
    setPhone('');
    setAddress('');
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Partner) => {
    setEditingPartner(p);
    setCode(p.code);
    setName(p.name);
    setType(p.type);
    setPhone(p.phone || '');
    setAddress(p.address || '');
    setNote(p.note || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!code.trim()) {
      setFormError('Vui lòng nhập Mã đối tác');
      return;
    }
    if (!name.trim()) {
      setFormError('Vui lòng nhập Tên đối tác');
      return;
    }

    // Check duplicate code
    const isDuplicate = partners.some(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase() && p.id !== editingPartner?.id
    );
    if (isDuplicate) {
      setFormError(`Mã đối tác "${code}" đã tồn tại trong hệ thống!`);
      return;
    }

    if (editingPartner) {
      onUpdatePartner({
        ...editingPartner,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
      });
    } else {
      onAddPartner({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const filteredPartners = partners.filter((p) => {
    const matchSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === 'ALL' || p.type === filterType;
    return matchSearch && matchType;
  });

  const supplierCount = partners.filter((p) => p.type === 'NHA_CUNG_CAP').length;
  const customerCount = partners.filter((p) => p.type === 'KHACH_HANG').length;

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng Đối Tác</p>
            <p className="text-2xl font-bold text-slate-800">{partners.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Nhà Cung Cấp</p>
            <p className="text-2xl font-bold text-slate-800">{supplierCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Khách Hàng / Đơn Vị</p>
            <p className="text-2xl font-bold text-slate-800">{customerCount}</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã đối tác, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
            />
          </div>

          {/* Filter Type */}
          <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilterType('NHA_CUNG_CAP')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'NHA_CUNG_CAP' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhà Cung Cấp
            </button>
            <button
              onClick={() => setFilterType('KHACH_HANG')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'KHACH_HANG' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khách Hàng
            </button>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đối Tác</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Mã ĐT</th>
                <th className="px-4 py-3">Tên Đối Tác</th>
                <th className="px-4 py-3">Phân Loại</th>
                <th className="px-4 py-3">Số Điện Thoại</th>
                <th className="px-4 py-3">Địa Chỉ</th>
                <th className="px-4 py-3">Ghi Chú</th>
                {!isReadOnly && <th className="px-4 py-3 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 6 : 7} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy đối tác nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.type === 'NHA_CUNG_CAP' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Nhà Cung Cấp
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                          Khách Hàng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.phone ? (
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.address ? (
                        <div className="flex items-start text-slate-600">
                          <MapPin className="w-3.5 h-3.5 mr-1 mt-0.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{p.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.note || '-'}</td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa đối tác "${p.name}"?`)) {
                                onDeletePartner(p.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingPartner ? 'Chỉnh Sửa Đối Tác' : 'Thêm Đối Tác Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
                    Mã Đối Tác <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: NCC001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none uppercase font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
                    Phân Loại <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PartnerType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none font-medium"
                  >
                    <option value="NHA_CUNG_CAP">Nhà Cung Cấp</option>
                    <option value="KHACH_HANG">Khách Hàng / Đơn Vị</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
                  Tên Đối Tác <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Công ty TNHH Bao bì An Phát"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988 123 456"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Địa Chỉ</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="VD: Hà Nội"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Ghi Chú</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thông tin thêm..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingPartner ? 'Lưu Thay Đổi' : 'Thêm Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
