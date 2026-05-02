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
      setError(err?.message || 'পেমেন্ট ফেইল্ড');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-green-200 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-8 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🎉 পেমেন্ট সফল!</h1>
          <p className="text-gray-600 mb-6 text-lg">
            আপনার অর্ডার কনফার্ম হয়েছে। তাজা প্রোডাক্ট শীঘ্রই পৌঁছে যাবে।
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 font-medium">
              অর্ডার ট্র্যাক করতে আপনার অর্ডার পেজে যান
            </p>
          </div>
          <p className="text-sm text-gray-500">অর্ডার পেজে রিডাইরেক্ট হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">পেমেন্ট সামারি</p>
              <p className="text-sm text-gray-600">
                {productDetails?.produce?.name || 'প্রোডাক্ট'} × {productDetails?.quantity || 1}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-700">
              ৳{productDetails?.totalPrice || productDetails?.totalAmount || 0}
            </p>
            <p className="text-xs text-blue-600">
              ≈ ${(Math.round((productDetails?.totalPrice || productDetails?.totalAmount || 0) / 120 * 100) / 100).toFixed(2)} USD
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all">
          <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            কার্ড তথ্য দিন
          </label>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: '500',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#dc2626',
                    iconColor: '#dc2626',
                  },
                },
                hidePostalCode: true,
              }}
              className="focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            কার্ড তথ্য Stripe-এর মাধ্যমে সুরক্ষিতভাবে প্রসেস হয়
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-green-200 hover:shadow-green-300 transform hover:scale-105 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              পেমেন্ট প্রসেসিং...
            </>
          ) : (
            <>
              <ShieldCheck className="w-6 h-6" />
              ৳{productDetails?.totalPrice || productDetails?.totalAmount || 0} পেমেন্ট করুন
            </>
          )}
        </button>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-8 opacity-70" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8 opacity-70" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-8 opacity-70" />
          </div>
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            256-bit SSL এনক্রিপশন | PCI DSS কমপ্লায়েন্ট | আপনার ডেটা সুরক্ষিত
          </p>
        </div>
      </form>
    </div>
  );
};

export default function CheckoutPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any>(null);

  useEffect(() => {
    initiatePayment();
  }, [orderId]);

  const initiatePayment = async () => {
    try {
      setLoading(true);

      // Get auth token
      const token = localStorage.getItem('accessToken') ||
                   document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];

      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fetch order details first
      const orderRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const order = orderRes.data.data;
      setProductDetails(order);

      // Create payment intent
      const paymentRes = await axios.post('http://localhost:5000/api/v1/payment/create-intent', {
        orderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClientSecret(paymentRes.data.data.clientSecret);
      setOrderDetails(paymentRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-200 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">পেমেন্ট প্রস্তুত করা হচ্ছে</h2>
          <p className="text-gray-600">অনুগ্রহ করে অপেক্ষা করুন...</p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-red-200 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">পেমেন্ট ত্রুটি</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              আবার চেষ্টা করুন
            </button>
            <button
              onClick={() => window.location.href = '/orders'}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-medium transition-all"
            >
              অর্ডার পেজে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              সুরক্ষিত পেমেন্ট
            </h1>
            <p className="text-gray-600 text-lg">আপনার তাজা প্রোডাক্ট অর্ডার সম্পূর্ণ করুন</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-500">SSL এনক্রিপ্টেড | PCI কমপ্লায়েন্ট</span>
            </div>
          </div>
          
          {productDetails && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-8 border border-green-200">
              {/* Product Summary Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {productDetails.produce?.name || 'প্রোডাক্ট'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    অর্ডার #{orderId.slice(0, 8)}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>পরিমাণ: {productDetails.quantity || 1} {productDetails.produce?.unit || 'ইউনিট'}</span>
                    {productDetails.produce?.isOrganic && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        🌱 অর্গানিক
                      </span>
                    )}
                  </div>
                </div>
                {productDetails.produce?.image && (
                  <div className="ml-4">
                    <img
                      src={productDetails.produce.image}
                      alt={productDetails.produce.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-green-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ইউনিট মূল্য</span>
                    <span className="font-medium">৳{productDetails.produce?.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">পরিমাণ × {productDetails.quantity || 1}</span>
                    <span className="font-medium">৳{(productDetails.produce?.price || 0) * (productDetails.quantity || 1)}</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">মোট মূল্য</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">
                        ৳{productDetails.totalPrice || productDetails.totalAmount || 0}
                      </p>
                      <p className="text-xs text-green-600">
                        ≈ ${(Math.round((productDetails.totalPrice || productDetails.totalAmount || 0) / 120 * 100) / 100).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Info */}
              {productDetails.vendor && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🏢</span>
                    <span>{productDetails.vendor.farmName || 'ভেন্ডর'}</span>
                    {productDetails.vendor.certificationStatus === 'Approved' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 ml-2">
                        ✅ সার্টিফাইড
                      </span>
                    )}
                  </div>
                </div>
              )}
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