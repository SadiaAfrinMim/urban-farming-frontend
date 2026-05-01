'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalSpace, useCreateOrder } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function RentalDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const resolvedParams = use(params);
  const { data: rentalSpace, isLoading, error } = useRentalSpace(resolvedParams.id);
  const createOrderMutation = useCreateOrder();
  const [quantity, setQuantity] = useState(1);

  const handleBookRental = async () => {
    if (!isAuthenticated || !user) {
      toast.error('রেন্টাল স্পেস বুক করার জন্য লগইন করুন');
      router.push('/login');
      return;
    }

    if (user.role === 'Vendor') {
      toast.error('ভেন্ডররা রেন্টাল স্পেস বুক করতে পারবেন না। শুধুমাত্র কাস্টমাররা বুক করতে পারবেন।');
      return;
    }

    if (!rentalSpace) {
      toast.error('রেন্টাল স্পেস খুঁজে পাওয়া যায়নি');
      return;
    }

    if (!rentalSpace.availability) {
      toast.error('এই রেন্টাল স্পেসটি এখন বুক করার জন্য উপলব্ধ নয়');
      return;
    }

    const orderData = {
      rentalSpaceId: rentalSpace.id,
      quantity: quantity, // Allow multiple portions for rentals
      totalPrice: rentalSpace.price * quantity,
    };

    console.log('Creating rental order with data:', orderData);

    createOrderMutation.mutate(orderData, {
      onSuccess: (response: any) => {
        console.log('Rental order creation response:', response);
        if (response.success && response.data) {
          const orderId = response.data.id || response.data.orderId || rentalSpace.id;

          // Store order ID for payment page
          localStorage.setItem('pendingOrderId', orderId.toString());
          console.log('Stored rental order ID:', orderId);

          toast.success('রেন্টাল অর্ডার তৈরি হয়েছে! পেমেন্ট পেজে যাচ্ছে...');

          // Redirect to payment page
          router.push('/payment');
        } else {
          toast.error(response.message || 'রেন্টাল অর্ডার তৈরি করা যায়নি');
        }
      },
      onError: (error: Error) => {
        console.error('Failed to create rental order:', error);
        toast.error('রেন্টাল অর্ডার তৈরি করার সময় ত্রুটি ঘটেছে');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
          <div className="text-xl text-[#39FF14] font-medium">রেন্টাল স্পেস লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  if (error || !rentalSpace) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-400 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center">
          {error?.message || 'রেন্টাল স্পেস খুঁজে পাওয়া যায়নি'}
        </div>
        <Link
          href="/rentals"
          className="px-8 py-3 bg-[#39FF14] text-black rounded-lg hover:bg-[#28CC0C] transition-colors font-medium"
        >
          রেন্টাল স্পেসে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4 relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 brightness-75 z-0"
      >
        <source src="/15146916_1080_1920_30fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-10"></div>

      <div className="max-w-4xl mx-auto relative z-20">
        <div className="mb-8">
          <Link href="/rentals" className="inline-flex items-center gap-2 text-[#39FF14] hover:text-[#28CC0C] font-medium transition-colors">
            ← রেন্টাল স্পেসে ফিরে যান
          </Link>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Rental Space Image */}
            <div className="md:w-1/2">
              <div className="relative h-96 md:h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
                {rentalSpace.image ? (
                  <img
                    src={rentalSpace.image.startsWith('http') ? rentalSpace.image : `https://urban-farming-backend-pink.vercel.app${rentalSpace.image}`}
                    alt={rentalSpace.location}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', rentalSpace.image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl">🌱</span>
                    <span className="text-gray-400 font-medium">ছবি নেই</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-[#39FF14]/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#39FF14]">
                  {rentalSpace.size}
                </div>
                <div className={`absolute top-4 right-4 text-black px-3 py-1 rounded-full text-xs font-medium ${
                  rentalSpace.availability ? 'bg-[#39FF14]' : 'bg-gray-400'
                }`}>
                  {rentalSpace.availability ? '✅ উপলব্ধ' : '❌ বুক করা হয়েছে'}
                </div>
              </div>
            </div>

            {/* Rental Space Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-[#39FF14] mb-4">{rentalSpace.location}</h1>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#39FF14]">৳ {rentalSpace.price}</span>
                  <span className="text-sm text-gray-400">প্রতি মাস</span>
                </div>

                {/* Quantity Selection */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">পরিমাণ (মাস):</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 bg-gray-700 text-white rounded-full hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold text-[#39FF14] min-w-[2rem] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 bg-gray-700 text-white rounded-full hover:bg-gray-600 flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    মোট মূল্য: <span className="text-[#39FF14] font-semibold">৳ {rentalSpace.price * quantity}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  তৈরি হয়েছে: {new Date(rentalSpace.createdAt).toLocaleDateString('bn-BD')}
                </div>
                {rentalSpace.updatedAt !== rentalSpace.createdAt && (
                  <div className="text-sm text-gray-400">
                    আপডেট হয়েছে: {new Date(rentalSpace.updatedAt).toLocaleDateString('bn-BD')}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">আকার:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#39FF14]/20 text-[#39FF14]">
                    {rentalSpace.size}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">উপলব্ধতা:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rentalSpace.availability
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {rentalSpace.availability ? 'উপলব্ধ' : 'বুক করা হয়েছে'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">স্পেসের তথ্য</h3>
                <div className="space-y-2 text-gray-400">
                  <p><strong className="text-gray-300">আইডি:</strong> #{rentalSpace.id}</p>
                  <p><strong className="text-gray-300">ভেন্ডর আইডি:</strong> #{rentalSpace.vendorId}</p>
                  <p><strong className="text-gray-300">অবস্থান:</strong> {rentalSpace.location}</p>
                  <p><strong className="text-gray-300">আকার:</strong> {rentalSpace.size}</p>
                  <p><strong className="text-gray-300">দাম:</strong> ৳{rentalSpace.price} প্রতি মাস</p>
                  <p><strong className="text-gray-300">উপলব্ধতা:</strong> {rentalSpace.availability ? 'হ্যাঁ' : 'না'}</p>
                </div>
              </div>

              {rentalSpace.plantStatus && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">গাছের অবস্থা</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <p><strong className="text-gray-300">স্বাস্থ্য:</strong> <span className="text-green-400">{rentalSpace.plantStatus.health || 'অজানা'}</span></p>
                    <p><strong className="text-gray-300">বয়স:</strong> <span className="text-blue-400">{rentalSpace.plantStatus.age || 'অজানা'}</span></p>
                    {rentalSpace.plantStatus.growth && (
                      <p><strong className="text-gray-300">বৃদ্ধি:</strong> <span className="text-yellow-400">{rentalSpace.plantStatus.growth}</span></p>
                    )}
                    {rentalSpace.plantStatus.condition && (
                      <p><strong className="text-gray-300">অবস্থা:</strong> <span className="text-purple-400">{rentalSpace.plantStatus.condition}</span></p>
                    )}
                    <p><strong className="text-gray-300">শেষ পানি দেওয়া:</strong> <span className="text-cyan-400">{rentalSpace.lastWatered ? new Date(rentalSpace.lastWatered).toLocaleDateString('bn-BD') : 'অজানা'}</span></p>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleBookRental}
                  disabled={!rentalSpace.availability}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black text-lg font-semibold rounded-xl hover:from-[#28CC0C] hover:to-[#39FF14] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  {rentalSpace.availability
                    ? `বুক করুন (${quantity} মাস) - ৳ ${rentalSpace.price * quantity}`
                    : 'উপলব্ধ নয়'
                  }
                </button>
              </div>

              <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">রেন্টাল শর্তাবলী</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• রেন্টাল ফি নির্বাচিত মাসের জন্য এবং পেমেন্টের পর স্পেসটি আপনার জন্য রিজার্ভ হবে</p>
                  <p>• মাসিক পেমেন্ট সময়মতো করতে হবে</p>
                  <p>• গাছের যত্ন নেওয়ার দায়িত্ব ভাড়াটিয়ার</p>
                  <p>• কোনো ক্ষতি হলে ক্ষতিপূরণ দিতে হবে</p>
                  <p>• চুক্তি বাতিল করতে ৩০ দিনের নোটিশ দিতে হবে</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}