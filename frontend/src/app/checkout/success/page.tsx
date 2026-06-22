import { Suspense } from 'react';
import CheckoutSuccessClient from './SuccessClient';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading success details...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
