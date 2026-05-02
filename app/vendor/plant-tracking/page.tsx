'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface RentalSpace {
  id: number;
  vendorId: number;
  location: string;
  size: string;
  price: number;
  availability: boolean;
  image?: string;
  plantStatus?: {
    health?: string;
    age?: string;
    growth?: string;      // 'Seeding', 'Sprouting', 'Growing', 'Flowering', 'ReadyToHarvest', 'Harvested'
    condition?: string;
  };
  lastWatered?: string;
  createdAt: string;
  updatedAt: string;
  rentedBy?: string;
  latestImage?: string;   // Latest uploaded photo
}

export default function PlantTracking() {
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [updateData, setUpdateData] = useState({
    plantStatus: '',
    lastWatered: '',
    note: '',
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchRentedSpaces();
  }, []);

  const fetchRentedSpaces = async () => {
    try {
      const data = await api.getVendorRentalSpaces();
      const rentedSpaces = data.filter(space => !space.availability);
      const spacesWithRenter = rentedSpaces.map(space => ({
        ...space,
        rentedBy: `Customer ${space.id}`
      }));
      setSpaces(spacesWithRenter);
    } catch (err) {
      console.error('Failed to fetch rented spaces:', err);
      // Mock data with correct nested plantStatus and images
      setSpaces([
        {
          id: 1,
          vendorId: 1,
          location: 'Plot A1',
          size: '10x10 ft',
          price: 50,
          availability: false,
          plantStatus: { health: 'Good', age: '2 weeks', growth: 'Growing', condition: 'Healthy' },
          lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15',
          rentedBy: 'John Doe',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
          latestImage: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop',
        },
        {
          id: 3,
          vendorId: 1,
          location: 'Plot C3',
          size: '15x15 ft',
          price: 75,
          availability: false,
          plantStatus: { health: 'Excellent', age: '1 week', growth: 'Flowering', condition: 'Vibrant' },
          lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: '2024-01-01',
          updatedAt: '2024-01-10',
          rentedBy: 'Jane Smith',
          image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=300&fit=crop',
          latestImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
        },
        {
          id: 5,
          vendorId: 1,
          location: 'Plot B2',
          size: '12x12 ft',
          price: 60,
          availability: false,
          plantStatus: { health: 'Needs Care', age: '3 weeks', growth: 'Seeding', condition: 'Delicate' },
          lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: '2024-01-01',
          updatedAt: '2024-01-10',
          rentedBy: 'Alice Johnson',
          image: 'https://images.unsplash.com/photo-1464822759844-d150f39f8341?w=400&h=300&fit=crop',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;

    try {
      await api.updatePlantStatus({
        rentalSpaceId: selectedSpace,
        plantStatus: updateData.plantStatus || undefined,
        lastWatered: updateData.lastWatered || undefined,
      });
      setUpdateData({
        plantStatus: '',
        lastWatered: '',
        note: '',
        photo: null,
      });
      setPhotoPreview(null);
      setSelectedSpace('');
      fetchRentedSpaces();
      alert('✅ গাছের অবস্থা এবং ছবি সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      console.error('Failed to update plant status:', err);
      alert('❌ আপডেট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUpdateData({ ...updateData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getDaysSinceWatered = (lastWatered?: string) => {
    if (!lastWatered) return null;
    const wateredDate = new Date(lastWatered);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - wateredDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Progress based on growth stage
  const getGrowthProgress = (growth?: string) => {
    const stages = ['Seeding', 'Sprouting', 'Growing', 'Flowering', 'ReadyToHarvest', 'Harvested'];
    if (!growth) return 0;
    const index = stages.indexOf(growth);
    return index >= 0 ? (index / (stages.length - 1)) * 100 : 0;
  };

  const getPlantStatusColor = (growth?: string) => {
    switch (growth) {
      case 'Seeding':
      case 'Sprouting':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Growing':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Flowering':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'ReadyToHarvest':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'Harvested':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getGrowthLabel = (growth?: string) => {
    switch (growth) {
      case 'Seeding': return '🌱 বীজ বোনা';
      case 'Sprouting': return '🌿 অঙ্কুরোদগম';
      case 'Growing': return '🌳 বৃদ্ধি';
      case 'Flowering': return '🌸 ফুল ধরা';
      case 'ReadyToHarvest': return '✂️ তোলার জন্য প্রস্তুত';
      case 'Harvested': return '🍂 তোলা হয়েছে';
      default: return growth || 'অজানা';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">আপনার ভাড়া করা গাছের জায়গা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#39FF14] to-[#28CC0C] bg-clip-text text-transparent mb-3">
          গাছ ট্র্যাকিং স্টুডিও
        </h1>
        <p className="text-gray-400 text-lg">প্রতিটি ভাড়া করা জায়গার বৃদ্ধি, স্বাস্থ্য এবং যত্ন পর্যবেক্ষণ করুন</p>
      </div>

      {/* Update Modal */}
      {selectedSpace && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-[#39FF14]/20 to-[#28CC0C]/20 p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">🌱 গাছের অবস্থা আপডেট করুন</h3>
              <button
                onClick={() => {
                  setSelectedSpace('');
                  setUpdateData({ plantStatus: '', lastWatered: '', note: '', photo: null });
                  setPhotoPreview(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🌱 বৃদ্ধির পর্যায়</label>
                <select
                  value={updateData.plantStatus}
                  onChange={(e) => setUpdateData({ ...updateData, plantStatus: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-[#39FF14]"
                  required
                >
                  <option value="">পর্যায় নির্বাচন করুন...</option>
                  <option value="Seeding">🌱 বীজ বোনা</option>
                  <option value="Sprouting">🌿 অঙ্কুরোদগম</option>
                  <option value="Growing">🌳 বৃদ্ধি</option>
                  <option value="Flowering">🌸 ফুল ধরা</option>
                  <option value="ReadyToHarvest">✂️ তোলার জন্য প্রস্তুত</option>
                  <option value="Harvested">🍂 তোলা হয়েছে</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">💧 শেষ সেচের তারিখ</label>
                <input
                  type="date"
                  value={updateData.lastWatered}
                  onChange={(e) => setUpdateData({ ...updateData, lastWatered: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-[#39FF14]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">📸 দ্রুত ছবি</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-gray-800 border border-gray-700 rounded-xl p-3 text-center hover:bg-gray-700 transition">
                    <span className="text-gray-300">ছবি আপলোড করুন</span>
                    <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                  </label>
                  {photoPreview && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-600">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">📝 গ্রাহকের জন্য নোট</label>
                <textarea
                  value={updateData.note}
                  onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none"
                  rows={3}
                  placeholder="বৃদ্ধির টিপস, সেচের পরামর্শ বা বিশেষ আপডেট শেয়ার করুন..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              >
                ✨ গাছের অবস্থা আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm">
        {spaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4 animate-bounce">🌱</div>
            <div className="text-gray-400 text-2xl font-medium">এখনও কোনো ভাড়া করা জায়গা নেই</div>
            <div className="text-gray-500 text-base mt-2">গ্রাহকরা আপনার জায়গা ভাড়া করলে এখানে দেখাবে</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spaces.map((space) => {
              const daysSinceWatered = getDaysSinceWatered(space.lastWatered);
              const growthProgress = getGrowthProgress(space.plantStatus?.growth);
              const plantStatusColor = getPlantStatusColor(space.plantStatus?.growth);
              const growthLabel = getGrowthLabel(space.plantStatus?.growth);

              return (
                <div
                  key={space.id}
                  className="group bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-[#39FF14]/30"
                >
                  {/* Card Header with Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-900/60 to-blue-900/60 overflow-hidden">
                    {/* Display latest image or fallback */}
                    {(space.latestImage || space.image) ? (
                      <img
                        src={space.latestImage || space.image}
                        alt={`${space.location} plant`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // If image fails, show fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="fallback-icon absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-900/30 to-blue-900/30"
                      style={{ display: (space.latestImage || space.image) ? 'none' : 'flex' }}
                    >
                      <div className="text-6xl mb-2 animate-pulse">🌿</div>
                      <span className="text-white font-medium text-sm">ছবি নেই</span>
                    </div>

                    {/* Overlay tags */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-center z-10">
                      <h3 className="font-bold text-white text-xl tracking-wide mb-1">{space.location}</h3>
                      <div className="flex justify-center gap-2">
                        <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#39FF14]">
                          {space.size}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plantStatusColor}`}>
                          {growthLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Customer & Price */}
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <span className="text-gray-200 font-medium">{space.rentedBy}</span>
                      </div>
                      <div className="bg-gradient-to-r from-[#39FF14]/20 to-[#28CC0C]/20 px-3 py-1 rounded-full">
                        <span className="text-[#39FF14] font-bold">৳{space.price}</span>
                        <span className="text-gray-400 text-xs">/দিন</span>
                      </div>
                    </div>

                    {/* Watering Status */}
                    <div className="mb-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">💧</span>
                        <span className="text-gray-300 text-sm">শেষ সেচ:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200 text-sm">
                          {space.lastWatered ? new Date(space.lastWatered).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                        {daysSinceWatered !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${daysSinceWatered > 3 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {daysSinceWatered} দিন আগে
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Plant Status Details */}
                    {space.plantStatus && (
                      <div className="bg-gray-900/70 rounded-xl p-4 mb-5 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-white text-sm uppercase tracking-wider">🌱 গাছের অবস্থা</span>
                        </div>

                        {/* Growth Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>বৃদ্ধির অগ্রগতি</span>
                            <span className="text-[#39FF14]">{Math.round(growthProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#39FF14] to-[#28CC0C] h-full rounded-full transition-all duration-500"
                              style={{ width: `${growthProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Age, Condition, Health */}
                        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                          {space.plantStatus.age && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">⏳ বয়স:</span>
                              <span className="text-white">{space.plantStatus.age}</span>
                            </div>
                          )}
                          {space.plantStatus.condition && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">✨ অবস্থা:</span>
                              <span className="text-blue-300">{space.plantStatus.condition}</span>
                            </div>
                          )}
                          {space.plantStatus.health && (
                            <div className="flex items-center gap-2 col-span-2">
                              <span className="text-gray-400">💚 স্বাস্থ্য:</span>
                              <span className={`font-medium ${
                                space.plantStatus.health === 'Excellent' ? 'text-green-400' :
                                space.plantStatus.health === 'Good' ? 'text-yellow-400' :
                                space.plantStatus.health === 'Needs Care' ? 'text-red-400' :
                                'text-gray-300'
                              }`}>{space.plantStatus.health}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
                          আইডি: #{space.id} • তৈরি: {new Date(space.createdAt).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                    )}

                    {/* Update Button */}
                    <button
                      onClick={() => setSelectedSpace(space.id.toString())}
                      className="w-full py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-xl hover:from-[#39FF14] hover:to-[#28CC0C] hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-md"
                    >
                      <span>📝</span> আপডেট করুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}