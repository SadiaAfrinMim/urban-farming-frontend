'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Clear any pending order data
    localStorage.removeItem('pendingOrderId');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            পেমেন্ট সফল হয়েছে! 🎉
          </h1>

          <p className="text-gray-600 mb-6">
            আপনার অর্ডার সফলভাবে প্রসেস করা হয়েছে। আপনার প্রোডাক্ট শীঘ্রই ডেলিভারি করা হবে।
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">অর্ডার আইডি:</p>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/orders"
              className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              আমার অর্ডার দেখুন
            </Link>

            <Link
              href="/marketplace"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              আরও প্রোডাক্ট কিনুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}