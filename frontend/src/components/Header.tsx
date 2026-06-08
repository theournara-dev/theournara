'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Heart, ShoppingBag, User as UserIcon, Menu as MenuIcon,
  ChevronDown, Sparkles, X, LogOut, Bell, Users, Trash2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';

const CONCERNS = [
  { label: 'Anti-Aging', icon: '🕐' },
  { label: 'Acne & Blemishes', icon: '🌿' },
  { label: 'Hydration', icon: '💧' },
  { label: 'Brightening', icon: '✨' },
  { label: 'Dark Circles', icon: '👁️' },
  { label: 'Sensitive Skin', icon: '🌸' },
];

const CATEGORY_DISPLAY: Record<string, { emoji: string; highlight?: boolean }> = {
  'korean-beauty': { emoji: '✨', highlight: true },
  skincare: { emoji: '🧴' },
  makeup: { emoji: '💄' },
  'hair-care': { emoji: '💇' },
  tools: { emoji: '🛠️' },
};

function formatCategoryName(slug: string) {
  if (!slug) return '';
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, accessToken, logout } = useAuthStore();
  const { items: cartItems, removeItem } = useCartStore();
  
  const isAuthenticated = !!accessToken;
  const isAdmin = user?.roles?.some((r: any) => r === 'Admin' || r?.role?.name === 'Admin') || false;

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [showConcerns, setShowConcerns] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [cartDropOpen, setCartDropOpen] = useState(false);

  // Dynamic categories
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        // The API returns the category tree.
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        setSearchResults(res.data.data.products || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click away listener for search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (product: any) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/products/${product.slug}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Helper to resolve product image URL
  const resolveMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Logo & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-purple-950 md:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center gap-1.5">
              {/* our nara SVG logo */}
              <svg width="36" height="36" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left leaf */}
                <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#C8B89A" opacity="0.9"/>
                {/* Right leaf */}
                <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#B8A88A" opacity="0.85"/>
                {/* Center overlap highlight */}
                <ellipse cx="40" cy="38" rx="7" ry="9" fill="#D4C4A8" opacity="0.6"/>
              </svg>
              <span className="hidden sm:flex flex-col leading-none">
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: '400', letterSpacing: '0.12em', color: '#2C2524' }}>our nara</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Shop By Concern Dropdown */}
            <div
              onMouseEnter={() => setShowConcerns(true)}
              onMouseLeave={() => setShowConcerns(false)}
              className="relative"
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-purple-50/50 hover:text-purple-950 transition-colors">
                Shop By Concern
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
              {showConcerns && (
                <div className="absolute left-0 top-full w-60 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {CONCERNS.map((c) => (
                    <Link
                      key={c.label}
                      href={`/products?concern=${c.label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-purple-50/50 transition-colors"
                      onClick={() => setShowConcerns(false)}
                    >
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-sm font-medium text-gray-700 hover:text-purple-950">{c.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Categories */}
            {categoriesLoading ? (
              <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
            ) : (
              categories.map((cat) => {
                const display = CATEGORY_DISPLAY[cat.slug] || { emoji: '🧴' };
                const isHighlight = display.highlight;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoveredCat(cat.slug)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className="relative"
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        isHighlight
                          ? 'text-pink-500 hover:bg-pink-50/50'
                          : 'text-gray-800 hover:bg-purple-50/50 hover:text-purple-950'
                      }`}
                    >
                      {cat.name}
                      {cat.children?.length > 0 && <ChevronDown className="h-4 w-4 opacity-70" />}
                    </Link>

                    {/* Subcategories Dropdown */}
                    {hoveredCat === cat.slug && cat.children?.length > 0 && (
                      <div className="absolute left-1/2 top-full w-48 -translate-x-1/2 rounded-xl border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {cat.children.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${sub.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50/50 hover:text-purple-950 transition-colors font-medium"
                            onClick={() => setHoveredCat(null)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Skin Quiz Link */}
            <Link
              href="/skin-quiz"
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-1.5 text-xs font-bold text-pink-500 border border-pink-100 hover:scale-102 hover:border-pink-200 transition-all shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Skin Quiz
            </Link>
          </nav>

          {/* Right: Actions (Search, Admin, User, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center rounded-full border border-purple-950/20 bg-gray-50 px-3 py-1.5 w-48 sm:w-64">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none text-gray-800"
                    autoFocus
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                    <X className="h-4 w-4 text-gray-400 hover:text-purple-950" />
                  </button>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 max-h-96 overflow-y-auto">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSearchSelect(item)}
                          className="flex gap-3 items-center rounded-lg p-2 hover:bg-purple-50/50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <img
                            src={resolveMediaUrl(item.images?.[0]?.url)}
                            alt={item.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">{item.brand?.name || 'Brand'}</p>
                          </div>
                          <span className="text-xs font-bold text-purple-950">${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Admin Dashboard Trigger */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="hidden lg:inline-flex items-center justify-center rounded-full border border-purple-950 px-4 py-1.5 text-xs font-bold text-purple-950 hover:bg-purple-50 transition-all"
              >
                Admin Panel
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart Icon and Preview */}
            <div
              onMouseEnter={() => setCartDropOpen(true)}
              onMouseLeave={() => setCartDropOpen(false)}
              className="relative"
            >
              <Link
                href="/cart"
                className="relative rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors block"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-extrabold text-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Cart Dropdown */}
              {cartDropOpen && cartItems.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in duration-150">
                  <div className="border-b border-gray-100 bg-gray-50/50 p-3">
                    <p className="text-xs font-extrabold text-gray-800">Your Shopping Bag ({cartCount})</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-purple-50/20 border-b border-gray-50 last:border-0">
                        <img
                          src={resolveMediaUrl(item.product?.image)}
                          alt={item.product?.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{item.product?.name}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-purple-950">
                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] text-red-500 hover:underline mt-1 cursor-pointer flex items-center gap-0.5 ml-auto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-3">
                    <div className="flex justify-between items-center mb-3 text-xs font-bold text-gray-800">
                      <span>Total:</span>
                      <span className="text-purple-950">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Link
                      href="/cart"
                      onClick={() => setCartDropOpen(false)}
                      className="block w-full text-center rounded-xl bg-gradient-to-r from-purple-950 to-purple-900 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-purple-900 hover:to-purple-850 hover:shadow-lg transition-all"
                    >
                      Checkout Bag
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Authenticated Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/profile"
                  className="rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  title="My Profile"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-purple-950 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-900 hover:shadow-lg transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          
          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1.5">
                <svg width="28" height="28" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#C8B89A" opacity="0.9"/>
                  <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#B8A88A" opacity="0.85"/>
                  <ellipse cx="40" cy="38" rx="7" ry="9" fill="#D4C4A8" opacity="0.6"/>
                </svg>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: '400', letterSpacing: '0.12em', color: '#2C2524' }}>our nara</span>
              </span>
              <button onClick={() => setDrawerOpen(false)} className="rounded-md p-1.5 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Action buttons inside drawer */}
            {!isAuthenticated ? (
              <div className="my-4">
                <Link
                  href="/auth/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full text-center rounded-xl bg-purple-950 py-3 text-sm font-extrabold text-white shadow"
                >
                  Sign In / Register
                </Link>
              </div>
            ) : (
              <div className="my-4 flex flex-col gap-1 border-b border-gray-100 pb-4">
                <p className="text-sm font-extrabold text-gray-800">Hello, {user?.firstName || 'Beauty Lover'}! 👋</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Collections</p>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex flex-col">
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === cat.slug ? null : cat.slug)}
                      className="flex justify-between items-center py-2 text-sm font-bold text-gray-800 hover:text-purple-950"
                    >
                      <span>{CATEGORY_DISPLAY[cat.slug]?.emoji || '📦'} {cat.name}</span>
                      {cat.children?.length > 0 && (
                        <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedMobile === cat.slug ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {expandedMobile === cat.slug && cat.children?.length > 0 && (
                      <div className="flex flex-col pl-6 border-l border-gray-100 gap-2 mt-1">
                        <Link
                          href={`/products?category=${cat.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="py-1 text-xs text-gray-600 font-semibold hover:text-purple-950"
                        >
                          Shop All
                        </Link>
                        {cat.children.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${sub.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="py-1 text-xs text-gray-500 hover:text-purple-950"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Secondary links */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href="/skin-quiz"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-pink-500"
                >
                  <Sparkles className="h-4 w-4" />
                  Take Skin Quiz
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2 text-sm font-bold text-purple-950"
                  >
                    <Users className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => { handleLogout(); setDrawerOpen(false); }}
                    className="flex items-center gap-2 text-sm font-semibold text-red-500 text-left mt-4"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
