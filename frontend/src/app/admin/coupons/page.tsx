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
  Plus, Trash2, Loader2, Ticket, Calendar, BarChart
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    usageLimit: '',
    minOrderValue: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketing/coupons');
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };

    try {
      await api.post('/marketing/coupons', payload);
      alert('Coupon created successfully! 🎫');
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/marketing/coupons/${id}`);
      alert('Coupon deleted successfully.');
      fetchCoupons();
    } catch (err) {
      console.error('Failed to delete coupon', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Coupon Administration</h1>
          <p className="text-xs text-gray-400 mt-1">Configure discount promo codes and usage limits</p>
        </div>
        
        <Button onClick={() => { setForm({ code: '', discountType: 'percentage', discountValue: '', usageLimit: '', minOrderValue: '', expiresAt: '' }); setModalOpen(true); }} className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2">
          <Plus className="h-4.5 w-4.5" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Promo Codes</CardTitle>
          <CardDescription className="text-xs">Active discounts and campaigns available at checkout</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Retrieving coupons list...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No coupons found. Click 'Create Coupon' to add one.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Min. Order</th>
                  <th className="py-4 px-6">Usage</th>
                  <th className="py-4 px-6">Expires At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-purple-50/10 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-purple-950 flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-pink-500" />
                      <span>{coupon.code}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {coupon.discountType === 'percentage' 
                        ? `${Number(coupon.discountValue).toFixed(0)}% OFF`
                        : `$${Number(coupon.discountValue).toFixed(2)} OFF`}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-500">
                      {coupon.minOrderValue ? `$${Number(coupon.minOrderValue).toFixed(2)}` : 'None'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-500">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'} times
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Create Coupon</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-bold text-gray-700">Promo Code (Uppercase)</Label>
              <Input
                id="code"
                placeholder="e.g. FLASH20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType" className="text-xs font-bold text-gray-700">Type</Label>
                <select
                  id="discountType"
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-purple-900"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue" className="text-xs font-bold text-gray-700">Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder="e.g. 15"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderValue" className="text-xs font-bold text-gray-700">Min. Order Value ($)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  placeholder="e.g. 30"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="text-xs font-bold text-gray-700">Usage Limit (Optional)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="e.g. 200"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-xs font-bold text-gray-700">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button type="submit" className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 font-bold text-xs py-2.5">
                Save Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
