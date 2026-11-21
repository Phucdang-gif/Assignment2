export enum ProductSize {
  S = "S",
  M = "M",
  L = "L",
}

export type ProductSizeKey = keyof typeof ProductSize;

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  status?: "active" | "inactive";
  stock?: number;
  sizeStock?: Record<ProductSizeKey, number>;
  categoryId?: number;
  category?: Category | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface ToppingItem {
  id: number;
  name: string;
  price: number;
  isAvailable?: boolean;
}
export enum UserRole {
  CUSTOMER = "customer",
  BARISTA = "barista",
  ADMIN = "admin",
}

export interface AuthUser {
  id: number;
  email: string;
  role?: UserRole | string;
  loyaltyPoints?: number;
}

export interface AdminUser {
  id: number | string;
  fullName: string | null;
  email: string;
  phone: string | null;
  role: UserRole | string;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminOrderItem {
  id: string | number;
  productId: string | number;
  size: string;
  qty: number;
  unitPrice?: string | number;
  lineTotal: string | number;
  Product?: {
    id: string | number;
    name: string;
  };
  OrderItemTopping?: {
    toppingId: number;
    priceAtTime: number;
    Topping?: {
      id: number;
      name: string;
      price: number;
    };
  }[];
}

export interface AdminOrder {
  id: string | number;
  userId: string | number;
  status: string;
  subtotal?: string | number;
  discountAmount?: string | number;
  total: string | number;
  createdAt: string;
  OrderItem?: AdminOrderItem[];
  User?: {
    id: string | number;
    email: string;
    fullName?: string | null;
  };
}
