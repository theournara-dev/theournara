'use client';

import React, { useState, useEffect } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  TrendingUp, ShoppingBag, Loader2, DollarSign, Users, AlertTriangle, Heart
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setMetrics(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="text-xs font-semibold">Running database analysis...</span>
      </div>
    );
  }

  const overview = metrics?.overview || {};
  const bestSelling = metrics?.bestSelling || [];
  const highDemand = metrics?.highDemand || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Analytics Deep Dive</h1>
        <p className="text-xs text-gray-400 mt-1">Detailed statistical insights of store activity and product performance</p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Revenue</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">${(overview.totalRevenue || 0).toFixed(2)}</h2>
            </div>
            <div className="rounded-xl bg-pink-500/5 p-2.5">
              <DollarSign className="h-5 w-5 text-pink-500" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fulfillment Orders</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.totalOrders || 0}</h2>
              <span className="text-[10px] text-gray-400 font-medium">{overview.pendingOrders || 0} pending</span>
            </div>
            <div className="rounded-xl bg-green-500/5 p-2.5">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Customers</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">{overview.totalUsers || 0}</h2>
            </div>
            <div className="rounded-xl bg-blue-500/5 p-2.5">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-gray-100 bg-white p-5 hover:translate-y-[-2px] transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inventory Value</p>
              <h2 className="text-2xl font-black text-gray-800 mt-1">${(overview.totalInventoryValue || 0).toFixed(0)}</h2>
            </div>
            <div className="rounded-xl bg-purple-950/5 p-2.5">
              <TrendingUp className="h-5 w-5 text-purple-950" />
            </div>
          </div>
        </Card>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Best Selling Products */}
        <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-950" />
              <span>Best Selling Products</span>
            </CardTitle>
            <CardDescription className="text-xs">Top products ranked by quantity sold and revenue generated</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {bestSelling.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-semibold">No sales data recorded yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {bestSelling.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(item.productImage, 80)}
                        alt={item.productTitle}
                        className="h-10 w-10 rounded-md object-cover bg-gray-50 border"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-gray-800">{item.productTitle}</p>
                        <span className="text-[10px] text-green-600 font-extrabold bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {item.totalSold} items sold
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-purple-950">${Number(item.totalRevenue).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* High Demand Low Stock */}
        <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>High Demand Warning</span>
            </CardTitle>
            <CardDescription className="text-xs">Products with high traffic or order rates but critically low stock levels</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {highDemand.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-semibold">All products are healthy and well-stocked.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {highDemand.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(item.imageUrl, 80)}
                        alt={item.title}
                        className="h-10 w-10 rounded-md object-cover bg-gray-50 border"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Critical stock: {item.stockQuantity} remaining
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-gray-500">{item.totalOrdered} orders in queue</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
