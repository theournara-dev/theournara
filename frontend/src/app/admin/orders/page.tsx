'use client';

import React, { useState, useEffect } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ShoppingCart, Eye, Truck, CheckCircle2, XCircle, AlertTriangle, Loader2
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const AVAILABLE_STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert('Order status updated successfully! 🎉');
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update order status', err);
      alert('Failed to update status. Check permissions.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailModal = (order: any) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  // Summary counts
  const totalRevenue = orders
    .filter(o => o.status === 'completed' || o.status === 'paid' || o.status === 'shipped')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
  
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Order Management</h1>
        <p className="text-xs text-gray-400 mt-1">Monitor, process and update customer transactions</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
            <h2 className="text-xl font-black text-purple-950 mt-1">₹{totalRevenue.toFixed(2)}</h2>
          </div>
          <div className="rounded-xl bg-purple-50 p-2 text-purple-950">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
            <h2 className="text-xl font-black text-yellow-700 mt-1">{pendingCount} orders</h2>
          </div>
          <div className="rounded-xl bg-yellow-50 p-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Orders</p>
            <h2 className="text-xl font-black text-green-700 mt-1">{completedCount} orders</h2>
          </div>
          <div className="rounded-xl bg-green-50 p-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Customer Transactions</CardTitle>
          <CardDescription className="text-xs">Browse incoming orders and moderate fulfillment states</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Retrieving order lists...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No orders found in the system.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-800">
                      #{order.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-800">
                        {order.user?.firstName || 'Guest'} {order.user?.lastName || ''}
                      </p>
                      <span className="text-[10px] text-gray-400">{order.user?.email || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold capitalize text-gray-500">
                      {order.paymentMethod?.replace('_', ' ')}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-purple-950">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="h-8 rounded-lg border border-gray-200 bg-transparent px-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-purple-900"
                      >
                        {AVAILABLE_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal(order)}
                        className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black flex items-center justify-between border-b pb-4">
                  <span>Order Details</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full uppercase border font-extrabold ${STATUS_COLORS[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* ID & Date */}
                <div className="flex justify-between text-xs text-gray-500 font-bold">
                  <p>Order ID: {selectedOrder.id}</p>
                  <p>Placed: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>

                {/* Shipping info */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Customer Details</p>
                    <p className="text-xs font-bold text-gray-800">
                      {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                    </p>
                    <p className="text-[11px] text-gray-500">{selectedOrder.user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Shipping Address</p>
                    <p className="text-xs font-semibold text-gray-700">{selectedOrder.shippingAddress?.line1}</p>
                    {selectedOrder.shippingAddress?.line2 && <p className="text-xs text-gray-600">{selectedOrder.shippingAddress.line2}</p>}
                    <p className="text-[11px] text-gray-500">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p className="text-[11px] text-gray-500">{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Line Items</p>
                  <div className="divide-y border rounded-2xl overflow-hidden bg-white">
                    {selectedOrder.items?.map((item: any) => {
                      const img = item.variant?.product?.images?.[0]?.url || item.variant?.product?.image || '';
                      return (
                        <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveMediaUrl(img, 60)}
                              alt={item.variant?.product?.name}
                              className="h-10 w-10 rounded-md object-cover bg-gray-100 border"
                            />
                            <div className="text-xs">
                              <p className="font-bold text-gray-800">{item.variant?.product?.name}</p>
                              <span className="text-[10px] text-gray-400">Variant: {item.variant?.name} | Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <p className="text-xs font-extrabold text-purple-950">
                            ₹{(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing totals */}
                <div className="border-t border-gray-100 pt-4 flex flex-col items-end space-y-1.5 text-xs">
                  <div className="flex justify-between w-48 text-gray-500 font-bold">
                    <span>Payment Method:</span>
                    <span className="capitalize">{selectedOrder.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                  {selectedOrder.coupon && (
                    <div className="flex justify-between w-48 text-green-600 font-bold">
                      <span>Coupon ({selectedOrder.coupon.code}):</span>
                      <span>
                        -{selectedOrder.coupon.discountType === 'percentage'
                          ? `${selectedOrder.coupon.discountValue}%`
                          : `₹${selectedOrder.coupon.discountValue}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between w-48 text-purple-950 font-black text-sm pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>₹{Number(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-gray-100 pt-6 flex flex-row items-center gap-2">
                <div className="flex items-center gap-2 mr-auto">
                  <span className="text-xs text-gray-400 font-bold">Modify Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingId === selectedOrder.id}
                    className="h-8 rounded-lg border border-gray-200 bg-transparent px-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-purple-900"
                  >
                    {AVAILABLE_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => setDetailModalOpen(false)} className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 font-bold text-xs py-2">
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
