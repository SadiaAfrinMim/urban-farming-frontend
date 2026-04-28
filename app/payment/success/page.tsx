import { Suspense } from 'react';
import PaymentSuccessPageClient from './PaymentSuccessPageClient';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessPageClient />
    </Suspense>
  );
}