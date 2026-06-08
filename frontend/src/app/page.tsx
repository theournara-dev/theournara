'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Star, Truck, RotateCcw, Shield, Gift, Tag, Clock, Zap, TrendingUp, Award, ShoppingCart, Heart } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function Home() {
  const router = useRouter();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);
  const [koreanProducts, setKoreanProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real products from API
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
        setCategories(categoriesRes.data?.data || []);
        setActiveOffers(offersRes.data?.data || []);
        setFlashSales(flashRes.data?.data || []);

        // Filter out Korean Beauty products
        const kProducts = allProducts.filter((p: any) =>
          p.categories?.some((c: any) => c.category?.slug === 'korean-beauty') ||
          p.brand?.name?.toLowerCase().includes('laneige')
        );
        setKoreanProducts(kProducts.length > 0 ? kProducts : allProducts.slice(0, 5));

      } catch (error) {
        console.error('Failed to load home page data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const resolveMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/300x200';
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
        image: image,
      }
    });
    alert('Product added to bag! 🛍️');
  };

  return (
    <div className="bg-slate-50/50">
      
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eee8ff] via-[#f8f7ff] to-[#ffe8e8] py-16 md:py-24">
        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-purple-950/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-pink-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-950/10 bg-purple-950/5 px-4 py-1.5 text-xs font-extrabold text-purple-950 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            New Season Collection
          </div>
          
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-purple-950 to-pink-600 bg-clip-text text-transparent leading-none mb-6">
            Discover Your Glow
          </h1>
          
          <p className="mx-auto max-w-xl text-base text-gray-500 sm:text-lg md:text-xl leading-relaxed mb-10">
            Premium Korean & global beauty products crafted for radiant, glass-like skin.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/products?category=korean-beauty"
              className="inline-flex items-center gap-2 rounded-full bg-purple-950 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-purple-950/20 hover:bg-purple-900 hover:scale-102 hover:shadow-2xl transition-all"
            >
              Shop K-Beauty
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products?category=skincare"
              className="inline-flex items-center rounded-full border-2 border-purple-950 bg-transparent px-8 py-4 text-sm font-extrabold text-purple-950 hover:bg-purple-950/5 hover:scale-102 transition-all"
            >
              Explore Skincare
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Promoted Offers Banner ===== */}
      {activeOffers.length > 0 && (
        <section className="bg-purple-950 py-10 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <Gift className="h-6 w-6 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight">Today's Deals</h2>
                </div>
                <p className="text-sm text-gray-300">Handpicked exclusive offers just for you.</p>
              </div>
              <div className="md:col-span-2 overflow-x-auto flex gap-4 pb-2 pr-2">
                {activeOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="min-w-[320px] rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md flex-shrink-0 hover:translate-y-[-4px] hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="rounded bg-pink-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                        Limited
                      </span>
                      {offer.promoCode && (
                        <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          {offer.promoCode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold line-clamp-1 mb-1">{offer.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2 h-8 mb-4">{offer.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-black">{offer.discountPercentage}% OFF</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          Ends {new Date(offer.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={`/products?offer=${offer.id}`}
                        className="rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-purple-950 hover:bg-gray-100 transition-colors"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Trust Badges ===== */}
      <section className="border-b border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 items-center justify-items-center">
            {[
              { icon: <Truck className="h-5 w-5" />, text: 'Free Shipping Over ₹500' },
              { icon: <Shield className="h-5 w-5" />, text: '100% Authentic Products' },
              { icon: <RotateCcw className="h-5 w-5" />, text: '30-Day Returns' },
              { icon: <Star className="h-5 w-5" />, text: '4.9★ Rated' },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-500 hover:text-purple-950 transition-colors">
                <div className="text-purple-950">{badge.icon}</div>
                <span className="text-xs font-bold text-gray-600">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Shop by Category ===== */}
      {categories.length > 0 && (
        <section className="border-b border-gray-100 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-extrabold text-purple-950 uppercase tracking-widest mb-4">
              Shop By Category
            </p>
            <div className="flex gap-2 justify-center overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="rounded-full bg-purple-950/5 border border-purple-950/10 px-6 py-2.5 text-xs font-bold text-purple-950 hover:bg-purple-950/10 hover:border-purple-950 transition-all flex-shrink-0"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Trending Now & Collection Sections ===== */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl md:text-4xl bg-gradient-to-r from-gray-900 to-purple-950 bg-clip-text text-transparent">
              Trending Now
            </h2>
            <p className="text-sm text-gray-400 mt-1">Our most-loved products this season</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-2xl bg-white border border-gray-100 p-4 space-y-4">
                  <div className="h-40 w-full rounded-xl bg-gray-100" />
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-4 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.slice(0, 10).map((product) => {
                const imgUrl = product.images?.[0]?.url || product.imageUrl || '';
                return (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-3 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-purple-950/5 transition-all duration-300"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3">
                      <img
                        src={resolveMediaUrl(imgUrl)}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Sale Badge */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-2 left-2 rounded bg-orange-500 px-2 py-0.5 text-[9px] font-black text-white">
                          Only {product.stock} left!
                        </span>
                      )}
                      
                      {/* Hover Add to Cart Button overlay */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] rounded-lg bg-purple-950 py-2.5 text-[10px] font-black text-white shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Add to Bag
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 px-1">
                      <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-0.5">
                        {product.brand?.name || 'Brand'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug mb-2 min-h-8">
                        {product.name}
                      </h3>
                      
                      {/* Price Area */}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-sm font-extrabold text-purple-950">
                          ₹{parseFloat(product.price).toFixed(2)}
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

      {/* ===== Flash Sale Countdown Section ===== */}
      {flashSales.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white shadow-lg">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-1.5 mb-2">
              <Zap className="h-6 w-6 text-white fill-white" />
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Flash Sale</h2>
            </div>
            <p className="text-sm text-white/90 mb-8">Limited time deals — grab them before they're gone!</p>

            <div className="flex gap-4 overflow-x-auto justify-center pb-2">
              {flashSales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-white rounded-2xl p-5 text-gray-800 w-80 flex-shrink-0 text-left border border-white/10 hover:shadow-2xl transition-all"
                >
                  <div className="flex justify-between items-center mb-3">
                     <span className="rounded bg-pink-100 text-pink-600 px-2 py-0.5 text-xs font-extrabold">
                      {sale.discountPercentage}% OFF
                    </span>
                    <span className="text-xs text-orange-500 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Active Deal
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold mb-1">{sale.title}</h3>
                  <p className="text-xs text-gray-400 mb-4 h-8 line-clamp-2">{sale.description}</p>
                  <Link
                    href="/products"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-pink-500 py-2.5 text-xs font-extrabold text-white hover:bg-pink-600 transition-colors"
                  >
                    Shop Deal
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== K-Beauty Essentials Grid ===== */}
      <section className="bg-gradient-to-br from-[#eee8ff] via-[#ffe8e8] to-[#fff8f0] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/40 px-4 py-1 text-xs font-bold text-pink-500 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              K-Beauty Essentials
            </div>
            <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">Korean Beauty Picks</h2>
            <p className="text-sm text-gray-500 mt-1">The secret to glass skin starts here. Authentic K-Beauty.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-center">
            {koreanProducts.slice(0, 5).map((product) => {
              const imgUrl = product.images?.[0]?.url || product.imageUrl || '';
              return (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.id}
                  className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-3 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3">
                    <img
                      src={resolveMediaUrl(imgUrl)}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] rounded-lg bg-purple-950 py-2 text-[9px] font-black text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-col flex-1 px-1">
                    <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-0.5">
                      {product.brand?.name || 'Brand'}
                    </span>
                    <h3 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug mb-2">
                      {product.name}
                    </h3>
                    <span className="text-xs font-extrabold text-purple-950 mt-auto">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/products?category=korean-beauty"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-pink-500/20 hover:scale-102 hover:shadow-xl transition-all"
            >
              Explore All K-Beauty
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ===== Why Choose Us ===== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-gray-900 sm:text-3xl mb-12">Why EcomBeauty?</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🌿', title: 'Clean Beauty', desc: 'All our products are cruelty-free, vegan-friendly, and free from harmful chemicals.' },
              { icon: '🇰🇷', title: 'Authentic K-Beauty', desc: 'Direct partnerships with Korean brands for guaranteed authentic products.' },
              { icon: '✨', title: 'Curated Collections', desc: 'Expert-picked products tailored to your unique skin concerns and beauty goals.' },
              { icon: '💜', title: 'Beauty Community', desc: 'Join thousands of beauty enthusiasts sharing tips, reviews, and routines.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-50 bg-slate-50/20 p-6 shadow-sm hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300"
              >
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="text-sm font-extrabold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Newsletter / CTA ===== */}
      <section className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 py-16 text-center text-white">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <Sparkles className="h-8 w-8 text-pink-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-black sm:text-3xl mb-2">Get 15% Off Your First Order</h2>
          <p className="text-xs text-gray-300 mb-8 leading-relaxed">
            Subscribe to our newsletter for exclusive deals, new arrivals, and K-Beauty tips.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully! 🎉'); }} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-xs text-white outline-none placeholder-gray-400 focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              className="rounded-xl bg-pink-500 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-pink-600 hover:scale-102 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
