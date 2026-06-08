'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { resolveMediaUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchOrderDetails();
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (error) {
      console.error('Failed to fetch order details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center animate-pulse text-muted-foreground">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-8">We couldn't locate the order you requested.</p>
        <Link href="/profile">
          <Button>Back to Profile</Button>
        </Link>
      </div>
    );
  }

  // Calculate pricing
  const itemTotal = order.items.reduce((acc: number, item: any) => acc + Number(item.price) * item.quantity, 0);
  const discount = order.coupon ? (order.coupon.discountType === 'percentage' ? (itemTotal * Number(order.coupon.discountValue)) / 100 : Number(order.coupon.discountValue)) : 0;
  const pointsEarned = Math.floor(Number(order.totalAmount));

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/profile">
          <Button variant="ghost" size="sm">
            &larr; Back to Profile
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order Details</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-muted-foreground">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            order.status === 'completed' || order.status === 'paid'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Order Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                      {item.variant.product.image ? (
                        <img src={resolveMediaUrl(item.variant.product.image)} alt={item.variant.product.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">No image</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.variant.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Variant: {item.variant.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">₹{Number(item.price).toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Address Details */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">{order.user?.firstName} {order.user?.lastName}</p>
                <p className="text-muted-foreground">{order.user?.email}</p>
              </div>
              <div className="border-t pt-3 space-y-1">
                <p className="font-medium">Shipping Address</p>
                <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p className="text-muted-foreground">{order.shippingAddress.line2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Order Summary & Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{itemTotal.toFixed(2)}</span>
              </div>
              {order.coupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({order.coupon.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between border-t pt-4 font-bold text-base text-foreground">
                <span>Total Amount</span>
                <span>₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-bold text-primary text-base">Points Earned</h3>
              <p className="text-sm text-muted-foreground">
                You earned <span className="font-bold text-primary text-lg">{pointsEarned}</span> loyalty points from this purchase!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <span className="text-muted-foreground font-medium block">Method</span>
                <span className="font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
