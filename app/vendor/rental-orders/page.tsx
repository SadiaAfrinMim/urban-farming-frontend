'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { Order } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function VendorRentalOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'Vendor') {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await api.getVendorRentalOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রেন্টাল অর্ডার লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await api.updateVendorRentalOrderStatus(orderId, status);
      toast.success('রেন্টাল অর্ডার স্ট্যাটাস আপডেট হয়েছে');
      fetchOrders(); // Refresh orders
    } catch (err) {
      toast.error('স্ট্যাটাস আপডেট করা যায়নি');
    }
  };

  if (!user || user.role !== 'Vendor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center bg-gray-900 p-8 rounded-xl shadow-2xl border border-[#39FF14]/20">
          <div className="text-[#39FF14] mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="#39FF14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#39FF14] mb-4">অনুমতি নেই</h1>
          <p className="text-gray-400 mb-6">এই পেজটি শুধুমাত্র ভেন্ডরদের জন্য</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-[#39FF14] hover:bg-[#28CC0C] text-black font-medium rounded-lg transition-colors duration-200">
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#39FF14]/20 border-t-[#39FF14] mx-auto mb-4"></div>
          <p className="text-[#39FF14] text-lg font-medium">রেন্টাল অর্ডার লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center bg-gray-900 p-8 rounded-xl shadow-2xl border border-[#39FF14]/20">
          <div className="text-[#39FF14] mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="#39FF14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#39FF14] mb-4">এরর হয়েছে</h2>
          <p className="text-gray-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#39FF14]">রেন্টাল অর্ডার ম্যানেজমেন্ট</h1>
            <p className="text-gray-400 mt-2 text-lg">আপনার রেন্টাল স্পেসের অর্ডার দেখুন এবং কনফার্ম করুন</p>
          </div>
          <Link href="/vendor/dashboard" className="inline-flex items-center px-6 py-3 bg-[#39FF14] hover:bg-[#28CC0C] text-black font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke="#39FF14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#39FF14] mb-2">কোনো রেন্টাল অর্ডার নেই</h3>
          <p className="text-gray-500 mb-4">আপনার রেন্টাল স্পেসে এখনো কোনো অর্ডার হয়নি</p>
          <Link href="/vendor/rentals" className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#28CC0C] transition-colors">
            রেন্টাল স্পেস ম্যানেজ করুন
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-black rounded-xl shadow-lg hover:shadow-2xl p-8 border border-[#39FF14]/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#39FF14]">রেন্টাল অর্ডার #{order.id}</h3>
                  <p className="text-sm text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="#39FF14" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="#39FF14" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    কাস্টমার: {order.user?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="px-4 py-2 border border-[#39FF14]/50 rounded-lg text-sm bg-gray-900 text-[#39FF14] focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    order.status === 'Delivered' ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/50' :
                    order.status === 'Confirmed' ? 'bg-blue-900 text-blue-300 border border-blue-500' :
                    order.status === 'Shipped' ? 'bg-purple-900 text-purple-300 border border-purple-500' :
                    order.status === 'Cancelled' ? 'bg-red-900 text-red-300 border border-red-500' :
                    'bg-gray-900 text-gray-300 border border-gray-500'
                  }`}>
                    {order.status === 'Delivered' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    {order.status === 'Confirmed' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {order.status === 'Shipped' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    {order.status === 'Cancelled' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                    {order.status === 'Pending' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#39FF14]/20 pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center border border-[#39FF14]/20">
                      <span className="text-3xl">🌱</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="#39FF14" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        রেন্টাল স্পেস: {order.rentalSpace?.location}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="#39FF14" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        সাইজ: {order.rentalSpace?.size}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#39FF14]">
                      ৳ {order.totalPrice || order.rentalSpace?.price || 0}
                    </p>
                    <p className="text-sm text-gray-500">মোট মূল্য</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}