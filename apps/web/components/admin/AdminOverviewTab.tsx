'use client';

import React from 'react';
import { AdminOrder, Category, Product, ToppingItem } from '@/types/types';
import { formatDateTime, formatVnd, ORDER_STATUS_META } from './adminConstants';

interface AdminOverviewTabProps {
  orders: AdminOrder[];
  products: Product[];
  categories: Category[];
  toppings: ToppingItem[];
  totalUsers: number;
  onNavigateTab: (tab: 'products' | 'categories' | 'toppings' | 'orders' | 'users') => void;
}

const REVENUE_STATUSES = new Set(['PAID', 'PREPARING', 'READY', 'COMPLETED']);

export default function AdminOverviewTab({
  orders,
  products,
  categories,
  toppings,
  totalUsers,
  onNavigateTab,
}: AdminOverviewTabProps) {
  const paidOrders = orders.filter((o) => REVENUE_STATUSES.has(o.status));
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const activeProductsCount = products.filter((p) => p.status !== 'inactive').length;
  const activeOrdersCount = orders.filter((o) =>
    ['PAID', 'PREPARING', 'READY'].includes(o.status),
  ).length;

  const statusCounts = Object.keys(ORDER_STATUS_META).map((status) => ({
    status,
    meta: ORDER_STATUS_META[status],
    count: orders.filter((o) => o.status === status).length,
  }));

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8D6E63]">
            Tổng doanh thu
          </p>
          <p className="text-2xl font-extrabold text-[#3E2723] mt-2">
            {formatVnd(totalRevenue)}
          </p>
          <p className="text-xs text-[#5C4D44] mt-1">
            Từ {paidOrders.length} đơn đã thanh toán
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('orders')}
          className="text-left bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs hover:border-[#D7A86E] transition-colors cursor-pointer"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8D6E63]">
            Đơn hàng
          </p>
          <p className="text-2xl font-extrabold text-[#3E2723] mt-2">
            {orders.length}
          </p>
          <p className="text-xs text-amber-700 font-medium mt-1">
            {activeOrdersCount} đơn đang xử lý
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('products')}
          className="text-left bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs hover:border-[#D7A86E] transition-colors cursor-pointer"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8D6E63]">
            Thực đơn
          </p>
          <p className="text-2xl font-extrabold text-[#3E2723] mt-2">
            {activeProductsCount}{' '}
            <span className="text-sm font-normal text-[#8D6E63]">
              / {products.length} món
            </span>
          </p>
          <p className="text-xs text-[#5C4D44] mt-1">
            {categories.length} danh mục · {toppings.length} topping
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('users')}
          className="text-left bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs hover:border-[#D7A86E] transition-colors cursor-pointer"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8D6E63]">
            Tài khoản hệ thống
          </p>
          <p className="text-2xl font-extrabold text-[#3E2723] mt-2">
            {totalUsers}
          </p>
          <p className="text-xs text-[#5C4D44] mt-1">
            Khách hàng, Barista & Admin
          </p>
        </button>
      </div>

      {/* Status breakdown + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs">
          <h3 className="text-base font-bold text-[#3E2723] mb-4">
            Phân bố trạng thái đơn
          </h3>
          <div className="space-y-2.5">
            {statusCounts.map(({ status, meta, count }) => (
              <div
                key={status}
                className="flex items-center justify-between py-1.5 border-b border-[#F5F0E6] last:border-b-0"
              >
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
                <span className="text-sm font-bold text-[#3E2723]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DFD8] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#3E2723]">
              Đơn hàng gần đây
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#8D6E63] hover:text-[#3E2723] cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#8D6E63] py-8 text-center">
              Chưa có đơn hàng nào trong hệ thống.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-[#8D6E63] border-b border-[#E8DFD8]">
                    <th className="pb-2.5 font-semibold">Mã đơn</th>
                    <th className="pb-2.5 font-semibold">Khách hàng</th>
                    <th className="pb-2.5 font-semibold">Tổng tiền</th>
                    <th className="pb-2.5 font-semibold">Trạng thái</th>
                    <th className="pb-2.5 font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F0E6]">
                  {recentOrders.map((order) => {
                    const meta = ORDER_STATUS_META[order.status] || {
                      label: order.status,
                      badgeClass: 'bg-gray-100 text-gray-700',
                    };
                    return (
                      <tr key={String(order.id)} className="hover:bg-[#FDFBF7]">
                        <td className="py-3 font-bold text-[#3E2723]">
                          #{order.id}
                        </td>
                        <td className="py-3 text-[#5C4D44] max-w-[180px] truncate">
                          {order.User?.email || `User #${order.userId}`}
                        </td>
                        <td className="py-3 font-semibold text-[#3E2723]">
                          {formatVnd(order.total)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-[#8D6E63]">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
