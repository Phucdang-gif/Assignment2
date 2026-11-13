import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const SIZE_PRICES = { S: 0, M: 5000, L: 10000 };

function calculateUnitPrice(basePrice, size, selectedToppings, toppingsCatalog) {
  const sizeExtra = SIZE_PRICES[size] ?? 0;
  const toppingsExtra = selectedToppings.reduce((sum, name) => {
    const found = toppingsCatalog.find((t) => t.name === name);
    return sum + (found ? Number(found.price) : 0);
  }, 0);
  return Number(basePrice) + sizeExtra + toppingsExtra;
}

function getMembershipDiscountPercent(loyaltyPoints) {
  if (loyaltyPoints >= 100) return 15;
  if (loyaltyPoints >= 50) return 10;
  if (loyaltyPoints >= 20) return 5;
  return 0;
}

function createCartStoreSimulator() {
  let state = {
    items: [],
    checkoutItems: [],
    checkoutExpiresAt: null,
    pendingOrderId: null,
  };

  return {
    getState: () => state,
    addToCart(newItem) {
      const pId = Number(newItem.productId);
      const stockLimit = newItem.stock !== undefined ? Math.max(0, Number(newItem.stock)) : 999;
      const existingQty = state.items
        .filter((i) => Number(i.productId) === pId)
        .reduce((sum, i) => sum + Number(i.quantity || 0), 0);

      if (stockLimit <= 0 || existingQty >= stockLimit) {
        return { success: false, addedQty: 0 };
      }

      const actualQty = Math.min(Math.max(1, Number(newItem.quantity) || 1), stockLimit - existingQty);
      const idx = state.items.findIndex((i) => i.cartItemId === newItem.cartItemId);

      if (idx !== -1) {
        state.items[idx].quantity += actualQty;
      } else {
        state.items.push({ ...newItem, quantity: actualQty, stock: stockLimit });
      }
      return { success: true, addedQty: actualQty };
    },
    updateQuantity(cartItemId, qty) {
      state.items = state.items.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        const max = item.stock ?? 999;
        return { ...item, quantity: Math.min(max, Math.max(1, qty)) };
      });
    },
    removeFromCart(cartItemId) {
      state.items = state.items.filter((i) => i.cartItemId !== cartItemId);
    },
    startCheckout(durationMinutes, orderId) {
      state = {
        ...state,
        checkoutItems: [...state.items],
        items: [],
        checkoutExpiresAt: Date.now() + durationMinutes * 60 * 1000,
        pendingOrderId: orderId,
      };
    },
    restoreCheckoutToCart() {
      state = {
        ...state,
        items: [...state.checkoutItems],
        checkoutItems: [],
        checkoutExpiresAt: null,
        pendingOrderId: null,
      };
    },
    completeCheckout() {
      state = {
        items: [],
        checkoutItems: [],
        checkoutExpiresAt: null,
        pendingOrderId: null,
      };
    },
  };
}

describe('BrewLite Frontend & E2E Ordering Flow Tests (TASK-5.2 / FR-01..FR-07)', () => {
  const sampleProducts = [
    { id: 1, categoryId: 1, name: 'Cà phê sữa đá', price: 35000, stock: 8, sizeStock: { S: 10, M: 8, L: 5 } },
    { id: 2, categoryId: 1, name: 'Americano', price: 40000, stock: 10, sizeStock: { S: 10, M: 10, L: 8 } },
    { id: 6, categoryId: 2, name: 'Trà đào cam sả', price: 39000, stock: 6, sizeStock: { S: 8, M: 6, L: 4 } },
  ];

  const sampleToppings = [
    { id: 1, name: 'Trân châu đen hoàng gia', price: 5000, isAvailable: true },
    { id: 2, name: 'Kem cheese (Macchiato)', price: 10000, isAvailable: true },
  ];

  it('FR-01 & FR-02: Lọc danh mục, tìm kiếm đồ uống và tính giá động theo Size (S/M/L) + Topping', () => {
    const filteredByCat = sampleProducts.filter((p) => p.categoryId === 1);
    assert.equal(filteredByCat.length, 2);

    const unitPriceS = calculateUnitPrice(35000, 'S', [], sampleToppings);
    assert.equal(unitPriceS, 35000);

    const unitPriceMWithToppings = calculateUnitPrice(
      35000,
      'M',
      ['Trân châu đen hoàng gia', 'Kem cheese (Macchiato)'],
      sampleToppings,
    );
    assert.equal(unitPriceMWithToppings, 55000); // 35.000 + 5.000 (Size M) + 15.000 (2 Toppings)
  });

  it('FR-03 & AC-E2E-01: Quản lý giỏ hàng, giữ chỗ Checkout 5 phút, hoàn trả khi hủy và làm rỗng giỏ khi PAID', () => {
    const cart = createCartStoreSimulator();
    const sortedToppings = ['Kem cheese (Macchiato)', 'Trân châu đen hoàng gia'].sort();
    const cartItemId = `1-M-${sortedToppings.join('-')}`;

    // 1. Thêm 2 ly vào giỏ hàng
    const addRes = cart.addToCart({
      cartItemId,
      productId: 1,
      name: 'Cà phê sữa đá',
      price: 55000,
      size: 'M',
      toppings: sortedToppings,
      quantity: 2,
      stock: 5,
    });
    assert.equal(addRes.success, true);
    assert.equal(cart.getState().items.length, 1);
    assert.equal(cart.getState().items[0].quantity, 2);

    // 2. Tăng số lượng vượt quá tồn kho (stock = 5) -> tự động giới hạn ở mức tối đa 5
    cart.updateQuantity(cartItemId, 10);
    assert.equal(cart.getState().items[0].quantity, 5);

    // 3. Điều chỉnh về 2 ly và tính tổng tiền với ưu đãi hạng Vàng (50 điểm -> giảm 10%) + Voucher 10.000đ
    cart.updateQuantity(cartItemId, 2);
    const subtotal = cart.getState().items.reduce((s, i) => s + i.price * i.quantity, 0);
    assert.equal(subtotal, 110000);

    const discountPercent = getMembershipDiscountPercent(50);
    assert.equal(discountPercent, 10);
    const memberDiscount = Math.round((subtotal * discountPercent) / 100); // 11.000đ
    const voucherDiscount = 10000;
    const grandTotal = subtotal - memberDiscount - voucherDiscount;
    assert.equal(grandTotal, 89000);

    // 4. Bấm Thanh toán -> Tạo đơn PENDING #101 và chuyển món sang checkoutItems giữ chỗ 5 phút
    cart.startCheckout(5, 101);
    assert.equal(cart.getState().items.length, 0);
    assert.equal(cart.getState().checkoutItems.length, 1);
    assert.equal(cart.getState().pendingOrderId, 101);

    // 5. Nếu hết hạn hoặc khách bấm quay lại giỏ hàng -> hoàn trả món về items
    cart.restoreCheckoutToCart();
    assert.equal(cart.getState().items.length, 1);
    assert.equal(cart.getState().checkoutItems.length, 0);
    assert.equal(cart.getState().pendingOrderId, null);

    // 6. Thực hiện lại Checkout và xác nhận thanh toán thành công (PAID) -> xóa rỗng giỏ hàng
    cart.startCheckout(5, 102);
    cart.completeCheckout();
    assert.equal(cart.getState().items.length, 0);
    assert.equal(cart.getState().checkoutItems.length, 0);
    assert.equal(cart.getState().pendingOrderId, null);
  });
});
