'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../lib/api';

interface Order {
  id: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getVendorOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      // Set mock data for demo
      setOrders([
        {
          id: '1',
          user: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
          },
          items: [
            { name: 'Organic Tomatoes', quantity: 5, price: 5.99 },
            { name: 'Fresh Lettuce', quantity: 2, price: 3.49 },
          ],
          totalAmount: 35.43,
          status: 'Pending',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          user: {
            name: 'Bob Smith',
            email: 'bob@example.com',
          },
          items: [
            { name: 'Carrot Seeds', quantity: 1, price: 12.99 },
          ],
          totalAmount: 12.99,
          status: 'Shipped',
          createdAt: '2024-01-10T14:30:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  if (loading) {
    return <div className="p-8">Loading orders...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-gray-600">
                  Customer: {order.user.name} ({order.user.email})
                </p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="text-lg font-bold mt-2">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'Pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Mark as Confirmed
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'Shipped')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                >
                  Mark as Shipped
                </button>
              </div>
            )}

            {order.status === 'Shipped' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'Delivered')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}