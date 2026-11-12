'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon, BrewLiteLogo } from '@/components/Icons';
import { API_URL } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setError('');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  const nameRe = /^[\p{L}\s'.-]{2,100}$/u;
  const cleanPhone = phone.replace(/[\s.-]/g, '');

  if (!nameRe.test(fullName.trim())) {
    setError('tên phải từ 2-100 ký tự chỉ chữ ');
    return;
  }
  if (!emailRe.test(email.trim())) {
    setError('Email không hợp lệ.');
    return;
  }
  if (!phoneRe.test(cleanPhone)) {
    setError('Số điện thoại không hợp lệ (VD: 0912345678).');
    return;
  }
  if (password.length < 8 || password.length > 30) {
    setError('Mật khẩu từ 8 đến 30 ký tự.');
    return;
  }
  if (password !== confirmPassword) {
    setError('Mật khẩu xác nhận không khớp.');
    return;
  }

  setIsLoading(true);
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim().replace(/\s+/g, ' '),
        email: email.trim(),
        phone: cleanPhone,
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Đăng ký không thành công');
      return;
    }
    alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
    router.push('/login');
  } catch {
    setError('Không thể kết nối máy chủ. Vui lòng kiểm tra lại backend.');
  } finally {
    setIsLoading(false);
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
            Đăng ký
          </h1>
          <p className="text-xs sm:text-sm text-[#756C65]">
            Tạo tài khoản mới để bắt đầu!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#3E2723]">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#FDFBF7] border border-[#E8DFD8] rounded-xl px-3.5 py-2.5 text-sm text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#3E2723]">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#FDFBF7] border border-[#E8DFD8] rounded-xl px-3.5 py-2.5 text-sm text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#3E2723]">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-[#FDFBF7] border border-[#E8DFD8] rounded-xl px-3.5 py-2.5 text-sm text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#3E2723]">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#3E2723]">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#FDFBF7] border border-[#E8DFD8] rounded-xl px-3.5 py-2.5 text-sm text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-[#3E2723]/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm cursor-pointer mt-2"
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs">
          <p className="text-[#756C65]">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-[#3E2723] hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
