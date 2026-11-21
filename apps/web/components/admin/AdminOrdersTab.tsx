'use client';

import React, { useMemo, useState } from 'react';
import { AdminOrder } from '@/types/types';
import { updateAdminOrderStatus } from '@/services/adminService';
import { formatDateTime, formatVnd, ORDER_STATUS_META } from './adminConstants';

interface AdminOrdersTabProps {
  orders: AdminOrder[];
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'PREPARING', label: 'Đang pha chế' },
  { value: 'READY', label: 'Sẵn sàng giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'PAYMENT_FAILED', label: 'Lỗi thanh toán' },
];

const NEXT_STATUS_ACTION: Record<string, { next: string; label: string }> = {
  PAID: { next: 'PREPARING', label: 'Nhận pha chế' },
  PREPARING: { next: 'READY', label: 'Báo xong' },
  READY: { next: 'COMPLETED', label: 'Hoàn tất' },
};

export default function AdminOrdersTab({
  orders,
  onRefresh,
  onNotify,
}: AdminOrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (q) {
        const matchId = String(o.id).includes(q);
        const matchEmail = (o.User?.email || '').toLowerCase().includes(q);
        if (!matchId && !matchEmail) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const handleStatusChange = async (orderId: string | number, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      await updateAdminOrderStatus(orderId, nextStatus);
      onNotify('success', `Đơn #${orderId} đã chuyển sang ${nextStatus}`);
      await onRefresh();
    } catch (err: unknown) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Không thể cập nhật trạng thái đơn',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn (#) hoặc email khách hàng..."
            className="flex-1 px-4 py-2 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D7A86E]"
          />
          <button
            type="button"
            onClick={() => onRefresh()}
            className="px-4 py-2 rounded-xl border border-[#E8DFD8] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6] cursor-pointer"
          >
            ↻ Làm mới
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-[#3E2723] text-white'
                  : 'bg-[#F5F0E6] text-[#5C4D44] hover:bg-[#E8DFD8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F0E6]/60 text-left text-xs uppercase text-[#8D6E63] border-b border-[#E8DFD8]">
                <th className="px-5 py-3.5 font-semibold">Mã đơn</th>
                <th className="px-5 py-3.5 font-semibold">Khách hàng</th>
                <th className="px-5 py-3.5 font-semibold">Chi tiết món</th>
                <th className="px-5 py-3.5 font-semibold">Tổng tiền</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold">Thời gian</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8D6E63]">
                    Không có đơn hàng nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badgeClass: 'bg-gray-100 text-gray-700',
                  };
                  const action = NEXT_STATUS_ACTION[order.status];
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={String(order.id)} className="hover:bg-[#FDFBF7] align-top">
                      <td className="px-5 py-3.5 font-bold text-[#3E2723]">
                        #{order.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#3E2723] max-w-[180px] truncate">
                          {order.User?.fullName || order.User?.email || `User #${order.userId}`}
                        </p>
                        {order.User?.email && (
                          <p className="text-xs text-[#8D6E63] truncate max-w-[180px]">
                            {order.User.email}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <ul className="space-y-1 text-xs text-[#5C4D44]">
                          {(order.OrderItem || []).map((item) => (
                            <li key={String(item.id)}>
                              <span className="font-semibold text-[#3E2723]">
                                {item.qty}x {item.Product?.name || `Món #${item.productId}`}
                              </span>{' '}
                              ({item.size})
                              {item.OrderItemTopping && item.OrderItemTopping.length > 0 && (
                                <span className="text-[#8D6E63]">
                                  {' '}
                                  +{' '}
                                  {item.OrderItemTopping.map(
                                    (t) => t.Topping?.name || `#${t.toppingId}`,
                                  ).join(', ')}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#3E2723] whitespace-nowrap">
                        {formatVnd(order.total)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#8D6E63] whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {action ? (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(order.id, action.next)}
                            className="px-3 py-1.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#2E1C12] disabled:opacity-50 cursor-pointer"
                          >
                            {isUpdating ? '...' : action.label}
                          </button>
                        ) : (
                          <span className="text-xs text-[#8D6E63]">—</span>
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
    </div>
  );
}
