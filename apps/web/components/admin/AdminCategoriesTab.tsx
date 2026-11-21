'use client';

import React, { useState } from 'react';
import { Category, Product } from '@/types/types';
import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
} from '@/services/adminService';

interface AdminCategoriesTabProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export default function AdminCategoriesTab({
  categories,
  products,
  onRefresh,
  onNotify,
}: AdminCategoriesTabProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      setBusy(true);
      await createAdminCategory(trimmed);
      setNewName('');
      onNotify('success', `Đã thêm danh mục "${trimmed}"`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể thêm danh mục');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    try {
      setBusy(true);
      await updateAdminCategory(id, trimmed);
      setEditingId(null);
      onNotify('success', 'Đã cập nhật danh mục');
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể cập nhật danh mục');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      setBusy(true);
      await deleteAdminCategory(cat.id);
      onNotify('success', `Đã xóa danh mục "${cat.name}"`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể xóa danh mục');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên danh mục mới (VD: Cà phê máy, Trà trái cây...)"
          maxLength={100}
          required
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2E1C12] text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          + Thêm danh mục
        </button>
      </form>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F0E6]/60 text-left text-xs uppercase text-[#8D6E63] border-b border-[#E8DFD8]">
              <th className="px-5 py-3.5 font-semibold">ID</th>
              <th className="px-5 py-3.5 font-semibold">Tên danh mục</th>
              <th className="px-5 py-3.5 font-semibold">Số sản phẩm</th>
              <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F0E6]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[#8D6E63]">
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const isEditing = editingId === cat.id;

                return (
                  <tr key={cat.id} className="hover:bg-[#FDFBF7]">
                    <td className="px-5 py-3.5 font-mono text-xs text-[#8D6E63]">
                      #{cat.id}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#3E2723]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          className="px-3 py-1.5 rounded-lg border border-[#D7A86E] bg-white text-sm w-full max-w-xs focus:outline-none"
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#5C4D44]">{count} món</td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleUpdate(cat.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#2E1C12] cursor-pointer"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg border border-[#E8DFD8] text-xs font-semibold text-[#5C4D44] hover:bg-[#F5F0E6] cursor-pointer"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditingName(cat.name);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#E8DFD8] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6] cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(cat)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            Xóa
                          </button>
                        </>
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
  );
}
