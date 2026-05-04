'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalSpace, useCreateOrder } from '../../hooks/useApi';
import api, { resolveAssetUrl, SOCKET_BASE_URL } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

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
  const [otherRentals, setOtherRentals] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);
  const [currentRentalSpace, setCurrentRentalSpace] = useState(rentalSpace);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<any>(null);

  useEffect(() => {
    if (rentalSpace) {
      setCurrentRentalSpace(rentalSpace);

      const fetchRelatedData = async () => {
        try {
          // Fetch vendor information
          try {
            const users = await api.getAllUsers();
            const vendor = users.find(u => u.id === rentalSpace.vendorId.toString());
            if (vendor) {
              setVendorInfo({
                id: vendor.id,
                name: vendor.name,
                farmName: vendor.name,
                farmLocation: 'Location not available',
                certificationStatus: 'Pending'
              });
            }
          } catch (vendorError) {
            console.warn('Could not fetch vendor info:', vendorError);
          }

          // Fetch other rentals
          const allRentals = await api.getRentalSpaces();
          const filteredRentals = allRentals.filter(r => r.vendorId === rentalSpace.vendorId && r.id !== rentalSpace.id);
          setOtherRentals(filteredRentals);

          // Fetch products from same vendor
          const allProducts = await api.getProduces();
          const filteredProducts = allProducts.filter(p => p.vendor?.id === rentalSpace.vendorId);
          setVendorProducts(filteredProducts);
        } catch (error) {
          console.error('Failed to fetch related data:', error);
        }
      };
      fetchRelatedData();
    }
  }, [rentalSpace]);

  useEffect(() => {
    if (rentalSpace) {
      // Connect to WebSocket server
      const socketConnection = io(SOCKET_BASE_URL, {
        transports: ['websocket', 'polling'],
      });

      socketConnection.on('connect', () => {
        console.log('RentalDetailPage: Connected to WebSocket server');
        setLiveUpdates(prev => [...prev, '🔗 রিয়েল-টাইম আপডেট সংযোগ স্থাপিত']);
      });

      socketConnection.on('disconnect', () => {
        console.log('RentalDetailPage: Disconnected from WebSocket server');
        setLiveUpdates(prev => [...prev, '🔌 সংযোগ বিচ্ছিন্ন']);
      });

      // Listen for rental space updates
      socketConnection.on('rental-space-updated', (updatedSpace: any) => {
        if (updatedSpace.id === rentalSpace.id) {
          console.log('RentalDetailPage: Rental space updated:', updatedSpace);
          setCurrentRentalSpace(updatedSpace);

          // Add to live updates
          const updateMessage = `🔄 রেন্টাল স্পেস আপডেট হয়েছে: ${updatedSpace.location}`;
          setLiveUpdates(prev => [updateMessage, ...prev.slice(0, 4)]); // Keep last 5 updates

          toast.success('রেন্টাল স্পেস আপডেট হয়েছে!');
        }
      });

      // Listen for rental space availability changes
      socketConnection.on('rental-space-availability-changed', (updatedSpace: any) => {
        if (updatedSpace.id === rentalSpace.id) {
          console.log('RentalDetailPage: Availability changed:', updatedSpace);
          setCurrentRentalSpace(updatedSpace);

          const availabilityMessage = updatedSpace.availability
            ? '✅ রেন্টাল স্পেস এখন উপলব্ধ'
            : '❌ রেন্টাল স্পেস বুক হয়েছে';
          setLiveUpdates(prev => [availabilityMessage, ...prev.slice(0, 4)]);

          toast.info(availabilityMessage);
        }
      });

      // Listen for plant status updates
      socketConnection.on('plant-status-updated', (updateData: any) => {
        if (updateData.rentalSpaceId === rentalSpace.id) {
          console.log('RentalDetailPage: Plant status updated:', updateData);

          const statusMessage = `🌱 গাছের অবস্থা আপডেট: ${updateData.status}`;
          setLiveUpdates(prev => [statusMessage, ...prev.slice(0, 4)]);

          toast.info('গাছের অবস্থা আপডেট হয়েছে');
        }
      });

      // Listen for watering updates
      socketConnection.on('watering-completed', (updateData: any) => {
        if (updateData.rentalSpaceId === rentalSpace.id) {
          console.log('RentalDetailPage: Watering completed:', updateData);

          const waterMessage = `💧 পানি দেওয়া হয়েছে - ${new Date().toLocaleTimeString('bn-BD')}`;
          setLiveUpdates(prev => [waterMessage, ...prev.slice(0, 4)]);

          toast.info('পানি দেওয়া সম্পন্ন!');
        }
      });

      // Listen for vendor messages/updates
      socketConnection.on('vendor-update', (updateData: any) => {
        if (updateData.rentalSpaceId === rentalSpace.id) {
          console.log('RentalDetailPage: Vendor update:', updateData);

          const vendorMessage = `👨‍🌾 ভেন্ডর আপডেট: ${updateData.message}`;
          setLiveUpdates(prev => [vendorMessage, ...prev.slice(0, 4)]);

          toast.info(updateData.message);
        }
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [rentalSpace]);

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

          // Redirect to checkout page with order ID
          router.push(`/payment/checkout/${orderId}`);
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

  const handleToggleAvailability = async () => {
    try {
      setUpdatingStatus(true);
      const spaceId = currentRentalSpace?.id || rentalSpace.id;
      await api.toggleRentalSpaceAvailability(spaceId.toString());
      const newAvailability = !(currentRentalSpace?.availability ?? rentalSpace.availability);
      setCurrentRentalSpace(prev => prev ? {...prev, availability: newAvailability} : null);
      toast.success(`স্পেস ${newAvailability ? 'উপলব্ধ' : 'অনুপলব্ধ'} করা হয়েছে!`);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast.error('স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePlantStatus = async (statusType: string) => {
    try {
      setUpdatingStatus(true);
      const spaceId = currentRentalSpace?.id || rentalSpace.id;
      let updateData: any = { rentalSpaceId: spaceId };

      switch (statusType) {
        case 'watered':
          updateData.lastWatered = new Date().toISOString();
          break;
        case 'healthy':
          updateData.plantStatus = { health: 'Healthy', age: 'Growing', growth: 'Good' };
          break;
        case 'maintenance':
          updateData.plantStatus = { health: 'Under Maintenance', age: 'N/A', growth: 'N/A' };
          break;
        default:
          break;
      }

      await api.updatePlantStatus(updateData);
      toast.success('গাছের অবস্থা আপডেট হয়েছে!');
      // Refresh the rental space data
      if (rentalSpace) {
        const updatedSpace = await api.getRentalSpace(rentalSpace.id.toString());
        setCurrentRentalSpace(updatedSpace);
      }
    } catch (error) {
      console.error('Failed to update plant status:', error);
      toast.error('গাছের অবস্থা আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setUpdatingStatus(false);
    }
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
                    src={resolveAssetUrl(rentalSpace.image)}
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
              <h1 className="text-3xl font-bold text-[#39FF14] mb-4">{currentRentalSpace?.location || rentalSpace.location}</h1>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#39FF14]">৳ {currentRentalSpace?.price || rentalSpace.price}</span>
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
                    মোট মূল্য: <span className="text-[#39FF14] font-semibold">৳ {(currentRentalSpace?.price || rentalSpace.price) * quantity}</span>
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
                  <p><strong className="text-gray-300">অবস্থান:</strong> {rentalSpace.location}</p>
                  <p><strong className="text-gray-300">আকার:</strong> {rentalSpace.size}</p>
                  <p><strong className="text-gray-300">দাম:</strong> ৳{rentalSpace.price} প্রতি মাস</p>
                  <p><strong className="text-gray-300">উপলব্ধতা:</strong> {rentalSpace.availability ? 'হ্যাঁ' : 'না'}</p>
                </div>

                {/* Vendor Information */}
                {vendorInfo && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">🏢 ভেন্ডর তথ্য</h4>
                    <div className="space-y-1">
                      <Link
                        href={`/users/${rentalSpace.vendorId}`}
                        className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                      >
                        {vendorInfo.farmName} 👤
                      </Link>
                      <p className="text-xs text-gray-400">ভেন্ডর আইডি: #{rentalSpace.vendorId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-Time Plant Tracking Dashboard */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  🌱 রিয়েল-টাইম গাছ ট্র্যাকিং
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </h3>

                {/* Plant Health Overview */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">
                        {(currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health === 'Healthy' ? '🟢' :
                         (currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health === 'Good' ? '🟡' :
                         (currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health === 'Poor' ? '🔴' : '⚪'}
                      </div>
                      <div className="text-xs text-gray-400">স্বাস্থ্য</div>
                      <div className={`text-sm font-medium ${
                        (currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health === 'Healthy' ? 'text-green-400' :
                        (currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health === 'Good' ? 'text-yellow-400' :
                        (currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health === 'Poor' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {(currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.health || 'অজানা'}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl mb-1">🌿</div>
                      <div className="text-xs text-gray-400">বয়স</div>
                      <div className="text-sm font-medium text-blue-400">
                        {(currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.age || 'অজানা'}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl mb-1">📈</div>
                      <div className="text-xs text-gray-400">বৃদ্ধি</div>
                      <div className="text-sm font-medium text-purple-400">
                        {(currentRentalSpace?.plantStatus || rentalSpace.plantStatus)?.growth || 'অজানা'}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl mb-1">💧</div>
                      <div className="text-xs text-gray-400">শেষ পানি</div>
                      <div className="text-sm font-medium text-cyan-400">
                        {(currentRentalSpace?.lastWatered || rentalSpace.lastWatered) ?
                          new Date(currentRentalSpace?.lastWatered || rentalSpace.lastWatered).toLocaleDateString('bn-BD') :
                          'অজানা'}
                      </div>
                    </div>
                  </div>

                  {/* Watering Schedule */}
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">পানি দেওয়ার সময়সূচি</h4>
                    <div className="grid grid-cols-7 gap-1">
                      {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'].map((day, index) => (
                        <div key={day} className="text-center">
                          <div className={`text-xs py-1 px-2 rounded ${
                            index % 2 === 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {day}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">প্রতি ২-৩ দিনে পানি দেওয়া হয়</p>
                  </div>
                </div>

                {/* Plant Care Instructions */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">গাছের যত্ন নির্দেশনা</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-[#39FF14] mb-2">💧 পানি দেওয়া</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• মাটি শুকিয়ে গেলে পানি দিন</li>
                        <li>• অতিরিক্ত পানি এড়িয়ে চলুন</li>
                        <li>• সকাল বা সন্ধ্যায় পানি দিন</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-[#39FF14] mb-2">☀️ আলো এবং তাপমাত্রা</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• দৈনিক ৬-৮ ঘণ্টা সূর্যালোক</li>
                        <li>• তাপমাত্রা: ২০-৩০°C</li>
                        <li>• সরাসরি রোদ এড়িয়ে চলুন</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Plant Growth Photos */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">গাছের বৃদ্ধি ফটো</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="aspect-square bg-gradient-to-br from-green-900 to-green-700 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-green-800 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-green-700 to-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🌳</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">ভেন্ডর নিয়মিত ফটো আপডেট করে</p>
                </div>
              </div>

              {/* Book Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleBookRental}
                  disabled={!(currentRentalSpace?.availability ?? rentalSpace.availability)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black text-lg font-semibold rounded-xl hover:from-[#28CC0C] hover:to-[#39FF14] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  {(currentRentalSpace?.availability ?? rentalSpace.availability)
                    ? `বুক করুন (${quantity} মাস) - ৳ ${(currentRentalSpace?.price || rentalSpace.price) * quantity}`
                    : 'উপলব্ধ নয়'
                  }
                </button>
              </div>

              {/* Status Update Section (For Vendors/Admins only) */}
              {isAuthenticated && user && (user.role === 'Vendor' || user.role === 'Admin') && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">⚙️ স্ট্যাটাস আপডেট</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleToggleAvailability}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                    >
                      {updatingStatus ? '...' : '🔄 উপলব্ধতা পরিবর্তন'}
                    </button>
                    <button
                      onClick={() => handleUpdatePlantStatus('healthy')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                    >
                      {updatingStatus ? '...' : '🌱 গাছের অবস্থা আপডেট'}
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">📝 দ্রুত আপডেট:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                        ✅ সক্রিয় করুন
                      </button>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                        🔧 রক্ষণাবেক্ষণ
                      </button>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                        💧 পানি দেওয়া হয়েছে
                      </button>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                        📊 রিপোর্ট আপডেট
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

        {/* Live Updates Section */}
        <div className="mt-12 bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-[#39FF14]">রিয়েল-টাইম আপডেট</h3>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              লাইভ
            </span>
          </div>

          {liveUpdates.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {liveUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="text-sm mt-0.5">🔔</div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">{update}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date().toLocaleTimeString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📡</div>
              <p className="text-gray-400 text-sm">রিয়েল-টাইম আপডেটের জন্য অপেক্ষা করুন...</p>
              <p className="text-gray-500 text-xs mt-1">ভেন্ডর কোনো আপডেট করলে এখানে দেখাবে</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">ℹ️</span>
              <span className="text-blue-300 text-sm font-medium">কী ধরনের আপডেট দেখবেন:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-200">
              <div>• রেন্টাল স্পেস তথ্য পরিবর্তন</div>
              <div>• উপলব্ধতা স্ট্যাটাস আপডেট</div>
              <div>• গাছের অবস্থা পরিবর্তন</div>
              <div>• পানি দেওয়ার তথ্য</div>
              <div>• ভেন্ডরের বার্তা এবং নোটিফিকেশন</div>
            </div>
          </div>
        </div>

        {/* Other Rentals from Same Vendor */}
        {otherRentals.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#39FF14] mb-8">এই ভেন্ডরের অন্যান্য রেন্টাল স্পেস</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherRentals.map((space) => (
                <Link key={space.id} href={`/rentals/${space.id}`}>
                  <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 cursor-pointer">
                    <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
                      {space.image ? (
                        <img
                          src={resolveAssetUrl(space.image)}
                          alt={space.location}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">🌱</span>
                          <span className="text-gray-400 font-medium">ছবি নেই</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#39FF14]/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#39FF14]">
                        {space.size}
                      </div>
                      <div className={`absolute top-3 right-3 text-black px-2 py-1 rounded-full text-xs font-medium ${
                        space.availability ? 'bg-[#39FF14]' : 'bg-gray-400'
                      }`}>
                        {space.availability ? '✅ উপলব্ধ' : '❌ বুক করা হয়েছে'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-[#39FF14] mb-2">{space.location}</h3>
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-[#39FF14]">
                          ৳ {space.price}
                        </div>
                        <span className="text-sm text-gray-400">প্রতি মাস</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products from Same Vendor */}
        {vendorProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#39FF14] mb-8">এই ভেন্ডরের পণ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendorProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 cursor-pointer">
                    <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="fallback flex flex-col items-center gap-2" style={{ display: product.image ? 'none' : 'flex' }}>
                        <span className="text-4xl">🥕</span>
                        <span className="text-gray-400 font-medium">ছবি নেই</span>
                      </div>
                      <div className="absolute top-3 left-3 bg-[#39FF14]/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#39FF14]">
                        {product.category || 'পণ্য'}
                      </div>
                      <div className="absolute top-3 right-3 bg-[#39FF14] text-black px-2 py-1 rounded-full text-xs font-medium">
                        {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' : '⏳ অপেক্ষমান'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-[#39FF14] mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description || 'কোনো বিবরণ নেই'}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-[#39FF14]">
                          ৳ {product.price}
                        </div>
                        <span className="text-sm text-gray-400">প্রতি {product.unit || 'ইউনিট'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
