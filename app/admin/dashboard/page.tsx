'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  pendingCertifications: number;
  pendingProducts: number;
  pendingPosts: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVendors: 0,
    totalCustomers: 0,
    pendingCertifications: 0,
    pendingProducts: 0,
    pendingPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users - include credentials for authentication
      const usersRes = await fetch('http://localhost:5000/api/v1/admin/users?limit=100', {
        credentials: 'include'
      });
      const certsRes = await fetch('http://localhost:5000/api/v1/admin/certifications/pending', {
        credentials: 'include'
      });
      const productsRes = await fetch('http://localhost:5000/api/v1/admin/produces/pending', {
        credentials: 'include'
      });
      const postsRes = await fetch('http://localhost:5000/api/v1/admin/posts', {
        credentials: 'include'
      });

      if (usersRes.ok) {
        const usersResponse = await usersRes.json();
        const userList = usersResponse.data || [];
        setUsers(userList);

        // Calculate stats
        const totalUsers = userList.length;
        const totalVendors = userList.filter((u: User) => u.role === 'Vendor').length;
        const totalCustomers = userList.filter((u: User) => u.role === 'Customer').length;

        // Get pending certifications
        let pendingCerts = 0;
        if (certsRes.ok) {
          const certsData = await certsRes.json();
          pendingCerts = certsData.data?.length || 0;
        }

        // Get pending products
        let pendingProducts = 0;
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          pendingProducts = productsData.data?.length || 0;
        }

        // Get unapproved posts
        let pendingPosts = 0;
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const posts = postsData.data || [];
          pendingPosts = posts.filter((post: any) => !post.isApproved).length;
        }

        setStats({
          totalUsers,
          totalVendors,
          totalCustomers,
          pendingCertifications: pendingCerts,
          pendingProducts,
          pendingPosts,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ডেটা লোড করা যাচ্ছে না');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchData(); // Refresh data
      } else {
        setError('স্ট্যাটাস আপডেট করা যাচ্ছে না');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← হোম পেজে ফিরে যান</Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">এডমিন ড্যাশবোর্ড</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">মোট ইউজার</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">ভেন্ডর</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalVendors}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">কাস্টমার</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalCustomers}</p>
          </div>

          <Link href="/admin/products" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">পেন্ডিং প্রোডাক্ট</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingProducts}</p>
            <p className="text-sm text-gray-500 mt-1">রিভিউ করুন</p>
          </Link>

          <Link href="/admin/posts" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">পেন্ডিং পোস্ট</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingPosts}</p>
            <p className="text-sm text-gray-500 mt-1">মডারেট করুন</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link href="/admin/products" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">প্রোডাক্ট রিভিউ</h3>
              <p className="text-gray-600 text-sm">পেন্ডিং প্রোডাক্ট অনুমোদন করুন</p>
            </div>
          </Link>

          <Link href="/admin/posts" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">পোস্ট মডারেশন</h3>
              <p className="text-gray-600 text-sm">কমিউনিটি পোস্ট মডারেট করুন</p>
            </div>
          </Link>

          <Link href="/admin/users" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">ইউজার ম্যানেজমেন্ট</h3>
              <p className="text-gray-600 text-sm">ইউজার রোল এবং স্ট্যাটাস পরিচালনা করুন</p>
            </div>
          </Link>

          <Link href="/admin/analytics" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">অ্যানালিটিক্স</h3>
              <p className="text-gray-600 text-sm">রেভেনু এবং পারফরমেন্স দেখুন</p>
            </div>
          </Link>

          <Link href="/admin/certifications" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">সার্টিফিকেশন</h3>
              <p className="text-gray-600 text-sm">ভেন্ডর সার্টিফিকেশন রিভিউ করুন</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">রিপোর্ট</h3>
              <p className="text-gray-600 text-sm">ইউজার রিপোর্ট ম্যানেজ করুন</p>
            </div>
          </Link>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-xl text-gray-800">সাম্প্রতিক ইউজার</h3>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              সব ইউজার দেখুন
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">নাম</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">ইমেইল</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">রোল</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Vendor' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'Admin' ? 'এডমিন' :
                         user.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'Active' ? 'সক্রিয়' :
                         user.status === 'Pending' ? 'পেন্ডিং' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.status}
                        onChange={(e) => updateUserStatus(user.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">সক্রিয়</option>
                        <option value="Pending">পেন্ডিং</option>
                        <option value="Suspended">নিষ্ক্রিয়</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}