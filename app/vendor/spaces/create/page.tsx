'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Ruler, DollarSign, FileText, CheckSquare, ImageIcon } from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function CreateRentalSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    size: '',
    price: '',
    description: '',
    status: 'Available',
    image: null as File | null,
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('স্পেস তৈরি হচ্ছে...');
    try {
      setLoading(true);

      const data =       await api.createRentalSpace({
        name: formData.location,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        size: formData.size,
        image: formData.image || undefined,
      });

      if (!data.success) {
        throw new Error(data.message || 'স্পেস তৈরি করা যাচ্ছে না');
      }

      toast.dismiss(loadingToast);
      toast.success('রেন্টাল স্পেস সফলভাবে তৈরি করা হয়েছে!');
      router.push('/vendor/spaces');
    } catch (error: any) {
      console.error('Failed to create rental space:', error);
      toast.error(error?.message || 'Failed to create rental space. Please try again.');
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">নতুন রেন্টাল স্পেস যোগ করুন</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            লোকেশন
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="উদাহরণ: মিরপুর, ঢাকা"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              আকার (বর্গমিটার)
            </label>
            <input
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="উদাহরণ: 50"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              মাসের ভাড়া (৳)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="উদাহরণ: 5000"
              required
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            বর্ণনা
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
            rows={4}
            placeholder="স্পেস সম্পর্কে বিস্তারিত লিখুন..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            ছবি
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <p className="text-sm text-gray-500 mt-1">ছবি আপলোড করুন (ঐচ্ছিক, সর্বোচ্চ 5MB)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            সুবিধাসমূহ
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="নতুন সুবিধা যোগ করুন"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              যোগ করুন
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span key={amenity} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                {amenity}
                <button type="button" onClick={() => removeAmenity(amenity)} className="text-green-900 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
        >
          {loading ? 'সেভ হচ্ছে...' : 'রেন্টাল স্পেস তৈরি করুন'}
        </button>
      </form>
    </div>
  );
}
