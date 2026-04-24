'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnalyticsCard } from '../../components/AnalyticsCard';
import api from '../../lib/api';

interface DashboardStats {
  totalSales: number;
  activeRentals: number;
  pendingOrders: number;
  totalProducts: number;
  monthlyEarnings: { month: string; earnings: number }[];
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVendorDashboardStats();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      // Set mock data for demo
      setStats({
        totalSales: 1250.50,
        activeRentals: 8,
        pendingOrders: 3,
        totalProducts: 24,
        monthlyEarnings: [
          { month: 'Jan', earnings: 450 },
          { month: 'Feb', earnings: 520 },
          { month: 'Mar', earnings: 680 },
          { month: 'Apr', earnings: 600 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Sales"
            value={`$${stats?.totalSales || 0}`}
            icon={<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">$</div>}
          />
          <AnalyticsCard
            title="Active Rentals"
            value={stats?.activeRentals || 0}
            icon={<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">🏠</div>}
          />
          <AnalyticsCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            icon={<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">📦</div>}
          />
          <AnalyticsCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={<div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">📊</div>}
          />
        </div>

        {/* Earnings Graph Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Earnings Chart (Recharts integration needed)</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/vendor/profile" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Farm Profile</h3>
            <p className="text-gray-600 text-sm">Manage your farm details and certifications</p>
          </Link>

          <Link href="/vendor/products" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Products</h3>
            <p className="text-gray-600 text-sm">Add and manage your organic produce</p>
          </Link>

          <Link href="/vendor/rentals" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Rental Spaces</h3>
            <p className="text-gray-600 text-sm">Manage garden plots for rent</p>
          </Link>

          <Link href="/vendor/plant-tracking" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Plant Tracking</h3>
            <p className="text-gray-600 text-sm">Update plant status for customers</p>
          </Link>

          <Link href="/vendor/orders" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Orders</h3>
            <p className="text-gray-600 text-sm">Handle customer orders</p>
          </Link>

          <Link href="/vendor/community" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Community</h3>
            <p className="text-gray-600 text-sm">Posts and notifications</p>
          </Link>
        </div>
      </div>
    </div>
  );
}