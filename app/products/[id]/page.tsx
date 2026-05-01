'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { Produce } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button, LoadingSpinner } from '../../components/ui';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await api.getProduce(productId);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'প্রোডাক্ট লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrementQuantity = () => {
    if (product && quantity < product.availableQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleBuyProduct = async () => {
    if (!isAuthenticated || !user) {
      toast.error('প্রোডাক্ট কেনার জন্য লগইন করুন');
      router.push('/login');
      return;
    }

    if (user.role === 'Vendor') {
      toast.error('ভেন্ডররা প্রোডাক্ট কিনতে পারবেন না। শুধুমাত্র কাস্টমাররা কিনতে পারবেন।');
      return;
    }

    if (!product) {
      toast.error('প্রোডাক্ট তথ্য পাওয়া যায়নি');
      return;
    }

    if (product.certificationStatus !== 'Approved') {
      toast.error('এই প্রোডাক্টটি এখন কেনার জন্য উপলব্ধ নয়');
      return;
    }

    try {
      setIsBuying(true);

      const orderData = {
        produceId: parseInt(productId),
        quantity: quantity,
        totalPrice: product.price * quantity,
      };

      const orderResponse = await api.createOrder(orderData);

      if (orderResponse.success) {
        const orderId = orderResponse.data.id;
        localStorage.setItem('pendingOrderId', orderId.toString());
        toast.success('অর্ডার তৈরি হয়েছে! পেমেন্ট পেজে যাচ্ছে...');
        router.push('/payment');
      } else {
        toast.error(orderResponse.message || 'অর্ডার তৈরি করা যায়নি');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('প্রোডাক্ট কেনার সময় ত্রুটি ঘটেছে');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error || 'প্রোডাক্ট পাওয়া যায়নি'}</div>
        <Link href="/marketplace" className="mt-4 text-blue-600">
          মার্কেটপ্লেসে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black/70 to-gray-900/50 z-0"></div>

      <div className="max-w-6xl mx-auto relative z-20">
        <div className="mb-8">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-[#39FF14] hover:text-[#28CC0C] font-medium transition-colors">
            ← মার্কেটপ্লেসে ফিরে যান
          </Link>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="relative h-96 md:h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || '/placeholder.jpg'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {/* Certification Badge */}
                <div className={`absolute top-4 right-4 text-black px-3 py-1 rounded-full text-xs font-medium ${
                  product.certificationStatus === 'Approved' ? 'bg-[#39FF14]' : 'bg-red-500'
                }`}>
                  {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' : '❌ অননুমোদিত'}
                </div>
                {/* Available Quantity Badge */}
                <div className="absolute top-4 left-4 bg-[#39FF14]/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#39FF14]">
                  {product.availableQuantity} {product.unit || 'ইউনিট'} উপলব্ধ
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-[#39FF14] mb-4">{product.name}</h1>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#39FF14]">৳ {product.price}</span>
                  <span className="text-sm text-gray-400">{product.unit ? `প্রতি ${product.unit}` : 'প্রতি ইউনিট'}</span>
                </div>

                {/* Quantity Selection */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">পরিমাণ:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDecrementQuantity}
                        disabled={quantity <= 1}
                        className="w-8 h-8 bg-gray-700 text-white rounded-full hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold text-[#39FF14] min-w-[2rem] text-center">{quantity}</span>
                      <button
                        onClick={handleIncrementQuantity}
                        disabled={quantity >= product.availableQuantity}
                        className="w-8 h-8 bg-gray-700 text-white rounded-full hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    মোট মূল্য: <span className="text-[#39FF14] font-semibold">৳ {product.price * quantity}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">প্রোডাক্ট তথ্য</h3>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <p><strong className="text-gray-300">আইডি:</strong> #{productId}</p>
                  <p><strong className="text-gray-300">উপলব্ধ পরিমাণ:</strong> {product.availableQuantity} {product.unit || 'ইউনিট'}</p>
                  <p><strong className="text-gray-300">সার্টিফিকেশন স্ট্যাটাস:</strong> <span className={product.certificationStatus === 'Approved' ? 'text-green-400' : 'text-red-400'}>{product.certificationStatus}</span></p>
                </div>
              </div>

              {/* Buy Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleBuyProduct}
                  disabled={isBuying || product.certificationStatus !== 'Approved'}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black text-lg font-semibold rounded-xl hover:from-[#28CC0C] hover:to-[#39FF14] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  {isBuying ? 'প্রসেসিং...' : `কিনুন - ৳ ${product.price * quantity}`}
                </button>
              </div>

              {/* Terms */}
              <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">ক্রয় শর্তাবলী</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• প্রোডাক্টটি শুধুমাত্র অনুমোদিত হলে কেনা যাবে</p>
                  <p>• অর্ডার কনফার্ম হওয়ার পর পেমেন্ট করতে হবে</p>
                  <p>• প্রোডাক্টের গুণগত মান নিশ্চিত করা হয়</p>
                  <p>• রিটার্ন পলিসি প্রযোজ্য হবে</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}