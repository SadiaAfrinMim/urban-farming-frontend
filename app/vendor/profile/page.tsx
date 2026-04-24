'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../lib/api';

interface VendorProfile {
  id: string;
  farmName: string;
  farmLocation: string;
  certificationStatus: 'Pending' | 'Approved' | 'Rejected';
  certifications: string[];
  profilePhoto?: string;
}

export default function VendorProfile() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    farmName: '',
    farmLocation: '',
    certifications: [] as File[],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getVendorProfile();
      setProfile(data);
      setFormData({
        farmName: data.farmName,
        farmLocation: data.farmLocation,
        certifications: [],
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Set mock data for demo
      setProfile({
        id: '1',
        farmName: 'Green Valley Farm',
        farmLocation: 'Dhaka, Bangladesh',
        certificationStatus: 'Approved',
        certifications: ['cert1.pdf', 'cert2.jpg'],
      });
      setFormData({
        farmName: 'Green Valley Farm',
        farmLocation: 'Dhaka, Bangladesh',
        certifications: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateVendorProfile({
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        certifications: formData.certifications,
      });
      setEditing(false);
      // Refresh profile data
      fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, certifications: Array.from(e.target.files) });
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Farm Profile & Certification</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Farm Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Farm Name</label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Farm Location</label>
              <input
                type="text"
                value={formData.farmLocation}
                onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-medium">Farm Name:</span> {profile?.farmName}
            </div>
            <div>
              <span className="font-medium">Location:</span> {profile?.farmLocation}
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <StatusBadge status={profile?.certificationStatus || 'Pending'} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Certification Documents</h2>

        <div className="mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-500 mt-2">Upload PDF or image files (max 5MB each)</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Uploaded Documents:</h3>
          {profile?.certifications.map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{cert}</span>
              <button className="text-red-600 hover:text-red-800">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}