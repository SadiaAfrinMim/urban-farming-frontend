'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api, { type Order } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

type VendorRentalOrder = Order & {
  user?: {
    name?: string;
    email?: string;
  };
  rentalSpace?: {
    location?: string;
    size?: string;
    price?: number;
  };
  totalPrice?: number;
};

function VendorRentalOrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<VendorRentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = (await api.getVendorRentalOrders()) as VendorRentalOrder[];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor rental orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'Vendor') {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [fetchOrders, user]);

  const handleStatusUpdate = async (orderId: number | string, status: string) => {
    try {
      await api.updateVendorRentalOrderStatus(Number(orderId), status);
      toast.success('Rental order status updated.');
      fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update rental order status.');
    }
  };

  if (!user || user.role !== 'Vendor') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="w-full max-w-lg rounded-2xl border border-green-500/20 bg-gray-950 p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-[#39FF14]">Vendor Access Only</h1>
          <p className="mb-6 text-gray-400">This page is available only for vendor accounts.</p>
          <Link href="/" className="inline-flex rounded-lg bg-[#39FF14] px-6 py-3 font-semibold text-black transition hover:bg-[#28CC0C]">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#39FF14]/20 border-t-[#39FF14]" />
          <p className="text-lg font-medium text-[#39FF14]">Loading rental orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/20 bg-gray-950 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-red-400">Could not load rental orders</h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <button
            onClick={fetchOrders}
            className="rounded-lg bg-[#39FF14] px-6 py-3 font-semibold text-black transition hover:bg-[#28CC0C]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#39FF14]">Vendor Rental Orders</h1>
            <p className="mt-2 text-gray-400">Manage customer bookings for your rental spaces.</p>
          </div>
          <Link
            href="/vendor/rentals"
            className="inline-flex rounded-lg border border-[#39FF14]/40 px-5 py-3 font-medium text-[#39FF14] transition hover:bg-[#39FF14]/10"
          >
            Manage Rentals
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#39FF14]/20 bg-gray-950 p-10 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-[#39FF14]">No rental orders yet</h2>
            <p className="mb-6 text-gray-400">Customers have not booked any rental spaces from your inventory yet.</p>
            <Link
              href="/vendor/rentals"
              className="inline-flex rounded-lg bg-[#39FF14] px-6 py-3 font-semibold text-black transition hover:bg-[#28CC0C]"
            >
              View Rental Spaces
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[#39FF14]/20 bg-gray-950 p-6 shadow-lg transition hover:border-[#39FF14]/40"
              >
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#39FF14]">Order #{order.id}</h2>
                    <p className="text-sm text-gray-400">
                      Created: {new Date(order.createdAt).toLocaleDateString('en-US')}
                    </p>
                    <p className="text-sm text-gray-400">
                      Customer: {order.user?.name || order.user?.email || 'Unknown customer'}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="rounded-lg border border-[#39FF14]/50 bg-black px-4 py-2 text-sm text-[#39FF14] outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <span className={statusClassName(order.status)}>{order.status}</span>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-[#39FF14]/10 pt-6 md:grid-cols-3">
                  <InfoCard label="Rental Space" value={order.rentalSpace?.location || 'Unknown location'} />
                  <InfoCard label="Size" value={order.rentalSpace?.size || 'Not provided'} />
                  <InfoCard
                    label="Total"
                    value={`BDT ${order.totalPrice || order.totalAmount || order.rentalSpace?.price || 0}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-base font-medium text-white">{value}</div>
    </div>
  );
}

function statusClassName(status: string) {
  if (status === 'Delivered') return 'rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300';
  if (status === 'Confirmed') return 'rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300';
  if (status === 'Shipped') return 'rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300';
  if (status === 'Cancelled') return 'rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300';
  return 'rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300';
}

export default function VendorRentalOrdersPage() {
  return (
    <ProtectedRoute>
      <VendorRentalOrdersContent />
    </ProtectedRoute>
  );
}
