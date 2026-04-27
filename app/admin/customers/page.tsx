'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAllCustomersData, useUpdateUserStatus } from '@/app/hooks/useApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingPage, ErrorPage, Card, Alert, Button } from '@/app/components/ui';

export default function AdminCustomersPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Redirect if not admin
  if (!hasRole('Admin')) {
    return <ErrorPage title="Access Denied" message="You don't have permission to access this page." />;
  }

  const filters = {
    ...(searchTerm && { searchTerm }),
    sortBy,
    sortOrder,
    limit: 50,
  };

  const { data: customersData, isLoading, error, refetch } = useAllCustomersData(filters);
  const updateUserStatusMutation = useUpdateUserStatus();

  const customers = customersData?.data || [];

  if (isLoading) {
    return <LoadingPage message="কাস্টমার লিস্ট লোড হচ্ছে..." />;
  }

  if (error) {
    return (
      <ErrorPage
        title="Error Loading Customers"
        message="কাস্টমার লিস্ট লোড করা যাচ্ছে না"
        onRetry={() => refetch()}
      />
    );
  }

  const sortOptions = [
    { value: 'createdAt', label: 'রেজিস্ট্রেশন তারিখ' },
    { value: 'name', label: 'নাম' },
    { value: 'email', label: 'ইমেইল' },
  ];

  const handleStatusUpdate = async (userId: string, status: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
            ← এডমিন ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">কাস্টমার ম্যানেজমেন্ট</h1>

          <div className="flex gap-2 items-center">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              রিফ্রেশ
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card shadow="md" className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">খোঁজ করুন</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নাম বা ইমেইল দিয়ে খোঁজ করুন..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">সর্ট করুন</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্রম</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">নতুন প্রথম</option>
                <option value="asc">পুরাতন প্রথম</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            মোট {customersData?.meta?.total || 0} কাস্টমার • দেখাচ্ছে {customers.length} কাস্টমার
          </div>
        </Card>

        {updateUserStatusMutation.isError && (
          <Alert
            type="error"
            message="স্ট্যাটাস আপডেট করা যাচ্ছে না"
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} shadow="md" className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center">
                  {customer.profileImage ? (
                    <img src={customer.profileImage} alt={customer.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-purple-700 font-medium">{customer.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <p className="text-xs text-gray-500">
                    রেজিস্ট্রেশন: {(() => {
                      try {
                        const date = new Date(customer.createdAt);
                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                      } catch (error) {
                        return 'Invalid Date';
                      }
                    })()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">স্ট্যাটাস:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {customer.status === 'Active' ? 'সক্রিয়' :
                     customer.status === 'Pending' ? 'পেন্ডিং' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{customer.ordersCount}</div>
                      <div className="text-xs text-gray-600">অর্ডার</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{customer.postsCount}</div>
                      <div className="text-xs text-gray-600">পোস্ট</div>
                    </div>
                  </div>
                </div>
              </div>

              <select
                value={customer.status}
                onChange={(e) => handleStatusUpdate(customer.id.toString(), e.target.value)}
                disabled={updateUserStatusMutation.isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <option value="Active">সক্রিয় করুন</option>
                <option value="Pending">পেন্ডিং করুন</option>
                <option value="Suspended">নিষ্ক্রিয় করুন</option>
              </select>
            </Card>
          ))}
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">কোনো কাস্টমার পাওয়া যায়নি</div>
            <p className="text-gray-400 mt-2">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        )}
      </div>
    </div>
  );
}