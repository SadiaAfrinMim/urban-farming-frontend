'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useApi';

export default function OrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('produce');
  const { data: orders = [], isLoading } = useOrders();

  const tabs = [
    { id: 'produce', label: '🥕 প্রোডিউস অর্ডার', count: orders.filter(order => order.produce).length },
    { id: 'rental', label: '🌱 রেন্টাল অর্ডার', count: orders.filter(order => order.rentalSpace).length }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📦 আমার অর্ডার</h1>
          <p className="text-lg text-gray-600">আপনার সকল অর্ডার এখানে দেখুন</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#39FF14] text-black shadow-lg'
                    : 'text-gray-600 hover:text-[#39FF14] hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Content */}
        <div className="space-y-8">
          {activeTab === 'produce' && orders.filter(order => order.produce).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#39FF14] mb-6">🥕 প্রোডিউস অর্ডার</h2>
              <div className="space-y-6">
                {orders.filter(order => order.produce).map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#39FF14]">অর্ডার #{order.id?.toString().slice(0, 8)}</h3>
                        <p className="text-gray-600">তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    {order.produce && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-[#39FF14]/20 rounded-lg flex items-center justify-center">
                            🥕
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#39FF14]">{order.produce.name}</h4>
                            <p className="text-gray-600">{order.produce.category}</p>
                            <p className="text-sm text-gray-500">পরিমাণ: {order.quantity || 1} ইউনিট</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#39FF14]">
                              ৳ {order.produce.price * (order.quantity || 1)}
                            </div>
                            <p className="text-sm text-gray-500">মূল্য</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          অর্ডার আইডি: {order.id}
                        </div>
                        <div className="text-lg font-bold text-[#39FF14]">
                          মোট: ৳ {order.produce ? order.produce.price * (order.quantity || 1) : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rental' && orders.filter(order => order.rentalSpace).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#39FF14] mb-6">🌱 রেন্টাল অর্ডার</h2>
              <div className="space-y-6">
                {orders.filter(order => order.rentalSpace).map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#39FF14]">রেন্টাল #{order.id?.toString().slice(0, 8)}</h3>
                        <p className="text-gray-600">তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    {order.rentalSpace && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-[#39FF14]/20 rounded-lg flex items-center justify-center">
                            🌱
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#39FF14]">{order.rentalSpace.name}</h4>
                            <p className="text-gray-600">{order.rentalSpace.location}</p>
                            <p className="text-sm text-gray-500">আয়তন: {order.rentalSpace.size} sq ft</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#39FF14]">
                              ৳ {order.rentalSpace.price}
                            </div>
                            <p className="text-sm text-gray-500">প্রতি দিন</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          রেন্টাল আইডি: {order.id}
                        </div>
                        <div className="text-lg font-bold text-[#39FF14]">
                          মোট: ৳ {order.rentalSpace ? order.rentalSpace.price : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl font-bold text-gray-900 mb-2">কোনো অর্ডার পাওয়া যায়নি</div>
              <div className="text-gray-600 mb-6">আপনার প্রথম অর্ডার করুন!</div>
              <Link
                href="/marketplace"
                className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#28CC0C] transition-colors"
              >
                🛍️ শপিং শুরু করুন
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}