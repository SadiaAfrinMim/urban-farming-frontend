'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const canceled = searchParams.get('canceled');
    if (sessionId) {
      setTimeout(() => setStatus('success'), 1500);
    } else if (canceled) {
      setTimeout(() => setStatus('error'), 1000);
    } else {
      setTimeout(() => setStatus('error'), 1500);
    }
  }, [sessionId, searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-gray-100">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50"></div>
            <Loader2 className="w-20 h-20 mx-auto text-green-600 animate-spin relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">পেমেন্ট প্রসেস হচ্ছে</h1>
          <p className="text-gray-500 mb-2">অনুগ্রহ করে অপেক্ষা করুন...</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-6 overflow-hidden">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md border border-green-100 transform transition-all">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-40"></div>
            <div className="relative z-10 bg-green-100 w-28 h-28 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">✅ পেমেন্ট সফল হয়েছে!</h1>
          <p className="text-gray-600 mb-2 text-lg">আপনার অর্ডার সফলভাবে কনফার্ম করা হয়েছে</p>
          <p className="text-gray-500 mb-8">ডেলিভারি খুব শীঘ্রই পাঠানো হবে।</p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/orders'}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg shadow-green-200 hover:shadow-xl"
            >
              📦 আমার অর্ডার দেখুন
            </button>
            <button
              onClick={() => window.location.href = '/products'}
              className="w-full px-6 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium border border-gray-200 transition-all"
            >
              🛒 আরো প্রোডাক্ট কিনুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md border border-red-100">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-40"></div>
          <div className="relative z-10 bg-red-100 w-28 h-28 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">❌ পেমেন্ট ব্যর্থ হয়েছে</h1>
        <p className="text-gray-600 mb-2 text-lg">দয়া করে আবার চেষ্টা করুন</p>
        <p className="text-gray-500 mb-8">আপনার অ্যাকাউন্ট থেকে কোনো টাকা কাটা হয়নি।</p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/orders'}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-200 hover:shadow-xl"
          >
            🔄 আবার চেষ্টা করুন
          </button>
          <button
            onClick={() => window.location.href = '/products'}
            className="w-full px-6 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium border border-gray-200 transition-all"
          >
            🛍️ প্রোডাক্ট পেজে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
