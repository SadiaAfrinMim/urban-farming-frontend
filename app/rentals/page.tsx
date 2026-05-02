'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { RentalSpace } from '../lib/api';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface LiveUpdate {
  message: string;
  timestamp: Date;
}

export default function RentalsPage() {
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);

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
    if (!searchQuery && selectedSize === 'all' && selectedAvailability === 'all') {
      fetchSpaces();
      return;
    }
    try {
      setLoading(true);
      let filteredSpaces = await api.getRentalSpaces();

      if (searchQuery) {
        filteredSpaces = filteredSpaces.filter(space =>
          space.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          space.size.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedSize !== 'all') {
        filteredSpaces = filteredSpaces.filter(space =>
          space.size.toLowerCase().includes(selectedSize.toLowerCase())
        );
      }

      if (selectedAvailability !== 'all') {
        const isAvailable = selectedAvailability === 'available';
        filteredSpaces = filteredSpaces.filter(space => space.availability === isAvailable);
      }

      setSpaces(filteredSpaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সার্চ করা যাচ্ছে না');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchSpaces();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSize, selectedAvailability, searchQuery]);

  // Real-time updates socket connection
  useEffect(() => {
    const socketConnection = io('https://urban-farming-backend-pink.vercel.app', {
      transports: ['websocket', 'polling'],
    });

    socketConnection.on('connect', () => {
      console.log('RentalsPage: Connected to WebSocket server');
      setLiveUpdates(prev => [...prev, {
        message: '🔗 রিয়েল-টাইম আপডেট সংযোগ স্থাপিত',
        timestamp: new Date()
      }]);
    });

    socketConnection.on('disconnect', () => {
      console.log('RentalsPage: Disconnected from WebSocket server');
      setLiveUpdates(prev => [...prev, {
        message: '🔌 সংযোগ বিচ্ছিন্ন',
        timestamp: new Date()
      }]);
    });

    socketConnection.on('rental-space-updated', (updatedSpace: any) => {
      console.log('RentalsPage: Rental space updated:', updatedSpace);
      setSpaces(prev => prev.map(space => space.id === updatedSpace.id ? updatedSpace : space));
      setLiveUpdates(prev => [{
        message: `🔄 রেন্টাল স্পেস আপডেট হয়েছে: ${updatedSpace.location}`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
      toast.success('রেন্টাল স্পেস আপডেট হয়েছে!');
    });

    socketConnection.on('rental-space-availability-changed', (updatedSpace: any) => {
      console.log('RentalsPage: Availability changed:', updatedSpace);
      setSpaces(prev => prev.map(space => space.id === updatedSpace.id ? updatedSpace : space));
      const availabilityMessage = updatedSpace.availability
        ? `✅ রেন্টাল স্পেস এখন উপলব্ধ: ${updatedSpace.location}`
        : `❌ রেন্টাল স্পেস বুক হয়েছে: ${updatedSpace.location}`;
      setLiveUpdates(prev => [{
        message: availabilityMessage,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
      toast.info(availabilityMessage);
    });

    socketConnection.on('plant-status-updated', (updateData: any) => {
      console.log('RentalsPage: Plant status updated:', updateData);
      setLiveUpdates(prev => [{
        message: `🌱 গাছের অবস্থা আপডেট: ${updateData.status} (${updateData.rentalSpaceId})`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
      toast.info('গাছের অবস্থা আপডেট হয়েছে');
    });

    socketConnection.on('watering-completed', (updateData: any) => {
      console.log('RentalsPage: Watering completed:', updateData);
      setLiveUpdates(prev => [{
        message: `💧 পানি দেওয়া হয়েছে - ${new Date().toLocaleTimeString('bn-BD')} (${updateData.rentalSpaceId})`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
      toast.info('পানি দেওয়া সম্পন্ন!');
    });

    socketConnection.on('vendor-update', (updateData: any) => {
      console.log('RentalsPage: Vendor update:', updateData);
      setLiveUpdates(prev => [{
        message: `👨‍🌾 ভেন্ডর আপডেট: ${updateData.message} (${updateData.rentalSpaceId})`,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
      toast.info(updateData.message);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleBookSpace = async (space: RentalSpace) => {
    try {
      const userProfile = await api.getMyProfile();
      if (!userProfile.success) {
        toast.error('প্রথমে লগইন করুন');
        return;
      }
    } catch {
      toast.error('প্রথমে লগইন করুন');
      return;
    }

    if (!confirm(`আপনি কি এই রেন্টাল স্পেস বুক করতে চান?\n\n📍 লোকেশন: ${space.location}\n💰 মূল্য: ৳${space.price}/মাস\n📏 সাইজ: ${space.size}`)) {
      return;
    }

    try {
      setBookingLoading(space.id.toString());
      await api.createRentalOrder({
        spaceId: space.id,
        totalPrice: space.price,
        duration: 1,
      });
      toast.success('🎉 রেন্টাল স্পেস সফলভাবে বুক করা হয়েছে!');
      setSpaces(prev => prev.map(s => s.id === space.id ? {...s, availability: false} : s));
      setTimeout(() => {
        fetchSpaces();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to book rental space:', err);
      toast.error(err?.response?.data?.message || err?.message || 'বুক করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
          </div>
          <div className="text-xl text-cyan-400 font-medium">পানির উদ্যান লোড হচ্ছে...</div>
          <div className="text-sm text-gray-500">আপনার স্বপ্নের উদ্যান খুঁজে আনা হচ্ছে</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-500 text-6xl mb-4">🌊</div>
        <div className="text-red-500 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center max-w-md">{error}</div>
        <button
          onClick={fetchSpaces}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🔄 আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
          <div className="flex gap-4">
            <Link href="/marketplace" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              🛒 মার্কেটপ্লেস
            </Link>
            <Link href="/orders" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              📦 আমার অর্ডার
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-cyan-500/20">
            <span className="text-2xl">💧</span>
            <span className="text-cyan-300 font-medium">পানির উদ্যান</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-6">
            পানির রেন্টাল স্পেস
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            আপনার নিজস্ব পানির উদ্যান তৈরি করুন। সবুজ পরিবেশে আধুনিক কৃষি শুরু করুন।
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-cyan-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{spaces.length}</div>
              <div className="text-sm text-gray-400">মোট স্পেস</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-green-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {spaces.filter(s => s.availability).length}
              </div>
              <div className="text-sm text-gray-400">অভ্যন্তরীণ</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-red-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {spaces.filter(s => !s.availability).length}
              </div>
              <div className="text-sm text-gray-400">বুক করা</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-cyan-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                ৳{spaces.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">মোট মূল্য</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">🔍 সার্চ করুন</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="লোকেশন বা সাইজ দিয়ে খুঁজুন..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">📏 সাইজ</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-white"
                >
                  <option value="all">সব সাইজ</option>
                  <option value="small">ছোট (১০০-৫০০ বর্গফুট)</option>
                  <option value="medium">মাঝারি (৫০০-১০০০ বর্গফুট)</option>
                  <option value="large">বড় (১০০০+ বর্গফুট)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">✅ অবস্থা</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-white"
                >
                  <option value="all">সব অবস্থা</option>
                  <option value="available">অভ্যন্তরীণ</option>
                  <option value="booked">বুক করা</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={searchSpaces}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                🔍 ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>

        {/* Spaces Grid */}
        {spaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">💧🌱</div>
            <div className="text-gray-300 text-2xl font-medium mb-4">কোনো পানির স্পেস পাওয়া যায়নি</div>
            <div className="text-gray-500 text-lg mb-8">ফিল্টার পরিবর্তন করে চেষ্টা করুন অথবা একটু পরে আবার দেখুন</div>
            <button
              onClick={fetchSpaces}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              🔄 রিফ্রেশ করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="group bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-800 hover:border-cyan-500/30"
              >
                {/* Image Section */}
                <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {space.image ? (
                    <img
                      src={space.image}
                      alt={space.location}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
                          <div class="relative z-10 text-center flex items-center justify-center h-full">
                            <div class="text-center">
                              <div class="text-7xl mb-2 animate-bounce">💧</div>
                              <div class="text-gray-400 font-medium">পানির উদ্যান</div>
                            </div>
                          </div>
                          <div class="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                          <div class="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping" style="animationDelay: 0.5s"></div>
                          <div class="absolute bottom-6 left-8 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" style="animationDelay: 1s"></div>
                        `;
                      }}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
                      <div className="relative z-10 text-center flex items-center justify-center h-full">
                        <div className="text-7xl mb-2 animate-bounce">💧</div>
                        <div className="text-gray-400 font-medium">পানির উদ্যান</div>
                      </div>
                      <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                      <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                    </>
                  )}

                  <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-cyan-400 shadow-lg border border-gray-700">
                    📏 {space.size || 'মাঝারি'}
                  </div>

                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                    space.availability
                      ? 'bg-green-600/90 text-white'
                      : 'bg-red-600/90 text-white'
                  }`}>
                    {space.availability ? '✅ অভ্যন্তরীণ' : '❌ বুক করা'}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="font-bold text-2xl text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {space.location}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-cyan-400">📍</span>
                      <span className="text-sm">লোকেশন: {space.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-cyan-400">💰</span>
                      <span className="text-sm">মূল্য: ৳{space.price}/মাস</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-cyan-400">🌊</span>
                      <span className="text-sm">পানির ব্যবস্থা: উন্নত</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-cyan-400">🌱</span>
                      <span className="text-sm">সবুজ পরিবেশ: আদর্শ</span>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
                      ৳{space.price}
                    </div>
                    <div className="text-gray-400 text-sm">প্রতি মাস</div>
                    <div className="text-gray-500 text-xs">≈ ${(space.price / 120).toFixed(2)} USD</div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/rentals/${space.id}`}
                      className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-center text-sm border border-gray-700"
                    >
                      👁️ বিস্তারিত দেখুন
                    </Link>
                    {space.availability && (
                      <button
                        onClick={() => handleBookSpace(space)}
                        disabled={bookingLoading === space.id.toString()}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                      >
                        {bookingLoading === space.id.toString() ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            বুক হচ্ছে...
                          </div>
                        ) : (
                          '💧 বুক করুন'
                        )}
                      </button>
                    )}
                  </div>

                  {space.plantStatus && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-300 mb-2">🌱 গাছের অবস্থা:</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-cyan-400 font-medium">{space.plantStatus.health || 'ভালো'}</div>
                          <div className="text-gray-500">স্বাস্থ্য</div>
                        </div>
                        <div className="text-center">
                          <div className="text-cyan-400 font-medium">{space.plantStatus.age || 'নতুন'}</div>
                          <div className="text-gray-500">বয়স</div>
                        </div>
                        <div className="text-center">
                          <div className="text-cyan-400 font-medium">{space.plantStatus.growth || 'ভালো'}</div>
                          <div className="text-gray-500">বৃদ্ধি</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Updates Section */}
        <div className="mt-16 bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-2xl font-bold text-white">রিয়েল-টাইম আপডেট</h3>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
              লাইভ
            </span>
          </div>

          {liveUpdates.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
              {liveUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-sm mt-0.5">🔔</div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">{update.message}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {update.timestamp.toLocaleTimeString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📡</div>
              <p className="text-gray-400 text-sm">রিয়েল-টাইম আপডেটের জন্য অপেক্ষা করুন...</p>
              <p className="text-gray-500 text-xs mt-1">ভেন্ডর বা সিস্টেম আপডেট করলে এখানে দেখাবে</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-cyan-400">ℹ️</span>
              <span className="text-gray-300 text-sm font-medium">কী ধরনের আপডেট দেখবেন:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
              <div>• রেন্টাল স্পেস তথ্য পরিবর্তন</div>
              <div>• উপলব্ধতা স্ট্যাটাস আপডেট</div>
              <div>• গাছের অবস্থা পরিবর্তন</div>
              <div>• পানি দেওয়ার তথ্য</div>
              <div>• ভেন্ডরের বার্তা এবং নোটিফিকেশন</div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">পানির উদ্যান কেন বেছে নেবেন?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              আমাদের পানির রেন্টাল স্পেসগুলোতে আধুনিক কৃষি প্রযুক্তি এবং পরিবেশবান্ধব ব্যবস্থা রয়েছে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💧</div>
              <h3 className="text-xl font-bold text-white mb-2">পানির ব্যবস্থা</h3>
              <p className="text-gray-400 text-sm">উন্নত পানি সংরক্ষণ এবং সেচ ব্যবস্থা</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-white mb-2">সবুজ পরিবেশ</h3>
              <p className="text-gray-400 text-sm">পরিবেশবান্ধব এবং টেকসই কৃষি পদ্ধতি</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">মনিটরিং</h3>
              <p className="text-gray-400 text-sm">রিয়েল-টাইম গাছের স্বাস্থ্য মনিটরিং</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }
      `}</style>
    </div>
  );
}