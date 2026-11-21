'use client';

import React, { useMemo, useState } from 'react';
import { Category, Product } from '@/types/types';
import {
  createAdminProduct,
  deleteAdminProduct,
  ProductPayload,
  updateAdminProduct,
} from '@/services/adminService';
import { formatVnd } from './adminConstants';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

interface ProductFormState {
  id?: number;
  name: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  description: string;
  status: 'active' | 'inactive';
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  price: '35000',
  categoryId: '',
  imageUrl: '',
  description: '',
  status: 'active',
};

export default function AdminProductsTab({
  products,
  categories,
  onRefresh,
  onNotify,
}: AdminProductsTabProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (filterCategory !== 'ALL' && String(p.categoryId || '') !== filterCategory) {
        return false;
      }
      const status = p.status || 'active';
      if (filterStatus !== 'ALL' && status !== filterStatus) return false;
      return true;
    });
  }, [products, search, filterCategory, filterStatus]);

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0] ? String(categories[0].id) : '',
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      categoryId: p.categoryId ? String(p.categoryId) : '',
      imageUrl: p.imageUrl || '',
      description: p.description || '',
      status: p.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductPayload = {
      name: form.name.trim(),
      price: Math.round(Number(form.price) || 0),
      status: form.status,
      ...(form.categoryId ? { categoryId: Number(form.categoryId) } : {}),
      ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };

    try {
      setBusy(true);
      if (form.id) {
        await updateAdminProduct(form.id, payload);
        onNotify('success', `Đã cập nhật "${payload.name}"`);
      } else {
        await createAdminProduct(payload);
        onNotify('success', `Đã thêm sản phẩm "${payload.name}"`);
      }
      setModalOpen(false);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể lưu sản phẩm');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const nextStatus = p.status === 'inactive' ? 'active' : 'inactive';
    try {
      setBusy(true);
      await updateAdminProduct(p.id, { status: nextStatus });
      onNotify(
        'success',
        `Đã ${nextStatus === 'active' ? 'hiển thị' : 'ẩn'} "${p.name}"`,
      );
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể đổi trạng thái');
    } finally {
      setBusy(false);
    }
  };

  const handleSoftDelete = async (p: Product) => {
    if (!window.confirm(`Ngừng bán (ẩn) sản phẩm "${p.name}"?`)) return;
    try {
      setBusy(true);
      await deleteAdminProduct(p.id);
      onNotify('success', `Đã chuyển "${p.name}" sang trạng thái ngừng bán`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể xóa sản phẩm');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] p-4 shadow-xs flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đồ uống..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none"
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2E1C12] text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F0E6]/60 text-left text-xs uppercase text-[#8D6E63] border-b border-[#E8DFD8]">
                <th className="px-5 py-3.5 font-semibold">Sản phẩm</th>
                <th className="px-5 py-3.5 font-semibold">Danh mục</th>
                <th className="px-5 py-3.5 font-semibold">Giá gốc</th>
                <th className="px-5 py-3.5 font-semibold">Tồn kho NL</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8D6E63]">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isActive = p.status !== 'inactive';
                  return (
                    <tr key={p.id} className="hover:bg-[#FDFBF7]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover border border-[#E8DFD8] shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#F5F0E6] border border-[#E8DFD8] flex items-center justify-center text-xs text-[#8D6E63] shrink-0">
                              ☕
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#3E2723]">{p.name}</p>
                            <p className="text-xs text-[#8D6E63] line-clamp-1 max-w-[260px]">
                              {p.description || 'Chưa có mô tả'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#5C4D44]">
                        {p.category?.name || 'Chưa phân loại'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#3E2723]">
                        {formatVnd(p.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold ${
                            (p.stock ?? 0) > 0 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {p.stock ?? 0} ly
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleToggleStatus(p)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {isActive ? 'Đang bán' : 'Ngừng bán'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 rounded-lg border border-[#E8DFD8] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6] cursor-pointer"
                        >
                          Sửa
                        </button>
                        {isActive && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleSoftDelete(p)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            Ẩn
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#E8DFD8] w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#3E2723]">
              {form.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={255}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                  Giá (VNĐ) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                  Danh mục
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                URL hình ảnh (https://...)
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as 'active' | 'inactive',
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              >
                <option value="active">Đang bán (active)</option>
                <option value="inactive">Ngừng bán (inactive)</option>
              </select>
            </div>

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
                {busy ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Tạo sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
