'use client';

import React, { useState, useEffect } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Heart, Loader2, Package, Tag
} from 'lucide-react';

export default function AdminWishlistPage() {
  const [wishlistPop, setWishlistPop] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistPop();
  }, []);

  const fetchWishlistPop = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard');
      setWishlistPop(res.data.data.wishlistPop || []);
    } catch (err) {
      console.error('Failed to fetch wishlist insights', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Wishlist Insights</h1>
        <p className="text-xs text-gray-400 mt-1">Check consumer demand trends using product wishlist frequencies</p>
      </div>

      {/* Wishlist Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Popular Wishlist Products</CardTitle>
          <CardDescription className="text-xs">Compare wishlisted frequency against available catalog stocks</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Analyzing consumer wishlists...</span>
            </div>
          ) : wishlistPop.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No product wishlist records found yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Product Image</th>
                  <th className="py-4 px-6">Product Name</th>
                  <th className="py-4 px-6">Wishlist Frequency</th>
                  <th className="py-4 px-6">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wishlistPop.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/10 transition-colors">
                    <td className="py-4 px-6">
                      <img
                        src={resolveMediaUrl(item.productImage, 80)}
                        alt={item.productTitle}
                        className="h-10 w-10 rounded-md object-cover bg-gray-50 border"
                      />
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {item.productTitle}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-pink-600 flex items-center gap-1.5 pt-6">
                      <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                      <span>{item.wishlistCount} saves</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        item.stockQuantity === 0
                          ? 'bg-red-50 text-red-600'
                          : item.stockQuantity <= 10
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {item.stockQuantity === 0 ? 'Out of Stock' : `${item.stockQuantity} in stock`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
