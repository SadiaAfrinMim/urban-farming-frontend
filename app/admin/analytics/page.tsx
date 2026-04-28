'use client';

import Link from 'next/link';
import { AlertCircle, DollarSign, TrendingUp, Package, MapPin } from 'lucide-react';
import { useAllOrders, useRentalAnalytics, useRevenueAnalytics } from '../../hooks/useApi';

interface Order {
  id: string;
  userId: string;
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt: string;
  items?: any[];
  produce?: {
    id: string;
    name: string;
    price: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Analytics {
  rentalAnalytics?: {
    totalSpaces: number;
    rentedSpaces: number;
    rentedPercentage: number;
  };
  revenueAnalytics?: {
    totalRevenue: number;
    commission: number;
    orderCount: number;
  };
}

export default function AdminAnalyticsPage() {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useAllOrders({ limit: 10 });
  const { data: rentalAnalytics, isLoading: rentalLoading, error: rentalError } = useRentalAnalytics();
  const { data: revenueAnalytics, isLoading: revenueLoading, error: revenueError } = useRevenueAnalytics();

  const orders = ordersData || [];
  const loading = ordersLoading || rentalLoading || revenueLoading;
  const error = ordersError || rentalError || revenueError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ত্রুটি</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-[#39FF14] hover:text-[#28CC0C] hover:underline">← এডমিন ড্যাশবোর্ডে ফিরে যান</Link>
        </div>

        <h1 className="text-3xl font-bold text-[#39FF14] mb-8">অ্যানালিটিক্স এবং রিপোর্ট</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {rentalAnalytics && (
            <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#39FF14]">রেন্টাল স্পেস</h3>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#39FF14]">{rentalAnalytics.totalSpaces}</p>
              <p className="text-sm text-gray-400">মোট স্পেস: {rentalAnalytics.rentedSpaces} ভাড়া হয়েছে ({rentalAnalytics.rentedPercentage}%)</p>
            </div>
          )}

          {revenueAnalytics && (
            <>
              <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#39FF14]">মোট রেভেনু</h3>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#39FF14]">৳{revenueAnalytics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-400">{revenueAnalytics.orderCount}টি অর্ডার থেকে</p>
              </div>

              <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#39FF14]">কমিশন</h3>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#39FF14]">৳{revenueAnalytics.commission.toLocaleString()}</p>
                <p className="text-sm text-gray-400">প্ল্যাটফর্ম কমিশন</p>
              </div>

              <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#39FF14]">মোট অর্ডার</h3>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#39FF14]">{revenueAnalytics.orderCount}</p>
                <p className="text-sm text-gray-400">সফল অর্ডারের সংখ্যা</p>
              </div>
            </>
          )}


        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">সাম্প্রতিক অর্ডার</h2>
            <Link href="/admin/orders" className="text-blue-600 hover:underline text-sm">সব অর্ডার দেখুন</Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">কোনো অর্ডার নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">অর্ডার #{order.id.toString().slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.user?.name} • {(() => {
                          try {
                            const date = new Date(order.createdAt);
                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ৳{(order.totalAmount || order.total || 0).toLocaleString()}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
