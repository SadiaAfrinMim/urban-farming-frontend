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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <Link href="/marketplace" className="text-blue-400 mb-4 inline-block">
          ← মার্কেটপ্লেসে ফিরে যান
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4 text-white">{product.name}</h1>
            <p className="text-2xl text-green-400 font-bold mb-4">
              ৳ {product.price} {product.unit ? `/ ${product.unit}` : '/ ইউনিট'}
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">পরিমাণ</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDecrementQuantity}
                  disabled={quantity <= 1}
                  className="w-8 h-8 bg-gray-200 rounded disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-xl">{quantity}</span>
                <button
                  onClick={handleIncrementQuantity}
                  disabled={quantity >= product.availableQuantity}
                  className="w-8 h-8 bg-gray-200 rounded disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                মোট: ৳ {product.price * quantity}
              </p>
            </div>

            <Button
              onClick={handleBuyProduct}
              disabled={isBuying || product.certificationStatus !== 'Approved'}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {isBuying ? 'Processing...' : 'কিনুন'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}