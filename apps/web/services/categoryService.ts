import { fetchApi } from '@/services/api';
import { Category } from '@/types/types';

interface ApiResponse<T> {
  data?: T;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetchApi<ApiResponse<Category[]> | Category[]>("/categories");
  const categories = (res as ApiResponse<Category[]>).data || (res as Category[]);
  if (!Array.isArray(categories)) return [];
  return categories.map((category) => ({
    id: Number(category.id),
    name: category.name,
  }));
}
