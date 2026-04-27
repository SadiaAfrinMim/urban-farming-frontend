'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '../../components/DataTable';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useVendorProduces, useCreateProduce, useUpdateProduce, useDeleteProduce } from '../../hooks/useApi';

interface Produce {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  availableQuantity: number;
  certificationStatus: string;
  image?: string;
  createdAt?: string;
}

export default function ProductManagement() {
  const { data: products = [], isLoading: loading, error, refetch } = useVendorProduces();
  const createMutation = useCreateProduce();
  const updateMutation = useUpdateProduce();
  const deleteMutation = useDeleteProduce();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produce | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    availableQuantity: 0,
    unit: 'kg',
    image: null as File | null,
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load products. Please check your connection and try again.');
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        data: {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          availableQuantity: formData.availableQuantity,
          unit: formData.unit,
          certificationStatus: editingProduct.certificationStatus, // Keep existing status
        }
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        availableQuantity: formData.availableQuantity,
        unit: formData.unit,
        certificationStatus: 'Pending',
        image: formData.image || undefined,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      availableQuantity: 0,
      unit: 'kg',
      image: null,
    });
  };

  const handleEdit = async (id: string) => {
    const productToEdit = products.find(p => p.id === id);
    if (!productToEdit) {
      toast.error('Product not found');
      return;
    }

    setEditingProduct(productToEdit);
    setFormData({
      name: productToEdit.name,
      description: productToEdit.description || '',
      price: productToEdit.price,
      category: productToEdit.category,
      availableQuantity: productToEdit.availableQuantity,
      unit: productToEdit.unit || 'kg',
      image: null, // Can't pre-fill file input
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">প্রোডাক্ট লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p className="text-gray-600 mt-1">আপনার কৃষি পণ্যসমূহ পরিচালনা করুন</p>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">মোট প্রোডাক্ট: <strong>{products.length}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">অনুমোদিত: <strong>{products.filter(p => p.certificationStatus === 'Approved').length}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">অপেক্ষমান: <strong>{products.filter(p => p.certificationStatus === 'Pending').length}</strong></span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            রিফ্রেশ
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showAddForm ? 'বাতিল করুন' : 'প্রোডাক্ট যোগ করুন'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">প্রোডাক্টের নাম</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
                placeholder="উদাহরণ: টমেটো"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">ক্যাটাগরি</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
              >
                <option value="">ক্যাটাগরি সিলেক্ট করুন</option>
                <option value="Vegetables">সবজি</option>
                <option value="Fruits">ফল</option>
                <option value="Seeds">বীজ</option>
                <option value="Tools">টুলস</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">দাম (টাকা)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">পরিমাণ</label>
              <input
                type="number"
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">ইউনিট</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
              >
                <option value="kg">কেজি</option>
                <option value="piece">পিস</option>
                <option value="dozen">ডজন</option>
                <option value="gram">গ্রাম</option>
                <option value="liter">লিটার</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">বর্ণনা</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                rows={3}
                placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন"
              />
            </div>
            {!editingProduct && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">প্রোডাক্টের ছবি</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <p className="text-sm text-gray-600 mt-1">ঐচ্ছিক: প্রোডাক্টের ছবি আপলোড করুন (সর্বোচ্চ 5MB)</p>
              </div>
            )}
            {editingProduct && editingProduct.image && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">বর্তমান ছবি</label>
                <div className="flex items-center gap-4">
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-600">ছবি পরিবর্তন করার জন্য API এর মাধ্যমে আপডেট করুন</p>
                </div>
              </div>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                {editingProduct ? 'আপডেট করুন' : 'প্রোডাক্ট যোগ করুন'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        <DataTable
          data={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}