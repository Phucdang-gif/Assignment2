import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { CHECKOUT_DURATION_MINUTES } from '@/hooks/useCheckoutTimer';

export interface CartItem {
  cartItemId: string;
  productId: number;
  name: string;
  price: number;
  size: string;
  toppings: string[];
  quantity: number;
  imageUrl?: string;
  stock?: number;
}

export interface AddToCartResult {
  success: boolean;
  addedQty: number;
  isCapped?: boolean;
  message?: string;
}

interface CartStore {
  items: CartItem[];
  cartsByUser: Record<string, CartItem[]>;
  activeUserEmail: string | null;

  checkoutItems: CartItem[];
  checkoutExpiresAt: number | null;
  pendingOrderId: number | null;
  pendingOrderTotal: number | null;
  pendingOrderDiscount: number | null;
  pendingOrderRawTotal: number | null;

  setPendingOrderId: (orderId: number | null) => void;
  setPendingOrderDetails: (
    details: { id: number; total: number; rawTotal?: number; discount?: number } | null
  ) => void;
  addToCart: (newItem: CartItem) => AddToCartResult;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  loadCartForUser: (email: string) => void;
  clearActiveCart: () => void;

  startCheckout: (
    durationMinutes?: number,
    orderId?: number | null,
    orderSummary?: { total: number; rawTotal?: number; discount?: number } | null
  ) => void;
  restoreCheckoutToCart: () => void;
  clearCheckoutItems: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartsByUser: {},
      activeUserEmail: null,
      checkoutItems: [],
      checkoutExpiresAt: null,
      pendingOrderId: null,
      pendingOrderTotal: null,
      pendingOrderDiscount: null,
      pendingOrderRawTotal: null,

      setPendingOrderId: (orderId) => set({ pendingOrderId: orderId }),
      setPendingOrderDetails: (details) =>
        set({
          pendingOrderId: details ? details.id : null,
          pendingOrderTotal: details ? details.total : null,
          pendingOrderRawTotal: details?.rawTotal ?? null,
          pendingOrderDiscount: details?.discount ?? null,
        }),

      addToCart: (newItem) => {
        const authUser = useAuthStore.getState().user;
        const email = authUser?.email;
        const currentItems = get().items;

        const pId = Number(newItem.productId);
        const hasStockLimit = newItem.stock !== undefined && newItem.stock !== null;
        const stockLimit = hasStockLimit ? Math.max(0, Number(newItem.stock)) : 999;

        // Tổng số lượng của productId này hiện đã có trong giỏ hàng
        // Nếu các size dùng chung stock thì cộng gộp, nếu có stock riêng từng size thì tính theo size
        const matchingProductItems = currentItems.filter((item) => Number(item.productId) === pId);
        const allSameStock = matchingProductItems.every((item) => item.stock === stockLimit);
        const existingProductTotalQty = allSameStock
          ? matchingProductItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
          : currentItems
              .filter((item) => Number(item.productId) === pId && item.size === newItem.size)
              .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        if (hasStockLimit && stockLimit <= 0) {
          return {
            success: false,
            addedQty: 0,
            message: 'Sản phẩm này hiện đã hết hàng trong kho.',
          };
        }

        const maxCanAdd = hasStockLimit
          ? Math.max(0, stockLimit - existingProductTotalQty)
          : 999;

        if (maxCanAdd <= 0) {
          return {
            success: false,
            addedQty: 0,
            message: `Bạn đã thêm tối đa số lượng tồn kho (${stockLimit}) của sản phẩm này vào giỏ hàng.`,
          };
        }

        const requestedQty = Math.max(1, Number(newItem.quantity) || 1);
        const actualQtyToAdd = Math.min(requestedQty, maxCanAdd);

        const normalizedItem: CartItem = {
          ...newItem,
          productId: pId,
          price: Number(newItem.price),
          quantity: actualQtyToAdd,
          stock: hasStockLimit ? stockLimit : undefined,
        };

        const existingItemIndex = currentItems.findIndex(
          (item) => item.cartItemId === normalizedItem.cartItemId
        );

        let updatedItems: CartItem[];

        if (existingItemIndex !== -1) {
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity:
              Number(updatedItems[existingItemIndex].quantity) + actualQtyToAdd,
            stock: hasStockLimit ? stockLimit : updatedItems[existingItemIndex].stock,
          };
        } else {
          updatedItems = [...currentItems, normalizedItem];
        }

        set((state) => ({
          items: updatedItems,
          cartsByUser: email
            ? {
                ...state.cartsByUser,
                [email]: updatedItems,
              }
            : state.cartsByUser,
          activeUserEmail: email || state.activeUserEmail,
        }));

        return {
          success: true,
          addedQty: actualQtyToAdd,
          isCapped: actualQtyToAdd < requestedQty,
          message:
            actualQtyToAdd < requestedQty
              ? `Chỉ có thể thêm ${actualQtyToAdd} sản phẩm do giới hạn tồn kho còn lại (${maxCanAdd}/${stockLimit}).`
              : undefined,
        };
      },

      removeFromCart: (cartItemId) =>
        set((state) => {
          const updatedItems = state.items.filter(
            (item) => item.cartItemId !== cartItemId
          );
          const updatedCheckoutItems = (state.checkoutItems || []).filter(
            (item) => item.cartItemId !== cartItemId
          );

          return {
            items: updatedItems,
            checkoutItems: updatedCheckoutItems,
            cartsByUser: state.activeUserEmail
              ? {
                  ...state.cartsByUser,
                  [state.activeUserEmail]: updatedItems,
                }
              : state.cartsByUser,
          };
        }),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          const itemToUpdate =
            state.items.find((item) => item.cartItemId === cartItemId) ||
            state.checkoutItems.find((item) => item.cartItemId === cartItemId);

          let safeQty = Math.max(1, Math.floor(Number(quantity) || 1));

          if (itemToUpdate && itemToUpdate.stock !== undefined && itemToUpdate.stock !== null) {
            const stockLimit = Number(itemToUpdate.stock);
            const pool = state.items.length > 0 ? state.items : state.checkoutItems;
            const sameProductItems = pool.filter((i) => Number(i.productId) === Number(itemToUpdate.productId));
            const allSameStock = sameProductItems.every((i) => i.stock === itemToUpdate.stock);
            const otherItemsQty = pool
              .filter(
                (i) =>
                  Number(i.productId) === Number(itemToUpdate.productId) &&
                  i.cartItemId !== cartItemId &&
                  (allSameStock || i.size === itemToUpdate.size)
              )
              .reduce((sum, i) => sum + Number(i.quantity || 0), 0);

            const maxAllowed = Math.max(1, stockLimit - otherItemsQty);
            safeQty = Math.min(safeQty, maxAllowed);
          }

          const updatedItems = state.items.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity: safeQty,
                }
              : item
          );
          const updatedCheckoutItems = (state.checkoutItems || []).map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity: safeQty,
                }
              : item
          );

          return {
            items: updatedItems,
            checkoutItems: updatedCheckoutItems,
            cartsByUser: state.activeUserEmail
              ? {
                  ...state.cartsByUser,
                  [state.activeUserEmail]: updatedItems,
                }
              : state.cartsByUser,
          };
        }),

      loadCartForUser: (email) =>
        set((state) => {
          const savedUserItems = state.cartsByUser[email] ?? [];
          let effectiveItems: CartItem[];

          // Nếu giỏ hàng hiện tại có món từ khách vãng lai (activeUserEmail === null):
          if (!state.activeUserEmail && state.items.length > 0) {
            if (savedUserItems.length > 0) {
              const merged = [...savedUserItems];
              for (const guestItem of state.items) {
                const existingIndex = merged.findIndex((m) => m.cartItemId === guestItem.cartItemId);
                if (existingIndex !== -1) {
                  merged[existingIndex] = {
                    ...merged[existingIndex],
                    quantity: Number(merged[existingIndex].quantity) + Number(guestItem.quantity),
                  };
                } else {
                  merged.push(guestItem);
                }
              }
              effectiveItems = merged;
            } else {
              effectiveItems = state.items;
            }
          } else if (state.activeUserEmail === email) {
            effectiveItems = state.items.length > 0 ? state.items : savedUserItems;
          } else {
            // Đổi người dùng hoặc giỏ trống: tải giỏ hàng đã lưu của chính tài khoản này
            effectiveItems = savedUserItems;
          }

          return {
            activeUserEmail: email,
            items: effectiveItems,
            cartsByUser: {
              ...state.cartsByUser,
              [email]: effectiveItems,
            },
          };
        }),

      startCheckout: (
        durationMinutes = CHECKOUT_DURATION_MINUTES,
        orderId?: number | null,
        orderSummary?: { total: number; rawTotal?: number; discount?: number } | null
      ) =>
        set((state) => {
          const authUser = useAuthStore.getState().user;
          const email = authUser?.email || state.activeUserEmail;
          const currentItems = state.items && state.items.length > 0 ? state.items : (state.checkoutItems || []);
          const expiresAt = Date.now() + durationMinutes * 60 * 1000;

          return {
            items: [],
            checkoutItems: [...currentItems],
            checkoutExpiresAt: expiresAt,
            pendingOrderId: orderId !== undefined ? orderId : state.pendingOrderId,
            pendingOrderTotal: orderSummary ? orderSummary.total : state.pendingOrderTotal,
            pendingOrderRawTotal: orderSummary ? (orderSummary.rawTotal ?? null) : state.pendingOrderRawTotal,
            pendingOrderDiscount: orderSummary ? (orderSummary.discount ?? null) : state.pendingOrderDiscount,
            cartsByUser: email
              ? {
                  ...state.cartsByUser,
                  [email]: [],
                }
              : state.cartsByUser,
          };
        }),

      restoreCheckoutToCart: () =>
        set((state) => {
          const authUser = useAuthStore.getState().user;
          const email = authUser?.email || state.activeUserEmail;

          const source = (state.checkoutItems && state.checkoutItems.length > 0) ? state.checkoutItems : state.items;
          if (!source || source.length === 0) {
            return state;
          }

          const restoredItems = [...source];

          return {
            items: restoredItems,
            checkoutItems: [],
            checkoutExpiresAt: null,
            pendingOrderId: null,
            pendingOrderTotal: null,
            pendingOrderRawTotal: null,
            pendingOrderDiscount: null,
            cartsByUser: email
              ? {
                  ...state.cartsByUser,
                  [email]: restoredItems,
                }
              : state.cartsByUser,
          };
        }),

      clearCheckoutItems: () =>
        set({
          checkoutItems: [],
          checkoutExpiresAt: null,
          pendingOrderId: null,
          pendingOrderTotal: null,
          pendingOrderRawTotal: null,
          pendingOrderDiscount: null,
        }),

      clearActiveCart: () =>
        set({
          items: [],
          activeUserEmail: null,
        }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        cartsByUser: state.cartsByUser,
        activeUserEmail: state.activeUserEmail,
        checkoutItems: state.checkoutItems,
        checkoutExpiresAt: state.checkoutExpiresAt,
        pendingOrderId: state.pendingOrderId,
        pendingOrderTotal: state.pendingOrderTotal,
        pendingOrderRawTotal: state.pendingOrderRawTotal,
        pendingOrderDiscount: state.pendingOrderDiscount,
      }),
    }
  )
);

export const getActiveCartUser = () =>
  useCartStore.getState().activeUserEmail;
