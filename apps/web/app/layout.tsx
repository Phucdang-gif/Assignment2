import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import PwaRegister from '@/components/PwaRegister';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3E2723",
};

export const metadata: Metadata = {
  applicationName: "BrewLite",
  title: "BrewLite — Good Coffee Better Days",
  description: "Ứng dụng đặt cà phê và thanh toán không dùng tiền mặt",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BrewLite",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <PwaRegister />
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
