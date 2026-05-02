'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, Alert, LoadingSpinner, StatusBadge } from '../../components/ui';
import api, { SOCKET_BASE_URL } from '../../lib/api';
import toast from 'react-hot-toast';
import { useUpdateRentalSpace, useDeleteRentalSpace } from '../../hooks/useApi';
import Image from 'next/image';
import { io } from 'socket.io-client';

interface RentalSpace {
  id: string;
  location: string;
  size: string;
  price: number;
  availability: boolean;
  image?: string;
  plantStatus?: string;
  lastWatered?: string;
}

// Vendor Update Modal Component
function VendorUpdateModal({ space, isOpen, onClose }: {
  space: RentalSpace | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateType, setUpdateType] = useState<'status' | 'maintenance' | 'watering' | 'custom'>('status');

  if (!isOpen || !space) return null;

  const updateTypeOptions = [
    { value: 'status', label: '📊 স্ট্যাটাস আপডেট', description: 'রেন্টাল স্পেসের সাধারণ স্ট্যাটাস আপডেট' },
    { value: 'maintenance', label: '🔧 মেইনটেনেন্স', description: 'মেরামত বা রক্ষণাবেক্ষণের তথ্য' },
    { value: 'watering', label: '💧 পানি দেওয়া', description: 'গাছ পানি দেওয়ার তথ্য' },
    { value: 'custom', label: '💬 কাস্টম মেসেজ', description: 'অন্য কোনো গুরুত্বপূর্ণ তথ্য' }
  ];

  const getUpdateMessage = (type: string) => {
    switch (type) {
      case 'status':
        return `${space.location} রেন্টাল স্পেসের স্ট্যাটাস আপডেট হয়েছে।`;
      case 'maintenance':
        return `${space.location}-এ মেইনটেনেন্স কাজ চলছে।`;
      case 'watering':
        return `${space.location}-এর গাছগুলোকে পানি দেওয়া হয়েছে।`;
      default:
        return '';
    }
  };

  const handleSendUpdate = async () => {
    if (!updateMessage.trim()) {
      toast.error('আপডেট মেসেজ লিখুন');
      return;
    }

    try {
      // Here we would send the update to customers via API
      // For now, we'll just emit a socket event (only in development)
      if (process.env.NODE_ENV === 'development') {
        const socket = io(SOCKET_BASE_URL);
        socket.emit('vendor-update', {
          rentalSpaceId: space.id,
          message: updateMessage,
          type: updateType,
          timestamp: new Date().toISOString()
        });
      }

      toast.success('আপডেট কাস্টমারদের কাছে পাঠানো হয়েছে!');
      setUpdateMessage('');
      setUpdateType('status');
      onClose();
    } catch (error) {
      console.error('Failed to send update:', error);
      toast.error('আপডেট পাঠাতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">ট্র্যাকিং আপডেট পাঠান</h2>
              <p className="text-green-800">{space.location}</p>
            </div>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-800 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Update Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              আপডেটের ধরন নির্বাচন করুন
            </label>
            <div className="grid grid-cols-2 gap-3">
              {updateTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setUpdateType(option.value as any);
                    if (option.value !== 'custom') {
                      setUpdateMessage(getUpdateMessage(option.value));
                    }
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    updateType === option.value
                      ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs mt-1 opacity-75">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              আপডেট মেসেজ
            </label>
            <textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="কাস্টমারদের জন্য আপডেট মেসেজ লিখুন..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] text-white resize-none"
              rows={4}
            />
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-2">প্রিভিউ:</h4>
            <div className="text-sm text-gray-400 bg-gray-900 p-3 rounded-lg">
              {updateMessage || 'আপডেট মেসেজ এখানে দেখাবে...'}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              এই মেসেজ কাস্টমারদের রিয়েল-টাইমে দেখাবে
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            বাতিল
          </Button>
          <Button
            onClick={handleSendUpdate}
            className="bg-[#39FF14] hover:bg-[#28CC0C] text-black"
            disabled={!updateMessage.trim()}
          >
            📤 আপডেট পাঠান
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RentalSpaceManagement() {
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<RentalSpace | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [addFormData, setAddFormData] = useState({
    location: '',
    size: '',
    price: '',
  });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSpaceForUpdate, setSelectedSpaceForUpdate] = useState<RentalSpace | null>(null);

  const updateMutation = useUpdateRentalSpace();
  const deleteMutation = useDeleteRentalSpace();

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorRentalSpaces();
      setSpaces(data);
    } catch (err) {
      console.error('Failed to fetch rental spaces:', err);
      setError('Failed to load rental spaces. Please check your connection and try again.');
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async (data: any) => {
    try {
      console.log('Creating rental space with data:', data);
      console.log('Image file selected:', addImageFile);

      const formData = new FormData();

      // Add text fields
      formData.append('location', data.location);
      formData.append('size', data.size);
      formData.append('price', data.price.toString());

      // Add image if selected
      if (addImageFile) {
        console.log('Adding image to FormData:', addImageFile.name);
        formData.append('image', addImageFile);
      }

      // Log FormData contents for debugging
      console.log('Sending FormData with keys:', Array.from(formData.keys()));
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const result = await api.createRentalSpace(formData);
      console.log('Rental space created successfully:', result);

      setShowAddForm(false);
      setAddFormData({ location: '', size: '', price: '' });
      setAddImageFile(null);
      toast.success('Rental space added successfully!');
      fetchSpaces();
    } catch (err: any) {
      console.error('Failed to create rental space:', err);
      console.error('Error response:', err?.response);
      console.error('Error data:', err?.response?.data);
      toast.error(err?.response?.data?.message || 'Failed to create rental space. Please try again.');
    }
  };

  const handleEditSpace = (space: RentalSpace) => {
    setEditingSpace(space);
    setSelectedFile(null);
  };

  const handleUpdateSpace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSpace) return;

    const formData = new FormData();
    const formElements = e.currentTarget.elements as any;

    const updateData = {
      location: formElements.location.value,
      size: formElements.size.value,
      price: formElements.price.value,
    };

    // Add image if selected
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    // Add JSON data as 'data' field
    formData.append('data', JSON.stringify(updateData));

    // Log FormData contents for debugging
    console.log('Update FormData with keys:', Array.from(formData.keys()));
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      setUpdating(true);
      await updateMutation.mutateAsync({
        id: editingSpace.id,
        data: formData
      });

      toast.success('Rental space updated successfully!');
      setEditingSpace(null);
      setSelectedFile(null);
      fetchSpaces();
    } catch (err: any) {
      console.error('Failed to update rental space:', err);
      toast.error(err?.response?.data?.message || 'Failed to update rental space. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this rental space? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(spaceId);
      toast.success('Rental space deleted successfully!');
      fetchSpaces();
    } catch (err: any) {
      console.error('Failed to delete rental space:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete rental space. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const openUpdateModal = (space: RentalSpace) => {
    setSelectedSpaceForUpdate(space);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setSelectedSpaceForUpdate(null);
    setShowUpdateModal(false);
  };

  useEffect(() => {
    fetchSpaces();

    // WebSocket connection for real-time updates (only in development)
    if (process.env.NODE_ENV === 'development') {
      const socket = io(SOCKET_BASE_URL);

      socket.on('rental-space-created', (newSpace) => {
        setSpaces(prev => [...prev, newSpace]);
        toast.success('New rental space added');
      });

      socket.on('rental-space-updated', (updatedSpace) => {
        setSpaces(prev => prev.map(space => space.id === updatedSpace.id ? updatedSpace : space));
        toast.success('Rental space updated');
      });

      socket.on('rental-space-deleted', ({ id }) => {
        setSpaces(prev => prev.filter(space => space.id !== id));
        toast.success('Rental space deleted');
      });

      socket.on('rental-space-availability-changed', (updatedSpace) => {
        setSpaces(prev => prev.map(space => space.id === updatedSpace.id ? updatedSpace : space));
        toast.success('Availability changed');
      });

      socket.on('rental-space-booked', (bookedSpace) => {
        setSpaces(prev => prev.map(space => space.id === bookedSpace.id ? { ...bookedSpace, availability: false } : space));
        toast.success('Space booked');
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#39FF14]">Rental Space Management</h1>
          <p className="text-gray-400 mt-2">Manage your rental plots and track their status</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#39FF14] hover:bg-[#28CC0C] text-black px-6 py-2 rounded-lg"
          >
            {showAddForm ? 'Cancel' : '+ Add New Plot'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Add Form */}
      {showAddForm && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#39FF14]">Add New Rental Plot</h2>
            <Button
              onClick={() => setShowAddForm(false)}
              variant="outline"
              size="sm"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAddSpace(addFormData); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="add-location" className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <Input
                  id="add-location"
                  name="location"
                  value={addFormData.location}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  placeholder="e.g., North Field, Plot A1"
                />
              </div>

              <div>
                <label htmlFor="add-size" className="block text-sm font-medium text-gray-300 mb-2">
                  Size *
                </label>
                <Input
                  id="add-size"
                  name="size"
                  value={addFormData.size}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, size: e.target.value }))}
                  required
                  placeholder="e.g., 100 sq ft"
                />
              </div>

              <div>
                <label htmlFor="add-price" className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Month *
                </label>
                <Input
                  id="add-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={addFormData.price}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="add-image" className="block text-sm font-medium text-gray-300 mb-2">
                  Image (Optional)
                </label>
                <input
                  id="add-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-gray-800 text-white"
                />
                {addImageFile && (
                  <p className="text-sm text-gray-400 mt-1">Selected: {addImageFile.name}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-[#39FF14] hover:bg-[#28CC0C] text-black"
                disabled={updating}
              >
                {updating ? <LoadingSpinner size="sm" /> : 'Add Rental Space'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddFormData({ location: '', size: '', price: '' });
                  setAddImageFile(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Form */}
      {editingSpace && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#39FF14]">Edit Rental Space</h2>
            <Button
              onClick={() => setEditingSpace(null)}
              variant="outline"
              size="sm"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleUpdateSpace} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingSpace.location}
                  required
                  placeholder="e.g., North Field, Plot A1"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">
                  Size *
                </label>
                <Input
                  id="size"
                  name="size"
                  defaultValue={editingSpace.size}
                  required
                  placeholder="e.g., 100 sq ft"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Month *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingSpace.price}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="edit-image" className="block text-sm font-medium text-gray-300 mb-2">
                  Update Image (Optional)
                </label>
                <input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-gray-800 text-white"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-400 mt-1">Selected: {selectedFile.name}</p>
                )}
                {editingSpace?.image && !selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">Current image will be kept if no new image is selected</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updating}
                className="bg-[#39FF14] hover:bg-[#28CC0C] text-black"
              >
                {updating ? <LoadingSpinner /> : 'Update Space'}
              </Button>
              <Button
                type="button"
                onClick={() => setEditingSpace(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rental Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#39FF14] mb-2">No rental spaces yet</h3>
            <p className="text-gray-400 mb-4">Start by adding your first rental plot</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-[#39FF14] hover:bg-[#28CC0C] text-black">
              Add Your First Plot
            </Button>
          </div>
        ) : (
          spaces.map((space) => (
            <Card key={space.id} className="hover:shadow-lg transition-shadow">
              {space.image && (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <Image
                    src={space.image}
                    alt={space.location}
                    className="w-full h-full object-cover"
                    width={500}
                    height={300}
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#39FF14] mb-1">
                      {space.location}
                    </h3>
                    <p className="text-sm text-gray-400">{space.size}</p>
                  </div>
                  <StatusBadge status={space.availability ? 'active' : 'inactive'}>
                    {space.availability ? 'Available' : 'Occupied'}
                  </StatusBadge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-medium text-[#39FF14]">${space.price}/month</span>
                  </div>

                  {space.plantStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Plant Status:</span>
                      <span className={`font-medium ${
                        space.plantStatus === 'Healthy' ? 'text-[#39FF14]' :
                        space.plantStatus === 'Sick' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {space.plantStatus}
                      </span>
                    </div>
                  )}

                  {space.lastWatered && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Watered:</span>
                      <span className="font-medium text-white">
                        {(() => {
                          try {
                            const date = new Date(space.lastWatered);
                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => openUpdateModal(space)}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    📤 Update
                  </Button>
                  <Button
                    onClick={() => handleEditSpace(space)}
                    variant="outline"
                    size="sm"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteSpace(space.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900"
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Vendor Update Modal */}
      <VendorUpdateModal
        space={selectedSpaceForUpdate}
        isOpen={showUpdateModal}
        onClose={closeUpdateModal}
      />
    </div>
  );
}
