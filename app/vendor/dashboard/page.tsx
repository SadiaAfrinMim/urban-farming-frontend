'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnalyticsCard } from '../../components/AnalyticsCard';
import api from '../../lib/api';

interface DashboardStats {
  totalSales: number;
  activeRentals: number;
  pendingOrders: number;
  totalProducts: number;
  monthlyEarnings: { month: string; earnings: number }[];
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const token = localStorage.getItem('accessToken');
      console.log('🔐 Auth token exists:', !!token);
      console.log('🔍 Fetching vendor dashboard stats from:', process.env.NEXT_PUBLIC_API_URL);

      const data = await api.getVendorDashboardStats();
      console.log('✅ Dashboard stats received:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Dashboard stats error:', err);

      // More detailed error handling
      let errorMessage = 'Failed to load dashboard stats';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check for specific error types
        if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
          errorMessage = 'Authentication required. Please login again.';
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = 'Access denied. Vendor account required.';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'API endpoint not found. Please check server connection.';
        }
      }

      setError(errorMessage);

      // Set mock data for demo purposes
      console.log('🔄 Using mock data for demo');
      setStats({
        totalSales: 1250.50,
        activeRentals: 8,
        pendingOrders: 3,
        totalProducts: 24,
        monthlyEarnings: [
          { month: 'Jan', earnings: 450 },
          { month: 'Feb', earnings: 520 },
          { month: 'Mar', earnings: 680 },
          { month: 'Apr', earnings: 600 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
          <div className="text-xl text-[#39FF14] font-medium">ড্যাশবোর্ড লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-400 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#39FF14] mb-2">
            🌱 ভেন্ডর ড্যাশবোর্ড
          </h1>
          <p className="text-gray-400 text-lg">আপনার ফার্মের পারফরম্যান্স এবং অর্ডার ম্যানেজ করুন</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnalyticsCard
            title="মোট বিক্রয়"
            value={`৳ ${stats?.totalSales?.toLocaleString('bn-BD') || 0}`}
            icon={<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl">💰</div>}
          />
          <AnalyticsCard
            title="সক্রিয় রেন্টাল"
            value={stats?.activeRentals || 0}
            icon={<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl">🏠</div>}
          />
          <AnalyticsCard
            title="পেন্ডিং অর্ডার"
            value={stats?.pendingOrders || 0}
            icon={<div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xl">📦</div>}
          />
          <AnalyticsCard
            title="মোট প্রোডাক্ট"
            value={stats?.totalProducts || 0}
            icon={<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xl">🥕</div>}
          />
        </div>

        {/* Monthly Earnings Chart */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-2xl flex items-center justify-center text-black text-xl">
              📈
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#39FF14]">মাসিক আয়</h2>
              <p className="text-gray-400">গত ৪ মাসের আয়ের পরিসংখ্যান</p>
            </div>
          </div>

          <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-600">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-gray-400 text-lg font-medium mb-2">চার্ট ইন্টিগ্রেশন প্রয়োজন</div>
              <div className="text-gray-500 text-sm">Recharts লাইব্রেরি যোগ করে চার্ট দেখানো যাবে</div>
            </div>
          </div>

          {/* Simple Bar Chart Placeholder */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            {stats?.monthlyEarnings?.map((earning, index) => (
              <div key={earning.month} className="text-center">
                <div className="bg-gradient-to-t from-[#39FF14] to-[#28CC0C] rounded-lg mb-2"
                     style={{ height: `${Math.max(20, (earning.earnings / 1000) * 60)}px` }}>
                </div>
                <div className="text-sm font-medium text-gray-300">{earning.month}</div>
                <div className="text-xs text-gray-400">৳{earning.earnings}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/vendor/profile" className="group bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-2xl flex items-center justify-center text-black text-xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#39FF14] group-hover:text-[#28CC0C] transition-colors">ফার্ম প্রোফাইল</h3>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">আপনার ফার্মের বিস্তারিত তথ্য এবং সার্টিফিকেশন ম্যানেজ করুন</p>
            <div className="mt-4 flex items-center text-[#39FF14] font-medium group-hover:text-[#28CC0C]">
              <span>যান</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link href="/vendor/products" className="group bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-2xl flex items-center justify-center text-black text-xl group-hover:scale-110 transition-transform">
                🥕
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#39FF14] group-hover:text-[#28CC0C] transition-colors">প্রোডাক্ট</h3>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">আপনার অর্গানিক ফলমূল এবং শাকসবজি যোগ এবং ম্যানেজ করুন</p>
            <div className="mt-4 flex items-center text-[#39FF14] font-medium group-hover:text-[#28CC0C]">
              <span>যান</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link href="/vendor/rentals" className="group bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                🌱
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#39FF14] group-hover:text-orange-700 transition-colors">রেন্টাল স্পেস</h3>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">বাগানের জমি ভাড়া দেওয়ার জন্য ম্যানেজ করুন</p>
            <div className="mt-4 flex items-center text-[#39FF14] font-medium group-hover:text-[#28CC0C]">
              <span>যান</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link href="/vendor/plant-tracking" className="group bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                🌿
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#39FF14] group-hover:text-cyan-700 transition-colors">প্ল্যান্ট ট্র্যাকিং</h3>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">গ্রাহকদের জন্য গাছের স্ট্যাটাস আপডেট করুন</p>
            <div className="mt-4 flex items-center text-[#39FF14] font-medium group-hover:text-[#28CC0C]">
              <span>যান</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link href="/vendor/orders" className="group bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                📦
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#39FF14] group-hover:text-yellow-700 transition-colors">অর্ডার</h3>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">গ্রাহকদের অর্ডার হ্যান্ডেল করুন</p>
            <div className="mt-4 flex items-center text-[#39FF14] font-medium group-hover:text-[#28CC0C]">
              <span>যান</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link href="/vendor/community" className="group bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#39FF14] group-hover:text-pink-700 transition-colors">কমিউনিটি</h3>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">পোস্ট এবং নোটিফিকেশন দেখুন</p>
            <div className="mt-4 flex items-center text-[#39FF14] font-medium group-hover:text-[#28CC0C]">
              <span>যান</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}