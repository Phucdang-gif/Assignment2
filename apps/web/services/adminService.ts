import { fetchApi, assetUrl } from '@/services/api';
import {
  AdminOrder,
  AdminUser,
  Category,
  Product,
  ToppingItem,
  UsersListResponse,
} from '@/types/types';

function normalizeProduct(p: Product): Product {
  return {
    id: Number(p.id),
    name: p.name,
    price: Number(p.price),
    imageUrl: p.imageUrl
      ? p.imageUrl.startsWith('http')
        ? p.imageUrl
        : assetUrl(p.imageUrl)
      : '',
    description: p.description || '',
    status: p.status || 'active',
    stock: p.stock !== undefined ? Number(p.stock) : 0,
    categoryId: p.categoryId ? Number(p.categoryId) : undefined,
    category: p.category ? { id: Number(p.category.id), name: p.category.name } : null,
  };
}

// --- Products ---
export async function fetchAdminProducts(): Promise<Product[]> {
  const data = await fetchApi<Product[]>('/products/admin/all');
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
}

export interface ProductPayload {
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  status?: 'active' | 'inactive';
  categoryId?: number;
}

export async function createAdminProduct(payload: ProductPayload): Promise<Product> {
  const created = await fetchApi<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeProduct(created);
}

export async function updateAdminProduct(
  id: number,
  payload: Partial<ProductPayload>,
): Promise<Product> {
  const updated = await fetchApi<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeProduct(updated);
}

export async function deleteAdminProduct(id: number): Promise<void> {
  await fetchApi(`/products/${id}`, { method: 'DELETE' });
}

// --- Categories ---
export async function createAdminCategory(name: string): Promise<Category> {
  return fetchApi<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateAdminCategory(id: number, name: string): Promise<Category> {
  return fetchApi<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await fetchApi(`/categories/${id}`, { method: 'DELETE' });
}

// --- Toppings ---
export async function fetchAdminToppings(): Promise<ToppingItem[]> {
  const res = await fetchApi<{ data?: ToppingItem[] } | ToppingItem[]>('/toppings/admin/all');
  const list = Array.isArray(res) ? res : res.data || [];
  return list.map((t) => ({
    id: Number(t.id),
    name: t.name,
    price: Number(t.price),
    isAvailable: t.isAvailable ?? true,
  }));
}

export interface ToppingPayload {
  name: string;
  price: number;
  isAvailable?: boolean;
}

export async function createAdminTopping(payload: ToppingPayload): Promise<ToppingItem> {
  return fetchApi<ToppingItem>('/toppings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminTopping(
  id: number,
  payload: Partial<ToppingPayload>,
): Promise<ToppingItem> {
  return fetchApi<ToppingItem>(`/toppings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminTopping(id: number): Promise<void> {
  await fetchApi(`/toppings/${id}`, { method: 'DELETE' });
}

// --- Orders ---
export async function fetchAdminOrders(status = 'ALL'): Promise<AdminOrder[]> {
  const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
  const data = await fetchApi<AdminOrder[]>(`/orders/admin/all${query}`);
  return Array.isArray(data) ? data : [];
}

export async function updateAdminOrderStatus(
  id: number | string,
  status: string,
): Promise<AdminOrder> {
  return fetchApi<AdminOrder>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// --- Users ---
export async function fetchAdminUsers(page = 1, limit = 10): Promise<UsersListResponse> {
  return fetchApi<UsersListResponse>(`/users?page=${page}&limit=${limit}`);
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  role?: 'customer' | 'barista' | 'admin';
}

export async function createAdminUser(payload: CreateUserPayload): Promise<AdminUser> {
  return fetchApi<AdminUser>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(
  id: number | string,
  payload: UpdateUserPayload,
): Promise<AdminUser> {
  return fetchApi<AdminUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: number | string): Promise<void> {
  await fetchApi(`/users/${id}`, { method: 'DELETE' });
}
