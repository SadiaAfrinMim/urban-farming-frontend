'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Dynamic import of CheckoutForm
import dynamic from 'next/dynamic';

const CheckoutForm = dynamic(() => import('../components/CheckoutForm'), {
  loading: () => <div>Loading checkout form...</div>,
  ssr: false,
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');

    if (canceled) {
      router.push('/marketplace?payment=canceled');
      return;
    }

    if (sessionId) {
      // Handle successful payment
      router.push('/marketplace?payment=success');
      return;
    }

    // Create payment intent for the order
    createPaymentIntent();
  }, [searchParams]);

  const createPaymentIntent = async () => {
    try {
      // Get order ID from localStorage or URL params
      const storedOrderId = localStorage.getItem('pendingOrderId');
      console.log('Stored order ID:', storedOrderId);

      if (!storedOrderId) {
        setError('No order found for payment');
        setLoading(false);
        return;
      }

      console.log('Creating payment intent for order:', storedOrderId);

      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/v1/payments/create-intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({ orderId: storedOrderId }),
        credentials: 'include', // Important: include cookies
      });

      console.log('Payment intent response status:', response.status);
      const data = await response.json();
      console.log('Payment intent response data:', data);

      if (data.success) {
        setClientSecret(data.data.clientSecret);
        setOrderId(storedOrderId);
      } else {
        setError(data.message || 'Failed to create payment intent');
      }
    } catch (err) {
      console.error('Payment intent creation error:', err);
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">পেমেন্ট ইনিশিয়ালাইজ হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">পেমেন্ট ত্রুটি</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            মার্কেটপ্লেসে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            পেমেন্ট সম্পন্ন করুন
          </h1>

          {clientSecret && CheckoutForm && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm orderId={orderId} />
            </Elements>
          )}

          {clientSecret && !CheckoutForm && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">❌ CheckoutForm component failed to load</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Reload Page
              </button>
            </div>
          )}

          {!clientSecret && !loading && !error && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">পেমেন্ট লোড হচ্ছে...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}