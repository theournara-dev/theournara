'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Heart, Star, Zap, Clock, Tag } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

// ─── Hero Slides ────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'NATURE IN EVERY DROP OF CARE',
    heading: 'Clean Daily\nSkincare',
    body: 'Gentle ingredients make it light enough for daily use\ndelivering only the moisture and comfort your skin needs',
    cta: 'View More',
    ctaHref: '/products',
    bg: '#dde5ef',
    image: '/hero_slide_1.png',
    imageAlt: 'Korean skincare model with serums',
  },
  {
    id: 2,
    eyebrow: 'A GENTLE CHOICE FOR COMFORTABLE SKIN',
    heading: 'Radiant Glow\nEssentials',
    body: 'Refreshing hydration gently wraps the skin\nleaving it fresh and soft throughout the day',
    cta: 'Shop Now',
    ctaHref: '/products?category=skincare',
    bg: '#f0ebe3',
    image: '/hero_slide_2.png',
    imageAlt: 'Korean beauty model holding skin cream',
  },
  {
    id: 3,
    eyebrow: 'PREMIUM FORMULATION',
    heading: 'Serum &\nAmpoule Edit',
    body: 'Science-backed actives in minimalist packaging\nfor visibly healthier skin in just 4 weeks',
    cta: 'Explore',
    ctaHref: '/products?category=korean-beauty',
    bg: '#eee8e0',
    image: '/hero_slide_3.png',
    imageAlt: 'Premium serum bottles product photography',
  },
];

// ─── Static category circle data (supplemented with API) ─────────────────────
const STATIC_CATEGORIES = [
  { slug: 'new', label: 'NEW 5%', bg: '#3d3830', textColor: '#fff', image: null },
  { slug: 'skincare', label: 'SKIN', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'makeup', label: 'MAKEUP', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'cleansing', label: 'WASH', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'sun-care', label: 'SUN', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'body', label: 'BODY', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'hair-care', label: 'HAIR', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'fragrance', label: 'FRAGRANCE', bg: '#f4f1ec', textColor: '#333', image: null },
  { slug: 'diffuser', label: 'DIFFUSER', bg: '#f4f1ec', textColor: '#333', image: null },
];

export default function Home() {
  const router = useRouter();
  const { addItem } = useCartStore();

  // State
  const [products, setProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((idx: number) => {
    setCurrentSlide((idx + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const resetTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [resetTimer]);

  // Fetch data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, categoriesRes, offersRes, flashRes] = await Promise.all([
          api.get('/products?limit=50'),
          api.get('/categories'),
          api.get('/marketing/offers/active').catch(() => ({ data: { data: [] } })),
          api.get('/marketing/flash-sales/active').catch(() => ({ data: { data: [] } })),
        ]);

        const allProducts = productsRes.data?.data?.products || [];
        setProducts(allProducts);
        setNewProducts(allProducts.slice(4, 8));
        setCategories(categoriesRes.data?.data || []);
        setActiveOffers(offersRes.data?.data || []);
        setFlashSales(flashRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load home page data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const resolveMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=Product';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.[0];
    const image = product.images?.[0]?.url || product.imageUrl || '';
    addItem({
      id: variant?.id || product.id,
      variantId: variant?.id || product.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image,
      },
    });
    alert('Added to bag! 🛍️');
  };

  // Build category circles from API + static list
  const categoryCircles = (() => {
    if (categories.length === 0) return STATIC_CATEGORIES;
    const apiCats = categories.map((c: any) => ({
      slug: c.slug,
      label: c.name.toUpperCase(),
      bg: '#f4f1ec',
      textColor: '#333',
      image: c.imageUrl || null,
    }));
    return [
      { slug: 'new', label: 'NEW 5%', bg: '#3d3830', textColor: '#fff', image: null },
      ...apiCats,
    ];
  })();

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div style={{ backgroundColor: '#fafaf8', fontFamily: 'Inter, sans-serif' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO SLIDER
      ═══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: slide.bg, transition: 'background-color 0.6s ease', minHeight: '520px' }}
      >
        {/* Slides wrapper */}
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 flex items-center min-h-[520px]">

          {/* Left: Text */}
          <div className="relative z-10 flex flex-col justify-center py-16 w-full md:w-1/2">
            <p
              className="text-xs font-semibold tracking-widest mb-5 opacity-70"
              style={{ color: '#1a1a1a', letterSpacing: '0.18em' }}
            >
              {slide.eyebrow}
            </p>
            <h1
              className="font-black mb-5 leading-tight"
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                color: '#1a1a1a',
                whiteSpace: 'pre-line',
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '800',
              }}
            >
              {slide.heading}
            </h1>
            <p
              className="text-sm leading-relaxed mb-10 opacity-75 max-w-xs"
              style={{ color: '#1a1a1a', whiteSpace: 'pre-line' }}
            >
              {slide.body}
            </p>
            <div>
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:scale-105"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  padding: '14px 36px',
                  letterSpacing: '0.02em',
                }}
              >
                {slide.cta}
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="hidden md:flex items-end justify-center absolute right-0 bottom-0 w-1/2 h-full pointer-events-none">
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.imageAlt}
              className="object-contain object-bottom"
              style={{
                maxHeight: '500px',
                width: '100%',
                animation: 'fadeSlideIn 0.5s ease forwards',
              }}
            />
          </div>
        </div>

        {/* Prev / Next */}
        <button
          onClick={() => { goToSlide(currentSlide - 1); resetTimer(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={() => { goToSlide(currentSlide + 1); resetTimer(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>

        {/* Slide counter pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          <div
            className="rounded-full px-5 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(6px)', color: '#1a1a1a' }}
          >
            {currentSlide + 1} / {HERO_SLIDES.length}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════
          FLASH SALE STRIP (conditional)
      ═══════════════════════════════════════════════════════ */}
      {flashSales.length > 0 && (
        <div
          className="py-3 text-center text-sm font-semibold flex items-center justify-center gap-3"
          style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
        >
          <Zap className="h-4 w-4 text-yellow-400" />
          <span>Flash Sale: {flashSales[0]?.title} — {flashSales[0]?.discountPercentage}% OFF</span>
          <Link href="/products" className="underline text-yellow-400 text-xs font-bold">
            Shop Deal →
          </Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          CATEGORY CIRCLES
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-5 overflow-x-auto scrollbar-none pb-2 justify-start md:justify-center">
            {categoryCircles.map((cat, idx) => (
              <Link
                key={cat.slug + idx}
                href={cat.slug === 'new' ? '/products?sort=newest' : `/products?category=${cat.slug}`}
                className="category-circle flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                {/* Circle */}
                <div
                  className="relative flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow"
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: cat.bg,
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {cat.image ? (
                    <img
                      src={resolveMediaUrl(cat.image)}
                      alt={cat.label}
                      className="product-img h-full w-full object-cover"
                    />
                  ) : cat.slug === 'new' ? (
                    <span className="text-center text-xs font-black leading-tight" style={{ color: cat.textColor }}>
                      NEW<br />5%
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-center px-1" style={{ color: '#888' }}>
                      {cat.label}
                    </span>
                  )}
                </div>
                {/* Label */}
                <span
                  className="text-[11px] font-medium tracking-wider text-center"
                  style={{ color: '#555', letterSpacing: '0.08em' }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          RECOMMENDED PRODUCTS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: '#f5f4f0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="font-bold text-2xl mb-1"
                style={{ color: '#1a1a1a', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}
              >
                Recommended products
              </h2>
              <p className="text-sm" style={{ color: '#999' }}>Handpicked just for you</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-xs font-medium hover:gap-2 transition-all"
              style={{ color: '#666' }}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-2xl bg-white p-4 space-y-4">
                  <div className="h-52 w-full rounded-xl bg-gray-100" />
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-4 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => {
                const imgUrl = product.images?.[0]?.url || product.imageUrl || '';
                const originalPrice = parseFloat(product.price);
                const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > originalPrice;
                const discountPct = hasDiscount
                  ? Math.round(((parseFloat(product.compareAtPrice) - originalPrice) / parseFloat(product.compareAtPrice)) * 100)
                  : 0;
                return (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className="product-card group relative flex flex-col rounded-2xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
                    style={{ border: '1px solid #ebebeb' }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ backgroundColor: '#f5f4f0', aspectRatio: '1/1' }}>
                      <img
                        src={resolveMediaUrl(imgUrl)}
                        alt={product.name}
                        className="product-img h-full w-full object-cover"
                      />

                      {/* Badges */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span
                          className="absolute top-3 left-3 rounded text-[9px] font-bold px-2 py-0.5"
                          style={{ backgroundColor: '#ff6b35', color: '#fff' }}
                        >
                          Only {product.stock} left
                        </span>
                      )}
                      {hasDiscount && (
                        <span
                          className="absolute top-3 left-3 rounded text-[9px] font-bold px-2 py-0.5"
                          style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
                        >
                          {discountPct}%
                        </span>
                      )}

                      {/* Hover actions */}
                      <div className="product-card-overlay absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 px-3">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold text-white shadow-lg transition-colors"
                          style={{ backgroundColor: '#1a1a1a' }}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Bag
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: '#aaa' }}>
                        {product.brand?.name || 'our nara'}
                      </p>
                      <h3 className="text-sm font-medium line-clamp-2 leading-snug mb-3" style={{ color: '#1a1a1a' }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-xs line-through" style={{ color: '#bbb' }}>
                            ₹{parseFloat(product.compareAtPrice).toFixed(0)}
                          </span>
                        )}
                        <span className="text-sm font-bold" style={{ color: hasDiscount ? '#e53935' : '#1a1a1a' }}>
                          ₹{originalPrice.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-medium border-b border-gray-400 pb-0.5"
              style={{ color: '#555' }}
            >
              View all products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          EDITORIAL BANNERS (2-column)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banner 1 */}
            <Link href="/products?category=skincare" className="editorial-banner relative rounded-2xl overflow-hidden block" style={{ minHeight: '260px', backgroundColor: '#e8edf4' }}>
              <img
                src="/editorial_banner_1.png"
                alt="Skincare Editorial"
                className="w-full h-full object-cover absolute inset-0"
                style={{ minHeight: '260px' }}
              />
              <div className="relative z-10 p-8 flex flex-col justify-end h-full" style={{ minHeight: '260px', background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }}>
                <p className="text-[10px] font-semibold tracking-widest text-white/80 mb-2 uppercase">viøønep</p>
                <h3 className="text-xl font-bold text-white leading-tight mb-1">
                  Gently layering points<br />feeling better every moment
                </h3>
              </div>
            </Link>

            {/* Banner 2 */}
            <Link href="/products?category=makeup" className="editorial-banner relative rounded-2xl overflow-hidden block" style={{ minHeight: '260px', backgroundColor: '#f0eae8' }}>
              <img
                src="/editorial_banner_2.png"
                alt="Makeup Editorial"
                className="w-full h-full object-cover absolute inset-0"
                style={{ minHeight: '260px' }}
              />
              <div className="relative z-10 p-8 flex flex-col justify-end h-full" style={{ minHeight: '260px', background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }}>
                <p className="text-[10px] font-semibold tracking-widest text-white/80 mb-2 uppercase">BLUSH HORIZON</p>
                <h3 className="text-xl font-bold text-white leading-tight mb-1">
                  Small moments of joy<br />feel good benefits
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          NEW PRODUCTS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: '#f5f4f0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="font-bold text-2xl mb-1"
                style={{ color: '#1a1a1a', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}
              >
                New products
              </h2>
              <p className="text-sm" style={{ color: '#999' }}>Fresh arrivals this season</p>
            </div>
            <Link href="/products?sort=newest" className="hidden sm:flex items-center gap-1 text-xs font-medium hover:gap-2 transition-all" style={{ color: '#666' }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-2xl bg-white p-4 space-y-4">
                  <div className="h-52 w-full rounded-xl bg-gray-100" />
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-4 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(newProducts.length > 0 ? newProducts : products.slice(4, 8)).map((product) => {
                const imgUrl = product.images?.[0]?.url || product.imageUrl || '';
                const originalPrice = parseFloat(product.price);
                const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > originalPrice;
                const discountPct = hasDiscount
                  ? Math.round(((parseFloat(product.compareAtPrice) - originalPrice) / parseFloat(product.compareAtPrice)) * 100)
                  : 0;
                return (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className="product-card group relative flex flex-col rounded-2xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
                    style={{ border: '1px solid #ebebeb' }}
                  >
                    <div className="relative overflow-hidden" style={{ backgroundColor: '#f5f4f0', aspectRatio: '1/1' }}>
                      <img
                        src={resolveMediaUrl(imgUrl)}
                        alt={product.name}
                        className="product-img h-full w-full object-cover"
                      />
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 rounded text-[9px] font-bold px-2 py-0.5" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                          {discountPct}%
                        </span>
                      )}
                      <span className="absolute top-3 right-3 rounded text-[9px] font-bold px-2 py-0.5" style={{ backgroundColor: '#4caf50', color: '#fff' }}>
                        NEW
                      </span>
                      <div className="product-card-overlay absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 px-3">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold text-white shadow-lg"
                          style={{ backgroundColor: '#1a1a1a' }}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Bag
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: '#aaa' }}>
                        {product.brand?.name || 'our nara'}
                      </p>
                      <h3 className="text-sm font-medium line-clamp-2 leading-snug mb-3" style={{ color: '#1a1a1a' }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-xs line-through" style={{ color: '#bbb' }}>
                            ₹{parseFloat(product.compareAtPrice).toFixed(0)}
                          </span>
                        )}
                        <span className="text-sm font-bold" style={{ color: hasDiscount ? '#e53935' : '#1a1a1a' }}>
                          ₹{originalPrice.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ACTIVE OFFERS STRIP (conditional)
      ═══════════════════════════════════════════════════════ */}
      {activeOffers.length > 0 && (
        <section className="py-10 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-bold text-2xl" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>Today's Deals</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
              {activeOffers.slice(0, 3).map((offer) => (
                <div
                  key={offer.id}
                  className="min-w-[280px] rounded-2xl p-5 flex-shrink-0 border"
                  style={{ backgroundColor: '#fafaf8', borderColor: '#ebebeb' }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="rounded text-[9px] font-bold px-2 py-0.5" style={{ backgroundColor: '#e53935', color: '#fff' }}>
                      LIMITED
                    </span>
                    {offer.promoCode && (
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#888' }}>
                        <Tag className="h-3 w-3" />
                        {offer.promoCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-1 mb-1" style={{ color: '#1a1a1a' }}>{offer.title}</h3>
                  <p className="text-xs mb-4 line-clamp-2 h-8" style={{ color: '#999' }}>{offer.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-black" style={{ color: '#1a1a1a' }}>{offer.discountPercentage}% OFF</p>
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: '#bbb' }}>
                        <Clock className="h-3 w-3" />
                        Ends {new Date(offer.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/products?offer=${offer.id}`}
                      className="rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          FULL-WIDTH CAMPAIGN BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '420px', backgroundColor: '#dde5ef' }}>
        {/* Background image */}
        <img
          src="/campaign_banner.png"
          alt="A Moment for Your Skin to Rest"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(200,210,230,0.6) 0%, transparent 60%)' }}
        />
        {/* Text */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 flex flex-col justify-center h-full" style={{ minHeight: '420px' }}>
          <div className="max-w-md">
            <h2
              className="font-bold mb-3 leading-tight"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}
            >
              A Moment for<br />Your Skin to Rest
            </h2>
            <p className="text-sm mb-8" style={{ color: '#444', lineHeight: '1.7' }}>
              Natural care that feels gentle, even on sensitive skin
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full text-sm font-semibold border-2 transition-all hover:bg-white/20"
              style={{
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                padding: '12px 36px',
                letterSpacing: '0.02em',
              }}
            >
              View More
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: '#f5f4f0', borderTop: '1px solid #e8e6e0' }}>
        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">

            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <svg width="28" height="28" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#C8B89A" opacity="0.9"/>
                  <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#B8A88A" opacity="0.85"/>
                  <ellipse cx="40" cy="38" rx="7" ry="9" fill="#D4C4A8" opacity="0.6"/>
                </svg>
                <span
                  style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', letterSpacing: '0.14em', color: '#1a1a1a' }}
                >
                  our nara
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
                {['About Us', 'Terms & Conditions', 'Privacy Policy', 'Help'].map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="text-xs hover:text-gray-900 transition-colors"
                    style={{ color: '#777' }}
                  >
                    {link}
                  </Link>
                ))}
              </div>
              <div className="text-xs space-y-1" style={{ color: '#aaa' }}>
                <p>Corporate Name : &nbsp;·&nbsp; CEO :</p>
                <p>Business Registration No.:</p>
                <p>E-commerce Permit :</p>
                <p>Address :</p>
              </div>
              <p className="text-xs mt-4" style={{ color: '#bbb' }}>
                © {new Date().getFullYear()} our nara. All rights reserved.
              </p>
              {/* Social icons */}
              <div className="flex gap-4 mt-5">
                {['Instagram', 'YouTube', 'X', 'Facebook'].map((social) => (
                  <Link key={social} href="#" className="text-xs hover:text-gray-900 transition-colors" style={{ color: '#888' }}>
                    {social === 'Instagram' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    )}
                    {social === 'YouTube' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                    )}
                    {social === 'X' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    )}
                    {social === 'Facebook' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: Customer Center */}
            <div>
              <h3 className="text-sm font-semibold mb-5" style={{ color: '#1a1a1a', letterSpacing: '0.02em' }}>Customer Center</h3>
              <p className="text-2xl font-bold mb-3" style={{ color: '#1a1a1a' }}>+91 98765 43210</p>
              <div className="text-xs space-y-1.5 mb-5" style={{ color: '#888' }}>
                <p>Weekdays: 10:00 ~ 18:00</p>
                <p>Lunch: 12:00 ~ 13:00</p>
                <p>Closed on Weekends and Holidays</p>
              </div>
              <div className="flex gap-3">
                <Link href="#" className="rounded-lg px-4 py-2 text-xs font-medium border transition-colors hover:bg-gray-50" style={{ color: '#555', borderColor: '#ddd' }}>
                  1:1 Inquiry
                </Link>
                <Link href="#" className="rounded-lg px-4 py-2 text-xs font-medium border transition-colors hover:bg-gray-50" style={{ color: '#555', borderColor: '#ddd' }}>
                  FAQ
                </Link>
              </div>
            </div>

            {/* Column 3: Shipping */}
            <div>
              <h3 className="text-sm font-semibold mb-5" style={{ color: '#1a1a1a', letterSpacing: '0.02em' }}>Shipping & Returns</h3>
              <div className="text-xs space-y-3" style={{ color: '#888', lineHeight: '1.7' }}>
                <p>
                  <span className="font-semibold" style={{ color: '#555' }}>Important:</span>{' '}
                  Your order is shipped once your payment has been cleared.
                </p>
                <p>
                  Please contact our customer service center if you would like to request an exchange or return on your order.
                </p>
                <p>
                  <span className="font-semibold" style={{ color: '#555' }}>※ Shipping Time:</span> 3–7 days
                </p>
                <p>
                  <span className="font-semibold" style={{ color: '#555' }}>Free shipping</span> on orders over ₹999
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer bottom bar */}
        <div
          className="border-t py-4 text-center text-[11px]"
          style={{ borderColor: '#e0ddd8', color: '#bbb' }}
        >
          <p>Designed with ♥ for radiant skin · our nara Beauty</p>
        </div>
      </footer>

    </div>
  );
}
