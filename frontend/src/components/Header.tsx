'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Heart, ShoppingBag, User as UserIcon, Menu as MenuIcon,
  ChevronDown, Sparkles, X, LogOut, Users, Trash2, Globe
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
  const [announcementVisible, setAnnouncementVisible] = useState(true);

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

  const resolveMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <>
      {/* ===== Announcement Bar ===== */}
      {announcementVisible && (
        <div
          className="relative z-50 flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-gray-900"
          style={{ backgroundColor: '#f5e642' }}
        >
          <span>
            ✨ Free shipping on orders over ₹999 &nbsp;·&nbsp; Use code{' '}
            <span className="font-black underline">OURNARA15</span> for 15% off your first order
          </span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ===== Main Header ===== */}
      <header
        className="sticky top-0 z-40 w-full border-b border-gray-100"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#C8B89A" opacity="0.9"/>
                <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#B8A88A" opacity="0.85"/>
                <ellipse cx="40" cy="38" rx="7" ry="9" fill="#D4C4A8" opacity="0.6"/>
              </svg>
              <span
                className="hidden sm:block"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '17px',
                  fontWeight: '400',
                  letterSpacing: '0.14em',
                  color: '#1a1a1a',
                }}
              >
                our nara
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0">
            {/* Shop By Concern Dropdown */}
            <div
              onMouseEnter={() => setShowConcerns(true)}
              onMouseLeave={() => setShowConcerns(false)}
              className="relative"
            >
              <button
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                style={{ letterSpacing: '0.01em' }}
              >
                By Concern
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {showConcerns && (
                <div className="absolute left-0 top-full w-56 rounded-lg border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {CONCERNS.map((c) => (
                    <Link
                      key={c.label}
                      href={`/products?concern=${c.label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowConcerns(false)}
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="text-sm text-gray-700">{c.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Categories */}
            {categoriesLoading ? (
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100 mx-2" />
            ) : (
              categories.map((cat) => {
                const isHighlight = CATEGORY_DISPLAY[cat.slug]?.highlight;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoveredCat(cat.slug)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className="relative"
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`flex items-center gap-0.5 px-4 py-2 text-sm font-medium transition-colors ${
                        isHighlight
                          ? 'text-rose-500 hover:text-rose-600'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={{ letterSpacing: '0.01em' }}
                    >
                      {cat.name}
                      {cat.children?.length > 0 && <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />}
                    </Link>

                    {/* Subcategories Dropdown */}
                    {hoveredCat === cat.slug && cat.children?.length > 0 && (
                      <div className="absolute left-1/2 top-full w-44 -translate-x-1/2 rounded-lg border border-gray-100 bg-white py-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {cat.children.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${sub.slug}`}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
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

            {/* Skin Quiz */}
            <Link
              href="/skin-quiz"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-400 hover:text-rose-500 transition-colors"
              style={{ letterSpacing: '0.01em' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Skin Quiz
            </Link>
          </nav>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-0.5">

            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 w-48 sm:w-60">
                  <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none text-gray-800"
                    autoFocus
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-700" />
                  </button>

                  {searchResults.length > 0 && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 max-h-96 overflow-y-auto z-50">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSearchSelect(item)}
                          className="flex gap-3 items-center rounded-lg p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <img
                            src={resolveMediaUrl(item.images?.[0]?.url)}
                            alt={item.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">{item.brand?.name || 'Brand'}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-800">₹{parseFloat(item.price).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Admin */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="hidden lg:inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Admin
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <div
              onMouseEnter={() => setCartDropOpen(true)}
              onMouseLeave={() => setCartDropOpen(false)}
              className="relative"
            >
              <Link
                href="/cart"
                className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors block"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Cart Dropdown */}
              {cartDropOpen && cartItems.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in duration-150 z-50">
                  <div className="border-b border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-800">Shopping Bag ({cartCount})</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50/50 border-b border-gray-50 last:border-0">
                        <img
                          src={resolveMediaUrl(item.product?.image)}
                          alt={item.product?.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{item.product?.name}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-800">
                            ₹{((item.product?.price || 0) * item.quantity).toFixed(0)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] text-red-400 hover:text-red-600 mt-1 cursor-pointer flex items-center gap-0.5 ml-auto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-3">
                    <div className="flex justify-between items-center mb-3 text-xs font-semibold text-gray-800">
                      <span>Total:</span>
                      <span>₹{cartTotal.toFixed(0)}</span>
                    </div>
                    <Link
                      href="/cart"
                      onClick={() => setCartDropOpen(false)}
                      className="block w-full text-center rounded-lg py-2.5 text-xs font-semibold text-white transition-all"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      View Bag & Checkout
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-0.5">
                <Link
                  href="/profile"
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                  title="My Profile"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all ml-2"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger extra */}
            <button
              className="hidden md:flex p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Mobile Drawer ===== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="flex items-center gap-2">
                <svg width="26" height="26" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#C8B89A" opacity="0.9"/>
                  <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#B8A88A" opacity="0.85"/>
                  <ellipse cx="40" cy="38" rx="7" ry="9" fill="#D4C4A8" opacity="0.6"/>
                </svg>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '15px', letterSpacing: '0.12em', color: '#1a1a1a' }}>our nara</span>
              </span>
              <button onClick={() => setDrawerOpen(false)} className="rounded-md p-1.5 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="my-4">
                <Link
                  href="/auth/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full text-center rounded-lg py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  Sign In / Register
                </Link>
              </div>
            ) : (
              <div className="my-4 flex flex-col gap-1 border-b border-gray-100 pb-4">
                <p className="text-sm font-semibold text-gray-800">Hello, {user?.firstName || 'Beauty Lover'}! 👋</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Shop</p>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex flex-col">
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === cat.slug ? null : cat.slug)}
                      className="flex justify-between items-center py-2.5 text-sm font-medium text-gray-800 hover:text-gray-900"
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
                          className="py-1 text-xs text-gray-600 hover:text-gray-900"
                        >
                          Shop All
                        </Link>
                        {cat.children.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${sub.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="py-1 text-xs text-gray-500 hover:text-gray-900"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href="/skin-quiz"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-rose-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Take Skin Quiz
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Users className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => { handleLogout(); setDrawerOpen(false); }}
                    className="flex items-center gap-2 text-sm font-medium text-red-400 text-left mt-4"
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
