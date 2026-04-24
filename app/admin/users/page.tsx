'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { User } from '../../lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ইউজার লিস্ট পেতে সমস্যা হয়েছে');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      setError(null);
      await api.updateUserStatus(userId.toString(), status);
      fetchUsers(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'স্ট্যাটাস আপডেট করা যাচ্ছে না');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role.toLowerCase() === filter;
  });

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
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← এডমিন ড্যাশবোর্ডে ফিরে যান</Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ইউজার ম্যানেজমেন্ট</h1>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সব ইউজার</option>
              <option value="admin">এডমিন</option>
              <option value="vendor">ভেন্ডর</option>
              <option value="customer">কাস্টমার</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                      {new Date(user.createdAt).toLocaleDateString('bn-BD')}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              কোনো ইউজার পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>
    </div>
  );
}