'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, FileCheck, AlertCircle, Calendar } from 'lucide-react';
import { usePendingCertifications, useApproveCertification, useRejectCertification } from '../../hooks/useApi';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ত্রুটি</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'সার্টিফিকেশন লোড করতে সমস্যা হয়েছে'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            রিফ্রেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← এডমিন ড্যাশবোর্ডে ফিরে যান</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">ভেন্ডর সার্টিফিকেশন রিভিউ</h1>

        {certifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <FileCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">কোনো পেন্ডিং সার্টিফিকেশন নেই</h3>
            <p className="text-gray-500">সব ভেন্ডর সার্টিফিকেশন রিভিউ করা হয়েছে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* Vendor Profile Photo */}
                  <div className="flex-shrink-0">
                    {vendor.profilePhoto ? (
                      <img
                        src={vendor.profilePhoto}
                        alt={vendor.farmName}
                        className="w-16 h-16 object-cover rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{vendor.farmName.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Vendor Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{vendor.farmName}</h3>
                    <p className="text-gray-600 text-sm mb-2">{vendor.farmLocation}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">ভেন্ডর:</span>
                        <span className="truncate ml-2">{vendor.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ইমেইল:</span>
                        <span className="truncate ml-2 text-xs">{vendor.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">সার্টিফিকেট:</span>
                        <span className="text-sm">{vendor.certifications.length}টি</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApprove(vendor.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        অনুমোদন
                      </button>
                      <button
                        onClick={() => handleReject(vendor.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        প্রত্যাখ্যান
                      </button>
                    </div>
                  </div>
                </div>

                {/* Certification Preview */}
                {vendor.certifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">সার্টিফিকেশন:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {vendor.certifications.slice(0, 4).map((cert, index) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cert);
                        return (
                          <div key={index} className="relative">
                            {isImage ? (
                              <img
                                src={cert}
                                alt={`সার্টিফিকেশন ${index + 1}`}
                                className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(cert, '_blank')}
                              />
                            ) : (
                              <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                <FileCheck className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {vendor.certifications.length > 4 && (
                        <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{vendor.certifications.length - 4} আরও</span>
                        </div>
                      )}
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
