'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#fafaf8] p-4 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2" style={{ letterSpacing: '-0.02em' }}>Payment Successful</h1>
      <p className="text-[#666] mb-8 max-w-md mx-auto">
        Thank you for your purchase. Your order {orderId && <span className="font-mono text-[#1a1a1a]">#{orderId.split('-')[0]}</span>} has been placed successfully and is being processed.
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => router.push('/profile/orders')} 
          className="px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] rounded-full font-medium hover:bg-[#ebe9e4] transition-colors"
        >
          View Order
        </button>
        <button 
          onClick={() => router.push('/products')} 
          className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium hover:bg-black transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
