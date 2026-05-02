'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useCreateProduce } from '@/app/hooks/useApi';
import { Button, Input, Textarea, Select, Card, Alert, LoadingSpinner } from '@/app/components/ui';

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  availableQuantity: string;
  unit: string;
  image: File | null;
}

export default function CreateProducePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const createProduceMutation = useCreateProduce();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    availableQuantity: '',
    unit: 'kg',
    image: null,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = 'প্রোডাক্টের নাম প্রয়োজন';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'সঠিক দাম প্রয়োজন';
    if (!formData.category) newErrors.category = 'ক্যাটাগরি সিলেক্ট করুন';
    if (!formData.availableQuantity || parseInt(formData.availableQuantity) <= 0) {
      newErrors.availableQuantity = 'সঠিক পরিমাণ প্রয়োজন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createProduceMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        availableQuantity: parseInt(formData.availableQuantity),
        certificationStatus: 'Pending',
        unit: formData.unit,
        image: formData.image || undefined,
      });

      router.push('/vendor/products');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const categoryOptions = [
    { value: '', label: 'ক্যাটাগরি সিলেক্ট করুন' },
    { value: 'Vegetables', label: 'সবজি' },
    { value: 'Fruits', label: 'ফল' },
    { value: 'Grains', label: 'শস্য' },
    { value: 'Herbs', label: 'ভেষজ' },
    { value: 'Seeds', label: 'বীজ' },
    { value: 'Tools', label: 'টুলস' },
    { value: 'Other', label: 'অন্যান্য' },
  ];

  const unitOptions = [
    { value: 'kg', label: 'কেজি' },
    { value: 'piece', label: 'পিস' },
    { value: 'dozen', label: 'ডজন' },
    { value: 'gram', label: 'গ্রাম' },
    { value: 'liter', label: 'লিটার' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/vendor/products" className="inline-flex items-center text-green-700 hover:text-green-800 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            প্রোডাক্ট লিস্টে ফিরে যান
          </Link>
        </div>

        <Card className="border border-gray-100" shadow="lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">নতুন প্রোডাক্ট যোগ করুন</h1>
            <p className="text-gray-600">আপনার কৃষি পণ্য তথ্য প্রদান করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="প্রোডাক্টের নাম *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="উদাহরণ: টমেটো, আলু, পাতা শাক"
              fullWidth
              required
            />

            <Textarea
              label="বর্ণনা"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন"
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="দাম (টাকা) *"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                placeholder="১০০"
                required
              />

              <Input
                label="পরিমাণ *"
                name="availableQuantity"
                type="number"
                min="0"
                value={formData.availableQuantity}
                onChange={handleChange}
                error={errors.availableQuantity}
                placeholder="৫০"
                required
              />

              <Select
                label="একক *"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                options={unitOptions}
                required
              />
            </div>

            <Select
              label="ক্যাটাগরি *"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              options={categoryOptions}
              fullWidth
              required
            />

            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-gray-800 mb-2">
                প্রোডাক্টের ছবি
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">ছবি আপলোড করুন (ঐচ্ছিক, সর্বোচ্চ 5MB)</p>
            </div>

            {createProduceMutation.isError && (
              <Alert
                type="error"
                message={(createProduceMutation.error as Error)?.message || 'প্রোডাক্ট তৈরি করা যাচ্ছে না'}
              />
            )}

            <Button
              type="submit"
              loading={createProduceMutation.isPending}
              fullWidth
              size="lg"
              className="text-lg"
            >
              প্রোডাক্ট তৈরি করুন
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
