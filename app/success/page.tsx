'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to orders page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• You'll receive an order confirmation email</li>
              <li>• Your vendor will start preparing your order</li>
              <li>• Track your order status in real-time</li>
              <li>• Expect delivery within 3-5 business days</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/orders"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            You will be redirected to your orders page in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}