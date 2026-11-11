'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { CoffeeCupIcon, BagIcon, UserIcon } from './Icons';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DFD8] py-2 px-6 flex items-center justify-around shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === '/' ? 'text-[#3E2723] font-bold' : 'text-[#8D6E63] hover:text-[#3E2723]'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Trang chủ</span>
      </Link>

      <Link
        href="/#menu"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname.includes('#menu') ? 'text-[#3E2723] font-bold' : 'text-[#8D6E63] hover:text-[#3E2723]'
        }`}
      >
        <CoffeeCupIcon className="w-5 h-5" />
        <span>Menu</span>
      </Link>

      <Link
        href="/cart"
        className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === '/cart' ? 'text-[#3E2723] font-bold' : 'text-[#8D6E63] hover:text-[#3E2723]'
        }`}
      >
        <div className="relative">
          <BagIcon className="w-5 h-5" />
          {isMounted && totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-[#8D6E63] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </div>
        <span>Giỏ hàng</span>
      </Link>

      <Link
        href={isMounted && user ? "/orders" : "/login"}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === '/orders' || pathname === '/login'
            ? 'text-[#3E2723] font-bold'
            : 'text-[#8D6E63] hover:text-[#3E2723]'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span>{user ? 'Đơn hàng' : 'Tài khoản'}</span>
      </Link>
    </nav>
  );
}
