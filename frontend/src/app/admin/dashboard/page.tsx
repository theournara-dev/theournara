'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Package, ShoppingCart, Users, DollarSign,
  AlertTriangle, BarChart3, Heart, Sparkles, TrendingUp
} from 'lucide-react';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic RBAC check on client side
    const isAdmin = user?.roles?.some((r: any) => r === 'Admin' || r?.role?.name === 'Admin') || false;
    if (!user || !isAdmin) {
      router.push('/');
      return;
    }
    fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setMetrics(res.data.data);
    } catch (error) {
      console.error('Failed to fetch admin metrics', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/40';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) {
    return <div className="container mx-auto py-20 text-center animate-pulse text-sm text-gray-400 font-bold">Loading dashboard...</div>;
  }

  const overview = metrics?.overview || {};
  const bestSelling = metrics?.bestSelling || [];
  const highDemand = metrics?.highDemand || [];
  const wishlistPop = metrics?.wishlistPop || [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Overview of your store performance</p>
      </div>

      {/* Grid of First Row Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.totalProducts || 0}</h2>
              <span className="text-[10px] text-gray-400 font-medium">{overview.activeProducts || 0} active</span>
            </div>
            <div className="rounded-xl bg-purple-950/5 p-2.5">
              <Package className="h-5 w-5 text-purple-950" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.totalOrders || 0}</h2>
              <span className="text-[10px] text-gray-400 font-medium">{overview.pendingOrders || 0} pending</span>
            </div>
            <div className="rounded-xl bg-green-500/5 p-2.5">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Revenue</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">${(overview.totalRevenue || 0).toFixed(2)}</h2>
            </div>
            <div className="rounded-xl bg-pink-500/5 p-2.5">
              <DollarSign className="h-5 w-5 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Users</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.totalUsers || 0}</h2>
            </div>
            <div className="rounded-xl bg-blue-500/5 p-2.5">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Second Row Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Out of Stock */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Out of Stock</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.outOfStock || 0}</h2>
            </div>
            <div className="rounded-xl bg-red-500/5 p-2.5">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.lowStock || 0}</h2>
              <span className="text-[10px] text-gray-400 font-medium">≤ 10 units</span>
            </div>
            <div className="rounded-xl bg-orange-500/5 p-2.5">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inventory Value</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">${(overview.totalInventoryValue || 0).toFixed(0)}</h2>
            </div>
            <div className="rounded-xl bg-purple-950/5 p-2.5">
              <BarChart3 className="h-5 w-5 text-purple-950" />
            </div>
          </div>
        </div>

        {/* Wishlisted */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wishlisted</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{wishlistPop.reduce((sum: number, item: any) => sum + item.wishlistCount, 0)}</h2>
              <span className="text-[10px] text-gray-400 font-medium">unique products</span>
            </div>
            <div className="rounded-xl bg-pink-500/5 p-2.5">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Inventory Intelligence Alert Box */}
      <div className="rounded-3xl border border-pink-200/40 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-pink-500 animate-pulse" />
          <h3 className="text-base font-extrabold text-gray-800">AI Inventory Intelligence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Critical Alerts</p>
            {highDemand.length === 0 ? (
              <p className="text-xs text-gray-500 mt-2 font-medium">No critical issues detected. ✅</p>
            ) : (
              <div className="mt-2 space-y-2">
                {highDemand.slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-red-100 bg-red-50/20 p-2.5">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">
                      Low stock ({item.stockQuantity}) but high demand!
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Optimization Tips</p>
            <div className="mt-2 rounded-xl border border-purple-100 bg-purple-50/20 p-3.5">
              <p className="text-xs font-bold text-gray-800">Bulk Restock Recommended</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                Total inventory value is healthy, but {overview.lowStock || 0} items need restocking soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Best Selling */}
        <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 p-4">
            <TrendingUp className="h-5 w-5 text-purple-950" />
            <h4 className="text-sm font-extrabold text-gray-800">Best Selling</h4>
          </div>
          {bestSelling.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 font-semibold">No sales data yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bestSelling.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <img
                    src={resolveMediaUrl(item.productImage)}
                    alt={item.productTitle}
                    className="h-10 w-10 rounded-lg object-cover bg-gray-50"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1">{item.productTitle}</p>
                    <span className="rounded bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700">
                      {item.totalSold} sold
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-gray-700">${item.totalRevenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Demand */}
        <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h4 className="text-sm font-extrabold text-gray-800">High Demand (Low Stock)</h4>
          </div>
          {highDemand.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 font-semibold">All products well-stocked</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {highDemand.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt={item.title}
                    className="h-10 w-10 rounded-lg object-cover bg-gray-50"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1">{item.title}</p>
                    <span className="rounded bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-700">
                      Stock: {item.stockQuantity}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-gray-500">{item.totalOrdered} ordered</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Wishlisted */}
        <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 p-4">
            <Heart className="h-5 w-5 text-pink-500" />
            <h4 className="text-sm font-extrabold text-gray-800">Most Wishlisted</h4>
          </div>
          {wishlistPop.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 font-semibold">No wishlist data yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {wishlistPop.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <img
                    src={resolveMediaUrl(item.productImage)}
                    alt={item.productTitle}
                    className="h-10 w-10 rounded-lg object-cover bg-gray-50"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1">{item.productTitle}</p>
                    <span className="rounded bg-pink-50 px-2 py-0.5 text-[9px] font-bold text-pink-500">
                      ♥ {item.wishlistCount} count
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-gray-500">Stock: {item.stockQuantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
