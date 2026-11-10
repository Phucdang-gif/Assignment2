"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from '@/hooks/useProducts';
import { fetchCategories } from '@/services/categoryService';
import { Category } from '@/types/types';
import {
  CoffeeCupIcon,
  CardIcon,
  PlusIcon,
  ArrowRightIcon,
  SearchIcon,
} from '@/components/Icons';

function HomeContent() {
  const searchParams = useSearchParams();

  const { products: apiProducts, isLoading } = useProducts();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchCategories().then(setCategories).catch((error) => {
      console.error("Lỗi khi lấy danh mục:", error);
      setCategories([]);
    });
  }, []);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return apiProducts.filter((p) => {
      const matchCategory =
        selectedCategory === "ALL" || p.categoryId === selectedCategory;
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(search) ||
        (p.category?.name.toLowerCase().includes(search) ?? false);
      return matchCategory && matchSearch;
    });
  }, [apiProducts, selectedCategory, searchTerm]);

  return (
    <main className="w-full min-h-screen bg-[#FBF8F2] text-[#1F1F1F]">
      <section className="relative w-full overflow-hidden bg-[#24130A] shadow-xl">
        <div className="relative w-full aspect-[16/7] sm:aspect-[21/9] lg:aspect-[1024/450] min-h-[360px] sm:min-h-[440px] md:min-h-[500px] overflow-hidden">
          <img
            src="/hero-banner.png"
            alt="Good Coffee Better Days - BrewLite"
            className="w-full h-full object-cover object-right sm:object-center transition-transform duration-700 hover:scale-[1.01]"
          />

          <div className="absolute inset-0 flex items-center z-10 pointer-events-none">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
              <div className="max-w-md sm:max-w-lg md:max-w-xl space-y-3 sm:space-y-4 md:space-y-5 pointer-events-auto select-none pb-6 sm:pb-8">
                <h1 className="font-black text-white text-3xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-[1.08] drop-shadow-lg">
                  Good Coffee
                  <br />
                  Better Days
                </h1>

                <p className="text-[#EADBC8] text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed drop-shadow max-w-sm sm:max-w-md">
                  Những ly cà phê tuyệt hảo, khởi đầu cho những điều tuyệt vời.
                </p>

                <div className="pt-1.5 sm:pt-2">
                  <a
                    href="#menu"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("menu")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 sm:gap-2.5 px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#C76F26] via-[#B85F18] to-[#974709] hover:from-[#D87D30] hover:to-[#A85312] text-white font-bold text-xs sm:text-sm md:text-base shadow-xl shadow-amber-950/50 hover:shadow-amber-900/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-amber-400/30 group"
                    title="Khám phá menu"
                    aria-label="Khám phá menu"
                  >
                    <span>Khám phá menu</span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        <section className="relative z-10 -mt-14 sm:-mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/95 backdrop-blur-sm border border-[#E8DFD8] rounded-2xl p-5 sm:p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F5F0E6] text-[#3E2723] flex items-center justify-center shrink-0">
              <CoffeeCupIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#3E2723]">
                Cà phê chất lượng
              </h3>
              <p className="text-xs sm:text-sm text-[#756C65] mt-0.5 leading-snug">
                Hương vị tuyệt hảo từ những hạt cà phê chọn lọc
              </p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm border border-[#E8DFD8] rounded-2xl p-5 sm:p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F5F0E6] text-[#3E2723] flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#3E2723]">
                Nhận nhanh tại quầy
              </h3>
              <p className="text-xs sm:text-sm text-[#756C65] mt-0.5 leading-snug">
                Không cần xếp hàng, nhận món ngay khi sẵn sàng
              </p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm border border-[#E8DFD8] rounded-2xl p-5 sm:p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F5F0E6] text-[#3E2723] flex items-center justify-center shrink-0">
              <CardIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#3E2723]">
                Thanh toán tiện lợi
              </h3>
              <p className="text-xs sm:text-sm text-[#756C65] mt-0.5 leading-snug">
                Ví điện tử, thẻ, QR Chuyển khoản linh hoạt
              </p>
            </div>
          </div>
        </section>

        <section id="menu" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3E2723] tracking-tight">
              Menu
            </h2>
            <p className="text-sm sm:text-base text-[#756C65]">
              Khám phá những ly đồ uống tuyệt vời của chúng tôi
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E8DFD8] pb-5">
            <div className="flex flex-wrap items-center gap-2">
              {[{ id: "ALL" as const, label: "Tất cả" }, ...categories.map((cat) => ({ id: cat.id, label: cat.name }))].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#3E2723] text-white shadow-md shadow-[#3E2723]/20"
                        : "bg-white text-[#5C4D44] border border-[#E8DFD8] hover:bg-[#F5F0E6] hover:text-[#3E2723]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-64 relative">
              <SearchIcon className="w-4 h-4 text-[#8D6E63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm đồ uống..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E8DFD8] rounded-full pl-9 pr-4 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#8D6E63] focus:border-[#8D6E63]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFD8] p-8">
              <div className="w-8 h-8 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#8D6E63]">
                Đang tải dữ liệu từ cửa hàng...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFD8] p-8">
              <CoffeeCupIcon className="w-12 h-12 text-[#D7A86E] mx-auto mb-3" />
              <p className="text-lg font-bold text-[#3E2723]">
                Không tìm thấy đồ uống phù hợp
              </p>
              <p className="text-sm text-[#756C65] mt-1">
                Hãy thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchTerm("");
                }}
                className="mt-4 inline-block text-xs font-bold text-[#3E2723] underline"
              >
                Xem tất cả món
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D7A86E] transition-all duration-300 flex flex-col"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="relative block w-full aspect-square bg-[#F5F0E6] overflow-hidden"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${product.id}`}
                        className="font-bold text-base text-[#2E1810] group-hover:text-[#8D6E63] transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="text-xs text-[#756C65] mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-[#8D6E63] mt-2">
                        {Number(product.price).toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    <div className="pt-3 mt-2 flex items-center justify-between border-t border-gray-100">
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs font-semibold text-[#8D6E63] hover:text-[#3E2723] hover:underline"
                      >
                        Tùy chọn size & topping
                      </Link>

                      <Link
                        href={`/product/${product.id}`}
                        aria-label={`Thêm ${product.name}`}
                        className="w-8 h-8 rounded-full bg-[#3E2723] hover:bg-[#2E1C12] text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          id="about"
          className="bg-[#F5F0E6] rounded-3xl p-8 sm:p-12 border border-[#E8DFD8] scroll-mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8D6E63]">
                Về thương hiệu BrewLite
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723]">
                Hạt cà phê nguyên bản, trải nghiệm đặt món tiện lợi
              </h2>
              <p className="text-sm text-[#5C4D44] leading-relaxed">
                BrewLite được sinh ra với sứ mệnh mang lại những ly cà phê
                nguyên chất tuyệt hảo nhất, cùng với giải pháp thanh toán không
                dùng tiền mặt hiện đại. Tiết kiệm thời gian, chọn vị yêu thích
                và thưởng thức từng khoảnh khắc trọn vẹn.
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-[#3E2723]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D7A86E]" />
                  <span>100% Cà phê sạch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D7A86E]" />
                  <span>Thanh toán QR / Thẻ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D7A86E]" />
                  <span>Nhận nhanh tại quầy</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-[#3E2723]">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80"
                alt="BrewLite Roasting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center text-sm text-[#756C65]">
          Đang tải...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
