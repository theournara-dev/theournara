'use client';

import React, { useEffect, useState, Suspense } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string;
  variants: any[];
  images: any[];
}

function ProductsList() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts(search, category);
  }, [category]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistProductIds([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      const items = res.data.data.items || [];
      setWishlistProductIds(items.map((item: any) => item.productId));
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    const isCurrentlyWishlisted = wishlistProductIds.includes(productId);
    try {
      if (isCurrentlyWishlisted) {
        await api.delete(`/wishlist/${productId}`);
        setWishlistProductIds(wishlistProductIds.filter(id => id !== productId));
      } else {
        await api.post('/wishlist', { productId });
        setWishlistProductIds([...wishlistProductIds, productId]);
      }
    } catch (err: any) {
      console.error('Failed to toggle wishlist', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert(err.response?.data?.message || 'Failed to update wishlist.');
      }
    }
  };

  const fetchProducts = async (searchQuery = '', categoryQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { 
          search: searchQuery || undefined,
          category: categoryQuery || undefined
        },
      });
      setProducts(res.data.data.products || res.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search, category);
  };

  const handleAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      addItem({
        id: defaultVariant.id,
        variantId: defaultVariant.id,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          price: Number(product.price) + Number(defaultVariant.additionalPrice),
          image: product.images?.[0]?.url || '',
        },
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Catalog` : 'Our Catalog'}
          </h1>
          <p className="text-muted-foreground mt-2">Find the perfect products for you.</p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full md:max-w-sm items-center space-x-2">
          <Input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-[350px] bg-muted rounded-xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No products found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search query or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden relative group">
              <div className="aspect-square bg-muted relative overflow-hidden">
                <Link href={`/products/${product.slug}`} className="block w-full h-full">
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
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black transition shadow-sm z-10 active:scale-95"
                  title={wishlistProductIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${
                      wishlistProductIds.includes(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground hover:text-red-500'
                    }`} 
                  />
                </button>
              </div>
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
                <div className="font-semibold text-lg">₹{parseFloat(product.price).toFixed(2)}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.variants || product.variants.length === 0}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-20 text-center animate-pulse">
        Loading catalog...
      </div>
    }>
      <ProductsList />
    </Suspense>
  );
}
