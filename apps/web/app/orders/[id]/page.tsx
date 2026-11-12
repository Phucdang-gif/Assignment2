'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/services/api';
import { generateUUIDv4 } from '@/lib/uuid';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { CoffeeCupIcon } from '@/components/Icons';

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

interface Payment {
  id: string | number;
  amount: string | number;
  method: string;
  idempotencyKey?: string;
}

interface OrderDetail {
  id: string | number;
  userId: string | number;
  status: string;
  total: string | number;
  createdAt: string;
  updatedAt: string;
  OrderItem?: OrderItem[];
  Payment?: Payment[];
}

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Đã thanh toán - Chờ pha chế', className: 'bg-emerald-100 text-emerald-800' },
  PREPARING: { label: 'Đang pha chế', className: 'bg-blue-100 text-blue-800' },
  READY: { label: 'Sẵn sàng nhận tại quầy', className: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-gray-100 text-gray-800' },
  PAYMENT_FAILED: { label: 'Thanh toán lỗi', className: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-gray-200 text-gray-600' },
};

const STATE_MACHINE_STEPS = [
  { status: 'PENDING', label: 'Chờ thanh toán' },
  { status: 'PAID', label: 'Đã thanh toán' },
  { status: 'PREPARING', label: 'Đang pha chế' },
  { status: 'READY', label: 'Sẵn sàng nhận' },
  { status: 'COMPLETED', label: 'Hoàn thành' },
];

const PENDING_STATUSES = ['PENDING'];
const ACTIVE_TRACKING_STATUSES = ['PENDING', 'PAID', 'PREPARING', 'READY'];

function OrderConfirmationContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params?.id as string;

  const paymentStatus = searchParams?.get('status');
  const payosCode = searchParams?.get('code');
  const orderCode = searchParams?.get('orderCode');

  const { token, user, logout } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const { clearActiveCart, clearCheckoutItems } = useCartStore();

  const fetchOrder = useCallback(async () => {
    if (!token || !orderId) return null;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đơn hàng.');
          return null;
        }
        if (res.status === 403) {
          setError('Khách hàng chỉ có quyền xem đơn mình đã mua, không có quyền xem lịch sử đơn của người khác.');
          return null;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Không thể tải thông tin đơn hàng');
      }

      const data: OrderDetail = await res.json();

      if (user && Number(data.userId) !== Number(user.id)) {
        const isStaff = user.role === 'barista' || user.email?.toLowerCase().includes('barista');
        if (!isStaff) {
          setError('Khách hàng chỉ có quyền xem đơn mình đã mua, không có quyền xem lịch sử đơn của người khác.');
          setOrder(null);
          return null;
        }
      }

      setOrder(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải thông tin đơn hàng');
      return null;
    }
  }, [orderId, token, user, logout]);

  const verifyAndFetchOrder = useCallback(async () => {
    if (!token || !orderId) return null;

    if (paymentStatus === 'PAID' || payosCode === '00' || orderCode) {
      try {
        const verifyRes = await fetch(`${API_URL}/payments/payos-verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: Number(orderId),
            orderCode: orderCode ? Number(orderCode) : undefined,
            status: paymentStatus || undefined,
            code: payosCode || undefined,
          }),
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.success && verifyData.order) {
            setOrder(verifyData.order);
            clearActiveCart();
            clearCheckoutItems();
            return verifyData.order;
          }
        }
      } catch (err) {
        console.warn('Lỗi tự động xác thực PayOS:', err);
      }
    }

    return fetchOrder();
  }, [token, orderId, paymentStatus, payosCode, orderCode, fetchOrder, clearActiveCart, clearCheckoutItems]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (!orderId) return;

    setLoading(true);
    verifyAndFetchOrder()
      .then((data) => {
        if (data) {
          clearActiveCart();
          clearCheckoutItems();
        }
      })
      .finally(() => setLoading(false));
  }, [orderId, token, verifyAndFetchOrder, clearActiveCart, clearCheckoutItems]);

  const currentOrderStatus = order?.status;

  useEffect(() => {
    if (!currentOrderStatus || !ACTIVE_TRACKING_STATUSES.includes(currentOrderStatus)) return;

    const interval = setInterval(async () => {
      if (PENDING_STATUSES.includes(currentOrderStatus)) {
        try {
          const verifyRes = await fetch(`${API_URL}/payments/payos-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: Number(orderId),
              orderCode: orderCode ? Number(orderCode) : undefined,
              status: paymentStatus || undefined,
              code: payosCode || undefined,
            }),
          });

          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.order && verifyData.isPaid) {
              setOrder(verifyData.order);
              clearActiveCart();
              clearCheckoutItems();
              return;
            }
          }
        } catch {
          // Bỏ qua lỗi polling ngầm
        }
      }

      const updated = await fetchOrder();
      if (updated && !ACTIVE_TRACKING_STATUSES.includes(updated.status)) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrderStatus, fetchOrder, token, orderId, orderCode, paymentStatus, payosCode, clearActiveCart, clearCheckoutItems]);

  const handleManualConfirm = async () => {
    if (!token || !order) return;
    setIsConfirming(true);
    setConfirmMessage(null);

    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: Number(order.id),
          amount: Number(order.total),
          method: 'WALLET',
          idempotencyKey: generateUUIDv4(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setConfirmMessage('✅ Xác nhận thanh toán thành công! Đơn hàng đang được chuẩn bị.');
        await fetchOrder();
      } else {
        setConfirmMessage(`⚠️ ${data.message || 'Không thể xác nhận. Vui lòng thử lại.'}`);
      }
    } catch {
      setConfirmMessage('⚠️ Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-[#FBF8F2] p-8 flex items-center justify-center">
        <div className="bg-white border border-[#E8DFD8] text-gray-800 p-8 rounded-3xl shadow-sm max-w-md w-full text-center space-y-4">
          <p className="text-base font-semibold text-[#3E2723]">
            Vui lòng đăng nhập để xem thông tin đơn hàng
          </p>
          <button
            onClick={() => router.push(`/login?redirect=/orders/${orderId}`)}
            className="w-full bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer"
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
        <p className="text-sm font-medium text-[#756C65]">
          {paymentStatus === 'PAID' ? 'Đang hoàn tất xác nhận thanh toán...' : 'Đang tải thông tin đơn hàng...'}
        </p>
      </main>
    );
  }

  if (error || !order) {
    const isForbidden = error?.includes('quyền') || error?.includes('người khác');
    return (
      <main className="min-h-screen bg-[#FBF8F2] p-8 flex items-center justify-center">
        <div className="bg-white border border-[#E8DFD8] text-gray-800 p-8 rounded-3xl shadow-sm max-w-md w-full text-center space-y-4">
          <div className={`w-14 h-14 ${isForbidden ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'} rounded-full flex items-center justify-center mx-auto text-xl font-bold`}>
            {isForbidden ? '🔒' : '✕'}
          </div>
          <h2 className="text-xl font-extrabold text-[#3E2723]">
            {isForbidden ? 'Không có quyền truy cập' : 'Không tìm thấy đơn hàng'}
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            {error || 'Đơn hàng không tồn tại hoặc bạn không có quyền xem.'}
          </p>
          <div className="space-y-2 pt-2">
            <Link
              href="/orders"
              className="block w-full bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-2.5 rounded-xl transition text-xs"
            >
              Về lịch sử đơn của bạn
            </Link>
            <Link
              href="/"
              className="block w-full bg-[#FDFBF7] hover:bg-[#F5F0E6] text-[#5C4D44] font-semibold py-2.5 rounded-xl transition border border-[#E8DFD8] text-xs"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusConfig = statusBadgeMap[order.status] || {
    label: order.status,
    className: 'bg-gray-100 text-gray-800',
  };

  const statusHeaderMap: Record<
    string,
    { title: string; subtitle: string; iconBg: string; iconSvg: React.ReactNode }
  > = {
    PENDING: {
      title: 'Đang chờ thanh toán',
      subtitle: 'Đơn hàng đã được tạo trên hệ thống và đang chờ bạn hoàn tất chuyển khoản.',
      iconBg: 'bg-amber-100 text-amber-800',
      iconSvg: (
        <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    PAID: {
      title: 'Đặt hàng thành công!',
      subtitle: 'Đã nhận thanh toán. Đơn hàng của bạn đã chuyển vào hàng đợi để chuẩn bị pha chế.',
      iconBg: 'bg-[#D7A86E] text-[#3E2723]',
      iconSvg: (
        <svg className="w-8 h-8 text-[#2E1810]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    PREPARING: {
      title: 'Đang pha chế đồ uống',
      subtitle: 'Barista đang pha chế món theo đơn của bạn. Món sẽ sớm sẵn sàng!',
      iconBg: 'bg-blue-100 text-blue-800',
      iconSvg: <CoffeeCupIcon className="w-8 h-8 text-blue-800" />,
    },
    READY: {
      title: 'Đồ uống đã sẵn sàng!',
      subtitle: 'Món của bạn đã được pha chế xong. Mời bạn đến quầy BrewLite để nhận món.',
      iconBg: 'bg-purple-100 text-purple-800',
      iconSvg: (
        <svg className="w-8 h-8 text-purple-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
    },
    COMPLETED: {
      title: 'Đơn hàng đã hoàn thành',
      subtitle: 'Cảm ơn bạn đã thưởng thức đồ uống tại BrewLite. Chúc bạn một ngày tốt lành!',
      iconBg: 'bg-emerald-100 text-emerald-800',
      iconSvg: (
        <svg className="w-8 h-8 text-emerald-800" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    PAYMENT_FAILED: {
      title: 'Thanh toán không thành công',
      subtitle: 'Giao dịch thanh toán chưa thể hoàn tất. Bạn có thể kiểm tra hoặc thử lại.',
      iconBg: 'bg-red-100 text-red-800',
      iconSvg: (
        <svg className="w-8 h-8 text-red-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    CANCELLED: {
      title: 'Đơn hàng đã bị hủy',
      subtitle: 'Đơn hàng này đã được hủy và hệ thống đã hoàn trả lại số lượng tồn kho.',
      iconBg: 'bg-gray-100 text-gray-700',
      iconSvg: (
        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const headerInfo = statusHeaderMap[order.status] || {
    title: `Đơn hàng #${order.id}`,
    subtitle: 'Thông tin chi tiết đơn hàng của bạn.',
    iconBg: 'bg-[#D7A86E] text-[#3E2723]',
    iconSvg: (
      <svg className="w-8 h-8 text-[#2E1810]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  const currentStepIndex = STATE_MACHINE_STEPS.findIndex((s) => s.status === order.status);

  const primaryProductImage =
    order.OrderItem?.[0]?.Product?.imageUrl ||
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=85';

  const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="min-h-screen bg-[#FBF8F2] py-10 px-4 sm:px-6 lg:px-8 text-[#1F1F1F]">
      <div className="max-w-4xl mx-auto space-y-8">
        {currentStepIndex >= 0 && (
          <div className="bg-white border border-[#E8DFD8] rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold text-sm text-[#3E2723] mb-4 uppercase tracking-wider">
              Tiến trình trạng thái đơn hàng
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {STATE_MACHINE_STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition ${
                        isCurrent
                          ? 'bg-[#3E2723] text-white ring-4 ring-[#D7A86E]/40'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#F5F0E6] text-[#8D6E63]'
                      }`}
                    >
                      {index < currentStepIndex ? '✓' : index + 1}
                    </div>
                    <span
                      className={`mt-2 text-[11px] sm:text-xs font-bold ${
                        isCurrent
                          ? 'text-[#3E2723]'
                          : isDone
                          ? 'text-emerald-700'
                          : 'text-[#8D6E63]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white border border-[#E8DFD8] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg border-2 border-[#E8DFD8] bg-[#F5F0E6]">
              <img
                src={primaryProductImage}
                alt={order.OrderItem?.[0]?.Product?.name || 'BrewLite Coffee'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-semibold text-white/90">
                  Cảm ơn bạn đã lựa chọn BrewLite ☕
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-2">
              <div
                className={`w-14 h-14 rounded-full ${headerInfo.iconBg} flex items-center justify-center shadow-md`}
              >
                {headerInfo.iconSvg}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight pt-2">
                {headerInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#756C65] leading-relaxed">
                {headerInfo.subtitle}
              </p>
            </div>

            <div className="bg-[#FDFBF7] border border-[#E8DFD8] rounded-2xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#756C65] font-medium">Mã đơn hàng:</span>
                <span className="font-extrabold text-[#3E2723] text-sm">
                  #BL{String(order.id).padStart(8, '0')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#756C65] font-medium">Thời gian:</span>
                <span className="font-semibold text-[#2E1810]">
                  {formattedDate}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#756C65] font-medium">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
              </div>

              {PENDING_STATUSES.includes(order.status) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 text-xs">
                    <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="font-medium">Đang chờ xác nhận thanh toán từ ngân hàng...</span>
                  </div>
                  <p className="text-[11px] text-amber-600">
                    Nếu bạn đã chuyển khoản xong nhưng trạng thái chưa cập nhật, bấm nút bên dưới để xác nhận thủ công.
                  </p>
                  {confirmMessage && (
                    <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      {confirmMessage}
                    </p>
                  )}
                  <button
                    onClick={handleManualConfirm}
                    disabled={isConfirming}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg text-xs transition cursor-pointer"
                  >
                    {isConfirming ? 'Đang xác nhận...' : '✅ Tôi đã chuyển khoản - Xác nhận thanh toán'}
                  </button>
                </div>
              )}

              <hr className="border-[#E8DFD8]" />

              {Number(order.total) >= 10000 && (
                <div className="flex justify-between items-center px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  <span className="font-medium">Điểm thưởng tích lũy:</span>
                  <span className="font-extrabold">+{Math.floor(Number(order.total) / 10000)} điểm</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm text-[#3E2723]">Tổng tiền:</span>
                <span className="font-extrabold text-xl text-[#3E2723]">
                  {Number(order.total).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/orders"
                className="flex-1 bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-3 px-4 rounded-xl text-center text-xs sm:text-sm transition shadow-md shadow-[#3E2723]/20 cursor-pointer"
              >
                Xem đơn hàng
              </Link>
              <Link
                href="/"
                className="flex-1 bg-white hover:bg-[#F5F0E6] text-[#3E2723] font-bold py-3 px-4 rounded-xl text-center text-xs sm:text-sm transition border border-[#E8DFD8] cursor-pointer"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8DFD8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-extrabold text-lg text-[#3E2723] pb-3 border-b border-gray-100">
            Chi tiết món đã đặt
          </h2>

          <div className="divide-y divide-gray-100">
            {order.OrderItem && order.OrderItem.length > 0 ? (
              order.OrderItem.map((item) => (
                <div key={item.id} className="py-3.5 flex justify-between items-center gap-4 text-xs sm:text-sm">
                  <div>
                    <h3 className="font-bold text-[#2E1810]">
                      {item.Product?.name || `Sản phẩm #${item.productId}`}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#756C65] mt-1">
                      <span className="bg-[#F5F0E6] text-[#5C4D44] font-semibold px-2 py-0.5 rounded">
                        Size {item.size}
                      </span>
                      <span>× {item.qty}</span>
                    </div>

                    {item.OrderItemTopping && item.OrderItemTopping.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] text-[#8D6E63] font-medium">Topping:</span>
                        {item.OrderItemTopping.map((oit) => (
                          <span
                            key={oit.toppingId}
                            className="text-[11px] bg-[#FDFBF7] text-[#8D6E63] border border-[#E8DFD8] px-2 py-0.5 rounded font-medium"
                          >
                            +{oit.Topping?.name || `Topping #${oit.toppingId}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right font-extrabold text-[#3E2723]">
                    {Number(item.lineTotal).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs py-4 text-center">Không có chi tiết sản phẩm</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FBF8F2] p-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#8D6E63] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-[#756C65]">Đang tải thông tin đơn hàng...</p>
        </main>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
