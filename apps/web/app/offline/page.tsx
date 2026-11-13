'use client';

import Link from 'next/link';
import { BrewLiteLogo } from '@/components/Icons';

export default function OfflinePage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-[#3E2723]/10">
        <BrewLiteLogo className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-[#3E2723] mb-3">
        Bạn đang ngoại tuyến
      </h1>
      <p className="text-[#6B5B53] max-w-md mb-8 text-sm sm:text-base">
        Không thể kết nối đến máy chủ BrewLite. Vui lòng kiểm tra lại kết nối Wi-Fi hoặc dữ liệu di động để tiếp tục xem menu và đặt món.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-[#3E2723] text-[#FBF8F2] font-semibold text-sm hover:bg-[#2E1C12] transition-colors cursor-pointer"
        >
          Thử kết nối lại
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-[#E8DFD8] bg-white text-[#3E2723] font-semibold text-sm hover:bg-[#F5F0E6] transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
