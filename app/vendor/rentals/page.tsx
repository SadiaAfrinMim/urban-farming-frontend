'use client';

import { useEffect, useState } from 'react';
import { MultiStepForm } from '../../components/MultiStepForm';
import api from '../../lib/api';

interface RentalSpace {
  id: string;
  name: string;
  location: string;
  size: string;
  price: number;
  available: boolean;
  rentedBy?: string;
  rentalStart?: string;
  rentalEnd?: string;
}

export default function RentalSpaceManagement() {
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const data = await api.getVendorRentalSpaces();
      setSpaces(data);
    } catch (err) {
      console.error('Failed to fetch rental spaces:', err);
      // Set mock data for demo
      setSpaces([
        {
          id: '1',
          name: 'Plot A1',
          location: 'North Field',
          size: '100 sq ft',
          price: 50,
          available: false,
          rentedBy: 'John Doe',
          rentalStart: '2024-01-01',
          rentalEnd: '2024-12-31',
        },
        {
          id: '2',
          name: 'Plot B2',
          location: 'South Field',
          size: '150 sq ft',
          price: 75,
          available: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async (data: any) => {
    try {
      await api.createRentalSpace({
        name: data.name,
        description: data.description,
        price: data.price,
        location: data.location,
        size: data.size,
      });
      setShowAddForm(false);
      // Refresh spaces list
      fetchSpaces();
    } catch (err) {
      console.error('Failed to create rental space:', err);
      alert('Failed to create rental space. Please try again.');
    }
  };

  if (loading) {
    return <div className="p-8">Loading rental spaces...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rental Space Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Plot'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Rental Plot</h2>
          <MultiStepForm onSubmit={handleAddSpace} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <div key={space.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{space.name}</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Location:</span> {space.location}</p>
              <p><span className="font-medium">Size:</span> {space.size}</p>
              <p><span className="font-medium">Price:</span> ${space.price}/month</p>
              <p>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  space.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {space.available ? 'Available' : 'Occupied'}
                </span>
              </p>
              {!space.available && (
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="font-medium text-blue-800">Current Tenant:</p>
                  <p>{space.rentedBy}</p>
                  <p className="text-xs text-blue-600">
                    {space.rentalStart} to {space.rentalEnd}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
                Edit
              </button>
              <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}