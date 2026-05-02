'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import api, { Order, RentalSpace } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

// Rental Tracking Modal Component
function RentalStatusModal({ order, isOpen, onClose }: {
  order: OrderWithRental | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !order) return null;

  const statusSteps = [
    { status: 'Pending', label: 'পেন্ডিং', icon: '⏳', description: 'আপনার অর্ডার প্রসেসিং হচ্ছে' },
    { status: 'Confirmed', label: 'কনফার্মড', icon: '✅', description: 'আপনার রেন্টাল স্পেস কনফার্ম হয়েছে' },
    { status: 'Shipped', label: 'শিপড', icon: '🚚', description: 'রেন্টাল স্পেস প্রস্তুত করা হচ্ছে' },
    { status: 'Delivered', label: 'ডেলিভার্ড', icon: '🏡', description: 'রেন্টাল স্পেস ব্যবহারের জন্য রেডি' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

  // Generate tracking timeline for confirmed orders
  const generateTrackingTimeline = () => {
    const timeline = [];
    const orderDate = new Date(order.createdAt);

    timeline.push({
      date: orderDate.toLocaleDateString('bn-BD'),
      time: orderDate.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'অর্ডার প্লেস করা হয়েছে',
      description: 'আপনার রেন্টাল স্পেস বুকিং কনফার্ম হয়েছে',
      icon: '📝',
      completed: true
    });

    if (order.status === 'Confirmed' || currentStepIndex >= 1) {
      const confirmedDate = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      timeline.push({
        date: confirmedDate.toLocaleDateString('bn-BD'),
        time: confirmedDate.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        status: 'পেমেন্ট কনফার্মড',
        description: 'পেমেন্ট সফলভাবে প্রসেস হয়েছে',
        icon: '💳',
        completed: currentStepIndex >= 1
      });
    }

    if (order.status === 'Shipped' || currentStepIndex >= 2) {
      const shippedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
      timeline.push({
        date: shippedDate.toLocaleDateString('bn-BD'),
        time: shippedDate.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        status: 'প্রস্তুত করা হচ্ছে',
        description: 'আপনার রেন্টাল স্পেস প্রস্তুত করা হচ্ছে',
        icon: '🔧',
        completed: currentStepIndex >= 2
      });
    }

    if (order.status === 'Delivered' || currentStepIndex >= 3) {
      const deliveredDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days later
      timeline.push({
        date: deliveredDate.toLocaleDateString('bn-BD'),
        time: deliveredDate.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        status: 'ব্যবহারের জন্য রেডি',
        description: 'আপনার রেন্টাল স্পেস এখন ব্যবহারের জন্য প্রস্তুত',
        icon: '🎉',
        completed: currentStepIndex >= 3
      });
    }

    return timeline;
  };

  const trackingTimeline = generateTrackingTimeline();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">রেন্টাল ট্র্যাকিং ভিউ</h2>
              <p className="text-green-100">অর্ডার #{order.id?.toString().slice(0, 8)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Progress */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">স্ট্যাটাস প্রোগ্রেস</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
                    index <= currentStepIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <div className={`text-sm font-medium text-center ${
                    index <= currentStepIndex ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 w-full mt-4 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ minWidth: '50px' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ট্র্যাকিং টাইমলাইন</h3>
            <div className="space-y-4">
              {trackingTimeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    event.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${event.completed ? 'text-green-700' : 'text-gray-500'}`}>
                        {event.status}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {event.date} - {event.time}
                      </span>
                    </div>
                    <p className={`text-sm ${event.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                      {event.description}
                    </p>
                    {index < trackingTimeline.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 ml-5 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status Description */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {statusSteps.find(s => s.status === order.status)?.icon}
              </span>
              <div>
                <h4 className="font-bold text-blue-800">
                  বর্তমান স্ট্যাটাস: {statusSteps.find(s => s.status === order.status)?.label}
                </h4>
                <p className="text-blue-600">
                  {statusSteps.find(s => s.status === order.status)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Rental Space Details */}
          {(order.rentalSpace || (order as any).rentalSpaceId) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">রেন্টাল স্পেস ডিটেলস</h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {order.rentalSpace?.location || 'রেন্টাল স্পেস'}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>📏 সাইজ: {order.rentalSpace?.size || 'উপলব্ধ নেই'}</p>
                      <p>💰 প্রাইস: ৳{order.rentalSpace?.price || 0} প্রতি মাস</p>
                      <p>📅 বুকিং তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                      <p>🆔 অর্ডার আইডি: #{order.id}</p>
                    </div>

                    {/* Tracking Information for Confirmed Orders */}
                    {order.status === 'Confirmed' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">📍 ট্র্যাকিং তথ্য</h5>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p>🏢 লোকেশন: {order.rentalSpace?.location || 'ফার্ম এরিয়া'}</p>
                          <p>⏰ প্রস্তুত হবে: ২৪-৪৮ ঘণ্টার মধ্যে</p>
                          <p>👷 প্রস্তুতকারক: ফার্ম টিম</p>
                          <p>📞 সাপোর্ট: +880 1234-567890</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'Shipped' && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-800 mb-2">🚚 প্রস্তুত করা হচ্ছে</h5>
                        <div className="space-y-1 text-sm text-purple-700">
                          <p>🔧 কাজ চলছে: স্পেস প্রস্তুত করা হচ্ছে</p>
                          <p>📅 সম্ভাব্য ডেলিভারি: ১-২ দিনের মধ্যে</p>
                          <p>👷 দায়িত্বে: {order.rentalSpace?.location} টিম</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'Delivered' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2">🎉 রেডি!</h5>
                        <div className="space-y-1 text-sm text-green-700">
                          <p>✅ স্পেস ব্যবহারের জন্য প্রস্তুত</p>
                          <p>🗝️ এক্সেস: আপনার ড্যাশবোর্ড থেকে</p>
                          <p>📞 সাহায্য: support@urbanfarming.com</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photos Section */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3">ফটো গ্যালারি</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {order.rentalSpace?.image ? (
                        <div className="aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={order.rentalSpace.image}
                            alt={order.rentalSpace.location}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-4xl">🏡</span>
                        </div>
                      )}

                      {/* Status-based photos */}
                      {order.status === 'Confirmed' && (
                        <>
                          <div className="aspect-square bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🔧</span>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-blue-300 to-cyan-300 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🌱</span>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">💧</span>
                          </div>
                        </>
                      )}

                      {order.status === 'Shipped' && (
                        <>
                          <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🚧</span>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-purple-300 to-pink-300 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🌿</span>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🏗️</span>
                          </div>
                        </>
                      )}

                      {order.status === 'Delivered' && (
                        <>
                          <div className="aspect-square bg-gradient-to-br from-green-200 to-emerald-200 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🎉</span>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-green-300 to-emerald-300 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">✅</span>
                          </div>
                          <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🚀</span>
                          </div>
                        </>
                      )}
                    </div>

                    {order.status === 'Confirmed' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">📋</span>
                          <p className="text-sm text-blue-800">
                            আপনার রেন্টাল স্পেস প্রস্তুত করা হচ্ছে। ট্র্যাকিং আপডেটের জন্য এই পেজে চোখ রাখুন।
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === 'Shipped' && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">🚚</span>
                          <p className="text-sm text-purple-800">
                            আপনার রেন্টাল স্পেস প্রায় রেডি! শীঘ্রই এক্সেস পাবেন।
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === 'Delivered' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🎉</span>
                          <p className="text-sm text-green-800">
                            অভিনন্দন! আপনার রেন্টাল স্পেস এখন ব্যবহারের জন্য পুরোপুরি প্রস্তুত।
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">অর্ডার সামারি</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">মোট পরিমাণ:</span>
                <span className="font-bold text-2xl text-green-600">
                  ৳{order.total || order.totalAmount || order.rentalSpace?.price || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

interface OrderWithRental extends Order {
  rentalSpace?: RentalSpace;
  rentalSpaceId?: number;
}

function RentalOrdersPageContent() {
  const [orders, setOrders] = useState<OrderWithRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRental | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRentalOrders = useCallback(async () => {
    try {
      // Get only the current user's orders
      const allOrders = await api.getCustomerOrders();
      // Filter orders that have rentalSpace or are rental orders - these are booked rental spaces
      let rentalOrders = allOrders.filter(order => order.rentalSpace || (order as any).rentalSpaceId);
      // Sort orders to show pending first
      rentalOrders = rentalOrders.sort((a, b) => {
        const statusOrder = { 'Pending': 0, 'Confirmed': 1, 'Shipped': 2, 'Delivered': 3 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 4) - (statusOrder[b.status as keyof typeof statusOrder] || 4);
      });
      setOrders(rentalOrders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রেন্টাল অর্ডার লিস্ট পেতে সমস্যা হয়েছে');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchRentalOrders();
    };
    loadData();

    // Connect to socket for real-time order updates
    const socketConnection = io('https://urban-farming-backend-pink.vercel.app', {
      transports: ['websocket', 'polling'],
    });

    socketConnection.on('connect', () => {
      console.log('RentalOrdersPage: Connected to WebSocket server');
    });

    socketConnection.on('disconnect', () => {
      console.log('RentalOrdersPage: Disconnected from WebSocket server');
    });

    // Listen for rental order updates
    socketConnection.on('rental-space-booked', (bookedSpace: RentalSpace) => {
      console.log('RentalOrdersPage: Rental space booked:', bookedSpace);
      // Refresh orders to show updated status
      fetchRentalOrders();
    });

    socketConnection.on('rental-order-completed', (data: { orderId: number; rentalSpaceId: number; customerId: number }) => {
      console.log('RentalOrdersPage: Rental order completed:', data);
      // Refresh orders to show updated status
      fetchRentalOrders();
    });

    // Listen for order status updates
    socketConnection.on('order-status-updated', (updatedOrder: Order) => {
      console.log('RentalOrdersPage: Order status updated:', updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        )
      );
    });

    // Listen for new orders
    socketConnection.on('order-created', (newOrder: Order) => {
      console.log('RentalOrdersPage: New order created:', newOrder);
      fetchRentalOrders(); // Refresh to get new rental orders
    });

    socketConnection.on('rental-order-completed', (data: { orderId: number; rentalSpaceId: number; customerId: number }) => {
      // Refresh orders to show updated status
      fetchRentalOrders();
    });

    // Listen for order status updates
    socketConnection.on('order-status-updated', (updatedOrder: Order) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        )
      );
    });

    socketConnection.on('rental-order-completed', (data: { orderId: number; rentalSpaceId: number; customerId: number }) => {
      // Refresh orders to show updated status
      fetchRentalOrders();
    });

    socketConnection.on('connect_error', (error) => {
      console.error('RentalOrdersPage: WebSocket connection error:', error);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openStatusModal = (order: OrderWithRental) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeStatusModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
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
          onClick={fetchRentalOrders}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🌱 আমার বুক করা রেন্টাল স্পেস
          </h1>
          <p className="text-lg text-gray-600">আপনার বুক করা রেন্টাল স্পেস গুলোর তথ্য এবং স্ট্যাটাস</p>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌱</div>
              <div className="text-gray-500 text-xl font-medium">কোনো বুক করা রেন্টাল স্পেস পাওয়া যায়নি</div>
              <div className="text-gray-400 text-sm mt-2">আপনার প্রথম রেন্টাল স্পেস বুক করুন!</div>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-2xl text-gray-800 mb-2">বুক করা রেন্টাল স্পেস #{order.id.toString().slice(0, 8)}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      📅 {(() => {
                        try {
                          const date = new Date(order.createdAt);
                          return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)} shadow-sm`}>
                      {order.status}
                    </span>
                    {order.status === 'Confirmed' && (
                      <button
                        onClick={() => openStatusModal(order)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        📍 ট্র্যাকিং দেখুন
                      </button>
                    )}
                  </div>
                </div>

                {(order.rentalSpace || (order as any).rentalSpaceId) && (
                  <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {order.rentalSpace?.image ? (
                        <Image
                          src={order.rentalSpace.image}
                          alt={order.rentalSpace.location}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                          <span className="text-2xl">🏡</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {order.rentalSpace?.location || 'রেন্টাল স্পেস'}
                      </h4>
                      <p className="text-gray-600 text-sm mb-1">
                        {order.rentalSpace?.size || 'সাইজ উপলব্ধ নেই'}
                      </p>
                      <p className="text-gray-500 text-sm">পরিমাণ: ১ ইউনিট (রেন্টাল স্পেস)</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        ৳ {order.rentalSpace?.price || order.total || order.totalAmount || 0}
                      </span>
                      <p className="text-gray-500 text-sm">প্রতি মাস</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600 flex items-center gap-2">
                      🏡 রেন্টাল স্পেস: ১ টি
                    </span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      ৳ {order.total || order.totalAmount || order.rentalSpace?.price || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rental Status Modal */}
        <RentalStatusModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={closeStatusModal}
        />
      </div>
    </div>
  );
}

export default function RentalOrdersPage() {
  return (
    <ProtectedRoute>
      <RentalOrdersPageContent />
    </ProtectedRoute>
  );
}