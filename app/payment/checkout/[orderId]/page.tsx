'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, CreditCard, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51TBWwgCPSjSh2u8aqmr9vBHJKbG4bTaEHLC8zCaJx0QjoeNPrlULiZcW0tdPkBbRDfzFysGnUc48qPvpDNDSMu9Q00TotwWeR4');

const CheckoutForm = ({ clientSecret, orderId }: { clientSecret: string; orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) throw new Error('Card element not found');

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment in backend
        try {
          await axios.post('http://localhost:5000/api/v1/payment/confirm', {
            paymentIntentId: paymentIntent.id
          });
        } catch (confirmError) {
          console.error('Confirm payment error:', confirmError);
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">✅ পেমেন্ট সফল হয়েছে!</h3>
        <p className="text-gray-600">অর্ডার কনফার্ম করা হয়েছে। রিডাইরেক্ট করা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          কার্ড ডিটেইলস
        </label>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                fontFamily: 'system-ui, sans-serif',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#dc2626',
              },
            },
          }}
          className="p-4 bg-white border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-all"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            পেমেন্ট প্রসেস হচ্ছে...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            সুরক্ষিত পেমেন্ট করুন
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Stripe দ্বারা সুরক্ষিত | কোনো ডেটা আমাদের সার্ভারে সেভ হয় না
      </p>
    </form>
  );
};

export default function CheckoutPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    initiatePayment();
  }, [orderId]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      // Token is sent via cookies automatically
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await axios.post('http://localhost:5000/api/v1/payment/create-intent', {
        orderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClientSecret(res.data.data.clientSecret);
      setOrderDetails(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto text-green-600 animate-spin mb-4" />
          <p className="text-xl text-gray-600">পেমেন্ট পেজ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">চেকআউট সমস্যা</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/orders'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            অর্ডার পেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">পেমেন্ট করুন</h1>
            <p className="text-gray-500">আপনার অর্ডারটি সম্পূর্ণ করতে নিচের ফর্মটি পূরণ করুন</p>
          </div>
          
          {orderDetails && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-8 border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">অর্ডার পরিমাণ</p>
                  <p className="text-xs text-gray-500">Order #{orderId.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-700">৳ {orderDetails.amount}</p>
                  <p className="text-xs text-green-600">সহ সব খরচ</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
              <span className="text-xs text-gray-400 font-medium">সুরক্ষিত পেমেন্ট</span>
              <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-60" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-60" />
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}