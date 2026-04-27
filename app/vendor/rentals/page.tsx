'use client';

import { useEffect, useState } from 'react';
import { MultiStepForm } from '../../components/MultiStepForm';
import { Card, Button, Input, Alert, LoadingSpinner, StatusBadge } from '../../components/ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useUpdateRentalSpace, useDeleteRentalSpace } from '../../hooks/useApi';
import Image from 'next/image';

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

  const updateMutation = useUpdateRentalSpace();
  const deleteMutation = useDeleteRentalSpace();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVendorRentalSpaces();
      setSpaces(data);
    } catch (err) {
      console.error('Failed to fetch rental spaces:', err);
      setError('Failed to load rental spaces. Please check your connection and try again.');
      // Keep empty spaces array for now
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Space Management</h1>
          <p className="text-gray-600 mt-2">Manage your rental plots and track their status</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            {showAddForm ? 'Cancel' : '+ Add New Plot'}
          </Button>
          <Button
            onClick={() => handleAddSpace({ location: 'Test Location', size: '100 sq ft', price: '50' })}
            variant="outline"
            className="px-4 py-2"
          >
            Test Create
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {showAddForm && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Rental Plot</h2>
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
                <label htmlFor="add-location" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="add-size" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="add-price" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="add-image" className="block text-sm font-medium text-gray-700 mb-2">
                  Image (Optional)
                </label>
                <input
                  id="add-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {addImageFile && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {addImageFile.name}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
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

      {editingSpace && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Rental Space</h2>
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
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-2">
                  Update Image (Optional)
                </label>
                <input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>
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
                className="bg-blue-600 hover:bg-blue-700 text-white"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rental spaces yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first rental plot</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {space.location}
                    </h3>
                    <p className="text-sm text-gray-600">{space.size}</p>
                  </div>
                  <StatusBadge status={space.availability ? 'active' : 'inactive'}>
                    {space.availability ? 'Available' : 'Occupied'}
                  </StatusBadge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${space.price}/month</span>
                  </div>

                  {space.plantStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plant Status:</span>
                      <span className={`font-medium ${
                        space.plantStatus === 'Healthy' ? 'text-green-600' :
                        space.plantStatus === 'Sick' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {space.plantStatus}
                      </span>
                    </div>
                  )}

                  {space.lastWatered && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Watered:</span>
                      <span className="font-medium">
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

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditSpace(space)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteSpace(space.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}