'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface RentalSpace {
  id: string;
  name: string;
  rentedBy?: string;
  plantStatus?: string;
  lastWatered?: string;
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

  useEffect(() => {
    fetchRentedSpaces();
  }, []);

  const fetchRentedSpaces = async () => {
    try {
      const data = await api.getVendorRentalSpaces();
      // Filter only rented spaces (not available)
      setSpaces(data.filter(space => !space.available));
    } catch (err) {
      console.error('Failed to fetch rented spaces:', err);
      // Set mock data for demo
      setSpaces([
        {
          id: '1',
          name: 'Plot A1',
          rentedBy: 'John Doe',
          plantStatus: 'Growing',
          lastWatered: '2024-01-15',
        },
        {
          id: '3',
          name: 'Plot C3',
          rentedBy: 'Jane Smith',
          plantStatus: 'Seeding',
          lastWatered: '2024-01-10',
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

      // Reset form
      setUpdateData({
        plantStatus: '',
        lastWatered: '',
        note: '',
        photo: null,
      });
      setSelectedSpace('');
      // Refresh spaces
      fetchRentedSpaces();
      alert('Plant status updated successfully!');
    } catch (err) {
      console.error('Failed to update plant status:', err);
      alert('Failed to update plant status. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUpdateData({ ...updateData, photo: e.target.files[0] });
    }
  };

  if (loading) {
    return <div className="p-8">Loading rented spaces...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Plant Tracking</h1>

      <div className="bg-gray-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Select a Rented Plot to Update</h2>
        <select
          value={selectedSpace}
          onChange={(e) => setSelectedSpace(e.target.value)}
          className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded mb-4"
        >
          <option value="">Choose a plot...</option>
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.location} ({space.size})
            </option>
          ))}
        </select>

        {selectedSpace && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Plant Status</label>
              <select
                value={updateData.plantStatus}
                onChange={(e) => setUpdateData({ ...updateData, plantStatus: e.target.value })}
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
                required
              >
                <option value="">Select status...</option>
                <option value="Seeding">Seeding</option>
                <option value="Sprouting">Sprouting</option>
                <option value="Growing">Growing</option>
                <option value="Flowering">Flowering</option>
                <option value="ReadyToHarvest">Ready to Harvest</option>
                <option value="Harvested">Harvested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Last Watered Date</label>
              <input
                type="date"
                value={updateData.lastWatered}
                onChange={(e) => setUpdateData({ ...updateData, lastWatered: e.target.value })}
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Quick Photo</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
              />
              <p className="text-sm text-gray-300 mt-1">Upload a photo of the current plant status</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Notes for Customer</label>
              <textarea
                value={updateData.note}
                onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
                rows={3}
                placeholder="Any special tips or updates for the customer..."
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-green-400 text-white rounded hover:bg-green-500"
            >
              Update Plant Status
            </button>
          </form>
        )}
      </div>

      <div className="bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Current Plant Status Overview</h2>
        <div className="space-y-4">
          {spaces.map((space) => (
            <div key={space.id} className="flex justify-between items-center p-4 border border-gray-600 bg-gray-800 rounded">
              <div>
                <h3 className="font-medium text-white">{space.location}</h3>
                <p className="text-sm text-gray-300">Rented by: {space.rentedBy}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{space.plantStatus}</p>
                <p className="text-sm text-gray-300">
                  Last watered: {space.lastWatered ? (() => {
                    try {
                      const date = new Date(space.lastWatered);
                      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                    } catch (error) {
                      return 'Invalid Date';
                    }
                  })() : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}