'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { Produce } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Produce[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProduce(resolvedParams.id);
      setProduct(data);

      // Fetch related products from same vendor
      const allProducts = await api.getProduces();
      const filteredProducts = allProducts.filter(p =>
        p.vendor?.id === data.vendor?.id && p.id !== data.id
      ).slice(0, 4); // Limit to 4 related products
      setRelatedProducts(filteredProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'প্রোডাক্ট লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error('অর্ডার করার জন্য লগইন করুন');
      return;
    }

    if (!product) return;

    if (quantity > product.availableQuantity) {
      toast.error('পর্যাপ্ত স্টক নেই');
      return;
    }

    try {
      setOrderLoading(true);
      const orderResponse = await api.createOrder({
        produceId: parseInt(product.id),
        quantity: quantity,
        totalPrice: product.price * quantity,
      });
      toast.success('🎉 অর্ডার সফলভাবে সম্পন্ন হয়েছে!');

      // Redirect to payment page
      if (orderResponse?.data?.data?.id) {
        router.push(`/payment/checkout/${orderResponse.data.data.id}`);
      } else {
        // Fallback to general payment page if no order ID
        router.push('/payment');
      }
    } catch (err) {
      console.error('Order failed:', err);
      toast.error(err instanceof Error ? err.message : 'অর্ডার করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
          </div>
          <div className="text-xl text-green-400 font-medium">প্রোডাক্ট লোড হচ্ছে...</div>
          <div className="text-sm text-gray-500">আপনার প্রোডাক্টের বিস্তারিত তথ্য আনা হচ্ছে</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-500 text-6xl mb-4">🥕</div>
        <div className="text-red-500 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center max-w-md">{error || 'প্রোডাক্ট পাওয়া যায়নি'}</div>
        <Link
          href="/marketplace"
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🛒 মার্কেটপ্লেসে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
            ← মার্কেটপ্লেসে ফিরে যান
          </Link>
          <div className="flex gap-4">
            <Link href="/rentals" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              💧 রেন্টাল স্পেস
            </Link>
            <Link href="/orders" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              📦 আমার অর্ডার
            </Link>
          </div>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
              <div className="relative z-10 text-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div>
                    <div className="text-9xl mb-4">🥕</div>
                    <div className="text-gray-400 font-medium text-xl">{product.category}</div>
                  </div>
                )}
              </div>
              {/* Certification Badge */}
              <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                product.certificationStatus === 'Approved'
                  ? 'bg-green-600/90 text-white'
                  : product.certificationStatus === 'Pending'
                  ? 'bg-yellow-600/90 text-white'
                  : 'bg-red-600/90 text-white'
              }`}>
                {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' :
                 product.certificationStatus === 'Pending' ? '⏳ পেন্ডিং' : '❌ প্রত্যাখ্যাত'}
              </div>
              {/* Organic Badge */}
              {product.isOrganic && (
                <div className="absolute top-6 right-6 bg-green-600/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg">
                  🌱 অর্গানিক
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Basic Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
                <span className="text-sm text-gray-500 bg-gray-700 px-3 py-1 rounded-full">#{String(product.id).slice(-6)}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl">🏷️</span>
                <span className="text-xl text-gray-300">{product.category}</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                {product.description || 'কোনো বিস্তারিত বিবরণ নেই'}
              </p>
            </div>

            {/* Price and Stock */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    ৳{product.price}
                  </div>
                  <div className="text-gray-400">প্রতি {product.unit || 'ইউনিট'}</div>
                  <div className="text-sm text-gray-500">≈ ${(product.price / 120).toFixed(2)} USD</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">স্টক</div>
                  <div className={`text-2xl font-bold ${
                    product.availableQuantity < 10
                      ? 'text-red-400'
                      : product.availableQuantity < 50
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    {product.availableQuantity} {product.unit || 'ইউনিট'}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-300 font-medium">পরিমাণ:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                    disabled={quantity >= product.availableQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={handleOrder}
                disabled={orderLoading || product.availableQuantity === 0}
                className="w-full py-4 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] hover:from-[#28CC0C] hover:to-[#39FF14] text-black text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {orderLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    অর্ডার হচ্ছে...
                  </div>
                ) : product.availableQuantity === 0 ? (
                  'স্টক শেষ'
                ) : (
                  `🛒 ${quantity}টি অর্ডার করুন - ৳${(product.price * quantity).toLocaleString()}`
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                <div className="text-sm text-gray-400 mb-1">ইউনিট</div>
                <div className="text-white font-medium">{product.unit || 'প্রতি ইউনিট'}</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                <div className="text-sm text-gray-400 mb-1">অর্গানিক</div>
                <div className={`font-medium ${product.isOrganic ? 'text-green-400' : 'text-gray-500'}`}>
                  {product.isOrganic ? 'হ্যাঁ' : 'না'}
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">ভেন্ডর তথ্য</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <div className="text-white font-medium">{product.vendor.farmName}</div>
                      <div className="text-gray-400 text-sm">{product.vendor.farmLocation}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">সার্টিফিকেশন:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.vendor.certificationStatus === 'Approved'
                        ? 'bg-green-900/50 text-green-400'
                        : product.vendor.certificationStatus === 'Rejected'
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {product.vendor.certificationStatus === 'Approved'
                        ? '✅ অনুমোদিত'
                        : product.vendor.certificationStatus === 'Rejected'
                        ? '❌ প্রত্যাখ্যাত'
                        : '⏳ অপেক্ষমান'}
                    </span>
                  </div>
                  {product.vendor.user && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      <div className="text-white">{product.vendor.user.name}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sustainability Certificates */}
            {product.vendor?.sustainabilityCerts && product.vendor.sustainabilityCerts.length > 0 && (
              <div className="bg-green-900/10 backdrop-blur-sm p-6 rounded-2xl border border-green-700/30">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <span>🌱</span>
                  টেকসই প্রমাণপত্র ({product.vendor.sustainabilityCerts.length})
                </h3>
                <div className="space-y-3">
                  {product.vendor.sustainabilityCerts.map((cert, index) => (
                    <div key={index} className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                      <div className="flex justify-between items-center">
                        <span className="text-green-300 font-medium">{cert.certifyingAgency}</span>
                        <span className="text-green-400 text-sm">{new Date(cert.certificationDate).getFullYear()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">একই ভেন্ডরের অন্যান্য প্রোডাক্ট</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/marketplace/${relatedProduct.id}`}
                  className="group bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-green-500/30"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    {relatedProduct.image ? (
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">🥕</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-bold">৳{relatedProduct.price}</span>
                      <span className="text-sm text-gray-400">{relatedProduct.category}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}