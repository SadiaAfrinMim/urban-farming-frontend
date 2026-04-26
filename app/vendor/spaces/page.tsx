'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';

interface RentalSpace {
  id: string;
  location: string;
  size: number;
  price: number;
  status: string;
  amenities: string[];
  description: string;
}

export default function VendorSpacesPage() {
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      // Token is sent via cookies automatically
      const res = await axios.get('http://localhost:5000/api/v1/rental', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpaces(res.data.data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই স্পেসটি ডিলিট করতে চান?')) return;
    
    try {
      // Token is sent via cookies automatically
      await axios.delete(`http://localhost:5000/api/v1/rental/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSpaces();
    } catch (error) {
      console.error('Error deleting space:', error);
    }
  };

  if (loading) return <div className="p-6 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">রেন্টাল স্পেস ম্যানেজমেন্ট</h1>
        <Link
          href="/vendor/spaces/create"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          নতুন স্পেস যোগ করুন
        </Link>
      </div>

      {spaces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">কোনো রেন্টাল স্পেস নেই</h3>
          <p className="text-gray-500 mb-6">আপনার ফার্মের জায়গা ভাড়া দেওয়ার জন্য নতুন স্পেস যোগ করুন</p>
          <Link
            href="/vendor/spaces/create"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            প্রথম স্পেস তৈরি করুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{space.location}</h3>
                  <p className="text-gray-500 text-sm">{space.size} বর্গমিটার</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  space.status === 'Available' ? 'bg-green-100 text-green-700' : 
                  space.status === 'Rented' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {space.status}
                </span>
              </div>
              
              {space.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{space.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {space.amenities?.map((amenity, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {amenity}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">৳ {space.price}/মাস</span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(space.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
