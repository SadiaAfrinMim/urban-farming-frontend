'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { RentalSpace } from '../lib/api';

export default function RentalsPage() {
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const data = await api.getRentalSpaces();
      setSpaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রেন্টাল স্পেস লিস্ট পেতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const searchSpaces = async () => {
    if (!searchQuery) {
      fetchSpaces();
      return;
    }
    try {
      setLoading(true);
      // For now, filter locally. In production, implement server-side search
      const allSpaces = await api.getRentalSpaces();
      const filteredSpaces = allSpaces.filter(space =>
        space.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSpaces(filteredSpaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সার্চ করা যাচ্ছে না');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <div className="text-xl text-gray-700 font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 gap-4">
        <div className="text-red-600 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-600 text-xl font-medium text-center">{error}</div>
        <button
          onClick={fetchSpaces}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🌱 রেন্টাল স্পেস
          </h1>
          <p className="text-lg text-gray-600">আপনার নিজস্ব উদ্যান তৈরি করুন</p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="স্পেস সার্চ করুন..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            />
            <button
              onClick={searchSpaces}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              🔍 সার্চ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="relative h-48 bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center overflow-hidden">
                <span className="text-6xl">🌱</span>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-green-700">
                  {space.size || 'সাইজ'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-2">{space.location}</h3>
                <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                  📍 {space.location}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      ৳ {space.price}
                    </span>
                    <span className="text-xs text-gray-500">প্রতি মাস</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${space.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {space.available ? '✅ অভ্যন্তরীণ' : '❌ ব্যবহৃত'}
                  </span>
                </div>
                {space.available && (
                  <button className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                    📅 বুক করুন
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
