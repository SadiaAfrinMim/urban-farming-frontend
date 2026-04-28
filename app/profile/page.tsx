'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Alert, LoadingSpinner, StatusBadge } from '../components/ui';
import ProfileImage from '../components/ProfileImage';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  status: 'Active' | 'Pending' | 'Suspended';
  profileImage?: string;
  profileData?: {
    farmName?: string;
    farmLocation?: string;
    certificationStatus?: string;
    profilePhoto?: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    const formElements = e.currentTarget.elements as any;

    const updateData = {
      name: formElements.name.value,
    };

    // If vendor, add farm data
    if (profile?.role === 'Vendor') {
      updateData.farmName = formElements.farmName?.value;
      updateData.farmLocation = formElements.farmLocation?.value;
    }

    // Add profile image if selected
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    // Add JSON data as 'data' field (backend expects this format)
    formData.append('data', JSON.stringify(updateData));

    try {
      setUpdating(true);
      const response = await api.updateProfile(formData);

      if (response.success) {
        toast.success('প্রোফাইল আপডেট সফল হয়েছে!');
        setEditing(false);
        setSelectedFile(null);
        setImagePreview(null);
        fetchProfile(); // Refresh the profile data
      } else {
        throw new Error(response.message || 'প্রোফাইল আপডেট করা যাচ্ছে না');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'প্রোফাইল আপডেট করা যাচ্ছে না');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      setUpdating(true);
      const response = await api.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        toast.success('পাসওয়ার্ড পরিবর্তন সফল হয়েছে!');
        setChangingPassword(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.message || 'পাসওয়ার্ড পরিবর্তন করা যাচ্ছে না');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'পাসওয়ার্ড পরিবর্তন করা যাচ্ছে না');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-16">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-300 font-medium">প্রোফাইল লোড হচ্ছে...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" message={error || "প্রোফাইল লোড করা যাচ্ছে না। অনুগ্রহ করে রিফ্রেশ করে আবার চেষ্টা করুন।"} />
          <div className="mt-6 text-center">
            <Button onClick={fetchProfile} variant="primary">
              রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            👤 প্রোফাইল
          </h1>
          <p className="text-lg text-gray-300">আপনার প্রোফাইল তথ্য পরিচালনা করুন</p>
        </div>

        <Card className="mb-6">
          {/* Profile Header */}
           <div className="flex items-center mb-6">
             <div className="flex-shrink-0 mr-6">
               {editing && imagePreview && (profile.role === 'Customer' || profile.role === 'Admin') ? (
                 <img
                   src={imagePreview}
                   alt="Profile Preview"
                   className="w-24 h-24 rounded-full object-cover shadow-lg"
                 />
               ) : (
                 <ProfileImage user={profile} size="lg" className="shadow-lg" />
               )}
             </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white">{profile.name}</h2>
              <p className="text-gray-300 mt-1">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={profile.status} />
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-200">{profile.role}</span>
              </div>
            </div>
            <Button
              onClick={() => setEditing(!editing)}
              variant="outline"
              size="sm"
            >
              {editing ? 'বাতিল করুন' : 'প্রোফাইল এডিট করুন'}
            </Button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload - Only for Customer and Admin */}
              {(profile.role === 'Customer' || profile.role === 'Admin') && (
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                     {imagePreview ? (
                       <img
                         src={imagePreview}
                         alt="Profile Preview"
                         className="w-20 h-20 rounded-full object-cover shadow-md"
                       />
                     ) : (
                       <ProfileImage user={profile} size="md" className="shadow-md" />
                     )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      প্রোফাইল ছবি
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-700 file:text-green-100 hover:file:bg-green-600"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      JPG, PNG বা GIF ফরম্যাটে ছবি আপলোড করুন (সর্বোচ্চ 5MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Vendor Profile Photo Notice */}
              {profile.role === 'Vendor' && (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                     <div className="flex-shrink-0">
                       <ProfileImage user={profile} size="md" className="shadow-md" />
                     </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-200 mb-1">ভেন্ডর প্রোফাইল ছবি</h4>
                      <p className="text-sm text-gray-300">
                        ভেন্ডর প্রোফাইল ছবি পরিবর্তন করতে "ভেন্ডর প্রোফাইল" পেজে যান।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="নাম *"
                  name="name"
                  defaultValue={profile.name}
                  placeholder="আপনার নাম লিখুন"
                  fullWidth
                  required
                />
              </div>

              {profile.role === 'Vendor' && profile.profileData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="ফার্মের নাম"
                    name="farmName"
                    defaultValue={profile.profileData.farmName || ''}
                    placeholder="আপনার ফার্মের নাম লিখুন"
                    fullWidth
                  />

                  <Input
                    label="ফার্মের অবস্থান"
                    name="farmLocation"
                    defaultValue={profile.profileData.farmLocation || ''}
                    placeholder="ফার্মের অবস্থান লিখুন"
                    fullWidth
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={updating}
                  variant="primary"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  variant="outline"
                >
                  বাতিল করুন
                </Button>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  ⚙️ আরও সেটিংস
                </Link>
              </div>
            </form>
          ) : (
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ফার্ম তথ্য</h3>
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
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500">সার্টিফিকেশন স্ট্যাটাস:</span>
                    <div className="mt-1">
                      <StatusBadge status={profile.profileData.certificationStatus || 'Pending'} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Password Change Section */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">🔐 পাসওয়ার্ড পরিবর্তন</h3>
              <p className="text-gray-300 mt-1">আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখার জন্য পাসওয়ার্ড পরিবর্তন করুন</p>
            </div>
            <Button
              onClick={() => setChangingPassword(!changingPassword)}
              variant="outline"
              size="sm"
            >
              {changingPassword ? 'বাতিল করুন' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </Button>
          </div>

          {changingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="বর্তমান পাসওয়ার্ড *"
                  name="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                  fullWidth
                  required
                />

                <Input
                  label="নতুন পাসওয়ার্ড *"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  fullWidth
                  required
                />

                <Input
                  label="পাসওয়ার্ড কনফার্ম করুন *"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                  fullWidth
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">পাসওয়ার্ড নীতি:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• কমপক্ষে ৬ অক্ষরের হতে হবে</li>
                  <li>• বর্তমান পাসওয়ার্ড সঠিকভাবে লিখুন</li>
                  <li>• নতুন এবং কনফার্ম পাসওয়ার্ড একই হতে হবে</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={updating}
                  variant="primary"
                >
                  পাসওয়ার্ড পরিবর্তন করুন
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  variant="outline"
                >
                  বাতিল করুন
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ দ্রুত অ্যাকশন</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.role === 'Customer' && (
              <>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="font-semibold text-blue-800">আমার অর্ডার</div>
                    <div className="text-sm text-blue-600">অর্ডার ইতিহাস দেখুন</div>
                  </div>
                </Link>
                <Link
                  href="/rentals"
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                  <span className="text-2xl">🌱</span>
                  <div>
                    <div className="font-semibold text-green-800">রেন্টাল স্পেস</div>
                    <div className="text-sm text-green-600">আপনার ভাড়া করা জায়গা</div>
                  </div>
                </Link>
                <Link
                  href="/community"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="font-semibold text-purple-800">কমিউনিটি</div>
                    <div className="text-sm text-purple-600">অন্যান্য উদ্যানবিদদের সাথে যুক্ত হোন</div>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                >
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <div className="font-semibold text-orange-800">সেটিংস</div>
                    <div className="text-sm text-orange-600">নিরাপত্তা এবং পছন্দসমূহ</div>
                  </div>
                </Link>
              </>
            )}

            {profile.role === 'Vendor' && (
              <>
                <Link
                  href="/vendor/dashboard"
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-semibold text-blue-800">ড্যাশবোর্ড</div>
                    <div className="text-sm text-blue-600">ব্যবসার ওভারভিউ</div>
                  </div>
                </Link>
                <Link
                  href="/vendor/products"
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                  <span className="text-2xl">🛒</span>
                  <div>
                    <div className="font-semibold text-green-800">প্রোডাক্ট ম্যানেজ</div>
                    <div className="text-sm text-green-600">আপনার প্রোডাক্টগুলো পরিচালনা করুন</div>
                  </div>
                </Link>
                <Link
                  href="/vendor/profile"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                  <span className="text-2xl">🏢</span>
                  <div>
                    <div className="font-semibold text-purple-800">ভেন্ডর প্রোফাইল</div>
                    <div className="text-sm text-purple-600">বিস্তারিত প্রোফাইল এবং সার্টিফিকেশন</div>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                >
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <div className="font-semibold text-orange-800">সেটিংস</div>
                    <div className="text-sm text-orange-600">নিরাপত্তা এবং পছন্দসমূহ</div>
                  </div>
                </Link>
              </>
            )}

            {profile.role === 'Admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-semibold text-blue-800">এডমিন ড্যাশবোর্ড</div>
                    <div className="text-sm text-blue-600">সিস্টেম ওভারভিউ</div>
                  </div>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="font-semibold text-green-800">ইউজার ম্যানেজমেন্ট</div>
                    <div className="text-sm text-green-600">সব ইউজার পরিচালনা করুন</div>
                  </div>
                </Link>
                <Link
                  href="/admin/products"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold text-purple-800">প্রোডাক্ট রিভিউ</div>
                    <div className="text-sm text-purple-600">প্রোডাক্ট অনুমোদন করুন</div>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                >
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <div className="font-semibold text-orange-800">সেটিংস</div>
                    <div className="text-sm text-orange-600">নিরাপত্তা এবং পছন্দসমূহ</div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </Card>

        {profile.role === 'Vendor' && (
          <Alert
            type="info"
            message="আপনার ফার্মের বিস্তারিত প্রোফাইল এবং সার্টিফিকেশন পরিচালনা করতে ভেন্ডর প্রোফাইল পেজে যান।"
            className="mb-6"
          />
        )}
      </div>
    </div>
  );
}