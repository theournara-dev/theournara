'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle2, ShieldCheck, MapPin, Loader2 } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    product: { name: string; price: string };
    additionalPrice: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    fetchData();
  }, [accessToken]);

  const fetchData = async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([
        api.get('/cart'),
        api.get('/addresses')
      ]);
      setCartItems(cartRes.data.data?.items || []);
      
      const userAddresses = addrRes.data.data || [];
      setAddresses(userAddresses);
      if (userAddresses.length > 0) {
        setSelectedAddress(userAddresses[0].id);
      }
    } catch (err) {
      console.error('Failed to load checkout data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.variant.product.price) + Number(item.variant.additionalPrice)) * item.quantity,
    0
  );
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Order in our DB
      const orderRes = await api.post('/orders', {
        shippingAddressId: selectedAddress,
        paymentMethod: 'razorpay'
      });
      const order = orderRes.data.data;

      // 2. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 3. Create Razorpay order
      const rzpRes = await api.post('/orders/razorpay/create', { orderId: order.id });
      const rzpOrder = rzpRes.data.data;

      // 4. Open Razorpay Widget
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyId', 
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'our nara',
        description: 'Conscious Beauty & Skincare',
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          try {
            // 5. Verify Signature on Backend
            await api.post('/orders/razorpay/verify', {
              orderId: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 6. Redirect to success
            router.push(`/checkout/success?orderId=${order.id}`);
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          contact: user?.phone || '',
        },
        theme: {
          color: '#1a1a1a',
        },
      };

      const rzpWindow = new (window as any).Razorpay(options);
      rzpWindow.on('payment.failed', function (response: any) {
        alert(response.error.description);
        setIsProcessing(false);
      });
      rzpWindow.open();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a1a1a]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf8] p-4 text-center">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">Your cart is empty</h1>
        <button onClick={() => router.push('/products')} className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Details */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8" style={{ letterSpacing: '-0.02em' }}>Checkout</h1>
            
            {/* Address Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ebe9e4]">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#888]" />
                Shipping Address
              </h2>
              {addresses.length === 0 ? (
                <div className="text-sm text-[#888] bg-[#f5f4f0] p-4 rounded-xl">
                  You have no saved addresses. Please add one in your profile first.
                  <button onClick={() => router.push('/profile')} className="block mt-2 text-[#1a1a1a] font-medium underline">
                    Go to Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={\`flex items-start p-4 rounded-xl border cursor-pointer transition-colors \${selectedAddress === addr.id ? 'border-[#1a1a1a] bg-[#fafaf8]' : 'border-[#ebe9e4] hover:bg-[#fafaf8]'}\`}>
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={selectedAddress === addr.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#1a1a1a]">{addr.line1}</p>
                        {addr.line2 && <p className="text-sm text-[#666]">{addr.line2}</p>}
                        <p className="text-sm text-[#666]">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-sm text-[#666]">{addr.country}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ebe9e4] sticky top-24">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#555] flex-1 pr-4">{item.quantity}x {item.variant.product.name}</span>
                  <span className="text-[#1a1a1a] font-medium font-mono">₹{(Number(item.variant.product.price) + Number(item.variant.additionalPrice)) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ebe9e4] pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-[#555]">
                <span>Subtotal</span>
                <span className="font-mono text-[#1a1a1a]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#555]">
                <span>Shipping</span>
                <span className="font-mono text-[#1a1a1a]">{shipping === 0 ? 'Free' : \`₹\${shipping}\`}</span>
              </div>
              
              <div className="border-t border-[#ebe9e4] pt-4 mt-4 flex justify-between items-center">
                <span className="text-base font-bold text-[#1a1a1a]">Total</span>
                <span className="text-xl font-bold font-mono text-[#1a1a1a]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || !selectedAddress}
              className="w-full mt-8 bg-[#1a1a1a] text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {isProcessing ? 'Processing...' : \`Pay ₹\${total}\`}
            </button>
            
            <p className="text-xs text-center text-[#888] mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure payment powered by Razorpay
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
