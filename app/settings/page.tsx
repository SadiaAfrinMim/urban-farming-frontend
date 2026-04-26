'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Alert, LoadingSpinner, StatusBadge } from '../components/ui';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  status: 'Active' | 'Pending' | 'Suspended';
  profileData?: {
    farmName?: string;
    farmLocation?: string;
    certificationStatus?: string;
  };
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getMyProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        throw new Error(response.message || 'প্রোফাইল লোড করা যাচ্ছে না');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'প্রোফাইল লোড করা যাচ্ছে না');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="text-center py-16">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-700 font-medium">সেটিংস লোড হচ্ছে...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Alert type="error" message={error || "সেটিংস লোড করা যাচ্ছে না।"} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4">
            ← প্রোফাইল পেজে ফিরে যান
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            ⚙️ সেটিংস
          </h1>
          <p className="text-lg text-gray-600">আপনার অ্যাকাউন্ট এবং পছন্দসমূহ পরিচালনা করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 প্রোফাইল সেটিংস
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔐 নিরাপত্তা
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'preferences'
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ পছন্দসমূহ
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">👤 প্রোফাইল তথ্য</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">নাম:</span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{profile.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">ইমেইল:</span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{profile.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">রোল:</span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{profile.role}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">স্ট্যাটাস:</span>
                      <div className="mt-1">
                        <StatusBadge status={profile.status} />
                      </div>
                    </div>
                  </div>

                  {profile.role === 'Vendor' && profile.profileData && (
                    <div className="border-t pt-4 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 ফার্ম তথ্য</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">ফার্মের নাম:</span>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {profile.profileData.farmName || 'নির্ধারিত নেই'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">ফার্মের অবস্থান:</span>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {profile.profileData.farmLocation || 'নির্ধারিত নেই'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-sm font-medium text-gray-500">সার্টিফিকেশন স্ট্যাটাস:</span>
                          <div className="mt-1">
                            <StatusBadge status={profile.profileData.certificationStatus || 'Pending'} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-6">
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      ✏️ প্রোফাইল এডিট করুন
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">🔐 নিরাপত্তা সেটিংস</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">পাসওয়ার্ড পরিবর্তন</h3>
                    <p className="text-gray-600 mb-4">
                      আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখার জন্য নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।
                    </p>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      🔑 পাসওয়ার্ড পরিবর্তন করুন
                    </Link>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">অ্যাকাউন্ট নিরাপত্তা</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">দুই-ফ্যাক্টর অথেনটিকেশন</div>
                          <div className="text-sm text-gray-600">অতিরিক্ত নিরাপত্তা যোগ করুন</div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          শীঘ্রই আসছে
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">লগইন অ্যাক্টিভিটি</div>
                          <div className="text-sm text-gray-600">আপনার অ্যাকাউন্টে লগইন অ্যাক্টিভিটি দেখুন</div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          শীঘ্রই আসছে
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">⚙️ পছন্দসমূহ</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">নোটিফিকেশন সেটিংস</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">ইমেইল নোটিফিকেশন</div>
                          <div className="text-sm text-gray-600">অর্ডার এবং আপডেট সম্পর্কিত ইমেইল পান</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600" disabled />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">পুশ নোটিফিকেশন</div>
                          <div className="text-sm text-gray-600">ব্রাউজারে নোটিফিকেশন পান</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-green-600" disabled />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">প্রাইভেসি সেটিংস</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">প্রোফাইল প্রকাশ্যতা</div>
                          <div className="text-sm text-gray-600">আপনার প্রোফাইল কে দেখতে পারবে</div>
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-lg" disabled>
                          <option>সবাই</option>
                          <option>শুধুমাত্র লগইন করা ইউজার</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          কাস্টমাইজেশন ফিচার
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>এই সেটিংস গুলো শীঘ্রই যোগ করা হবে। আপাতত ডিফল্ট সেটিংস ব্যবহার করা হচ্ছে।</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}