'use client';
import { API_URL } from '@/services/api';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { CoffeeCupIcon, ArrowRightIcon } from '@/components/Icons';

interface OrderItemTopping {
  toppingId: number;
  priceAtTime: number;
  Topping?: {
    id: number;
    name: string;
    price: number;
  };
}

interface OrderItem {
  id: string | number;
  productId: string | number;
  size: string;
  qty: number;
  lineTotal: string | number;
  Product?: {
    id: string | number;
    name: string;
    imageUrl?: string | null;
  };
  OrderItemTopping?: OrderItemTopping[];
}

interface OrderSummary {
  id: string | number;
  userId: string | number;
  status: string;
  total: string | number;
  createdAt: string;
  OrderItem?: OrderItem[];
}

const statusBadgeMap: Record<string, { label: string; className: string; category: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-800', category: 'PROCESSING' },
  PAID: { label: 'Đã thanh toán', className: 'bg-blue-100 text-blue-800', category: 'PROCESSING' },
  PREPARING: { label: 'Đang pha chế', className: 'bg-amber-100 text-amber-800', category: 'PROCESSING' },
  READY: { label: 'Sẵn sàng nhận', className: 'bg-purple-100 text-purple-800', category: 'READY' },
  COMPLETED: { label: 'Đã hoàn thành', className: 'bg-emerald-100 text-emerald-800', category: 'COMPLETED' },
  PAYMENT_FAILED: { label: 'Thanh toán lỗi', className: 'bg-red-100 text-red-800', category: 'CANCELLED' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-600', category: 'CANCELLED' },
};

const TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'READY', label: 'Sẵn sàng nhận' },
  { id: 'COMPLETED', label: 'Đã hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrderHistoryPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/orders/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            logout();
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem lịch sử đơn hàng.');
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Không thể tải lịch sử đơn hàng');
        }

        const data: OrderSummary[] = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, logout]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => {
      const config = statusBadgeMap[o.status];
      return config && config.category === activeTab;
    });
  }, [orders, activeTab]);

  if (!token) {
    return (
      <main className="min-h-screen bg-[#FBF8F2] p-8 flex items-center justify-center">
        <div className="bg-white border border-[#E8DFD8] text-gray-800 p-8 rounded-3xl shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-[#F5F0E6] text-[#8D6E63] rounded-full flex items-center justify-center mx-auto text-2xl">
            ☕
          </div>
          <h2 className="text-2xl font-extrabold text-[#3E2723]">Đăng nhập tài khoản</h2>
          <p className="text-sm text-[#756C65]">
            Vui lòng đăng nhập để xem toàn bộ lịch sử đơn hàng của bạn.
          </p>
          <button
            onClick={() => router.push('/login?redirect=/orders')}
            className="w-full bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer shadow-md shadow-[#3E2723]/20"
          >
            Đăng nhập ngay
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FBF8F2] p-8 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8D6E63] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[#756C65]">Đang tải danh sách đơn hàng...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBF8F2] py-8 px-4 sm:px-6 lg:px-8 text-[#1F1F1F]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">
            Lịch sử đơn hàng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-[#756C65] mt-1">
            Theo dõi tình trạng chế biến và giao hàng của các đơn bạn đã đặt
            {user?.email && (
              <span className="ml-2 font-medium text-[#8D6E63]">
                • Tài khoản: {user.email}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3E2723] text-white shadow-md shadow-[#3E2723]/20'
                    : 'bg-white text-[#5C4D44] border border-[#E8DFD8] hover:bg-[#F5F0E6] hover:text-[#3E2723]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => router.push('/login?redirect=/orders')}
              className="bg-red-600 text-white font-semibold px-3 py-1 rounded-lg text-xs"
            >
              Đăng nhập lại
            </button>
          </div>
        )}

        {!error && filteredOrders.length === 0 && (
          <div className="bg-white border border-[#E8DFD8] rounded-3xl p-12 text-center shadow-sm space-y-4">
            <CoffeeCupIcon className="w-14 h-14 text-[#D7A86E] mx-auto" />
            <h2 className="text-xl font-extrabold text-[#3E2723]">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-xs sm:text-sm text-[#756C65] max-w-sm mx-auto">
              {activeTab === 'ALL'
                ? 'Bạn chưa đặt đơn hàng nào. Hãy khám phá thực đơn cà phê thơm ngon của BrewLite ngay hôm nay!'
                : `Không có đơn hàng nào trong trạng thái này.`}
            </p>
            <div className="pt-2">
              <Link
                href="/#menu"
                className="inline-block bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold px-6 py-2.5 rounded-xl transition text-xs shadow-md shadow-[#3E2723]/20"
              >
                Khám phá Menu
              </Link>
            </div>
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div className="bg-white border border-[#E8DFD8] rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FDFBF7] border-b border-[#E8DFD8] text-[#5C4D44] font-bold">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Mã đơn hàng</th>
                    <th className="py-3.5 px-4 sm:px-6">Ngày giờ</th>
                    <th className="py-3.5 px-4 sm:px-6">Trạng thái</th>
                    <th className="py-3.5 px-4 sm:px-6">Tổng tiền</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8DFD8]/60">
                  {filteredOrders.map((order) => {
                    const statusConfig = statusBadgeMap[order.status] || {
                      label: order.status,
                      className: 'bg-gray-100 text-gray-800',
                    };

                    const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FDFBF7] transition-colors"
                      >
                        <td className="py-4 px-4 sm:px-6 font-extrabold text-[#3E2723]">
                          #BL{String(order.id).padStart(8, '0')}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-[#5C4D44]">
                          {formattedDate}
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 font-extrabold text-[#3E2723]">
                          {Number(order.total).toLocaleString('vi-VN')}đ
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-block border border-[#8D6E63] text-[#8D6E63] hover:bg-[#3E2723] hover:text-white hover:border-[#3E2723] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
                          >
                            Xem chi tiết
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
