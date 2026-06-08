'use client';

import React, { useEffect, useState } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/wishlist');
      return;
    }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setWishlistItems(res.data.data.items || []);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlistItems(wishlistItems.filter((item) => item.product.id !== id));
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  if (!user) {
    return <div className="container mx-auto py-20 text-center text-muted-foreground">Redirecting to login...</div>;
  }

  if (loading) {
    return <div className="container mx-auto py-20 text-center animate-pulse">Loading wishlist...</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h2>
        <p className="text-muted-foreground mb-8">Save items you love to your wishlist.</p>
        <Link href="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          return (
            <Card key={product.id} className="flex flex-col overflow-hidden">
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square bg-muted relative">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={resolveMediaUrl(product.images[0].url)} 
                      alt={product.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg truncate">
                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    {product.name}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {product.description || 'No description available.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 mt-auto flex justify-between items-end">
                <div className="font-semibold text-lg">₹{product.price}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button className="flex-1" variant="outline" asChild>
                  <Link href={`/products/${product.slug}`}>View</Link>
                </Button>
                <Button variant="ghost" className="text-destructive" onClick={() => removeFromWishlist(product.id)}>
                  Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
