'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useApi';
import ProfileImage from '../components/ProfileImage';
import { Button, Input } from '../components/ui';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: orders = [] } = useOrders();



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-xl text-gray-600">অনুগ্রহ করে লগইন করুন</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black p-8 text-center">
            <div className="flex justify-center mb-4">
              <ProfileImage
                user={{
                  name: user.name,
                  role: user.role,
                  profileImage: user.profileImage
                }}
                size="lg"
                className="border-4 border-white shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-lg opacity-90">
              {user.role === 'Admin' ? 'এডমিন' : user.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-600 hover:text-[#39FF14]'
                }`}
              >
                👤 প্রোফাইল
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-600 hover:text-[#39FF14]'
                }`}
              >
                📦 অর্ডার ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-600 hover:text-[#39FF14]'
                }`}
              >
                ⚙️ সেটিংস
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">ব্যক্তিগত তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                      <p className="text-gray-900 font-medium">{user.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ভূমিকা</label>
                      <p className="text-gray-900 font-medium">
                        {user.role === 'Admin' ? 'এডমিন' : user.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">যোগদানের তারিখ</label>
                      <p className="text-gray-900 font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">সাম্প্রতিক অর্ডার</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-4">📦</div>
                      <div className="text-gray-600 mb-4">কোনো অর্ডার পাওয়া যায়নি</div>
                      <a
                        href="/marketplace"
                        className="inline-block bg-[#39FF14] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#28CC0C] transition-colors"
                      >
                        🛍️ শপিং শুরু করুন
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-[#39FF14]">
                                অর্ডার #{order.id?.toString().slice(0, 8)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#39FF14]">
                              ৳ {order.total || order.totalAmount || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">সেটিংস</h3>

                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">অ্যাকাউন্ট তথ্য</h4>
                      <p className="text-blue-700">
                        আপনার অ্যাকাউন্ট তথ্য পরিবর্তন করতে চাইলে সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                      </p>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      🚪 লগআউট
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}