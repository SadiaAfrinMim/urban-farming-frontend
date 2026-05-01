'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAllVendorsData, useSustainabilityCerts } from '../hooks/useApi';
import { Card, LoadingSpinner, Button } from '../components/ui';
import ProfileImage from '../components/ProfileImage';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SustainabilityPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('Admin');

  // Fetch approved certified vendors
  const { data: vendorsData, isLoading: vendorsLoading, error: vendorsError } = useAllVendorsData({
    certificationStatus: 'Approved',
    limit: 100
  });

  // Fetch existing sustainability certificates
  const { data: sustainabilityCerts, isLoading: certsLoading, error: certsError } = useSustainabilityCerts();

  const [addingToSustainability, setAddingToSustainability] = useState<string | null>(null);

  // Check if vendor is already in sustainability list
  const isVendorInSustainability = (vendorId: string) => {
    if (!sustainabilityCerts) return false;
    return sustainabilityCerts.some(cert => cert.vendor && cert.vendor.userId === parseInt(vendorId));
  };

  // Add vendor to sustainability
  const addVendorToSustainability = async (vendor: any) => {
    if (!vendor.vendorProfile) {
      toast.error('ভেন্ডর প্রোফাইল তথ্য পাওয়া যায়নি');
      return;
    }

    setAddingToSustainability(vendor.id);

    try {
      // Create a sustainability certificate for this vendor using admin API
      const certData = {
        vendorId: vendor.vendorProfile.id,
        certifyingAgency: 'Urban Farming Admin',
        certificationDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://urban-farming-backend-pink.vercel.app'}/api/v1/sustainability/certs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(certData)
      });

      if (response.ok) {
        toast.success(`${vendor.vendorProfile.farmName} কে সাস্টেইনেবিলিটি লিস্টে যোগ করা হয়েছে`);
        // Refetch data by reloading the page
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'সার্টিফিকেট তৈরি করা যায়নি' }));
        throw new Error(errorData.message || 'সার্টিফিকেট তৈরি করা যায়নি');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'সাস্টেইনেবিলিটিতে যোগ করতে সমস্যা হয়েছে');
    } finally {
      setAddingToSustainability(null);
    }
  };

  if (vendorsLoading || certsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" className="text-green-400" />
          <div className="text-xl text-gray-300 font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🌍 সার্টিফাইড ভেন্ডরস
          </h1>
          <p className="text-lg text-gray-300">অনুমোদিত পরিবেশবান্ধব ভেন্ডরদের তালিকা দেখুন</p>
        </div>

        {(vendorsError || certsError) && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-6 py-4 rounded-xl mb-8 shadow-sm">
            ❌ {vendorsError?.message || certsError?.message || 'ডেটা লোড করা যাচ্ছে না'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(!vendorsData?.data || vendorsData.data.length === 0) ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🌱</div>
              <div className="text-gray-400 text-xl font-medium">কোনো অনুমোদিত সার্টিফাইড ভেন্ডর পাওয়া যায়নি</div>
              <div className="text-gray-500 text-sm mt-2">নতুন ভেন্ডররা শীঘ্রই যোগ হবে</div>
            </div>
          ) : (
            vendorsData.data.map((vendor: any) => (
              <Card key={vendor.id} className="bg-gray-800 border border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <ProfileImage
                      user={{
                        name: vendor.name,
                        role: 'Vendor',
                        profileData: { profilePhoto: vendor.vendorProfile?.profilePhoto }
                      }}
                      size="md"
                      className="border-2 border-green-500"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-100 truncate">{vendor.name}</h3>
                      <p className="text-sm text-gray-400">{vendor.email}</p>
                    </div>
                  </div>

                  {vendor.vendorProfile && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">ফার্ম:</span> {vendor.vendorProfile.farmName || 'নির্ধারিত নেই'}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">অবস্থান:</span> {vendor.vendorProfile.farmLocation || 'নির্ধারিত নেই'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-sm font-medium text-green-400">সার্টিফাইড</span>
                      {isVendorInSustainability(vendor.id) && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          🌱 সাস্টেইনেবিলিটিতে
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isAdmin && !isVendorInSustainability(vendor.id) && (
                        <Button
                          onClick={() => addVendorToSustainability(vendor)}
                          loading={addingToSustainability === vendor.id}
                          variant="outline"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        >
                          🌱 যোগ করুন
                        </Button>
                      )}
                      <Link
                        href={`/marketplace?vendor=${vendor.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <span>পণ্য দেখুন</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sustainability Certificates Section */}
        {sustainabilityCerts && sustainabilityCerts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                🌱 সাস্টেইনেবিলিটি সার্টিফিকেটস
              </h2>
              <p className="text-lg text-gray-300">পরিবেশবান্ধব কৃষি এবং পরিবেশ রক্ষার জন্য প্রাপ্ত সার্টিফিকেটসমূহ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sustainabilityCerts.map((cert: any) => (
                <Card key={cert.id} className="bg-gray-800 border border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <ProfileImage
                        user={{
                          name: cert.vendor?.user?.name || 'Unknown Vendor',
                          role: 'Vendor',
                          profileData: { profilePhoto: cert.vendor?.profilePhoto }
                        }}
                        size="md"
                        className="border-2 border-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-100 truncate">
                          {cert.vendor?.farmName || 'Unknown Farm'}
                        </h3>
                        <p className="text-sm text-gray-400">{cert.vendor?.user?.name}</p>
                        <p className="text-xs text-gray-500">{cert.vendor?.farmLocation}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">সার্টিফাইং এজেন্সি:</span>
                        <span className="text-sm font-medium text-gray-200">{cert.certifyingAgency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">সার্টিফিকেশন তারিখ:</span>
                        <span className="text-sm font-medium text-gray-200">
                          {new Date(cert.certificationDate).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-green-400 font-medium">
                      <span>🌿</span>
                      <span>পরিবেশবান্ধব ভেন্ডর</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
