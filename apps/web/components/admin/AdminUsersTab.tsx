'use client';

import React, { useState } from 'react';
import { AdminUser } from '@/types/types';
import {
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
} from '@/services/adminService';
import { formatDateTime, ROLE_META } from './adminConstants';

interface AdminUsersTabProps {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  currentUserId?: number;
  onPageChange: (nextPage: number) => void;
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

interface UserFormState {
  id?: number | string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'barista' | 'admin';
}

const EMPTY_USER_FORM: UserFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer',
};

export default function AdminUsersTab({
  users,
  total,
  page,
  limit,
  currentUserId,
  onPageChange,
  onRefresh,
  onNotify,
}: AdminUsersTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [busy, setBusy] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openCreate = () => {
    setForm(EMPTY_USER_FORM);
    setModalOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setForm({
      id: u.id,
      fullName: u.fullName || '',
      email: u.email,
      phone: u.phone || '',
      password: '',
      role: (u.role as 'customer' | 'barista' | 'admin') || 'customer',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      if (form.id) {
        await updateAdminUser(form.id, {
          fullName: form.fullName.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          role: form.role,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        });
        onNotify('success', 'Đã cập nhật tài khoản');
      } else {
        await createAdminUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });
        onNotify('success', 'Đã tạo tài khoản mới');
      }
      setModalOpen(false);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể lưu người dùng');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (Number(u.id) === Number(currentUserId)) {
      onNotify('error', 'Không thể tự xóa tài khoản đang đăng nhập');
      return;
    }
    if (!window.confirm(`Xóa tài khoản ${u.email}?`)) return;
    try {
      setBusy(true);
      await deleteAdminUser(u.id);
      onNotify('success', `Đã xóa tài khoản ${u.email}`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể xóa tài khoản');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-[#E8DFD8] p-4 shadow-xs">
        <div>
          <p className="text-sm font-bold text-[#3E2723]">
            Tổng cộng {total} tài khoản
          </p>
          <p className="text-xs text-[#8D6E63]">
            Trang {page} / {totalPages}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2E1C12] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F0E6]/60 text-left text-xs uppercase text-[#8D6E63] border-b border-[#E8DFD8]">
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Họ tên & Email</th>
                <th className="px-5 py-3.5 font-semibold">SĐT</th>
                <th className="px-5 py-3.5 font-semibold">Vai trò</th>
                <th className="px-5 py-3.5 font-semibold">Điểm Loyalty</th>
                <th className="px-5 py-3.5 font-semibold">Ngày tạo</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E6]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#8D6E63]">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleMeta = ROLE_META[String(u.role)] || {
                    label: String(u.role),
                    badgeClass: 'bg-gray-100 text-gray-700',
                  };
                  return (
                    <tr key={String(u.id)} className="hover:bg-[#FDFBF7]">
                      <td className="px-5 py-3.5 font-mono text-xs text-[#8D6E63]">
                        #{u.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-[#3E2723]">
                          {u.fullName || 'Chưa cập nhật'}
                        </p>
                        <p className="text-xs text-[#8D6E63]">{u.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#5C4D44]">
                        {u.phone || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${roleMeta.badgeClass}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#8D6E63]">
                        {u.loyaltyPoints ?? 0} điểm
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#8D6E63]">
                        {formatDateTime(u.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="px-3 py-1.5 rounded-lg border border-[#E8DFD8] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6] cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={busy || Number(u.id) === Number(currentUserId)}
                          onClick={() => handleDelete(u)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8DFD8] bg-white text-xs font-semibold text-[#3E2723] disabled:opacity-40 cursor-pointer"
          >
            ← Trước
          </button>
          <span className="text-xs font-semibold text-[#5C4D44] px-2">
            Trang {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8DFD8] bg-white text-xs font-semibold text-[#3E2723] disabled:opacity-40 cursor-pointer"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#E8DFD8] w-full max-w-md p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#3E2723]">
              {form.id ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required={!form.id}
                placeholder="0912345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                {form.id ? 'Mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu * (tối thiểu 8 ký tự)'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!form.id}
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            {form.id && (
              <div>
                <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                  Vai trò
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as 'customer' | 'barista' | 'admin',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
                >
                  <option value="customer">Khách hàng (customer)</option>
                  <option value="barista">Barista (barista)</option>
                  <option value="admin">Quản trị viên (admin)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E8DFD8] text-sm font-semibold text-[#5C4D44] hover:bg-[#F5F0E6] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 rounded-xl bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#2E1C12] cursor-pointer"
              >
                {busy ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
