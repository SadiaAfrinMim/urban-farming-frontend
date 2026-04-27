'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAllVendorsData, useUpdateUserStatus } from '@/app/hooks/useApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingPage, ErrorPage, Card, Alert, Button } from '@/app/components/ui';

export default function AdminVendorsPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [certificationFilter, setCertificationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Redirect if not admin
  if (!hasRole('Admin')) {
    return <ErrorPage title="Access Denied" message="You don't have permission to access this page." />;
  }

  const filters = {
    ...(searchTerm && { searchTerm }),
    ...(certificationFilter !== 'all' && { certificationStatus: certificationFilter }),
    sortBy,
    sortOrder,
    limit: 50,
  };

  const { data: vendorsData, isLoading, error, refetch } = useAllVendorsData(filters);
  const updateUserStatusMutation = useUpdateUserStatus();

  const vendors = vendorsData?.data || [];

  if (isLoading) {
    return <LoadingPage message="ভেন্ডর লিস্ট লোড হচ্ছে..." />;
  }

  if (error) {
    return (
      <ErrorPage
        title="Error Loading Vendors"
        message="ভেন্ডর লিস্ট লোড করা যাচ্ছে না"
        onRetry={() => refetch()}
      />
    );
  }

  const certificationOptions = [
    { value: 'all', label: 'সব সার্টিফিকেশন' },
    { value: 'Approved', label: 'অনুমোদিত' },
    { value: 'Pending', label: 'পেন্ডিং' },
    { value: 'Rejected', label: 'প্রত্যাখ্যাত' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'রেজিস্ট্রেশন তারিখ' },
    { value: 'farmName', label: 'ফার্মের নাম' },
    { value: 'farmLocation', label: 'অবস্থান' },
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
          <h1 className="text-3xl font-bold text-gray-800">ভেন্ডর ম্যানেজমেন্ট</h1>

          <div className="flex gap-2 items-center">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              রিফ্রেশ
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card shadow="md" className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">খোঁজ করুন</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ফার্মের নাম, নাম বা অবস্থান..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">সার্টিফিকেশন স্ট্যাটাস</label>
              <select
                value={certificationFilter}
                onChange={(e) => setCertificationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {certificationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            মোট {vendorsData?.meta?.total || 0} ভেন্ডর • দেখাচ্ছে {vendors.length} ভেন্ডর
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
          {vendors.map((vendor) => (
            <Card key={vendor.id} shadow="md" className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-300 rounded-full flex items-center justify-center">
                  {vendor.profilePhoto ? (
                    <img src={vendor.profilePhoto} alt={vendor.farmName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-green-700 font-medium">{vendor.farmName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{vendor.farmName}</h3>
                  <p className="text-sm text-gray-600">{vendor.user.name}</p>
                  <p className="text-sm text-gray-500">{vendor.user.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">অবস্থান:</span>
                  <span className="text-sm font-medium">{vendor.farmLocation}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">সার্টিফিকেশন:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vendor.certificationStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                    vendor.certificationStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vendor.certificationStatus === 'Approved' ? 'অনুমোদিত' :
                     vendor.certificationStatus === 'Rejected' ? 'প্রত্যাখ্যাত' : 'পেন্ডিং'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ইউজার স্ট্যাটাস:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vendor.user.status === 'Active' ? 'bg-green-100 text-green-800' :
                    vendor.user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vendor.user.status === 'Active' ? 'সক্রিয়' :
                     vendor.user.status === 'Pending' ? 'পেন্ডিং' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>প্রোডাক্ট: {vendor.produces.length}</span>
                  <span>রেন্টাল স্পেস: {vendor.rentalSpaces.length}</span>
                </div>

                <select
                  value={vendor.user.status}
                  onChange={(e) => handleStatusUpdate(vendor.user.id.toString(), e.target.value)}
                  disabled={updateUserStatusMutation.isPending}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <option value="Active">সক্রিয় করুন</option>
                  <option value="Pending">পেন্ডিং করুন</option>
                  <option value="Suspended">নিষ্ক্রিয় করুন</option>
                </select>
              </div>
            </Card>
          ))}
        </div>

        {vendors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">কোনো ভেন্ডর পাওয়া যায়নি</div>
            <p className="text-gray-400 mt-2">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        )}
      </div>
    </div>
  );
}