import { fetchApi } from '@/services/api';
import { generateUUIDv4 } from '@/lib/uuid';
import { PaymentMethod, PaymentRequest, PaymentResponse } from '@/types/payment';

/**
 * [TASK-5.1E] [FR-06] Gửi yêu cầu thanh toán mô phỏng kèm Idempotency Key
 */
export async function processPayment(
  orderId: number,
  amount: number,
  method: PaymentMethod,
  customIdempotencyKey?: string,
): Promise<PaymentResponse> {
  const idempotencyKey = customIdempotencyKey || generateUUIDv4();

  const payload: PaymentRequest = {
    orderId,
    amount,
    method,
    idempotencyKey,
  };

  return fetchApi<PaymentResponse>('/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Tra cứu trạng thái thanh toán của đơn hàng
 */
export async function getPaymentStatus(orderId: number): Promise<any> {
  return fetchApi(`/payments/status/${orderId}`, {
    method: 'GET',
  });
}

/**
 * Lấy danh sách giao dịch thanh toán theo đơn hàng
 */
export async function getPaymentsByOrder(orderId: number): Promise<any> {
  return fetchApi(`/payments/order/${orderId}`, {
    method: 'GET',
  });
}
