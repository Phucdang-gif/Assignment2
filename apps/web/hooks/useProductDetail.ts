import { useState, useEffect } from "react";
import { fetchProductById } from '@/services/productService';
import { Product } from '@/types/types';

export function useProductDetail(productIdStr: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productIdStr) return;

    setIsLoading(true);
    setError(null);

    fetchProductById(productIdStr)
      .then((productData) => {
        if (!productData) {
          setError("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.");
        }
        setProduct(productData);
      })
      .catch((err: Error) => {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
        setError(err.message || "Không thể kết nối tới máy chủ.");
        setProduct(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productIdStr]);

  return { product, isLoading, error };
}