export type PaymentMethod = 'WALLET' | 'CARD';

export interface PaymentRequest {
  orderId: number;
  amount: number;
  method: PaymentMethod;
  idempotencyKey: string;
}

export interface PaymentRecord {
  id: string | number;
  orderId: string | number;
  amount: string | number;
  method: PaymentMethod;
  status: string;
  idempotencyKey: string;
  transactionRef?: string | null;
  createdAt: string;
}

export interface PaymentResponse {
  payment: PaymentRecord;
  order: any;
  pointsEarned?: number;
  idempotent?: boolean;
  message?: string;
  alreadyPaid?: boolean;
}
