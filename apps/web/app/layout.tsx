import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrewLite — Good Coffee Better Days",
  description: "Ứng dụng đặt cà phê và thanh toán không dùng tiền mặt",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FBF8F2] text-[#1F1F1F] font-sans pb-16 md:pb-0" suppressHydrationWarning>
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
