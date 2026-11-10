import { useState, useEffect } from "react";
import { fetchAllProducts } from '@/services/productService';
import { Product } from '@/types/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchAllProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err: Error) => {
        setError(err.message || "Không thể tải danh sách sản phẩm.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { products, isLoading, error };
}