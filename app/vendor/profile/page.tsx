'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { useVendorProfile, useUpdateVendorProfile } from '../../hooks/useApi';
import { Card, Button, Input, Alert, LoadingSpinner } from '../../components/ui';
import ProfileImage from '../../components/ProfileImage';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { data: profile, isLoading, error, refetch } = useVendorProfile();
  const updateProfileMutation = useUpdateVendorProfile();

  const [editing, setEditing] = useState(false);
  const [certifications, setCertifications] = useState<File[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    // Add text fields
    const formElements = e.currentTarget.elements as any;
    formData.append('farmName', formElements.farmName.value);
    formData.append('farmLocation', formElements.farmLocation.value);

    // Add profile photo if selected
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    // Add certifications
    if (certifications.length > 0) {
      certifications.forEach((cert) => {
        formData.append('certification', cert);
      });
    }

    updateProfileMutation.mutate(formData as any, {
      onSuccess: () => {
        setEditing(false);
        setCertifications([]);
        setProfilePhoto(null);
        // Clear file inputs
        const profilePhotoInput = document.getElementById('profilePhoto') as HTMLInputElement;
        const certInput = document.querySelector('input[accept=".pdf,.jpg,.jpeg,.png"]') as HTMLInputElement;
        if (profilePhotoInput) profilePhotoInput.value = '';
        if (certInput) certInput.value = '';
        refetch();
      },
    });
  };

  const removeCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    // Reset the input field
    const input = document.getElementById('profilePhoto') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Validate file types and sizes
      const validFiles = fileArray.filter(file => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name}: শুধুমাত্র PDF এবং ইমেজ ফাইল গ্রহণযোগ্য`);
          return false;
        }

        if (file.size > maxSize) {
          toast.error(`${file.name}: ফাইল সাইজ 5MB এর বেশি হতে পারবে না`);
          return false;
        }

        return true;
      });

      setCertifications(prev => [...prev, ...validFiles]);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image types and sizes
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error('শুধুমাত্র JPEG, PNG এবং WebP ইমেজ গ্রহণযোগ্য');
        return;
      }

      if (file.size > maxSize) {
        toast.error('প্রোফাইল ফটো 5MB এর বেশি হতে পারবে না');
        return;
      }

      setProfilePhoto(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-16">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">প্রোফাইল লোড হচ্ছে...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" message="প্রোফাইল লোড করা যাচ্ছে না। অনুগ্রহ করে রিফ্রেশ করে আবার চেষ্টা করুন।" />
          <div className="mt-4 text-center">
            <Button onClick={() => refetch()} variant="primary">
              রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ফার্ম প্রোফাইল এবং সার্টিফিকেশন</h1>
          <p className="text-gray-600 mt-2">আপনার ফার্মের তথ্য এবং সার্টিফিকেশন পরিচালনা করুন</p>
        </div>

        {updateProfileMutation.isError && (
          <Alert
            type="error"
            message="প্রোফাইল আপডেট করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।"
            className="mb-6"
          />
        )}

        <Card className="mb-6">
          {/* Profile Photo Display */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 mr-6">
              <ProfileImage
                user={{
                  name: profile?.farmName,
                  role: 'Vendor',
                  profileData: { profilePhoto: profile?.profilePhoto }
                }}
                size="lg"
                className="border-4 border-green-100 shadow-lg"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">ফার্ম তথ্য</h2>
              <p className="text-gray-600 mt-1">{profile?.farmName || 'ফার্মের নাম যোগ করুন'}</p>
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
            <Input
              label="ফার্মের নাম *"
              name="farmName"
              defaultValue={profile?.farmName || ''}
              placeholder="আপনার ফার্মের নাম লিখুন"
              fullWidth
              required
            />

            <Input
              label="ফার্মের অবস্থান *"
              name="farmLocation"
              defaultValue={profile?.farmLocation || ''}
              placeholder="ফার্মের অবস্থান লিখুন"
              fullWidth
              required
            />

            <div>
              <label htmlFor="profilePhoto" className="block text-sm font-semibold text-gray-800 mb-2">
                প্রোফাইল ফটো
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="profilePhoto"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">প্রোফাইল ফটো আপলোড করুন (ঐচ্ছিক, সর্বোচ্চ 5MB)</p>
              {profilePhoto && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={URL.createObjectURL(profilePhoto)}
                    alt="প্রোফাইল ফটো প্রিভিউ"
                    className="w-20 h-20 object-cover rounded-full border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="প্রোফাইল ফটো রিমুভ করুন"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                loading={updateProfileMutation.isPending}
                variant="primary"
              >
                পরিবর্তন সংরক্ষণ করুন
              </Button>
              <Button
                type="button"
                onClick={() => setEditing(false)}
                variant="outline"
              >
                বাতিল করুন
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">ফার্মের নাম:</span>
                <p className="text-lg font-semibold text-gray-900 mt-1">{profile?.farmName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">অবস্থান:</span>
                <p className="text-lg font-semibold text-gray-900 mt-1">{profile?.farmLocation}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">সার্টিফিকেশন স্ট্যাটাস:</span>
              <div className="mt-1">
                <StatusBadge status={profile?.certificationStatus || 'Pending'} />
              </div>
            </div>
          </div>
        )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">সার্টিফিকেশন ডকুমেন্টস</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                নতুন ডকুমেন্ট আপলোড করুন
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">PDF বা ইমেজ ফাইল আপলোড করুন (প্রতিটি সর্বোচ্চ 5MB)। ইমেজগুলো ক্লিক করে বড় করে দেখতে পারবেন।</p>
            </div>

            {profile?.certifications && profile.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">আপলোড করা ডকুমেন্টস:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.certifications.map((cert, index) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cert);
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        {isImage ? (
                          <div className="relative mb-2">
                            <img
                              src={cert}
                              alt={`সার্টিফিকেশন ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(cert, '_blank')}
                              onError={(e) => {
                                // If image fails to load, show document icon
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const iconDiv = parent.querySelector('.fallback-icon') as HTMLElement;
                                  if (iconDiv) iconDiv.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="fallback-icon hidden items-center gap-3">
                              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900 truncate flex-1">সার্টিফিকেশন {index + 1}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 mb-2">
                            <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900 truncate flex-1">সার্টিফিকেশন {index + 1}</span>
                          </div>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // TODO: Implement remove functionality
                            toast.error('এক্সিস্টিং ডকুমেন্ট রিমুভ ফিচার এখনও ইমপ্লিমেন্ট করা হয়নি');
                          }}
                        >
                          রিমুভ করুন
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">নতুন আপলোড করা ডকুমেন্টস:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certifications.map((file, index) => (
                    <div key={index} className="relative bg-blue-50 rounded-lg p-3 border border-blue-200">
                      {file.type.startsWith('image/') ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`প্রিভিউ: ${file.name}`}
                            className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                          />
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title="ফাইল রিমুভ করুন"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-800 truncate">{file.name}</p>
                            <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors flex-shrink-0"
                            title="ফাইল রিমুভ করুন"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}