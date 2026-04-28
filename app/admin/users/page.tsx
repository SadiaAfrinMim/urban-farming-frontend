'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAllUsersData, useUpdateUserStatus } from '@/app/hooks/useApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingPage, ErrorPage, Card, Alert, Button } from '@/app/components/ui';

export default function AdminUsersPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const filters = {
    ...(searchTerm && { searchTerm }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    sortBy,
    sortOrder,
    limit: 50, // Show more users on this page
  };

  const { data: usersData, isLoading, error, refetch } = useAllUsersData(filters);
const updateUserStatusMutation = useUpdateUserStatus();

const [isDark, setIsDark] = useState(true);
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);

// Redirect if not admin
  if (!hasRole('Admin')) {
    return <ErrorPage title="Access Denied" message="You don't have permission to access this page." />;
  }

  const users = usersData?.data || [];

  const handleStatusUpdate = async (userId: string, status: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <LoadingPage message="ইউজার লিস্ট লোড হচ্ছে..." />;
  }

  if (error) {
    return (
      <ErrorPage
        title="Error Loading Users"
        message="ইউজার লিস্ট লোড করা যাচ্ছে না"
        onRetry={() => refetch()}
      />
    );
  }

  const roleOptions = [
    { value: 'all', label: 'সব রোল' },
    { value: 'Admin', label: 'এডমিন' },
    { value: 'Vendor', label: 'ভেন্ডর' },
    { value: 'Customer', label: 'কাস্টমার' },
  ];

  const statusOptions = [
    { value: 'all', label: 'সব স্ট্যাটাস' },
    { value: 'Active', label: 'সক্রিয়' },
    { value: 'Pending', label: 'পেন্ডিং' },
    { value: 'Suspended', label: 'নিষ্ক্রিয়' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'রেজিস্ট্রেশন তারিখ' },
    { value: 'name', label: 'নাম' },
    { value: 'email', label: 'ইমেইল' },
  ];



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← এডমিন ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">ইউজার ম্যানেজমেন্ট</h1>

          <div className="flex gap-2 items-center">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              রিফ্রেশ
            </Button>
            <Button onClick={() => setIsDark(!isDark)} variant="outline" size="sm">
              {isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card shadow="md" className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খোঁজ করুন</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নাম বা ইমেইল দিয়ে খোঁজ করুন..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">রোল ফিল্টার</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">স্ট্যাটাস ফিল্টার</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সর্ট করুন</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রম</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="desc">নতুন প্রথম</option>
                <option value="asc">পুরাতন প্রথম</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            মোট {usersData?.meta?.total || 0} ইউজার • দেখাচ্ছে {users.length} ইউজার
          </div>
        </Card>

        {updateUserStatusMutation.isError && (
          <Alert
            type="error"
            message="স্ট্যাটাস আপডেট করা যাচ্ছে না"
            className="mb-6"
          />
        )}

        <Card shadow="md" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100">ইউজার</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100">রোল</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100">বিস্তারিত তথ্য</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100">রেজিস্ট্রেশন তারিখ</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user.role === 'Admin' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        user.role === 'Vendor' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {user.role === 'Admin' ? 'এডমিন' :
                         user.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user.status === 'Active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        user.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {user.status === 'Active' ? 'সক্রিয়' :
                         user.status === 'Pending' ? 'পেন্ডিং' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'Vendor' && user.vendorProfile ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-800 dark:text-gray-100">{user.vendorProfile.farmName}</p>
                          <p className="text-gray-600 dark:text-gray-400">{user.vendorProfile.farmLocation}</p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.vendorProfile.certificationStatus === 'Approved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            user.vendorProfile.certificationStatus === 'Rejected' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {user.vendorProfile.certificationStatus === 'Approved' ? 'অনুমোদিত' :
                             user.vendorProfile.certificationStatus === 'Rejected' ? 'প্রত্যাখ্যাত' : 'পেন্ডিং'}
                          </span>
                        </div>
                      ) : user.role === 'Customer' ? (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>কাস্টমার অ্যাকাউন্ট</p>
                          <p>সক্রিয় অংশগ্রহণকারী</p>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>এডমিন অ্যাকাউন্ট</p>
                          <p>সিস্টেম অ্যাক্সেস</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.createdAt ? (() => {
                        try {
                          const date = new Date(user.createdAt);
                          return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.status || 'Active'}
                        onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                        disabled={updateUserStatusMutation.isPending}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              কোনো ইউজার পাওয়া যায়নি
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}