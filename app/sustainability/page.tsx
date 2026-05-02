'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { SustainabilityTip } from '../lib/api';
import { useApprovedVendorCertificates } from '../hooks/useApi';

export default function SustainabilityPage() {
  const [tips, setTips] = useState<SustainabilityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: approvedVendors } = useApprovedVendorCertificates();

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

        {/* Summary Section */}
        {approvedVendors && approvedVendors.length > 0 && (
          <div className="mt-16 bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
              📊 সামারি
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {approvedVendors.reduce((total, vendor) => total + (vendor.produces?.length || 0), 0)}
                </div>
                <div className="text-gray-300">মোট পণ্য</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {approvedVendors.reduce((total, vendor) => total + (vendor.rentalSpaces?.length || 0), 0)}
                </div>
                <div className="text-gray-300">মোট রেন্টাল স্পেস</div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Profiles Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              👨‍🌾 সার্টিফাইড ভেন্ডর প্রোফাইলস
            </h2>
            <p className="text-lg text-gray-300">সাস্টেইনেবিলিটি সার্টিফাইড ভেন্ডরদের সাথে পরিচিত হোন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(!approvedVendors || approvedVendors.length === 0) ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">👨‍🌾</div>
                <div className="text-gray-400 text-xl font-medium">কোনো অনুমোদিত ভেন্ডর পাওয়া যায়নি</div>
                <div className="text-gray-500 text-sm mt-2">শীঘ্রই যোগ করা হবে</div>
              </div>
            ) : (
              approvedVendors?.map((vendor) => (
                <div key={vendor.id} className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {vendor.profilePhoto ? (
                        <img src={vendor.profilePhoto} alt={vendor.farmName} className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl text-white">👨‍🌾</span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-gray-100 mb-1">{vendor.user.name}</h3>
                    <p className="text-sm text-gray-400">{vendor.farmName}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">📍 অবস্থান:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.farmLocation}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">📧 ইমেইল:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">🌱 পণ্য:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.produces?.length || 0} টি</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">🏠 রেন্টাল স্পেস:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.rentalSpaces?.length || 0} টি</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-sm font-medium text-green-400">সাস্টেইনেবিলিটি সার্টিফাইড</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">🌱</span>
                      <span className="text-sm font-medium text-gray-200">অনুমোদিত</span>
                    </div>
                  </div>

                  {/* <div className="flex gap-3">
                    <Link
                      href={`/marketplace?vendor=${vendor.id}`}
                      className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      🛍️ পণ্য দেখুন
                    </Link>
                    <Link
                      href={`/vendor/profile?id=${vendor.id}`}
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      👤 প্রোফাইল
                    </Link>
                  </div> */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}