'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { SustainabilityTip } from '../lib/api';

export default function SustainabilityPage() {
  const [tips, setTips] = useState<SustainabilityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const data = await api.getSustainabilityCerts();
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'টিপস লিস্ট পেতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <div className="text-xl text-gray-300 font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🌍 সাস্টেইনেবিলিটি টিপস
          </h1>
          <p className="text-lg text-gray-300">পরিবেশবান্ধব উদ্যান তৈরির জন্য দরকারী পরামর্শ</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-6 py-4 rounded-xl mb-8 shadow-sm">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🌱</div>
              <div className="text-gray-400 text-xl font-medium">কোনো টিপস পাওয়া যায়নি</div>
              <div className="text-gray-500 text-sm mt-2">শীঘ্রই যোগ করা হবে</div>
            </div>
          ) : (
            tips.map((tip) => (
              <div key={tip.id} className="bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl text-gray-100 leading-tight">{tip.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-900 to-blue-900 text-green-200 border border-green-700">
                    {tip.category}
                  </span>
                </div>
                <p className="text-gray-300 text-base leading-relaxed">{tip.description}</p>
                <div className="mt-6 flex items-center gap-2 text-green-400 font-medium">
                  <span>💡</span>
                  <span>দরকারী টিপ</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
