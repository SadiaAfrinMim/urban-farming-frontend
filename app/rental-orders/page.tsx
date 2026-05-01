'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import api, { Order, RentalSpace } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface OrderWithRental extends Order {
  rentalSpace?: RentalSpace;
  rentalSpaceId?: number;
}

function RentalOrdersPageContent() {
  const [orders, setOrders] = useState<OrderWithRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

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
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)} shadow-sm`}>
                    {order.status}
                  </span>
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