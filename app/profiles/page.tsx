'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { User, VendorProfile } from '../lib/api';
import toast from 'react-hot-toast';

interface ExtendedUser extends User {
  vendorProfile?: VendorProfile;
  customerStats?: {
    postsCount: number;
    ordersCount: number;
  };
}

export default function ProfilesPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    fetchAllProfiles();
  }, []);

  const fetchAllProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users with their profiles
      const usersResponse = await api.getAllUsers();
      const users = usersResponse || [];

      // Fetch vendor profiles for vendors
      const vendorUsers = users.filter(u => u.role === 'Vendor');
      const vendorProfiles = await Promise.all(
        vendorUsers.map(async (user) => {
          try {
            const profile = await api.getVendorProfile();
            return { userId: user.id, profile };
          } catch {
            return null;
          }
        })
      );

      // Fetch customer stats for customers
      const customerUsers = users.filter(u => u.role === 'Customer');
      const customerStats = await Promise.all(
        customerUsers.map(async (user) => {
          try {
            const stats = await api.getCustomerDashboard();
            return { userId: user.id, stats: stats.stats };
          } catch {
            return { userId: user.id, stats: { postsCount: 0, ordersCount: 0 } };
          }
        })
      );

      // Combine all data
      const enrichedUsers: ExtendedUser[] = users.map(user => {
        const vendorProfile = vendorProfiles.find(vp => vp?.userId === user.id)?.profile;
        const customerStats = customerUsers.find(cu => cu.id === user.id)
          ? customerStats.find(cs => cs.userId === user.id)?.stats
          : undefined;

        return {
          ...user,
          vendorProfile,
          customerStats
        };
      });

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'প্রোফাইল লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();
    const matchesSearch = !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      fetchAllProfiles(); // Refresh data
    } catch (error) {
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast.success('রোল আপডেট হয়েছে');
      fetchAllProfiles(); // Refresh data
    } catch (error) {
      toast.error('রোল আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Vendor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Customer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
          <div className="text-xl text-[#39FF14] font-medium">প্রোফাইল লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black gap-4">
        <div className="text-red-400 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center">{error}</div>
        <button
          onClick={fetchAllProfiles}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[#39FF14] hover:text-[#28CC0C] font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="text-[#39FF14] hover:text-[#28CC0C] font-medium transition-colors">
              📊 ড্যাশবোর্ড
            </Link>
            <Link href="/admin/analytics" className="text-[#39FF14] hover:text-[#28CC0C] font-medium transition-colors">
              📈 অ্যানালিটিক্স
            </Link>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#39FF14] to-[#28CC0C] bg-clip-text text-transparent mb-4">
            👥 সকল প্রোফাইল
          </h1>
          <p className="text-lg text-gray-400">সকল ইউজার, ভেন্ডর এবং কাস্টমার প্রোফাইল একসাথে দেখুন</p>
        </div>

        {/* Filters and Search */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors text-white placeholder-gray-400"
                />
              </div>

              {/* Role Filter */}
              <div className="md:w-48">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors text-white"
                >
                  <option value="all">সকল রোল</option>
                  <option value="admin">অ্যাডমিন</option>
                  <option value="vendor">ভেন্ডর</option>
                  <option value="customer">কাস্টমার</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#39FF14] mb-2">{users.length}</div>
              <div className="text-sm text-gray-400">মোট প্রোফাইল</div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{users.filter(u => u.role === 'Admin').length}</div>
              <div className="text-sm text-gray-400">অ্যাডমিন</div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{users.filter(u => u.role === 'Vendor').length}</div>
              <div className="text-sm text-gray-400">ভেন্ডর</div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{users.filter(u => u.role === 'Customer').length}</div>
              <div className="text-sm text-gray-400">কাস্টমার</div>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👤</div>
            <div className="text-gray-400 text-xl font-medium">কোনো প্রোফাইল পাওয়া যায়নি</div>
            <div className="text-gray-500 text-sm mt-2">ফিল্টার পরিবর্তন করে চেষ্টা করুন</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Profile Header */}
                <div className="relative h-32 bg-gradient-to-r from-[#39FF14]/20 to-[#28CC0C]/20 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-black font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status || 'Active')}`}>
                      {user.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-xl text-white mb-1">{user.name}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  {/* Role Badge */}
                  <div className="flex justify-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Vendor Profile Details */}
                  {user.role === 'Vendor' && user.vendorProfile && (
                    <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-300 mb-2">
                        <span className="font-medium text-[#39FF14]">🏠 ফার্ম:</span> {user.vendorProfile.farmName}
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        <span className="font-medium text-[#39FF14]">📍 অবস্থান:</span> {user.vendorProfile.farmLocation}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-[#39FF14]">📜 সার্টিফিকেশন:</span> {user.vendorProfile.certificationStatus}
                      </div>
                    </div>
                  )}

                  {/* Customer Stats */}
                  {user.role === 'Customer' && user.customerStats && (
                    <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-[#39FF14]">{user.customerStats.postsCount}</div>
                          <div className="text-xs text-gray-400">পোস্ট</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-[#39FF14]">{user.customerStats.ordersCount}</div>
                          <div className="text-xs text-gray-400">অর্ডার</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex-1 text-center bg-[#39FF14] text-black py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-[#28CC0C] transform hover:scale-105"
                    >
                      👁️ দেখুন
                    </button>
                    <select
                      value={user.status || 'Active'}
                      onChange={(e) => updateUserStatus(user.id, e.target.value)}
                      className="flex-1 bg-gray-700 text-white py-2 px-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Profile Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-full flex items-center justify-center">
                      <span className="text-2xl text-black font-bold">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                      <p className="text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Detailed Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">রোল</div>
                      <div className="text-lg font-medium text-white">{selectedUser.role}</div>
                    </div>
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">স্ট্যাটাস</div>
                      <div className="text-lg font-medium text-white">{selectedUser.status || 'Active'}</div>
                    </div>
                  </div>

                  {selectedUser.role === 'Vendor' && selectedUser.vendorProfile && (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <h3 className="text-lg font-medium text-[#39FF14] mb-3">ভেন্ডর প্রোফাইল</h3>
                      <div className="space-y-2">
                        <div><span className="text-gray-400">ফার্ম নাম:</span> <span className="text-white">{selectedUser.vendorProfile.farmName}</span></div>
                        <div><span className="text-gray-400">অবস্থান:</span> <span className="text-white">{selectedUser.vendorProfile.farmLocation}</span></div>
                        <div><span className="text-gray-400">সার্টিফিকেশন:</span> <span className="text-white">{selectedUser.vendorProfile.certificationStatus}</span></div>
                        {selectedUser.vendorProfile.certifications && selectedUser.vendorProfile.certifications.length > 0 && (
                          <div>
                            <span className="text-gray-400">সার্টিফিকেট:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedUser.vendorProfile.certifications.map((cert, index) => (
                                <span key={index} className="px-2 py-1 bg-[#39FF14]/20 text-[#39FF14] rounded text-xs">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedUser.role === 'Customer' && selectedUser.customerStats && (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <h3 className="text-lg font-medium text-[#39FF14] mb-3">কাস্টমার স্ট্যাটিসটিক্স</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-600/50 rounded">
                          <div className="text-2xl font-bold text-[#39FF14]">{selectedUser.customerStats.postsCount}</div>
                          <div className="text-sm text-gray-400">মোট পোস্ট</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600/50 rounded">
                          <div className="text-2xl font-bold text-[#39FF14]">{selectedUser.customerStats.ordersCount}</div>
                          <div className="text-sm text-gray-400">মোট অর্ডার</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-6">
                  <select
                    value={selectedUser.status || 'Active'}
                    onChange={(e) => updateUserStatus(selectedUser.id, e.target.value)}
                    className="flex-1 bg-gray-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                    className="flex-1 bg-gray-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}