import React from 'react';
import Link from 'next/link';
import {
  BrewLiteLogo,
  CoffeeBeanIcon,
  CoffeeCupIcon,
  LocationPinIcon,
  PhoneIcon,
  BankIcon,
} from './Icons';

export default function Footer() {
  return (
    <footer className="w-full bg-[#24140E] text-[#D7CCC8] border-t border-[#3E2417] mt-auto">
      <div className="border-b border-[#3A2216] bg-[#1C0F0A]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#3E2723] flex items-center justify-center text-[#D7A86E] shrink-0 shadow-inner">
              <CoffeeCupIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight">
                Good Coffee, Better Days
              </h3>
              <p className="text-xs sm:text-sm text-[#A8988B] mt-0.5">
                Cà phê nguyên chất đậm đà • Đặt trước tiện lợi • Thanh toán không tiền mặt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#C4B5A5] font-medium hidden sm:inline">
              Nhận thông báo ưu đãi mới nhất:
            </span>
            <div className="flex items-center bg-[#2E1810] border border-[#4A2D1F] rounded-full p-1 pl-4 focus-within:border-[#D7A86E] transition-colors">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="bg-transparent text-xs text-white placeholder-[#8D7B6F] focus:outline-none w-44 sm:w-56"
              />
              <button
                type="button"
                className="bg-[#D7A86E] hover:bg-[#C5965C] text-[#24140E] font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <BrewLiteLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white block">
                  BrewLite
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#D7A86E] block -mt-1 font-semibold">
                  Coffee &amp; Tea
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#BCAAA4] leading-relaxed">
              BrewLite là ứng dụng đặt cà phê và thanh toán không tiền mặt tiện lợi. Chúng tôi mang đến những ly cà phê thơm ngon từ hạt cà phê Việt nguyên chất, giúp bạn tiết kiệm thời gian và khởi đầu ngày mới tràn đầy năng lượng.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#321C14] hover:bg-[#D7A86E] hover:text-[#24140E] text-[#D7CCC8] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#321C14] hover:bg-[#D7A86E] hover:text-[#24140E] text-[#D7CCC8] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-[#321C14] hover:bg-[#D7A86E] hover:text-[#24140E] text-[#D7CCC8] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#D7A86E] pl-2.5">
              Thông tin cửa hàng
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-[#BCAAA4]">
              <li className="flex items-start gap-2.5">
                <LocationPinIcon className="w-4 h-4 text-[#D7A86E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Địa chỉ quán:</strong>
                  123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon className="w-4 h-4 text-[#D7A86E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Hotline hỗ trợ:</strong>
                  1900 6868 &bull; 0901 234 567
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[#D7A86E] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>
                  <strong className="text-white block font-medium">Email liên hệ:</strong>
                  contact@brewlite.vn &bull; support@brewlite.vn
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[#D7A86E] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>
                  <strong className="text-white block font-medium">Giờ phục vụ:</strong>
                  07:00 – 22:30 hàng ngày (Kể cả Thứ 7, Chủ Nhật &amp; Ngày Lễ)
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#D7A86E] pl-2.5">
              Khám phá thực đơn
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#BCAAA4]">
              <li>
                <Link href="/#menu" className="hover:text-[#D7A86E] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D7A86E]">&rsaquo;</span> Cà phê sữa &amp; Đen đá
                </Link>
              </li>
              <li>
                <Link href="/#menu" className="hover:text-[#D7A86E] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D7A86E]">&rsaquo;</span> Bạc xỉu ba tầng
                </Link>
              </li>
              <li>
                <Link href="/#menu" className="hover:text-[#D7A86E] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D7A86E]">&rsaquo;</span> Trà đào &amp; Trà trái cây tươi
                </Link>
              </li>
              <li>
                <Link href="/#menu" className="hover:text-[#D7A86E] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D7A86E]">&rsaquo;</span> Trà sữa trân châu &amp; Matcha
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#D7A86E] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D7A86E]">&rsaquo;</span> Tra cứu lịch sử đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/barista" className="hover:text-[#D7A86E] transition-colors flex items-center gap-1.5 text-[#D7A86E]/90">
                  <span className="text-[#D7A86E]">&rsaquo;</span> Cổng Barista (Dành cho nhân viên)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#D7A86E] pl-2.5">
              Thanh toán không tiền mặt
            </h4>
            <p className="text-xs text-[#BCAAA4] leading-relaxed">
              BrewLite tiên phong mô hình gọi món thông minh không dùng tiền mặt, hỗ trợ các phương thức thanh toán điện tử tiện lợi:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-[#2E1810] border border-[#4A2D1F] rounded-xl p-2.5 flex items-center gap-2">
                <BankIcon className="w-4 h-4 text-[#D7A86E] shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-white block">VietQR Pro</span>
                  <span className="text-[9px] text-[#A8988B] block">Chuyển khoản 24/7</span>
                </div>
              </div>

              <div className="bg-[#2E1810] border border-[#4A2D1F] rounded-xl p-2.5 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#A50064] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                  M
                </span>
                <div>
                  <span className="text-[11px] font-bold text-white block">Ví MoMo</span>
                  <span className="text-[9px] text-[#A8988B] block">Quét mã tiện lợi</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1C0F0A] border border-[#3E2417] rounded-xl p-3 flex items-center gap-2.5 mt-3">
              <CoffeeBeanIcon className="w-5 h-5 text-[#D7A86E] shrink-0" />
              <p className="text-[11px] text-[#D7CCC8] leading-tight">
                <strong className="text-white font-medium">Cam kết chất lượng:</strong> 100% hạt Robusta &amp; Arabica sạch, rang mộc chuẩn vị Việt.
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-[#3A2216] bg-[#1A0D08] pb-20 md:pb-6 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8D7B6F]">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} BrewLite Coffee. Bản quyền thuộc về Dự án BrewLite.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[#A8988B]">
            <span className="hover:text-white transition-colors cursor-pointer">
              Chính sách bảo mật
            </span>
            <span>&bull;</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Điều khoản dịch vụ
            </span>
            <span>&bull;</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Quy chế hoạt động
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
