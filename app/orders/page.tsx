'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { Order } from '../lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অর্ডার লিস্ট পেতে সমস্যা হয়েছে');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-red-500 text-xl">{error}</div>
        <button 
          onClick={fetchOrders}
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
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">আমার অর্ডার</h1>
        
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">কোনো অর্ডার পাওয়া যায়নি</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">অর্ডার #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">আইটেম সংখ্যা: {order.items?.length || 0}</span>
                    <span className="font-semibold text-green-600">মোট: ৳ {order.total}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
