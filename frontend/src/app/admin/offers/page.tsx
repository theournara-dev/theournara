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
  Plus, Trash2, Loader2, Tag, Percent, Calendar
} from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form states
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    categoryId: '' // optional category target
  });

  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketing/offers');
      setOffers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch offers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      discountPercentage: Number(form.discountPercentage),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      categories: form.categoryId ? [form.categoryId] : []
    };

    try {
      await api.post('/marketing/offers', payload);
      alert('Marketing Offer scheduled successfully! 🏷️');
      setModalOpen(false);
      fetchOffers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create offer');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Offers & Promotions</h1>
          <p className="text-xs text-gray-400 mt-1">Manage general discount promotions and campaigns</p>
        </div>
        
        <Button onClick={() => { setForm({ title: '', description: '', discountPercentage: '15', startDate: '', endDate: '', categoryId: '' }); setModalOpen(true); }} className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2">
          <Plus className="h-4.5 w-4.5" />
          Schedule Offer
        </Button>
      </div>

      {/* Offers Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Active Offers</CardTitle>
          <CardDescription className="text-xs">Browse all active and scheduled discount promotions</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Retrieving promotions list...</span>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No promotions found. Click 'Schedule Offer' to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Offer Title</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Start Date</th>
                  <th className="py-4 px-6">End Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map((offer) => {
                  const now = new Date();
                  const start = new Date(offer.startDate);
                  const end = new Date(offer.endDate);
                  const isActive = now >= start && now <= end;
                  const isUpcoming = now < start;

                  return (
                    <tr key={offer.id} className="hover:bg-purple-50/10 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-purple-950 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-pink-500" />
                        <div>
                          <p>{offer.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium">{offer.description}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-800">
                        {offer.discountPercentage}% OFF
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
            <DialogTitle className="text-xl font-black">Schedule Offer</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold text-gray-700">Offer Title</Label>
              <Input
                id="title"
                placeholder="e.g. Summer Skincare Solstice"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc" className="text-xs font-bold text-gray-700">Description</Label>
              <Input
                id="desc"
                placeholder="e.g. Get 15% off on all serums and moisturizers"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercentage" className="text-xs font-bold text-gray-700">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  placeholder="e.g. 15"
                  value={form.discountPercentage}
                  onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="catTarget" className="text-xs font-bold text-gray-700">Target Category (Optional)</Label>
                <select
                  id="catTarget"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-purple-900"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-bold text-gray-700">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-bold text-gray-700">End Date</Label>
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
                Save Promotion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
