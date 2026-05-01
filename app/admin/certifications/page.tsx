'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, FileCheck, AlertCircle, Calendar } from 'lucide-react';
import { usePendingCertifications, useApproveCertification, useRejectCertification } from '../../hooks/useApi';
import ProfileImage from '../../components/ProfileImage';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VendorProfile {
  id: string;
  farmName: string;
  farmLocation: string;
  certificationStatus: string;
  profilePhoto?: string;
  certifications: string[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminCertificationsPage() {
  const { data: certifications = [], isLoading: loading, error, refetch } = usePendingCertifications();
  const approveCertificationMutation = useApproveCertification();
  const rejectCertificationMutation = useRejectCertification();

  const handleApprove = async (vendorId: string) => {
    try {
      await approveCertificationMutation.mutateAsync(vendorId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = prompt('প্রত্যাখ্যানের কারণ লিখুন:');
    if (!reason) return;

    try {
      await rejectCertificationMutation.mutateAsync({ vendorId, reason });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl text-gray-200 font-medium">লোড হচ্ছে...</div>
          <div className="text-gray-400 mt-2">সার্টিফিকেশন ডেটা আনা হচ্ছে</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500 rounded-full w-20 h-20 mx-auto opacity-10"></div>
              <AlertCircle className="w-20 h-20 mx-auto text-red-500 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-200 mb-3">⚠️ ত্রুটি ঘটেছে</h2>
            <p className="text-gray-300 text-lg mb-6">{error instanceof Error ? error.message : 'সার্টিফিকেশন লোড করতে সমস্যা হয়েছে'}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 রিফ্রেশ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                এডমিন ড্যাশবোর্ডে ফিরে যান
              </Link>
              <h1 className="text-4xl font-bold mb-2">🌱 ভেন্ডর সার্টিফিকেশন রিভিউ</h1>
              <p className="text-green-100 text-lg">নতুন ভেন্ডরদের সার্টিফিকেশন যাচাই করে অনুমোদন করুন</p>
            </div>
            <div className="hidden md:block">
              <FileCheck className="w-24 h-24 text-green-200 opacity-80" />
            </div>
          </div>
        </div>

        {certifications.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full w-20 h-20 mx-auto opacity-10"></div>
              <FileCheck className="w-20 h-20 mx-auto text-green-500 mb-6 relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-200 mb-3">🎉 কোনো পেন্ডিং সার্টিফিকেশন নেই</h3>
            <p className="text-gray-300 text-lg max-w-md mx-auto">সব ভেন্ডর সার্টিফিকেশন রিভিউ করা হয়েছে। নতুন আবেদনের জন্য অপেক্ষা করুন!</p>
            <div className="mt-6 flex justify-center">
              <div className="bg-gray-700 px-6 py-3 rounded-full">
                <span className="text-green-400 font-medium">সব পরিষ্কার! ✨</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {certifications.map((vendor) => (
              <div key={vendor.id} className="bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🌾</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{vendor.farmName}</h3>
                      <p className="text-blue-100 text-sm">📍 {vendor.farmLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-4 mb-4">
                    {/* Vendor Profile Photo */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <ProfileImage
                          user={{
                            name: vendor.farmName,
                            role: 'Vendor',
                            profileData: { profilePhoto: vendor.profilePhoto }
                          }}
                          size="lg"
                          className="border-4 border-white shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">⭐</span>
                        </div>
                      </div>
                    </div>

                    {/* Vendor Details */}
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400">👤</span>
                            <span className="font-medium text-gray-200">ভেন্ডর:</span>
                          </div>
                          <span className="text-gray-100">{vendor.user.name}</span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400">📧</span>
                            <span className="font-medium text-gray-200">ইমেইল:</span>
                          </div>
                          <span className="text-gray-100 text-xs break-all">{vendor.user.email}</span>
                        </div>
                        <div className="bg-gray-600 rounded-lg p-3 border border-green-600">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-400">📋</span>
                            <span className="font-medium text-green-300">সার্টিফিকেশন:</span>
                          </div>
                          <span className="text-green-200 font-semibold">{vendor.certifications.length}টি ডকুমেন্ট</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleApprove(vendor.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      ✅ অনুমোদন
                    </button>
                    <button
                      onClick={() => handleReject(vendor.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                      ❌ প্রত্যাখ্যান
                    </button>
                  </div>
                </div>

                {/* Certification Preview */}
                {vendor.certifications.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                      <div className="flex items-center gap-2 mb-3">
                        <FileCheck className="w-5 h-5 text-blue-400" />
                        <h4 className="text-lg font-semibold text-gray-100">📄 সার্টিফিকেশন ডকুমেন্টস</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {vendor.certifications.slice(0, 4).map((cert, index) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cert);
                          const fullUrl = cert.startsWith('http') ? cert : `${API_BASE_URL}${cert}`;
                          return (
                            <div key={index} className="relative group">
                              {isImage ? (
                                <div className="relative overflow-hidden rounded-lg shadow-md">
                                  <img
                                    src={fullUrl}
                                    alt={`সার্টিফিকেশন ${index + 1}`}
                                    className="w-full h-20 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                    onClick={() => window.open(fullUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      const parent = (e.target as HTMLImageElement).parentElement;
                                      if (parent) {
                                        const placeholder = document.createElement('div');
                                        placeholder.className = 'w-full h-20 bg-gray-600 rounded-lg flex items-center justify-center text-center';
                                        placeholder.innerHTML = '<div><span className="text-2xl">📄</span><span className="text-xs text-gray-300 font-medium block mt-1">Image Error</span></div>';
                                        placeholder.onclick = () => window.open(fullUrl, '_blank');
                                        parent.appendChild(placeholder);
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium">
                                      দেখুন
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="w-full h-20 bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-all duration-200 shadow-md"
                                  onClick={() => window.open(fullUrl, '_blank')}
                                >
                                  <div className="text-center">
                                    <FileCheck className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                                    <span className="text-xs text-blue-300 font-medium">ডকুমেন্ট</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {vendor.certifications.length > 4 && (
                          <div className="w-full h-20 bg-gray-600 rounded-lg flex items-center justify-center shadow-md">
                            <div className="text-center">
                              <span className="text-2xl">📚</span>
                              <span className="text-xs text-gray-300 font-medium block mt-1">+{vendor.certifications.length - 4} আরও</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
