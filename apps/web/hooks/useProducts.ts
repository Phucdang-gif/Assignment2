import { useState, useEffect, useCallback } from "react";
import { fetchAllProducts } from '@/services/productService';
import { Product } from '@/types/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    setError(null);
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, isLoading, error, refetch: loadProducts };
}