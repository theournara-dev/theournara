'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Trash2, Loader2, Zap, Calendar, ShoppingCart
} from 'lucide-react';

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Available products selection
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Form states
  const [form, setForm] = useState({
    title: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    productId: '',
    discountPrice: '',
    stockLimit: '10'
  });

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketing/flash-sales');
      setSales(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch flash sales', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (search = '') => {
    setProductsLoading(true);
    try {
      const res = await api.get('/products', { params: { search, limit: 10 } });
      setProducts(res.data.data.products || res.data.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);
    if (value.length >= 2) {
      fetchProducts(value);
    }
  };

  const selectProduct = (p: any) => {
    setForm(prev => ({
      ...prev,
      productId: p.id,
      discountPrice: (Number(p.price) * (1 - Number(form.discountPercentage || 0) / 100)).toFixed(2)
    }));
    setProductSearch(p.name);
    setProducts([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) {
      alert('Please select a valid product for the flash sale');
      return;
    }

    const payload = {
      title: form.title,
      discountPercentage: Number(form.discountPercentage),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      products: [
        {
          productId: form.productId,
          discountPrice: Number(form.discountPrice),
          stockLimit: Number(form.stockLimit)
        }
      ]
    };

    try {
      await api.post('/marketing/flash-sales', payload);
      alert('Flash Sale created successfully! ⚡');
      setModalOpen(false);
      fetchFlashSales();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create flash sale');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Flash Sales</h1>
          <p className="text-xs text-gray-400 mt-1">Schedule high-discount limited campaigns</p>
        </div>
        
        <Button onClick={() => { setForm({ title: '', discountPercentage: '20', startDate: '', endDate: '', productId: '', discountPrice: '', stockLimit: '10' }); setProductSearch(''); setModalOpen(true); }} className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2">
          <Plus className="h-4.5 w-4.5" />
          Schedule Flash Sale
        </Button>
      </div>

      {/* Flash Sales Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Fulfillment Campaigns</CardTitle>
          <CardDescription className="text-xs">Monitor active or upcoming flash sale schedules</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Retrieving campaign timelines...</span>
            </div>
          ) : sales.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No flash sales found. Click 'Schedule Flash Sale' to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Start Date</th>
                  <th className="py-4 px-6">End Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((sale) => {
                  const now = new Date();
                  const start = new Date(sale.startDate);
                  const end = new Date(sale.endDate);
                  const isActive = now >= start && now <= end;
                  const isUpcoming = now < start;

                  return (
                    <tr key={sale.id} className="hover:bg-purple-50/10 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-purple-950 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
                        <span>{sale.title}</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-800">
                        {sale.discountPercentage}% OFF
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {start.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {end.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isActive
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : isUpcoming
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}>
                          {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Schedule Flash Sale</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold text-gray-700">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g. Midnight Skincare Madness"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="prodSearch" className="text-xs font-bold text-gray-700">Select Product</Label>
              <Input
                id="prodSearch"
                placeholder="Type 2+ characters to search..."
                value={productSearch}
                onChange={handleProductSearchChange}
                required
              />
              {productsLoading && <div className="absolute right-3 top-9 text-xs text-gray-400">Searching...</div>}
              {products.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border border-gray-100 mt-1 rounded-xl shadow-xl z-50 divide-y max-h-40 overflow-y-auto">
                  {products.map(p => (
                    <div
                      key={p.id}
                      onClick={() => selectProduct(p)}
                      className="p-3 text-xs font-bold text-gray-700 hover:bg-purple-50 cursor-pointer flex justify-between"
                    >
                      <span>{p.name}</span>
                      <span className="text-gray-400">${Number(p.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercentage" className="text-xs font-bold text-gray-700">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  placeholder="e.g. 25"
                  value={form.discountPercentage}
                  onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="text-xs font-bold text-gray-700">Calculated Sale Price ($)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 19.99"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockLimit" className="text-xs font-bold text-gray-700">Flash Stock Limit</Label>
                <Input
                  id="stockLimit"
                  type="number"
                  value={form.stockLimit}
                  onChange={(e) => setForm({ ...form, stockLimit: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-bold text-gray-700">Start Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-bold text-gray-700">End Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button type="submit" className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 font-bold text-xs py-2.5">
                Save Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
