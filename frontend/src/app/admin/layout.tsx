'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Heart, LogOut, Menu as MenuIcon,
  Sparkles, ChevronLeft, MessageSquare, Tag, BarChart3, Ticket, Zap, Users, User as UserIcon,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="h-5 w-5" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Coupons', path: '/admin/coupons', icon: <Ticket className="h-5 w-5" /> },
  { label: 'Flash Sales', path: '/admin/flash-sales', icon: <Zap className="h-5 w-5" /> },
  { label: 'Customers', path: '/admin/customers', icon: <Users className="h-5 w-5" /> },
  { label: 'Wishlist Insights', path: '/admin/wishlist', icon: <Heart className="h-5 w-5" /> },
  { label: 'Reviews & Feedback', path: '/admin/reviews', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Offers & Promos', path: '/admin/offers', icon: <Tag className="h-5 w-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=' + pathname);
    } else if (!user.roles.some(r => r.toLowerCase() === 'admin')) {
      alert('Access Denied: Admin role required.');
      router.push('/');
    } else {
      setAuthorized(true);
    }
  }, [user, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#2d1b69] text-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 border-b border-white/5 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-pink-400 shadow-md">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black tracking-tight leading-none">EcomBeauty</p>
          <span className="text-[10px] text-white/50 font-bold mt-0.5 block">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="text-white/40 hover:text-white md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-grow overflow-y-auto px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all relative ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={active ? 'text-pink-500' : 'text-white/50'}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {active && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded bg-pink-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Information & Logouts */}
      <div className="border-t border-white/5 p-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 font-extrabold text-sm text-white">
            {(user?.firstName || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</p>
            <span className="text-[10px] text-white/40 font-bold truncate block">Administrator</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-white/40" />
          Logout
        </button>
        
        <Link
          href="/"
          className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors block"
        >
          <Sparkles className="h-4.5 w-4.5 text-white/40" />
          Back to Store
        </Link>
      </div>
    </div>
  );

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f4f3f8] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2d1b69]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3f8] flex">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-20 border-r border-gray-100 shadow-xl shadow-[#2d1b69]/5">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 flex flex-col bg-[#2d1b69] animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-100 items-center px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[#2d1b69] hover:bg-gray-100 p-2 rounded-lg"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-extrabold text-[#2d1b69] ml-2">EcomBeauty Admin Panel</span>
        </header>

        {/* Inner Page View */}
        <div className="p-4 sm:p-6 lg:p-8 flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
