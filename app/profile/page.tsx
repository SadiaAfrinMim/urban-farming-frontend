'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useApi';
import ProfileImage from '../components/ProfileImage';
import { Button, Input } from '../components/ui';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: orders = [] } = useOrders();

  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
  }, [user?.name]);

  const handleSave = async () => {
    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append('name', editedName);
        formData.append('file', selectedImage);
        await updateProfile(formData);
      } else {
        await updateProfile({ name: editedName });
      }
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Profile update failed:', error);
      // TODO: Show error message
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-xl text-gray-400">অনুগ্রহ করে লগইন করুন</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-white p-8 text-center">
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
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-400 hover:text-[#39FF14]'
                }`}
              >
                👤 প্রোফাইল
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-400 hover:text-[#39FF14]'
                }`}
              >
                📦 অর্ডার ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-400 hover:text-[#39FF14]'
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
                  <h3 className="text-xl font-bold text-white mb-4">ব্যক্তিগত তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-1">নাম</label>
                      {isEditing ? (
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="bg-gray-600 text-white border-gray-500"
                        />
                      ) : (
                        <p className="text-white font-medium">{user.name}</p>
                      )}
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-1">ইমেইল</label>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-1">ভূমিকা</label>
                      <p className="text-white font-medium">
                        {user.role === 'Admin' ? 'এডমিন' : user.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-1">যোগদানের তারিখ</label>
                      <p className="text-white font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          className="bg-[#39FF14] text-black hover:bg-[#28CC0C]"
                        >
                          সেভ করুন
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedName(user?.name || '');
                            setSelectedImage(null);
                          }}
                          className="bg-gray-600 text-white hover:bg-gray-500"
                        >
                          ক্যানসেল
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#39FF14] text-black hover:bg-[#28CC0C]"
                      >
                        এডিট করুন
                      </Button>
                    )}
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">প্রোফাইল ছবি পরিবর্তন</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                      className="bg-gray-700 text-white border border-gray-500 rounded px-3 py-2"
                    />
                    {selectedImage && (
                      <p className="text-gray-400 mt-2">নতুন ছবি নির্বাচিত: {selectedImage.name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">সাম্প্রতিক অর্ডার</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-700 rounded-lg">
                      <div className="text-4xl mb-4">📦</div>
                      <div className="text-gray-400 mb-4">কোনো অর্ডার পাওয়া যায়নি</div>
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
                        <div key={order.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-[#39FF14]">
                                অর্ডার #{order.id?.toString().slice(0, 8)}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Delivered' ? 'bg-green-900 text-green-200' :
                              order.status === 'Shipped' ? 'bg-blue-900 text-blue-200' :
                              order.status === 'Confirmed' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-gray-700 text-gray-200'
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
                  <h3 className="text-xl font-bold text-white mb-4">সেটিংস</h3>

                  <div className="space-y-4">
                    <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-200 mb-2">অ্যাকাউন্ট তথ্য</h4>
                      <p className="text-blue-300">
                        আপনার অ্যাকাউন্ট তথ্য পরিবর্তন করতে চাইলে সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                      </p>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full bg-red-900 hover:bg-red-800 text-red-200 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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