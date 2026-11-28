'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchCategories } from '@/services/categoryService';
import {
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminToppings,
  fetchAdminUsers,
} from '@/services/adminService';
import { AdminOrder, AdminUser, Category, Product, ToppingItem } from '@/types/types';
import { BrewLiteLogo } from '@/components/Icons';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminCategoriesTab from '@/components/admin/AdminCategoriesTab';
import AdminToppingsTab from '@/components/admin/AdminToppingsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';

type AdminTab = 'overview' | 'products' | 'categories' | 'toppings' | 'orders' | 'users';

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Tổng quan', icon: '📊' },
  { id: 'products', label: 'Sản phẩm', icon: '☕' },
  { id: 'categories', label: 'Danh mục', icon: '🏷️' },
  { id: 'toppings', label: 'Topping', icon: '🧋' },
  { id: 'orders', label: 'Đơn hàng', icon: '🧾' },
  { id: 'users', label: 'Người dùng', icon: '👥' },
];

const USERS_PAGE_SIZE = 10;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toppings, setToppings] = useState<ToppingItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const isAdmin = isMounted && user?.role === 'admin';

  const loadUsers = useCallback(
    async (pageToLoad: number) => {
      if (!token || user?.role !== 'admin') return;
      try {
        const userRes = await fetchAdminUsers(pageToLoad, USERS_PAGE_SIZE);
        const items = userRes.items || [];
        const total = userRes.total || 0;
        if (items.length === 0 && pageToLoad > 1 && total > 0) {
          const prevPage = pageToLoad - 1;
          setUsersPage(prevPage);
          const prevRes = await fetchAdminUsers(prevPage, USERS_PAGE_SIZE);
          setUsers(prevRes.items || []);
          setUsersTotal(prevRes.total || 0);
          return;
        }
        setUsers(items);
        setUsersTotal(total);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Không thể tải danh sách người dùng';
        setError(message);
      }
    },
    [token, user?.role],
  );

  const loadAllData = useCallback(
    async (pageToLoad = 1) => {
      if (!token || user?.role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [prodList, catList, topList, orderList, userRes] = await Promise.all([
          fetchAdminProducts(),
          fetchCategories(),
          fetchAdminToppings(),
          fetchAdminOrders('ALL'),
          fetchAdminUsers(pageToLoad, USERS_PAGE_SIZE),
        ]);

        setProducts(prodList);
        setCategories(catList);
        setToppings(topList);
        setOrders(orderList);
        const items = userRes.items || [];
        const total = userRes.total || 0;
        if (items.length === 0 && pageToLoad > 1 && total > 0) {
          const prevPage = pageToLoad - 1;
          setUsersPage(prevPage);
          const prevRes = await fetchAdminUsers(prevPage, USERS_PAGE_SIZE);
          setUsers(prevRes.items || []);
          setUsersTotal(prevRes.total || 0);
        } else {
          setUsers(items);
          setUsersTotal(total);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Không thể tải dữ liệu quản trị';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [token, user?.role],
  );

  useEffect(() => {
    if (isMounted) {
      loadAllData(1);
    }
  }, [isMounted, loadAllData]);

  const handleUsersPageChange = (nextPage: number) => {
    setUsersPage(nextPage);
    void loadUsers(nextPage);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#fbf8f2] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#8D6E63]">Đang tải...</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#fbf8f2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E8DFD8] p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <BrewLiteLogo className="w-12 h-12 mx-auto" />
          <h1 className="text-xl font-extrabold text-[#3E2723]">
            Yêu cầu đăng nhập
          </h1>
          <p className="text-sm text-[#5C4D44]">
            Vui lòng đăng nhập bằng tài khoản Quản trị viên (Admin) để truy cập bảng điều khiển.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#2E1C12]"
            >
              Đăng nhập
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm font-semibold text-[#5C4D44] hover:bg-[#F5F0E6]"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#fbf8f2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E8DFD8] p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            403
          </div>
          <h1 className="text-xl font-extrabold text-[#3E2723]">
            Không có quyền truy cập
          </h1>
          <p className="text-sm text-[#5C4D44]">
            Tài khoản <span className="font-semibold">{user.email}</span> ({user.role}) không có quyền quản trị hệ thống.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#2E1C12]"
            >
              Về trang chủ
            </Link>
            {user.role === 'barista' && (
              <Link
                href="/barista"
                className="px-5 py-2.5 rounded-xl border border-[#E8DFD8] text-sm font-semibold text-[#3E2723] hover:bg-[#F5F0E6]"
              >
                Quầy Barista
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#1f1f1f] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-[#E8DFD8] p-5 justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrewLiteLogo className="w-8 h-8" />
            <div>
              <span className="font-extrabold text-xl text-[#3E2723] block leading-none">
                BrewLite
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8D6E63]">
                Admin Portal
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#3E2723] text-white shadow-xs'
                    : 'text-[#5C4D44] hover:bg-[#F5F0E6] hover:text-[#3E2723]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E8DFD8] space-y-2">
          <div className="px-2 py-1.5">
            <p className="text-xs text-[#8D6E63]">Quản trị viên</p>
            <p className="text-xs font-bold text-[#3E2723] truncate">{user.email}</p>
          </div>
          <Link
            href="/barista"
            className="block w-full text-center px-3 py-2 rounded-xl border border-[#E8DFD8] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6]"
          >
            Mở Quầy Barista
          </Link>
          <Link
            href="/"
            className="block w-full text-center px-3 py-2 rounded-xl border border-[#E8DFD8] text-xs font-semibold text-[#5C4D44] hover:bg-[#F5F0E6]"
          >
            ← Về cửa hàng
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E8DFD8] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#3E2723]">
              {TABS.find((t) => t.id === activeTab)?.icon}{' '}
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-[#8D6E63] hidden sm:block">
              Quản lý vận hành, thực đơn, đơn hàng và tài khoản BrewLite
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAllData(usersPage)}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-[#E8DFD8] bg-[#FDFBF7] text-xs font-semibold text-[#3E2723] hover:bg-[#F5F0E6] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang tải...' : '↻ Đồng bộ'}
            </button>
            <Link
              href="/"
              className="lg:hidden px-3.5 py-2 rounded-xl border border-[#E8DFD8] text-xs font-semibold text-[#5C4D44]"
            >
              Trang chủ
            </Link>
          </div>
        </header>

        {/* Mobile Tabs */}
        <div className="lg:hidden bg-white border-b border-[#E8DFD8] px-4 py-2.5 flex gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#3E2723] text-white'
                  : 'bg-[#F5F0E6] text-[#5C4D44]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => loadAllData(usersPage)}
                className="text-xs font-bold underline cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}

          {loading && products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8DFD8] p-12 text-center text-sm text-[#8D6E63]">
              Đang tải dữ liệu hệ thống...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <AdminOverviewTab
                  orders={orders}
                  products={products}
                  categories={categories}
                  toppings={toppings}
                  totalUsers={usersTotal}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'products' && (
                <AdminProductsTab
                  products={products}
                  categories={categories}
                  onRefresh={() => loadAllData(usersPage)}
                  onNotify={notify}
                />
              )}

              {activeTab === 'categories' && (
                <AdminCategoriesTab
                  categories={categories}
                  products={products}
                  onRefresh={() => loadAllData(usersPage)}
                  onNotify={notify}
                />
              )}

              {activeTab === 'toppings' && (
                <AdminToppingsTab
                  toppings={toppings}
                  onRefresh={() => loadAllData(usersPage)}
                  onNotify={notify}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrdersTab
                  orders={orders}
                  onRefresh={() => loadAllData(usersPage)}
                />
              )}

              {activeTab === 'users' && (
                <AdminUsersTab
                  users={users}
                  total={usersTotal}
                  page={usersPage}
                  limit={USERS_PAGE_SIZE}
                  currentUserId={user.id}
                  onPageChange={handleUsersPageChange}
                  onRefresh={() => loadUsers(usersPage)}
                  onNotify={notify}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
