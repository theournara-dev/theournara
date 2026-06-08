'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users, UserCheck, ShieldCheck, ShieldAlert, Loader2, Shield
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentRoles: string[]) => {
    setUpdatingId(userId);
    const isAdmin = currentRoles.includes('Admin');
    const newRoles = isAdmin 
      ? currentRoles.filter(r => r !== 'Admin') 
      : [...currentRoles, 'Admin'];

    // Ensure we keep 'User' if it doesn't exist
    if (!newRoles.includes('User')) {
      newRoles.push('User');
    }

    try {
      await api.put(`/auth/users/${userId}/role`, { roles: newRoles });
      alert(`User roles updated successfully!`);
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u));
    } catch (err) {
      console.error('Failed to update roles', err);
      alert('Failed to update user roles.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Customer Directory</h1>
        <p className="text-xs text-gray-400 mt-1">Manage registered accounts and administrative permissions</p>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Registered Customers</p>
            <h2 className="text-xl font-black text-purple-950 mt-1">{users.length} users</h2>
          </div>
          <div className="rounded-xl bg-purple-50 p-2 text-purple-950">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Administrators</p>
            <h2 className="text-xl font-black text-pink-600 mt-1">
              {users.filter(u => u.roles?.includes('Admin')).length} admins
            </h2>
          </div>
          <div className="rounded-xl bg-pink-50 p-2 text-pink-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Accounts</CardTitle>
          <CardDescription className="text-xs">Configure roles and check details for store accounts</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Retrieving account records...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No registered user accounts found.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">User Roles</th>
                  <th className="py-4 px-6">Registered On</th>
                  <th className="py-4 px-6 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((item) => {
                  const isAdmin = item.roles?.includes('Admin');
                  return (
                    <tr key={item.id} className="hover:bg-purple-50/10 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-800">
                        {item.firstName || 'Anonymous'} {item.lastName || ''}
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-semibold">
                        {item.email}
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {item.phone || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1 flex-wrap">
                          {item.roles?.map((r: string) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                r === 'Admin'
                                  ? 'bg-pink-50 text-pink-600 border border-pink-100'
                                  : 'bg-gray-50 text-gray-500 border border-gray-100'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant={isAdmin ? 'outline' : 'default'}
                          size="sm"
                          disabled={updatingId === item.id}
                          onClick={() => toggleAdminRole(item.id, item.roles || [])}
                          className="h-8 rounded-lg text-[10px] font-bold"
                        >
                          {isAdmin ? (
                            <span className="flex items-center gap-1 text-red-500">
                              <ShieldAlert className="h-3 w-3" />
                              Revoke Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Make Admin
                            </span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
