'use client';

import { use, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { Produce, RentalSpace, User } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import ProfileImage from '../../components/ProfileImage';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface PageProps {
  params: {
    id: string;
  };
}

export default function UserProfilePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [user, setUser] = useState<User | null>(null);
  const [produces, setProduces] = useState<Produce[]>([]);
  const [rentals, setRentals] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchUserProfile();
    setupWebSocket();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get user info (might fail if not authorized to see details)
      try {
        const userRes = await api.getAllUsers();
        const foundUser = userRes.find(u => u.id === userId);
        if (foundUser) {
          setUser(foundUser);
        }
      } catch (userError) {
        console.warn('Could not fetch user details:', userError);
        // Create a basic user object
        setUser({
          id: userId,
          name: 'User',
          email: '',
          role: 'Customer'
        });
      }

      // Fetch user's produces
      try {
        const allProduces = await api.getProduces();
        const userProduces = allProduces.filter(p => p.vendorId === userId);
        setProduces(userProduces);
      } catch (produceError) {
        console.warn('Could not fetch user produces:', produceError);
        setProduces([]);
      }

      // Fetch user's rental spaces
      try {
        const allRentals = await api.getRentalSpaces();
        const userRentals = allRentals.filter(r => r.vendorId === parseInt(userId));
        setRentals(userRentals);
      } catch (rentalError) {
        console.warn('Could not fetch user rentals:', rentalError);
        setRentals([]);
      }

    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      setError(err?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const socketConnection = io(api.SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socketConnection.on('connect', () => {
      console.log('UserProfilePage: Connected to WebSocket server');
    });

    socketConnection.on('disconnect', () => {
      console.log('UserProfilePage: Disconnected from WebSocket server');
    });

    // Listen for real-time updates
    socketConnection.on('rental-space-updated', (updatedSpace: any) => {
      if (updatedSpace.vendorId === parseInt(userId)) {
        setRentals(prev => prev.map(space =>
          space.id === updatedSpace.id ? updatedSpace : space
        ));
      }
    });

    socketConnection.on('produce-updated', (updatedProduce: any) => {
      if (updatedProduce.vendorId === userId) {
        setProduces(prev => prev.map(produce =>
          produce.id === updatedProduce.id ? updatedProduce : produce
        ));
      }
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <div className="text-xl text-cyan-400 font-medium">প্রোফাইল লোড হচ্ছে...</div>
          <div className="text-sm text-gray-500">ব্যবহারকারীর তথ্য এবং পণ্য লোড করা হচ্ছে</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 gap-4">
        <div className="text-red-500 text-6xl mb-4">👤</div>
        <div className="text-red-400 text-xl font-medium text-center">
          {error || 'ব্যবহারকারী খুঁজে পাওয়া যায়নি'}
        </div>
        <Link
          href="/marketplace"
          className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🛒 মার্কেটপ্লেসে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            ← মার্কেটপ্লেসে ফিরে যান
          </Link>
        </div>

        {/* User Profile Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 shadow-xl mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              <ProfileImage
                user={{
                  name: user.name,
                  role: user.role,
                  profileData: user.role === 'Vendor' ? { farmName: 'Farm' } : undefined
                }}
                size="xl"
                className="border-4 border-cyan-500/30 shadow-2xl"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
                {user.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <StatusBadge status={user.role} />
                {user.role === 'Vendor' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900/50 text-green-300 border border-green-700">
                    🏪 ভেন্ডর
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{produces.length}</div>
                  <div className="text-sm text-gray-400">পণ্য</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{rentals.length}</div>
                  <div className="text-sm text-gray-400">রেন্টাল স্পেস</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {produces.filter(p => p.certificationStatus === 'Approved').length}
                  </div>
                  <div className="text-sm text-gray-400">সার্টিফাইড</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {rentals.filter(r => r.availability).length}
                  </div>
                  <div className="text-sm text-gray-400">উপলব্ধ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        {produces.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-cyan-400">🥕</span>
              {user.role === 'Vendor' ? 'ফার্মের পণ্য' : 'পণ্য'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {produces.map((product) => (
                <div
                  key={product.id}
                  className="group bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-800 hover:border-cyan-500/30"
                >
                  <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {product.image ? (
                      <img
                        src={api.resolveAssetUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
                            <div class="relative z-10 text-center flex items-center justify-center h-full">
                              <div class="text-center">
                                <div class="text-7xl mb-2 animate-bounce">🥕</div>
                                <div class="text-gray-400 font-medium">পণ্যের ছবি</div>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse">
                        <div className="relative z-10 text-center flex items-center justify-center h-full">
                          <div className="text-7xl mb-2 animate-bounce">🥕</div>
                          <div className="text-gray-400 font-medium">পণ্যের ছবি নেই</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-cyan-400 shadow-lg border border-gray-700">
                      {product.category}
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                      product.certificationStatus === 'Approved'
                        ? 'bg-green-600/90 text-white'
                        : 'bg-yellow-600/90 text-white'
                    }`}>
                      {product.certificationStatus === 'Approved' ? '✅ সার্টিফাইড' : '⏳ অপেক্ষমান'}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-2xl text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {product.name}
                    </h3>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-cyan-400">📦</span>
                        <span className="text-sm">বিবরণ: {product.description || 'নেই'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-cyan-400">📏</span>
                        <span className="text-sm">পরিমাণ: {product.availableQuantity} {product.unit || 'ইউনিট'}</span>
                      </div>
                      {product.isOrganic && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="text-green-400">🌱</span>
                          <span className="text-sm">অর্গানিক</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
                        ৳{product.price}
                      </div>
                      <div className="text-gray-400 text-sm">প্রতি {product.unit || 'ইউনিট'}</div>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-center"
                    >
                      👁️ বিস্তারিত দেখুন
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rentals Section */}
        {rentals.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-cyan-400">🏡</span>
              রেন্টাল স্পেস
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rentals.map((rental) => (
                <div
                  key={rental.id}
                  className="group bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-800 hover:border-cyan-500/30"
                >
                  <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {rental.image ? (
                      <img
                        src={api.resolveAssetUrl(rental.image)}
                        alt={rental.location}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
                            <div class="relative z-10 text-center flex items-center justify-center h-full">
                              <div class="text-center">
                                <div class="text-7xl mb-2 animate-bounce">💧</div>
                                <div class="text-gray-400 font-medium">হাইড্রোপোনিক গার্ডেন</div>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse">
                        <div className="relative z-10 text-center flex items-center justify-center h-full">
                          <div className="text-7xl mb-2 animate-bounce">💧</div>
                          <div className="text-gray-400 font-medium">পানির উদ্যান</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-cyan-400 shadow-lg border border-gray-700">
                      📏 {rental.size === 'small' ? 'ছোট' : rental.size === 'medium' ? 'মাঝারি' : rental.size === 'large' ? 'বড়' : 'মাঝারি'}
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                      rental.availability
                        ? 'bg-green-600/90 text-white'
                        : 'bg-red-600/90 text-white'
                    }`}>
                      {rental.availability ? '✅ উপলব্ধ' : '❌ বুকড'}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-2xl text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {rental.location}
                    </h3>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-cyan-400">📍</span>
                        <span className="text-sm">অবস্থান: {rental.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-cyan-400">🌊</span>
                        <span className="text-sm">পানি সিস্টেম: উন্নত</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-cyan-400">🌱</span>
                        <span className="text-sm">সবুজ পরিবেশ: আদর্শ</span>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
                        ৳{rental.price}
                      </div>
                      <div className="text-gray-400 text-sm">প্রতি মাস</div>
                    </div>

                    <Link
                      href={`/rentals/${rental.id}`}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-center"
                    >
                      👁️ বিস্তারিত দেখুন
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {produces.length === 0 && rentals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👤</div>
            <div className="text-gray-300 text-2xl font-medium mb-4">
              {user.role === 'Vendor' ? 'এই ভেন্ডরের কোনো লিস্টিং নেই' : 'এই ব্যবহারকারীর কোনো তথ্য নেই'}
            </div>
            <div className="text-gray-500 text-lg mb-8">
              {user.role === 'Vendor' ? 'ভেন্ডর এখনও কোনো পণ্য বা রেন্টাল স্পেস যোগ করেনি' : 'ব্যবহারকারী এখনও কোনো তথ্য যোগ করেনি'}
            </div>
            <Link
              href="/marketplace"
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              🛒 মার্কেটপ্লেস দেখুন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}