'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { Order } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function VendorOrdersPage() {
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
      const ordersData = await api.getVendorOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অর্ডার লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      toast.success('অর্ডার স্ট্যাটাস আপডেট হয়েছে');
      fetchOrders(); // Refresh orders
    } catch (err) {
      toast.error('স্ট্যাটাস আপডেট করা যায়নি');
    }
  };

  if (!user || user.role !== 'Vendor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">অনুমতি নেই</h1>
          <p className="text-gray-600">এই পেজটি শুধুমাত্র ভেন্ডরদের জন্য</p>
          <Link href="/" className="text-blue-600 hover:underline">হোমে ফিরে যান</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">আমার অর্ডারসমূহ</h1>
          <p className="text-gray-600 mt-2">আপনার পণ্যের অর্ডার দেখুন এবং ম্যানেজ করুন</p>
        </div>
        <Link href="/" className="text-blue-600 hover:underline">হোমে ফিরে যান</Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো অর্ডার নেই</h3>
          <p className="text-gray-500 mb-4">আপনার পণ্যে এখনো কোনো অর্ডার হয়নি</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">অর্ডার #{order.id}</h3>
                  <p className="text-sm text-gray-600">তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                  <p className="text-sm text-gray-600">কাস্টমার: {order.user?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">পণ্য: {order.produce?.name}</p>
                    <p className="text-sm text-gray-600">পরিমাণ: {order.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">৳ {order.totalAmount || order.total || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}