'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Star, Trash2, MessageSquare, Loader2
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin/all');
      setReviews(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete/moderate this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      alert('Review deleted successfully.');
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-amber-400 gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400' : 'text-gray-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Reviews Moderation</h1>
        <p className="text-xs text-gray-400 mt-1">Moderate customer reviews and feedback ratings</p>
      </div>

      {/* Reviews Table */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-lg">Customer Reviews</CardTitle>
          <CardDescription className="text-xs">Browse and moderate feedback across all products</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Loading product reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold">
              No product reviews found in the system.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-purple-50/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {review.product?.name || 'Unknown Product'}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-800">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <span className="text-[10px] text-gray-400">{review.user?.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      {renderStars(review.rating)}
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                      {review.comment || <em className="text-gray-400">No comment</em>}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
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
    </div>
  );
}
