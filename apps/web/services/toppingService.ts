import { fetchApi } from '@/services/api';
import { ToppingItem } from '@/types/types';

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export async function fetchToppings(): Promise<ToppingItem[]> {
  try {
    const res = await fetchApi<ApiResponse<ToppingItem[]> | ToppingItem[]>("/toppings");
    const data = (res as ApiResponse<ToppingItem[]>).data || res;

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách toppings:", error);
    return [];
  }
}