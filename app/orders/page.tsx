'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { Order, Produce } from '../lib/api';

interface OrderWithProduce extends Order {
  produce?: Produce;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithProduce[]>([]);
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
          onClick={fetchOrders}
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
            📦 আমার অর্ডার
          </h1>
          <p className="text-lg text-gray-600">আপনার সকল অর্ডারের ইতিহাস</p>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-gray-500 text-xl font-medium">কোনো অর্ডার পাওয়া যায়নি</div>
              <div className="text-gray-400 text-sm mt-2">আপনার প্রথম অর্ডার করুন!</div>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-2xl text-gray-800 mb-2">অর্ডার #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      📅 {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)} shadow-sm`}>
                    {order.status}
                  </span>
                </div>

                {order.produce && (
                  <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {order.produce.image ? (
                        <img
                          src={order.produce.image}
                          alt={order.produce.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                          <span className="text-2xl">🥕</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{order.produce.name}</h4>
                      <p className="text-gray-600 text-sm mb-1">{order.produce.category}</p>
                      <p className="text-gray-500 text-sm">পরিমাণ: {order.produce.availableQuantity} ইউনিট</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        ৳ {order.produce.price}
                      </span>
                      <p className="text-gray-500 text-sm">প্রতি ইউনিট</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600 flex items-center gap-2">
                      📦 আইটেম সংখ্যা: {order.items?.length || 1}
                    </span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      ৳ {order.total || order.totalAmount || (order.produce ? order.produce.price : 0)}
                    </span>
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
