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

  setPendingOrderId: (orderId: number | null) => void;
  addToCart: (newItem: CartItem) => AddToCartResult;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  loadCartForUser: (email: string) => void;
  clearActiveCart: () => void;

  startCheckout: (durationMinutes?: number, orderId?: number | null) => void;
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

      setPendingOrderId: (orderId) => set({ pendingOrderId: orderId }),

      addToCart: (newItem) => {
        const authUser = useAuthStore.getState().user;
        const email = authUser?.email;
        const currentItems = get().items;

        const pId = Number(newItem.productId);
        const hasStockLimit = newItem.stock !== undefined && newItem.stock !== null;
        const stockLimit = hasStockLimit ? Math.max(0, Number(newItem.stock)) : 999;

        // Tổng số lượng của productId này hiện đã có trong giỏ hàng
        const existingProductTotalQty = currentItems
          .filter((item) => Number(item.productId) === pId)
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
            const otherItemsQty = (state.items.length > 0 ? state.items : state.checkoutItems)
              .filter(
                (i) =>
                  Number(i.productId) === Number(itemToUpdate.productId) &&
                  i.cartItemId !== cartItemId
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
          const effectiveItems =
            state.items.length > 0 ? state.items : savedUserItems;

          return {
            activeUserEmail: email,
            items: effectiveItems,
            cartsByUser: {
              ...state.cartsByUser,
              [email]: effectiveItems,
            },
          };
        }),

      startCheckout: (durationMinutes = CHECKOUT_DURATION_MINUTES, orderId?: number | null) =>
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
        }),

      clearActiveCart: () =>
        set({
          items: [],
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
      }),
    }
  )
);

export const getActiveCartUser = () =>
  useCartStore.getState().activeUserEmail;
