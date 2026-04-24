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
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-red-500 text-xl">{error}</div>
        <button 
          onClick={fetchSpaces}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← হোম পেজে ফিরে যান</Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">রেন্টাল স্পেস</h1>
        
        <div className="max-w-md mx-auto mb-10">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="স্পেস সার্চ করুন..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={searchSpaces}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              সার্চ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-6xl">🌱</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{space.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{space.location}</p>
                {space.area && <p className="text-gray-500 text-sm mb-3">আয়তন: {space.area} বর্গফুট</p>}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-600">৳ {space.price}/মাস</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${space.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {space.available ? 'অভ্যন্তরীণ' : 'ব্যবহৃত'}
                  </span>
                </div>
                {space.available && (
                  <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    বুক করুন
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
