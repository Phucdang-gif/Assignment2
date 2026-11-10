'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { BrewLiteLogo, SearchIcon, CartIcon, UserIcon } from './Icons';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { items, clearActiveCart } = useCartStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    clearActiveCart();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}#menu`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8DFD8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrewLiteLogo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-2xl tracking-tight text-[#3E2723]">
            BrewLite
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition-colors ${
              pathname === '/' && !pathname.includes('#')
                ? 'text-[#3E2723] font-bold'
                : 'text-[#5C4D44] hover:text-[#3E2723]'
            }`}
          >
            Trang chủ
          </Link>
          <Link
            href="/#menu"
            className="text-sm font-semibold text-[#5C4D44] hover:text-[#3E2723] transition-colors"
          >
            Menu
          </Link>
          <Link
            href="/#about"
            className="text-sm font-semibold text-[#5C4D44] hover:text-[#3E2723] transition-colors"
          >
            Về chúng tôi
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Tìm đồ uống..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-36 sm:w-48 bg-white border border-[#D7A86E] rounded-full px-3 py-1.5 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#8D6E63]"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-1 text-xs text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Tìm kiếm"
                className="p-2 text-[#5C4D44] hover:text-[#3E2723] hover:bg-[#F5F0E6] rounded-full transition-colors cursor-pointer"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className="relative p-2 text-[#5C4D44] hover:text-[#3E2723] hover:bg-[#F5F0E6] rounded-full transition-colors cursor-pointer"
          >
            <CartIcon className="w-5 h-5" />
            {isMounted && totalItems > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-[#8D6E63] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-label="Tài khoản"
              className="p-2 text-[#5C4D44] hover:text-[#3E2723] hover:bg-[#F5F0E6] rounded-full transition-colors cursor-pointer flex items-center"
            >
              <UserIcon className="w-5 h-5" />
              {isMounted && user && (
                <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold max-w-[100px] truncate text-[#3E2723]">
                  {user.email.split('@')[0]}
                </span>
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8DFD8] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {isMounted && user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Đã đăng nhập</p>
                      <p className="text-sm font-bold text-[#3E2723] truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 bg-[#FDFBF7] text-[#3E2723] rounded border border-[#E8DFD8]">
                          {(user.loyaltyPoints || 0) >= 100
                            ? '💎 Kim Cương (-15%)'
                            : (user.loyaltyPoints || 0) >= 50
                            ? '🏆 Vàng (-10%)'
                            : (user.loyaltyPoints || 0) >= 20
                            ? '🥈 Bạc (-5%)'
                            : '🥉 Đồng'}
                        </span>
                        <span className="text-[11px] font-bold text-[#8D6E63]">
                          {user.loyaltyPoints ?? 0} điểm
                        </span>
                      </div>
                      {user.role && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F0E6] text-[#8D6E63] rounded">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-[#4A3E37] hover:bg-[#FDFBF7] hover:text-[#3E2723] font-medium"
                    >
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      href="/barista"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#8D6E63] hover:bg-[#FDFBF7] font-semibold"
                    >
                      <span>Quầy Barista</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        Staff
                      </span>
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                      Tài khoản BrewLite
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-[#3E2723] hover:bg-[#FDFBF7]"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-[#8D6E63] hover:bg-[#FDFBF7]"
                    >
                      Đăng ký tài khoản
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
