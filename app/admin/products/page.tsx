'use client';

import Link from 'next/link';
import { CheckCircle, XCircle, Package, AlertCircle } from 'lucide-react';
import { usePendingProduces, useApproveProduce, useRejectProduce } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  certificationStatus: string;
  image?: string;
  vendor: {
    farmName: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminProductsPage() {
  const { data: products = [], isLoading: loading, error, refetch } = usePendingProduces();
  const approveProduceMutation = useApproveProduce();
  const rejectProduceMutation = useRejectProduce();

  const handleApprove = async (productId: string) => {
    try {
      await approveProduceMutation.mutateAsync(productId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await rejectProduceMutation.mutateAsync(productId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xl text-gray-300">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-200 mb-2">ত্রুটি</h2>
          <p className="text-gray-400">{error instanceof Error ? error.message : 'পণ্য লোড করতে সমস্যা হয়েছে'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            রিফ্রেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-[#39FF14] hover:text-[#28CC0C] hover:underline">← এডমিন ড্যাশবোর্ডে ফিরে যান</Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-10 text-[#39FF14]">পেন্ডিং প্রোডাক্ট রিভিউ</h1>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl shadow-md border border-gray-600">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">কোনো পেন্ডিং প্রোডাক্ট নেই</h3>
            <p className="text-gray-400">সব প্রোডাক্ট রিভিউ এবং অনুমোদিত হয়েছে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-600">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-200 mb-1">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span className="font-medium">মূল্য:</span>
                        <span>৳{product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ক্যাটেগরি:</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ভেন্ডর:</span>
                        <span className="truncate ml-2">{product.vendor.farmName}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {product.vendor.user.email}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        অনুমোদন
                      </button>
                      <button
                        onClick={() => handleReject(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        প্রত্যাখ্যান
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
