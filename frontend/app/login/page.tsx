'use client';
import { API_URL } from '@/services/api';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { EyeIcon, EyeOffIcon, BrewLiteLogo, CoffeeBeanIcon } from '@/components/Icons';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const login = useAuthStore((state) => state.login);
  const loadCartForUser = useCartStore((state) => state.loadCartForUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Đăng nhập không thành công');
        return;
      }
      login(data.access_token, data.user);
      loadCartForUser(data.user.email);
      router.push(redirectTo);
    } catch {
      setError('Không kết nối được máy chủ (cổng 3001). Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role: 'customer' | 'barista') => {
    if (role === 'customer') {
      setEmail('customer@brewlite.com');
      setPassword('customer123');
    } else {
      setEmail('barista@brewlite.com');
      setPassword('barista123');
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E8DFD8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center mb-1">
            <BrewLiteLogo className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight">
            Đăng nhập
          </h1>
          <p className="text-xs sm:text-sm text-[#756C65]">
            Chào mừng bạn quay trở lại!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#3E2723]">
              Email hoặc số điện thoại
            </label>
            <input
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-[#E8DFD8] rounded-xl px-3.5 py-2.5 text-sm text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#3E2723]">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E8DFD8] rounded-xl px-3.5 py-2.5 pr-11 text-sm text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E2723] p-1 cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-[#3E2723]/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm cursor-pointer"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="bg-[#F5F0E6] rounded-2xl p-3 border border-[#E8DFD8] text-center space-y-2">
          <p className="text-[11px] font-semibold text-[#8D6E63] uppercase tracking-wider">
            ⚡ Tài khoản mẫu kiểm thử
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillDemoAccount('customer')}
              className="text-xs bg-white hover:bg-gray-50 border border-[#D7A86E] text-[#3E2723] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
            >
              Khách hàng (customer)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('barista')}
              className="text-xs bg-white hover:bg-gray-50 border border-[#8D6E63] text-[#3E2723] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
            >
              Barista (staff)
            </button>
          </div>
        </div>

        <div className="text-center space-y-2 pt-2 border-t border-gray-100 text-xs">
          <p className="text-[#756C65]">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-[#3E2723] hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <div>
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
