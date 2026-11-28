'use client';

import React, { useState } from 'react';
import { ToppingItem } from '@/types/types';
import {
  createAdminTopping,
  deleteAdminTopping,
  updateAdminTopping,
} from '@/services/adminService';
import { formatVnd } from './adminConstants';

interface AdminToppingsTabProps {
  toppings: ToppingItem[];
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export default function AdminToppingsTab({
  toppings,
  onRefresh,
  onNotify,
}: AdminToppingsTabProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('5000');
  const [editing, setEditing] = useState<ToppingItem | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setBusy(true);
      await createAdminTopping({
        name: name.trim(),
        price: Number(price) || 0,
        isAvailable: true,
      });
      setName('');
      setPrice('5000');
      onNotify('success', 'Đã thêm topping mới');
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể thêm topping');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setBusy(true);
      await updateAdminTopping(editing.id, {
        name: editing.name.trim(),
        price: Number(editing.price) || 0,
        isAvailable: editing.isAvailable ?? true,
      });
      setEditing(null);
      onNotify('success', 'Đã cập nhật topping');
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể cập nhật topping');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleAvailable = async (t: ToppingItem) => {
    try {
      setBusy(true);
      await updateAdminTopping(t.id, { isAvailable: !(t.isAvailable ?? true) });
      onNotify('success', `Đã cập nhật trạng thái "${t.name}"`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (t: ToppingItem) => {
    if (
      !window.confirm(
        `Xóa vĩnh viễn topping "${t.name}"?\n\nLưu ý: Nếu quầy tạm hết hàng, nên bấm đổi trạng thái sang "Tạm hết" thay vì xóa. Topping đã từng xuất hiện trong đơn hàng sẽ không thể xóa để bảo toàn lịch sử.`,
      )
    ) {
      return;
    }
    try {
      setBusy(true);
      await deleteAdminTopping(t.id);
      onNotify('success', `Đã xóa topping "${t.name}"`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : 'Không thể xóa topping');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-900">
        💡 <strong>Khuyến nghị vận hành:</strong> Khi quầy tạm hết nguyên liệu topping, hãy bấm vào nút{' '}
        <strong>Còn hàng / Tạm hết</strong> thay vì xóa. Nút <strong>Xóa</strong> chỉ áp dụng cho topping mới tạo chưa có trong đơn hàng nào.
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên topping (VD: Trân châu trắng)"
          required
          className="px-4 py-2.5 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
        />
        <input
          type="number"
          min={0}
          step={1000}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Giá (VNĐ)"
          required
          className="px-4 py-2.5 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2E1C12] text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          + Thêm topping
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F0E6]/60 text-left text-xs uppercase text-[#8D6E63] border-b border-[#E8DFD8]">
              <th className="px-5 py-3.5 font-semibold">ID</th>
              <th className="px-5 py-3.5 font-semibold">Tên topping</th>
              <th className="px-5 py-3.5 font-semibold">Giá thêm</th>
              <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
              <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F0E6]">
            {toppings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#8D6E63]">
                  Chưa có topping nào.
                </td>
              </tr>
            ) : (
              toppings.map((t) => {
                const available = t.isAvailable ?? true;
                return (
                  <tr key={t.id} className="hover:bg-[#FDFBF7]">
                    <td className="px-5 py-3.5 font-mono text-xs text-[#8D6E63]">
                      #{t.id}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#3E2723]">
                      {t.name}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#5C4D44]">
                      {formatVnd(t.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleAvailable(t)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer ${
                          available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {available ? 'Còn hàng' : 'Tạm hết'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...t })}
                        className="px-3 py-1.5 rounded-lg border border-[#E8DFD8] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6] cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(t)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
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

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl border border-[#E8DFD8] w-full max-w-md p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#3E2723]">Chỉnh sửa Topping</h3>
            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Tên topping
              </label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C4D44] mb-1">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={editing.price}
                onChange={(e) =>
                  setEditing({ ...editing, price: Number(e.target.value) })
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#3E2723]">
              <input
                type="checkbox"
                checked={editing.isAvailable ?? true}
                onChange={(e) =>
                  setEditing({ ...editing, isAvailable: e.target.checked })
                }
                className="rounded accent-[#3E2723]"
              />
              Đang còn hàng
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl border border-[#E8DFD8] text-sm font-semibold text-[#5C4D44] hover:bg-[#F5F0E6] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#2E1C12] cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
