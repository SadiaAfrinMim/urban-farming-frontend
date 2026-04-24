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
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVendors: 0,
    totalCustomers: 0,
    pendingCertifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/v1/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (usersRes.ok) {
        const usersResponse = await usersRes.json();
        const userList = usersResponse.data || [];
        setUsers(userList);

        // Calculate stats
        const totalUsers = userList.length;
        const totalVendors = userList.filter((u: User) => u.role === 'Vendor').length;
        const totalCustomers = userList.filter((u: User) => u.role === 'Customer').length;

        setStats({
          totalUsers,
          totalVendors,
          totalCustomers,
          pendingCertifications: 0 // This would need a separate API call
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
      const res = await fetch(`/api/v1/user/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">পেন্ডিং সার্টিফিকেশন</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingCertifications}</p>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-xl text-gray-800">ইউজার ম্যানেজমেন্ট</h3>
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
                  <th className="px-4 py-2 text-left">নাম</th>
                  <th className="px-4 py-2 text-left">ইমেইল</th>
                  <th className="px-4 py-2 text-left">রোল</th>
                  <th className="px-4 py-2 text-left">স্ট্যাটাস</th>
                  <th className="px-4 py-2 text-left">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
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
                    <td className="px-4 py-2">
                      <select
                        value={user.status}
                        onChange={(e) => updateUserStatus(user.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
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