'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api, { resolveMediaUrl } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    line1: '', line2: '', city: '', state: '', zipCode: '', country: ''
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useSavedAddress, setUseSavedAddress] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (user && step === 2) {
      fetchAddresses();
    }
  }, [user, step]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      const data = res.data.data;
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: any) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id);
        setUseSavedAddress(true);
      } else {
        setUseSavedAddress(false);
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await api.get(`/marketing/coupons/${couponCode.trim()}`);
      const coupon = res.data.data;

      if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
        setCouponError(`Minimum order value for this coupon is ₹${Number(coupon.minOrderValue).toFixed(2)}`);
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(coupon);
    } catch (error: any) {
      console.error('Failed to apply coupon', error);
      setCouponError('Invalid coupon code or coupon expired');
      setAppliedCoupon(null);
    }
  };

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * Number(appliedCoupon.discountValue)) / 100;
    } else {
      discount = Number(appliedCoupon.discountValue);
    }
  }
  const total = Math.max(0, subtotal - discount);

  const handleProceedToShipping = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }
    
    setIsProcessing(true);
    try {
      const cartPayload = {
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };
      await api.post('/cart/sync', cartPayload);
      setStep(2);
    } catch (error: any) {
      console.error('Failed to sync cart', error);
      alert(error.response?.data?.message || 'Failed to sync cart with database. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setIsProcessing(true);
    try {
      let finalAddressId = selectedAddressId;

      if (!useSavedAddress) {
        if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
          alert('Please fill out all address fields.');
          setIsProcessing(false);
          return;
        }

        const addrRes = await api.post('/addresses', shippingAddress);
        finalAddressId = addrRes.data.data.id;
      }

      if (!finalAddressId) {
        alert('Please select or add a shipping address.');
        setIsProcessing(false);
        return;
      }

      const orderPayload = {
        shippingAddressId: finalAddressId,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };

      await api.post('/orders', orderPayload);
      clearCart();
      setStep(4); // Success step
    } catch (error: any) {
      console.error('Checkout failed', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step === 1) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any products yet.</p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-5xl">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10 space-x-4 text-sm font-medium">
        <span className={step >= 1 ? 'text-primary' : 'text-muted-foreground'}>1. Cart</span>
        <span className="text-muted-foreground">/</span>
        <span className={step >= 2 ? 'text-primary' : 'text-muted-foreground'}>2. Shipping</span>
        <span className="text-muted-foreground">/</span>
        <span className={step >= 3 ? 'text-primary' : 'text-muted-foreground'}>3. Payment</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              {items.map((item) => (
                <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4">
                  <div className="w-24 h-24 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.image ? (
                      <img src={resolveMediaUrl(item.product.image)} alt={item.product.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                  <div className="flex-1 ml-6 flex flex-col justify-center">
                    <h4 className="font-semibold">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Button variant="ghost" className="text-destructive" onClick={() => removeItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Shipping Details</h2>
              
              {addresses.length > 0 && (
                <Card className="p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      id="useSaved" 
                      name="addressMode" 
                      checked={useSavedAddress} 
                      onChange={() => setUseSavedAddress(true)} 
                    />
                    <label htmlFor="useSaved" className="font-semibold cursor-pointer">Use a Saved Address</label>
                  </div>
                  
                  {useSavedAddress && (
                    <div className="grid grid-cols-1 gap-3 pl-6">
                      {addresses.map((addr) => (
                        <label 
                          key={addr.id} 
                          className={`flex items-start space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted ${
                            selectedAddressId === addr.id ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="savedAddress" 
                            value={addr.id} 
                            checked={selectedAddressId === addr.id} 
                            onChange={(e) => setSelectedAddressId(e.target.value)} 
                            className="mt-1"
                          />
                          <div className="text-sm">
                            <p className="font-medium">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''} {addr.isDefault && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-2 font-normal">Default</span>}
                            </p>
                            <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-muted-foreground">{addr.country}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              <Card className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="radio" 
                    id="useNew" 
                    name="addressMode" 
                    checked={!useSavedAddress} 
                    onChange={() => setUseSavedAddress(false)} 
                  />
                  <label htmlFor="useNew" className="font-semibold cursor-pointer">Add New Shipping Address</label>
                </div>

                {!useSavedAddress && (
                  <div className="space-y-4 pl-6 pt-2">
                    <Input placeholder="Address Line 1" value={shippingAddress.line1} onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})} />
                    <Input placeholder="Address Line 2 (Optional)" value={shippingAddress.line2} onChange={(e) => setShippingAddress({...shippingAddress, line2: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} />
                      <Input placeholder="State/Province" value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="ZIP / Postal Code" value={shippingAddress.zipCode} onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})} />
                      <Input placeholder="Country" value={shippingAddress.country} onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})} />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Payment Method</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 flex flex-col">
                  <label className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-muted">
                    <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>Credit Card</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-muted">
                    <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>PayPal</span>
                  </label>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 4 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-bold">Order Confirmed!</h2>
              <p className="text-muted-foreground">Thank you for your purchase. We'll email you the tracking details soon.</p>
              <div className="pt-8 flex justify-center space-x-4">
                <Link href="/profile">
                  <Button variant="default">View My Orders</Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between border-t pt-4 font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                {/* Coupon Code Input */}
                <div className="border-t pt-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Have a Coupon?</label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="e.g. WELCOME10" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                        Remove
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    )}
                  </div>
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 font-medium">
                      Coupon applied successfully! ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} off)
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {step === 1 && (
                  <Button className="w-full" onClick={handleProceedToShipping} disabled={isProcessing}>
                    {isProcessing ? 'Syncing Cart...' : 'Checkout'}
                  </Button>
                )}
                {step === 2 && <Button className="w-full" onClick={() => setStep(3)}>Continue to Payment</Button>}
                {step === 3 && (
                  <Button className="w-full" onClick={handleCheckout} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
