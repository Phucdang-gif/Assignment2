"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useProductDetail } from '@/hooks/useProductDetail';
import { useToppings } from '@/hooks/useToppings';
import { ProductSize, ProductSizeKey } from '@/types/types';
import { useCartStore } from '@/store/cartStore';
import {
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  CoffeeCupIcon,
} from '@/components/Icons';

const SIZE_PRICES: Record<ProductSizeKey, number> = {
  [ProductSize.S]: 0,
  [ProductSize.M]: 5000,
  [ProductSize.L]: 10000,
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);

  const productIdStr = String(params?.id || "");

  const { product, isLoading, error } = useProductDetail(productIdStr);
  const { toppingsList, selectedToppings, handleToppingToggle } = useToppings();

  const [selectedSize, setSelectedSize] = useState<ProductSizeKey>(
    ProductSize.S,
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityInput, setQuantityInput] = useState<string>("1");
  const [activeImage, setActiveImage] = useState<string>("");
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    subMessage?: string;
  } | null>(null);

  const maxStock = product?.stock !== undefined ? Math.max(0, Number(product.stock)) : 999;
  const alreadyInCart = useMemo(() => {
    if (!product) return 0;
    return cartItems
      .filter((item) => Number(item.productId) === Number(product.id))
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartItems, product]);

  const availableToBuy = Math.max(0, maxStock - alreadyInCart);
  const isOutOfStock = maxStock <= 0;
  const isReachedStockLimit = availableToBuy <= 0 && !isOutOfStock;

  // Điều chỉnh số lượng nếu vượt quá tồn kho còn lại
  useEffect(() => {
    if (isOutOfStock) {
      setQuantity(0);
      setQuantityInput("0");
    } else if (isReachedStockLimit) {
      setQuantity(0);
      setQuantityInput("0");
    } else if (quantity > availableToBuy) {
      const adjusted = Math.max(1, availableToBuy);
      setQuantity(adjusted);
      setQuantityInput(String(adjusted));
    }
  }, [availableToBuy, isOutOfStock, isReachedStockLimit]);

  const changeQuantity = (newQty: number) => {
    if (availableToBuy <= 0) return;
    const safeMax = availableToBuy;
    const safe = Math.min(safeMax, Math.max(1, newQty));
    setQuantity(safe);
    setQuantityInput(String(safe));
    setStockWarning(null);
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (availableToBuy <= 0) return;
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setQuantityInput(val);
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        if (parsed > availableToBuy) {
          setQuantity(availableToBuy);
          setStockWarning(`Số lượng không được vượt quá tồn kho còn lại (${availableToBuy}).`);
        } else {
          setQuantity(parsed);
          setStockWarning(null);
        }
      }
    }
  };

  const handleQuantityBlur = () => {
    if (availableToBuy <= 0) {
      setQuantity(0);
      setQuantityInput("0");
      return;
    }
    const parsed = parseInt(quantityInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      changeQuantity(1);
    } else if (parsed > availableToBuy) {
      changeQuantity(availableToBuy);
      setStockWarning(`Số lượng đã được tự động điều chỉnh về mức tối đa (${availableToBuy}).`);
      setTimeout(() => setStockWarning(null), 3000);
    } else {
      changeQuantity(parsed);
    }
  };

  const currentImage = activeImage || product?.imageUrl || "";

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price);
    const sizeExtra = SIZE_PRICES[selectedSize] || 0;
    const toppingsExtra = selectedToppings.reduce((sum, name) => {
      const found = toppingsList.find((t) => t.name === name);
      return sum + (found ? Number(found.price) : 0);
    }, 0);
    return base + sizeExtra + toppingsExtra;
  }, [product, selectedSize, selectedToppings, toppingsList]);

  const totalPrice = unitPrice * (quantity || 0);

  const handleAddToCart = () => {
    if (!product) return;

    if (isOutOfStock) {
      setNotification({
        type: "error",
        message: "Sản phẩm này hiện đã hết hàng!",
        subMessage: "Vui lòng chọn món đồ uống khác.",
      });
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    if (isReachedStockLimit || availableToBuy <= 0) {
      setNotification({
        type: "error",
        message: "Đã đạt giới hạn tồn kho trong giỏ hàng!",
        subMessage: `Bạn đã thêm toàn bộ ${maxStock} sản phẩm vào giỏ hàng.`,
      });
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const finalQty = Math.min(availableToBuy, Math.max(1, quantity));

    const sortedToppings = [...selectedToppings].sort();
    const cartItemId = `${product.id}-${selectedSize}-${sortedToppings.join("-")}`;

    const res = addToCart({
      cartItemId,
      productId: product.id,
      name: product.name,
      price: unitPrice,
      size: selectedSize,
      toppings: sortedToppings,
      quantity: finalQty,
      imageUrl: product.imageUrl,
      stock: maxStock,
    });

    if (res && !res.success) {
      setNotification({
        type: "error",
        message: res.message || "Không thể thêm vào giỏ hàng!",
      });
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    setNotification({
      type: "success",
      message: res?.message || "Thêm vào giỏ thành công!",
      subMessage: `${finalQty}x ${product.name} (Size ${selectedSize})`,
    });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#8D6E63]">
            Đang tải dữ liệu sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-[#E8DFD8] shadow-sm max-w-md">
          <CoffeeCupIcon className="w-12 h-12 text-[#8D6E63] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#3E2723]">
            Không tìm thấy đồ uống
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            {error || "Món bạn tìm kiếm không tồn tại hoặc đã ngừng phục vụ."}
          </p>
          <Link
            href="/"
            className="inline-block bg-[#3E2723] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2E1C12]"
          >
            Quay lại Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBF8F2] py-8 px-4 sm:px-6 lg:px-8 text-[#1F1F1F]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8D6E63] hover:text-[#3E2723] transition-colors cursor-pointer group"
          >
            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại Menu</span>
          </button>
        </div>

        <div className="bg-white border border-[#E8DFD8] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F0E6] border border-[#E8DFD8] shadow-inner group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-red-600 text-white font-extrabold text-sm sm:text-base px-4 py-2 rounded-xl shadow-lg">
                    TẠM HẾT HÀNG
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3E2723] tracking-tight">
                    {product.name}
                  </h1>

                  {/* Nhãn tình trạng tồn kho */}
                  {isOutOfStock ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                      Hết hàng
                    </span>
                  ) : isReachedStockLimit ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Đã thêm tối đa trong giỏ ({alreadyInCart}/{maxStock})
                    </span>
                  ) : maxStock <= 5 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                      Chỉ còn {availableToBuy} sản phẩm
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F0E6] text-[#756C65] border border-[#E8DFD8]">
                      Còn {maxStock} sản phẩm {alreadyInCart > 0 ? `(Đã có ${alreadyInCart} trong giỏ)` : ''}
                    </span>
                  )}
                </div>

                <p className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] mt-2">
                  {unitPrice.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-sm text-[#756C65] mt-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <hr className="border-[#E8DFD8]" />

              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-[#3E2723]">
                  Chọn size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(ProductSize).map((size) => {
                    const isSelected = selectedSize === size;
                    const priceDiff = SIZE_PRICES[size];
                    const displayPrice = Number(product.price) + priceDiff;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#3E2723] text-white border-[#3E2723] shadow-md shadow-[#3E2723]/20"
                            : "bg-[#FDFBF7] text-[#5C4D44] border-[#E8DFD8] hover:bg-[#F5F0E6] hover:border-[#8D6E63]"
                        }`}
                      >
                        <div className="font-extrabold text-base">{size}</div>
                        <div
                          className={`text-xs mt-0.5 ${
                            isSelected ? "text-white/80" : "text-[#8D6E63]"
                          }`}
                        >
                          {displayPrice.toLocaleString("vi-VN")}đ
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {toppingsList.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <label className="block text-sm font-bold text-[#3E2723]">
                    Chọn topping
                  </label>
                  <div className="space-y-2">
                    {toppingsList.map((topping) => {
                      const isChecked = selectedToppings.includes(topping.name);
                      return (
                        <label
                          key={topping.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-[#F5F0E6]/60 border-[#D7A86E]"
                              : "bg-[#FDFBF7] border-[#E8DFD8] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToppingToggle(topping.name)}
                              className="w-4.5 h-4.5 text-[#3E2723] rounded border-gray-300 focus:ring-[#8D6E63] accent-[#3E2723] cursor-pointer"
                            />
                            <span className="text-sm font-medium text-[#2E1810]">
                              {topping.name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#8D6E63]">
                            +{Number(topping.price).toLocaleString("vi-VN")}đ
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#E8DFD8] space-y-3">
              {stockWarning && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 animate-fade-in flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{stockWarning}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center border rounded-xl p-1 shadow-inner transition-all ${
                    isOutOfStock || isReachedStockLimit
                      ? "bg-gray-100 border-gray-200 opacity-60"
                      : "border-[#E8DFD8] bg-[#FDFBF7] focus-within:border-[#8D6E63] focus-within:ring-1 focus-within:ring-[#8D6E63]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity - 1)}
                    disabled={quantity <= 1 || isOutOfStock || isReachedStockLimit}
                    className="w-9 h-9 flex items-center justify-center text-[#3E2723] hover:bg-[#F5F0E6] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Giảm số lượng"
                  >
                    <MinusIcon className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantityInput}
                    disabled={isOutOfStock || isReachedStockLimit}
                    onChange={handleQuantityInputChange}
                    onBlur={handleQuantityBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-14 text-center font-bold text-sm text-[#3E2723] bg-transparent focus:outline-none focus:bg-white rounded py-1 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors disabled:cursor-not-allowed"
                    aria-label="Nhập số lượng trực tiếp"
                    title={
                      isOutOfStock
                        ? "Sản phẩm hết hàng"
                        : isReachedStockLimit
                        ? "Đã đạt giới hạn tồn kho"
                        : `Tối đa ${availableToBuy}`
                    }
                  />
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity + 1)}
                    disabled={
                      quantity >= availableToBuy || isOutOfStock || isReachedStockLimit
                    }
                    className="w-9 h-9 flex items-center justify-center text-[#3E2723] hover:bg-[#F5F0E6] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Tăng số lượng"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isOutOfStock || isReachedStockLimit}
                  onClick={handleAddToCart}
                  className={`flex-1 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : isReachedStockLimit
                      ? "bg-amber-800/80 text-white cursor-not-allowed shadow-none"
                      : "bg-[#3E2723] hover:bg-[#2E1C12] text-white cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Tạm hết hàng</span>
                  ) : isReachedStockLimit ? (
                    <span>Đã thêm tối đa vào giỏ ({alreadyInCart}/{maxStock})</span>
                  ) : (
                    <>
                      <span>Thêm vào giỏ hàng</span>
                      <span>•</span>
                      <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo Toast */}
      <div
        className={`fixed top-6 right-4 sm:right-6 md:right-8 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto transition-all duration-500 ease-out transform ${
          notification
            ? 'translate-y-0 opacity-100 pointer-events-auto scale-100 shadow-2xl'
            : '-translate-y-16 opacity-0 pointer-events-none scale-95 shadow-none'
        }`}
      >
        <div
          className={`backdrop-blur-md border text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 sm:gap-6 ${
            notification?.type === 'error'
              ? 'bg-rose-950/95 border-rose-800'
              : 'bg-[#24130A]/95 border-[#5A3825]'
          }`}
        >
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span
              className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                notification?.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-emerald-500 animate-pulse'
              }`}
            >
              {notification?.type === 'error' ? '✕' : '✓'}
            </span>
            <div className="leading-tight">
              <p className="font-bold text-white">{notification?.message}</p>
              {notification?.subMessage && (
                <p className="text-[#C4B5A5] text-xs mt-0.5">
                  {notification.subMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {notification?.type === 'success' && (
              <Link
                href="/cart"
                className="bg-[#D7A86E] hover:bg-[#C5965C] text-[#24130A] text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>Xem giỏ hàng</span>
                <span>&rarr;</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-[#C4B5A5] hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
