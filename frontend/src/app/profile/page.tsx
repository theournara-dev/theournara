'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const [ordersRes, loyaltyRes] = await Promise.all([
        api.get('/orders'),
        api.get('/loyalty/balance').catch(() => ({ data: { data: { balance: 0 } } }))
      ]);
      setOrders(ordersRes.data.data);
      setLoyaltyBalance(loyaltyRes.data.data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch profile data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null; // will redirect
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account and view your orders.</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg">
                <span className="font-medium text-primary">Your Points</span>
                <span className="text-2xl font-bold text-primary">{loyaltyBalance}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10 animate-pulse text-muted-foreground">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link 
                      href={`/orders/${order.id}`}
                      key={order.id} 
                      className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-primary transition-all duration-200 cursor-pointer block"
                    >
                      <div>
                        <p className="font-semibold text-primary hover:underline">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{Number(order.totalAmount).toFixed(2)}</p>
                        <p className={`text-sm font-semibold capitalize ${
                          order.status === 'completed' || order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
