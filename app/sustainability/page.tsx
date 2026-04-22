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
      const data = await api.getSustainabilityTips();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← হোম পেজে ফিরে যান</Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">সাস্টেইনেবিলিটি সার্টিফিকেট</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg">কোনো টিপস পাওয়া যায়নি</div>
          ) : (
            tips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-800">{tip.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800`}>
                    {tip.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{tip.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
