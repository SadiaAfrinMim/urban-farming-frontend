'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUsers, useUpdateUserStatus } from '@/app/hooks/useApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingPage, ErrorPage, Card, Alert, Button } from '@/app/components/ui';

export default function AdminUsersPage() {
  const { hasRole } = useAuth();
  const [filter, setFilter] = useState<string>('all');

  // Redirect if not admin
  if (!hasRole('Admin')) {
    return <ErrorPage title="Access Denied" message="You don't have permission to access this page." />;
  }

  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUserStatusMutation = useUpdateUserStatus();

  const handleStatusUpdate = async (userId: string, status: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role.toLowerCase() === filter;
  });

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

  const filterOptions = [
    { value: 'all', label: 'সব ইউজার' },
    { value: 'admin', label: 'এডমিন' },
    { value: 'vendor', label: 'ভেন্ডর' },
    { value: 'customer', label: 'কাস্টমার' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'সক্রিয়' },
    { value: 'Pending', label: 'পেন্ডিং' },
    { value: 'Suspended', label: 'নিষ্ক্রিয়' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
            ← এডমিন ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ইউজার ম্যানেজমেন্ট</h1>

          <div className="flex gap-4 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button onClick={() => refetch()} variant="outline" size="sm">
              রিফ্রেশ
            </Button>
          </div>
        </div>

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
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">নাম</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">ইমেইল</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">রোল</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">রেজিস্ট্রেশন তারিখ</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Vendor' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'Admin' ? 'এডমিন' :
                         user.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'Active' ? 'সক্রিয়' :
                         user.status === 'Pending' ? 'পেন্ডিং' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              কোনো ইউজার পাওয়া যায়নি
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}