'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useApi';
import { Order, resolveAssetUrl } from '../lib/api';

// Order Tracking Modal Component
function OrderTrackingModal({ order, isOpen, onClose }: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !order) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Confirmed': return '✅';
      case 'Shipped': return '🚚';
      case 'Delivered': return '🏡';
      default: return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400';
      case 'Confirmed': return 'text-blue-400';
      case 'Shipped': return 'text-purple-400';
      case 'Delivered': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Pending': return 'আপনার অর্ডার প্রসেসিং হচ্ছে';
      case 'Confirmed': return 'অর্ডার কনফার্ম হয়েছে';
      case 'Shipped': return 'পণ্য পাঠানো হচ্ছে';
      case 'Delivered': return 'পণ্য ডেলিভার হয়েছে';
      default: return 'অর্ডার স্ট্যাটাস আপডেট হচ্ছে';
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full border border-gray-700 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-[#39FF14]">অর্ডার ট্র্যাকিং</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Order Info */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">
                {order.produce ? '🥕' : '🌱'}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-[#39FF14] text-base">
                  {order.produce ? order.produce.name : order.rentalSpace?.location}
                </h3>
                <p className="text-gray-400 text-xs">
                  অর্ডার #{order.id?.toString().slice(0, 8)}
                </p>
              </div>
            </div>

            {/* Status Display */}
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getStatusIcon(order.status)}</span>
                <div className="flex-1">
                  <h4 className={`font-bold text-base ${getStatusColor(order.status)}`}>
                    {order.status}
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {getStatusMessage(order.status)}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Updates for Rental Orders */}
          {order.rentalSpace && (
            <div className="mb-4">
              <h4 className="font-bold text-[#39FF14] text-base mb-3">🌱 ভেন্ডর আপডেটস</h4>
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
                {/* Rental Space Image */}
                {order.rentalSpace.image && (
                  <div className="mb-3">
                    <img
                      src={resolveAssetUrl(order.rentalSpace.image)}
                      alt="Rental Space"
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                      onError={(e) => {
                        console.error('Image failed to load:', order.rentalSpace.image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Plant Status - Single Dropdown Value */}
                {order.rentalSpace.plantStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {order.rentalSpace.plantStatus === 'Seeding' ? '🌱' :
                       order.rentalSpace.plantStatus === 'Sprouting' ? '🌿' :
                       order.rentalSpace.plantStatus === 'Growing' ? '🌳' :
                       order.rentalSpace.plantStatus === 'Flowering' ? '🌸' :
                       order.rentalSpace.plantStatus === 'ReadyToHarvest' ? '✂️' :
                       order.rentalSpace.plantStatus === 'Harvested' ? '🍂' : '🌱'}
                    </span>
                    <div className="flex-1">
                      <span className="text-white font-medium text-sm">
                        {order.rentalSpace.plantStatus === 'Seeding' ? 'বীজ বোনা' :
                         order.rentalSpace.plantStatus === 'Sprouting' ? 'অঙ্কুরোদগম' :
                         order.rentalSpace.plantStatus === 'Growing' ? 'বৃদ্ধি' :
                         order.rentalSpace.plantStatus === 'Flowering' ? 'ফুল ধরা' :
                         order.rentalSpace.plantStatus === 'ReadyToHarvest' ? 'তোলার জন্য প্রস্তুত' :
                         order.rentalSpace.plantStatus === 'Harvested' ? 'তোলা হয়েছে' :
                         order.rentalSpace.plantStatus}
                      </span>
                      <p className="text-gray-400 text-xs">
                        {order.rentalSpace.plantStatus === 'Seeding' ? 'বীজ বপন করা হয়েছে' :
                         order.rentalSpace.plantStatus === 'Sprouting' ? 'গাছ অঙ্কুরিত হচ্ছে' :
                         order.rentalSpace.plantStatus === 'Growing' ? 'গাছ বাড়ছে' :
                         order.rentalSpace.plantStatus === 'Flowering' ? 'ফুল আসছে' :
                         order.rentalSpace.plantStatus === 'ReadyToHarvest' ? 'ফসল তোলার সময়' :
                         order.rentalSpace.plantStatus === 'Harvested' ? 'ফসল তোলা হয়েছে' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Watered */}
                {order.rentalSpace.lastWatered && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💧</span>
                    <div className="flex-1">
                      <span className="text-white font-medium text-sm">সর্বশেষ সেচ</span>
                      <p className="text-gray-400 text-xs">
                        {new Date(order.rentalSpace.lastWatered).toLocaleDateString('bn-BD')} তারিখে
                      </p>
                    </div>
                  </div>
                )}

                {/* Vendor Info */}
                {order.vendor && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="text-xs space-y-1">
                      <p className="text-gray-400">
                        <span className="text-white font-medium">{order.vendor.user?.name || 'N/A'}</span> • {order.vendor.farmName || 'N/A'}
                      </p>
                      <p className="text-gray-500">
                        📍 {order.vendor.farmLocation || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* No Updates Message */}
                {!order.rentalSpace.plantStatus &&
                 !order.rentalSpace.lastWatered &&
                 !order.rentalSpace.image && (
                  <p className="text-gray-400 text-xs text-center py-2">
                    এখনও কোনো আপডেট নেই
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#39FF14] text-black rounded-lg font-medium hover:bg-[#28CC0C] transition-colors text-sm"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('produce');
  const { data: orders = [], isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const tabs = [
    { id: 'produce', label: '🥕 প্রোডিউস অর্ডার', count: orders.filter(order => order.produce).length },
    { id: 'rental', label: '🌱 রেন্টাল অর্ডার', count: orders.filter(order => order.rentalSpace).length }
  ];

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
  };

  const closeTrackingModal = () => {
    setSelectedOrder(null);
    setIsTrackingModalOpen(false);
  };

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
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#39FF14] mb-4">📦 আমার অর্ডার</h1>
          <p className="text-lg text-gray-400">আপনার সকল অর্ডার এখানে দেখুন</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg shadow-lg p-2 flex border border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#39FF14] text-black shadow-lg'
                    : 'text-gray-400 hover:text-[#39FF14] hover:bg-gray-800'
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
                  <div key={order.id} className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#39FF14]">অর্ডার #{order.id?.toString().slice(0, 8)}</h3>
                        <p className="text-gray-400">তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'Delivered' ? 'bg-green-900 text-green-300' :
                        order.status === 'Shipped' ? 'bg-blue-900 text-blue-300' :
                        order.status === 'Confirmed' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-800 text-gray-300'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    {order.produce && (
                      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-[#39FF14]/20 rounded-lg flex items-center justify-center">
                            🥕
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#39FF14]">{order.produce.name}</h4>
                            <p className="text-gray-400">{order.produce.category}</p>
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

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                          অর্ডার আইডি: {order.id}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openTrackingModal(order)}
                            className="px-4 py-2 bg-[#39FF14] hover:bg-[#28CC0C] text-black text-sm rounded-lg transition-colors font-medium"
                          >
                            📍 ট্র্যাক
                          </button>
                          <div className="text-lg font-bold text-[#39FF14]">
                            মোট: ৳ {order.produce ? order.produce.price * (order.quantity || 1) : 0}
                          </div>
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
                  <div key={order.id} className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#39FF14]">রেন্টাল #{order.id?.toString().slice(0, 8)}</h3>
                        <p className="text-gray-400">তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'Delivered' ? 'bg-green-900 text-green-300' :
                        order.status === 'Shipped' ? 'bg-blue-900 text-blue-300' :
                        order.status === 'Confirmed' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-800 text-gray-300'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    {order.rentalSpace && (
                      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-[#39FF14]/20 rounded-lg flex items-center justify-center">
                            🌱
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#39FF14]">{order.rentalSpace.name}</h4>
                            <p className="text-gray-400">{order.rentalSpace.location}</p>
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

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                          রেন্টাল আইডি: {order.id}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openTrackingModal(order)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            📍 ট্র্যাক
                          </button>
                          <div className="text-lg font-bold text-[#39FF14]">
                            মোট: ৳ {order.rentalSpace ? order.rentalSpace.price : 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-16 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl font-bold text-[#39FF14] mb-2">কোনো অর্ডার পাওয়া যায়নি</div>
              <div className="text-gray-400 mb-6">আপনার প্রথম অর্ডার করুন!</div>
              <Link
                href="/marketplace"
                className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#28CC0C] transition-colors"
              >
                🛍️ শপিং শুরু করুন
              </Link>
            </div>
          )}
        </div>

        {/* Order Tracking Modal */}
        <OrderTrackingModal
          order={selectedOrder}
          isOpen={isTrackingModalOpen}
          onClose={closeTrackingModal}
        />
      </div>
    </div>
  );
}