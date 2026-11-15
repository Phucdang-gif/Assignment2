import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

// Resolve Next.js `@/` alias and extensionless TypeScript imports for Node 24 test runner.
registerHooks({
  resolve(specifier, context, nextResolve) {
    let resolved = specifier;
    if (resolved.startsWith('@/')) {
      resolved = pathToFileURL(path.join(webRoot, resolved.slice(2))).href;
    }
    if (
      (resolved.startsWith('./') || resolved.startsWith('../') || resolved.startsWith('file://')) &&
      !path.extname(resolved)
    ) {
      const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : __filename;
      const basePath = resolved.startsWith('file://')
        ? fileURLToPath(resolved)
        : path.resolve(path.dirname(parentPath), resolved);
      for (const ext of ['.ts', '.tsx', '.js']) {
        if (fs.existsSync(basePath + ext)) {
          resolved = pathToFileURL(basePath + ext).href;
          break;
        }
      }
    }
    return nextResolve(resolved, context);
  },
});

const memoryStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
  setItem: (key, value) => {
    memoryStorage.set(key, String(value));
  },
  removeItem: (key) => {
    memoryStorage.delete(key);
  },
  clear: () => {
    memoryStorage.clear();
  },
};

const { useCartStore, getActiveCartUser } = await import('../store/cartStore.ts');
const { useAuthStore } = await import('../store/authStore.ts');
const { formatTimer } = await import('../hooks/useCheckoutTimer.ts');
const { generateUUIDv4 } = await import('../lib/uuid.ts');

function resetStores() {
  memoryStorage.clear();
  useAuthStore.setState({ token: null, user: null });
  useCartStore.setState({
    items: [],
    cartsByUser: {},
    activeUserEmail: null,
    checkoutItems: [],
    checkoutExpiresAt: null,
    pendingOrderId: null,
  });
}

describe('BrewLite Frontend Unit Tests (Cart, Auth & Helpers)', () => {
  beforeEach(() => {
    resetStores();
  });

  it('addToCart adds items, merges matching variants, and caps at stock limit', () => {
    const first = useCartStore.getState().addToCart({
      cartItemId: '1-M-none',
      productId: 1,
      name: 'Cà phê sữa đá',
      price: 35000,
      size: 'M',
      toppings: [],
      quantity: 2,
      stock: 3,
    });
    assert.equal(first.success, true);
    assert.equal(first.addedQty, 2);

    const capped = useCartStore.getState().addToCart({
      cartItemId: '1-M-none',
      productId: 1,
      name: 'Cà phê sữa đá',
      price: 35000,
      size: 'M',
      toppings: [],
      quantity: 5,
      stock: 3,
    });
    assert.equal(capped.success, true);
    assert.equal(capped.addedQty, 1);
    assert.equal(capped.isCapped, true);
    assert.equal(useCartStore.getState().items[0].quantity, 3);

    const maxed = useCartStore.getState().addToCart({
      cartItemId: '1-L-none',
      productId: 1,
      name: 'Cà phê sữa đá',
      price: 40000,
      size: 'L',
      toppings: [],
      quantity: 1,
      stock: 3,
    });
    assert.equal(maxed.success, false);
    assert.equal(maxed.addedQty, 0);

    const outOfStock = useCartStore.getState().addToCart({
      cartItemId: '2-S-none',
      productId: 2,
      name: 'Matcha Latte',
      price: 45000,
      size: 'S',
      toppings: [],
      quantity: 1,
      stock: 0,
    });
    assert.equal(outOfStock.success, false);
    assert.equal(outOfStock.addedQty, 0);
  });

  it('updateQuantity clamps minimum to 1 and respects combined stock across sizes', () => {
    useCartStore.getState().addToCart({
      cartItemId: '1-S-none',
      productId: 1,
      name: 'Bạc xỉu',
      price: 30000,
      size: 'S',
      toppings: [],
      quantity: 2,
      stock: 5,
    });
    useCartStore.getState().addToCart({
      cartItemId: '1-M-none',
      productId: 1,
      name: 'Bạc xỉu',
      price: 35000,
      size: 'M',
      toppings: [],
      quantity: 2,
      stock: 5,
    });

    useCartStore.getState().updateQuantity('1-S-none', 0);
    assert.equal(useCartStore.getState().items[0].quantity, 1);

    useCartStore.getState().updateQuantity('1-S-none', 10);
    assert.equal(useCartStore.getState().items[0].quantity, 3);
  });

  it('removeFromCart and clearActiveCart remove expected items', () => {
    useCartStore.getState().addToCart({
      cartItemId: 'item-1',
      productId: 1,
      name: 'Americano',
      price: 30000,
      size: 'M',
      toppings: [],
      quantity: 1,
    });
    useCartStore.getState().addToCart({
      cartItemId: 'item-2',
      productId: 2,
      name: 'Latte',
      price: 45000,
      size: 'M',
      toppings: [],
      quantity: 1,
    });

    useCartStore.getState().removeFromCart('item-1');
    assert.equal(useCartStore.getState().items.length, 1);
    assert.equal(useCartStore.getState().items[0].cartItemId, 'item-2');

    useCartStore.getState().clearActiveCart();
    assert.equal(useCartStore.getState().items.length, 0);
  });

  it('authStore and loadCartForUser isolate carts per customer', () => {
    useAuthStore.getState().login('jwt-token-1', {
      id: 1,
      email: 'alice@brewlite.com',
      role: 'customer',
      loyaltyPoints: 20,
    });
    assert.equal(useAuthStore.getState().token, 'jwt-token-1');

    useAuthStore.getState().updateLoyaltyPoints(55);
    assert.equal(useAuthStore.getState().user?.loyaltyPoints, 55);

    useCartStore.getState().addToCart({
      cartItemId: 'alice-1',
      productId: 1,
      name: 'Cold Brew',
      price: 40000,
      size: 'M',
      toppings: [],
      quantity: 1,
    });
    assert.equal(getActiveCartUser(), 'alice@brewlite.com');

    useCartStore.getState().clearActiveCart();
    useCartStore.getState().loadCartForUser('bob@brewlite.com');
    assert.equal(getActiveCartUser(), 'bob@brewlite.com');
    assert.equal(useCartStore.getState().items.length, 0);

    useCartStore.getState().loadCartForUser('alice@brewlite.com');
    assert.equal(useCartStore.getState().items.length, 1);
    assert.equal(useCartStore.getState().items[0].cartItemId, 'alice-1');

    useAuthStore.getState().logout();
    assert.equal(useAuthStore.getState().token, null);
    assert.equal(useAuthStore.getState().user, null);
  });

  it('startCheckout, restoreCheckoutToCart, and clearCheckoutItems manage checkout snapshot', () => {
    useCartStore.getState().addToCart({
      cartItemId: 'checkout-1',
      productId: 3,
      name: 'Trà đào cam sả',
      price: 42000,
      size: 'L',
      toppings: ['Trân châu trắng'],
      quantity: 2,
    });

    useCartStore.getState().startCheckout(5, 88);
    assert.equal(useCartStore.getState().items.length, 0);
    assert.equal(useCartStore.getState().checkoutItems.length, 1);
    assert.equal(useCartStore.getState().pendingOrderId, 88);
    assert.ok(typeof useCartStore.getState().checkoutExpiresAt === 'number');

    useCartStore.getState().restoreCheckoutToCart();
    assert.equal(useCartStore.getState().items.length, 1);
    assert.equal(useCartStore.getState().checkoutItems.length, 0);
    assert.equal(useCartStore.getState().pendingOrderId, null);

    useCartStore.getState().startCheckout(5, 89);
    useCartStore.getState().setPendingOrderId(90);
    assert.equal(useCartStore.getState().pendingOrderId, 90);
    useCartStore.getState().clearCheckoutItems();
    assert.equal(useCartStore.getState().checkoutItems.length, 0);
    assert.equal(useCartStore.getState().pendingOrderId, null);
  });

  it('formatTimer and generateUUIDv4 produce valid formatted outputs', () => {
    assert.equal(formatTimer(0), '00:00');
    assert.equal(formatTimer(65), '01:05');
    assert.equal(formatTimer(300), '05:00');

    const uuid = generateUUIDv4();
    assert.match(
      uuid,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
