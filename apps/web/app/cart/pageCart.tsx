'use client';
import { API_URL } from '@/services/api';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { CHECKOUT_DURATION_MINUTES } from '@/hooks/useCheckoutTimer';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CoffeeCupIcon,
  BagIcon,
} from '@/components/Icons';

function CartItemQuantityControl({
  quantity,
  max = 999,
  onChange,
  onRemove,
}: {
  quantity: number;
  max?: number;
  onChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const [inputValue, setInputValue] = useState(String(quantity));

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const commitValue = (val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue('1');
      onChange(1);
    } else if (parsed > max) {
      setInputValue(String(max));
      onChange(max);
    } else {
      setInputValue(String(parsed));
      onChange(parsed);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val);
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        onChange(Math.min(max, parsed));
      }
    }
  };

  return (
    <div className="flex items-center border border-[#E8DFD8] rounded-xl bg-[#FDFBF7] p-1 shadow-inner focus-within:border-[#8D6E63] focus-within:ring-1 focus-within:ring-[#8D6E63] transition-all">
      <button
        type="button"
        onClick={() => {
          if (quantity > 1) {
            onChange(quantity - 1);
          } else {
            onRemove();
          }
        }}
        className="w-7 h-7 flex items-center justify-center text-[#8D6E63] hover:bg-white hover:text-[#3E2723] rounded-lg transition cursor-pointer"
        aria-label="Giảm số lượng"
        title="Giảm 1"
      >
        <MinusIcon className="w-3.5 h-3.5" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={() => commitValue(inputValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-10 text-center text-sm font-bold text-[#3E2723] bg-transparent focus:outline-none focus:bg-white rounded px-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
        aria-label="Nhập số lượng trực tiếp"
        title={`Tối đa: ${max}`}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-7 h-7 flex items-center justify-center text-[#8D6E63] hover:bg-white hover:text-[#3E2723] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        aria-label="Tăng số lượng"
        title={quantity >= max ? `Đã đạt giới hạn tồn kho (${max})` : 'Tăng 1'}
      >
        <PlusIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    items = [],
    checkoutItems = [],
    removeFromCart,
    updateQuantity,
    startCheckout,
    restoreCheckoutToCart,
  } = useCartStore();

  const { user, token } = useAuthStore();
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (isNavigatingRef.current) return;

    const status = searchParams.get('status');
    const reason = searchParams.get('reason');

    if (status === 'cancelled' || status === 'restored' || reason === 'timeout' || reason === 'payos_timeout') {
      const store = useCartStore.getState();
      const orderIdParam = searchParams.get('orderId');
      const cancelId = orderIdParam ? Number(orderIdParam) : store.pendingOrderId;

      if (cancelId && token) {
        fetch(`${API_URL}/orders/${cancelId}/cancel`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }).catch((e) => console.error('Lỗi hoàn trả tồn kho PayOS:', e));
      }

      if (typeof restoreCheckoutToCart === 'function') {
        restoreCheckoutToCart();
      } else if (store && typeof store.restoreCheckoutToCart === 'function') {
        store.restoreCheckoutToCart();
      }

      if (reason === 'timeout') {
        setNoticeMessage(
          '⏱️ Đã hết thời gian giữ đơn hàng (5 phút). Các sản phẩm đã được tự động hoàn lại vào giỏ hàng của bạn!'
        );
      } else if (status === 'restored') {
        setNoticeMessage(
          '↩️ Đã hoàn trả món về giỏ hàng thành công.'
        );
      } else {
        setNoticeMessage(
          '⚠️ Quá trình thanh toán qua PayOS đã hết hạn hoặc bị hủy. Các sản phẩm đã được tự động hoàn lại vào giỏ hàng.'
        );
      }
      window.history.replaceState({}, '', '/cart');
    } else if (items.length === 0 && checkoutItems.length > 0) {
      const store = useCartStore.getState();
      const isExpired = !store.checkoutExpiresAt || store.checkoutExpiresAt <= Date.now();

      if (isExpired) {
        const cancelId = store.pendingOrderId;
        if (cancelId && token) {
          fetch(`${API_URL}/orders/${cancelId}/cancel`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          }).catch((e) => console.error('Lỗi hoàn trả tồn kho khi hết hạn:', e));
        }

        if (typeof restoreCheckoutToCart === 'function') {
          restoreCheckoutToCart();
        } else if (store && typeof store.restoreCheckoutToCart === 'function') {
          store.restoreCheckoutToCart();
        }
      }
    }
  }, [searchParams, restoreCheckoutToCart, items.length, checkoutItems.length, token]);

  const safeItems = items || [];
  const totalItemsCount = safeItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotal = safeItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const loyaltyPoints = Number(user?.loyaltyPoints || 0);
  const discountPercent =
    loyaltyPoints >= 100 ? 15 : loyaltyPoints >= 50 ? 10 : loyaltyPoints >= 20 ? 5 : 0;
  const membershipTier =
    loyaltyPoints >= 100
      ? 'Kim Cương'
      : loyaltyPoints >= 50
      ? 'Vàng'
      : loyaltyPoints >= 20
      ? 'Bạc'
      : 'Đồng';

  const discount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discount);

  // Kiểm tra xem có sản phẩm nào đang vượt quá số lượng tồn kho hay không
  const hasOverStockItem = safeItems.some((item) => {
    if (item.stock === undefined || item.stock === null) return false;
    const sameProductTotalQty = safeItems
      .filter((i) => Number(i.productId) === Number(item.productId))
      .reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    return sameProductTotalQty > Number(item.stock);
  });

  const handleProceedToCheckout = async () => {
    if (safeItems.length === 0 || isSubmitting || isSubmittingRef.current || isNavigatingRef.current) return;

    if (hasOverStockItem) {
      alert('Một số sản phẩm trong giỏ hàng vượt quá số lượng tồn kho hiện có. Vui lòng điều chỉnh lại số lượng trước khi tiếp tục!');
      return;
    }

    if (!token) {
      alert('Vui lòng đăng nhập để thanh toán đơn hàng!');
      router.push('/login?redirect=/cart');
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: safeItems.map((item) => ({
            productId: item.productId,
            size: item.size,
            qty: Number(item.quantity),
            price: Number(item.price),
            toppings: item.toppings || [],
          })),
        }),
      });

      const orderData = await orderResponse.json();

      if (orderResponse.status === 401) {
        useAuthStore.getState().logout();
        isNavigatingRef.current = false;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        alert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để thanh toán!');
        router.push('/login?redirect=/cart');
        return;
      }

      if (!orderResponse.ok) {
        throw new Error(
          Array.isArray(orderData.message)
            ? orderData.message.join(', ')
            : orderData.message || 'Không thể tạo đơn hàng giữ kho'
        );
      }

      const orderId = Number(orderData.orderId);

      isNavigatingRef.current = true;

      const store = useCartStore.getState();
      if (typeof startCheckout === 'function') {
        startCheckout(CHECKOUT_DURATION_MINUTES, orderId);
      } else if (store && typeof store.startCheckout === 'function') {
        store.startCheckout(CHECKOUT_DURATION_MINUTES, orderId);
      }

      router.push('/checkout');
    } catch (err: unknown) {
      isNavigatingRef.current = false;
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra tồn kho.');
    }
  };

  if (safeItems.length === 0) {
    const hasActiveCheckout = checkoutItems.length > 0;
    return (
      <main className="min-h-screen bg-[#FBF8F2] py-16 px-4 text-center flex items-center justify-center">
        <div className="bg-white border border-[#E8DFD8] rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-sm space-y-5">
          {noticeMessage && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-900 text-left font-medium leading-relaxed">
              {noticeMessage}
            </div>
          )}

          {hasActiveCheckout ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-3xl">
                ⏱️
              </div>
              <h1 className="text-2xl font-extrabold text-[#3E2723]">
                Đơn hàng đang chờ thanh toán
              </h1>
              <p className="text-sm text-[#756C65]">
                Món của bạn đang được giữ ở trang thanh toán (giữ kho 5 phút).
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#763A1E] hover:bg-[#5C2D17] text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md text-sm"
                >
                  <span>Tiếp tục thanh toán</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const store = useCartStore.getState();
                    if (store.pendingOrderId && token) {
                      fetch(`${API_URL}/orders/${store.pendingOrderId}/cancel`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${token}` },
                      }).catch(() => {});
                    }
                    if (typeof restoreCheckoutToCart === 'function') {
                      restoreCheckoutToCart();
                    } else if (store && typeof store.restoreCheckoutToCart === 'function') {
                      store.restoreCheckoutToCart();
                    }
                  }}
                  className="w-full text-xs text-[#8D6E63] hover:text-[#3E2723] font-semibold py-2 cursor-pointer"
                >
                  ↩️ Hủy giữ món & hoàn về giỏ hàng
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#F5F0E6] text-[#8D6E63] flex items-center justify-center mx-auto">
                <BagIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#3E2723]">
                Giỏ hàng của bạn đang trống
              </h1>
              <p className="text-sm text-[#756C65]">
                Hãy khám phá thực đơn cà phê và đồ uống đặc biệt của BrewLite để thêm món yêu thích nhé!
              </p>
              <div className="pt-2">
                <Link
                  href="/#menu"
                  className="inline-flex items-center gap-2 bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-[#3E2723]/20 text-sm"
                >
                  <span>Khám phá Menu ngay</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBF8F2] py-8 px-4 sm:px-6 lg:px-8 text-[#1F1F1F]">
      <div className="max-w-6xl mx-auto space-y-6">

        {noticeMessage && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-amber-900 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <span className="text-xl">⚠️</span>
              <span>{noticeMessage}</span>
            </div>
            <button
              onClick={() => setNoticeMessage(null)}
              className="text-amber-700 hover:text-amber-950 font-bold text-sm px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {hasOverStockItem && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between gap-3 text-red-900 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <span className="text-xl">⚠️</span>
              <span>Một số món trong giỏ hàng đang vượt quá số lượng tồn kho còn lại. Vui lòng điều chỉnh giảm số lượng trước khi thanh toán.</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Link
            href="/#menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8D6E63] hover:text-[#3E2723] transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Tiếp tục chọn món</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">
            Giỏ hàng ({totalItemsCount})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {safeItems.map((item) => {
              const itemTotal = Number(item.price) * Number(item.quantity);
              const otherQtySameProduct = safeItems
                .filter(
                  (i) =>
                    Number(i.productId) === Number(item.productId) &&
                    i.cartItemId !== item.cartItemId
                )
                .reduce((sum, i) => sum + Number(i.quantity || 0), 0);

              const hasStockLimit = item.stock !== undefined && item.stock !== null;
              const itemStock = hasStockLimit ? Math.max(0, Number(item.stock)) : 999;
              const maxAllowed = hasStockLimit ? Math.max(1, itemStock - otherQtySameProduct) : 999;
              const isOverStock = hasStockLimit && item.quantity > maxAllowed;

              return (
                <div
                  key={item.cartItemId}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow ${
                    isOverStock ? 'border-red-300 ring-1 ring-red-300 bg-red-50/20' : 'border-[#E8DFD8]'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F5F0E6] flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CoffeeCupIcon className="w-8 h-8 text-[#8D6E63]" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-[#3E2723] truncate">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 text-xs text-[#756C65]">
                        <span className="bg-[#F5F0E6] px-2 py-0.5 rounded-md font-medium">
                          Size {item.size}
                        </span>
                        {item.toppings && item.toppings.length > 0 && (
                          <span className="bg-[#F5F0E6] px-2 py-0.5 rounded-md">
                            +{item.toppings.join(', ')}
                          </span>
                        )}
                        {hasStockLimit && (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isOverStock
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            Kho còn: {itemStock}
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-sm sm:text-base text-[#8D6E63]">
                        {Number(item.price).toLocaleString('vi-VN')}đ
                      </p>
                      {isOverStock && (
                        <p className="text-[11px] font-bold text-red-600">
                          ⚠️ Vượt quá tồn kho có thể đặt (tối đa {maxAllowed})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 flex-shrink-0">
                    <CartItemQuantityControl
                      quantity={item.quantity}
                      max={maxAllowed}
                      onChange={(newQty) => updateQuantity(item.cartItemId, newQty)}
                      onRemove={() => removeFromCart(item.cartItemId)}
                    />

                    <div className="text-right min-w-[80px]">
                      <div className="font-black text-sm sm:text-base text-[#3E2723]">
                        {itemTotal.toLocaleString('vi-VN')}đ
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-[#BCAAA4] hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Xóa món"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <div className="bg-white border border-[#E8DFD8] rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-[#3E2723] pb-3 border-b border-[#E8DFD8]">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#5C4D44]">
                  <span>Tổng tiền ({totalItemsCount} sản phẩm)</span>
                  <span className="font-bold text-[#2E1810]">
                    {subtotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="flex justify-between text-[#5C4D44]">
                  <span>
                    Giảm giá {user ? `(Hạng ${membershipTier} -${discountPercent}%)` : ''}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {discount > 0 ? `-${discount.toLocaleString('vi-VN')}đ` : '0đ'}
                  </span>
                </div>
              </div>

              {!user && (
                <p className="text-[11px] text-[#8D6E63] bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E8DFD8] leading-relaxed">
                  💡 <strong>Đăng nhập</strong> để tự động nhận ưu đãi giảm giá theo điểm tích lũy thành viên (lên đến 15%).
                </p>
              )}

              <hr className="border-[#E8DFD8]" />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-base text-[#3E2723]">
                  Tổng cộng
                </span>
                <span className="font-extrabold text-2xl text-[#3E2723]">
                  {grandTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <button
                type="button"
                disabled={isSubmitting || hasOverStockItem}
                onClick={handleProceedToCheckout}
                className="w-full bg-[#3E2723] hover:bg-[#2E1C12] disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md shadow-[#3E2723]/20 hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Đang kiểm tra tồn kho...'
                    : hasOverStockItem
                    ? 'Vượt tồn kho, hãy chỉnh lại'
                    : 'Thanh toán'}
                </span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <Link
                href="/#menu"
                className="block text-center text-xs font-semibold text-[#8D6E63] hover:text-[#3E2723] hover:underline"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
