import { Suspense } from 'react';
import CartPage from './pageCart';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center text-[#756C65]">Đang tải...</div>}>
      <CartPage />
    </Suspense>
  );
}
