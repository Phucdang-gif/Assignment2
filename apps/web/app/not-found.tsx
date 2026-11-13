import Link from 'next/link';
import { CoffeeCupIcon } from '@/components/Icons';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FBF8F2]">
      <div className="max-w-md w-full bg-white border border-[#E8DFD8] rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#F5F0E6] text-[#8D6E63] flex items-center justify-center mx-auto shadow-inner">
          <CoffeeCupIcon className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            Lỗi 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723]">
            Không tìm thấy trang
          </h1>
          <p className="text-sm text-[#756C65] leading-relaxed">
            Ly cà phê bạn đang tìm có vẻ chưa được pha chế hoặc đường dẫn đã thay đổi. Hãy quay lại menu để thưởng thức những món thơm ngon khác nhé!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/#menu"
            className="flex-1 bg-[#3E2723] hover:bg-[#2E1C12] text-white font-bold py-3 px-4 rounded-xl text-center text-sm transition shadow-md shadow-[#3E2723]/20"
          >
            Khám phá Menu
          </Link>
          <Link
            href="/cart"
            className="flex-1 bg-[#FDFBF7] hover:bg-[#F5F0E6] text-[#3E2723] border border-[#E8DFD8] font-bold py-3 px-4 rounded-xl text-center text-sm transition"
          >
            Xem giỏ hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
