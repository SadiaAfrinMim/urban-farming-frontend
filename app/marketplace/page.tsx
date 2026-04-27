'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { Produce } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function MarketplacePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching products...');
      const productsData = await api.getProduces();
      console.log('Products fetched:', productsData?.length || 0, 'items');
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'পণ্য লোড করতে সমস্যা হয়েছে');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const searchResults = await api.searchProduces(searchQuery);
      setProducts(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অনুসন্ধানে সমস্যা হয়েছে');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchProducts();
  };

  const handleBuyProduct = async (productId: number) => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      toast.error('প্রোডাক্ট কেনার জন্য লগইন করুন');
      router.push('/login');
      return;
    }

    // Check if user is a vendor
    if (user.role === 'Vendor') {
      toast.error('ভেন্ডররা প্রোডাক্ট কিনতে পারবেন না। শুধুমাত্র কাস্টমাররা কিনতে পারবেন।');
      return;
    }

    try {
      // Create order first
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('প্রোডাক্ট খুঁজে পাওয়া যায়নি');
        return;
      }

      // Check if product is approved
      if (product.certificationStatus !== 'Approved') {
        toast.error('এই প্রোডাক্টটি এখন কেনার জন্য উপলব্ধ নয়');
        return;
      }

      const orderData = {
        produceId: productId, // Send as number
        quantity: 1, // Default to 1 for now
        totalPrice: product.price,
      };

      console.log('Creating order with data:', orderData);

      const orderResponse = await api.createOrder(orderData);
      console.log('Order creation response:', orderResponse);

      if (orderResponse.success) {
        const orderId = orderResponse.data.id;

        // Store order ID for payment page
        localStorage.setItem('pendingOrderId', orderId.toString());
        console.log('Stored order ID:', orderId);

        toast.success('অর্ডার তৈরি হয়েছে! পেমেন্ট পেজে যাচ্ছে...');

        // Redirect to payment page
        router.push('/payment');
      } else {
        toast.error(orderResponse.message || 'অর্ডার তৈরি করা যায়নি');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('প্রোডাক্ট কেনার সময় ত্রুটি ঘটেছে');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <div className="text-xl text-gray-700 font-medium">পণ্য লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 gap-4">
        <div className="text-red-600 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-600 text-xl font-medium text-center">{error}</div>
        <button
          onClick={fetchProducts}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🛍️ মার্কেটপ্লেস
          </h1>
          <p className="text-lg text-gray-600">সকল পণ্য অনুসন্ধান এবং ক্রয় করুন</p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্যের নাম দিয়ে অনুসন্ধান করুন..."
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold text-lg flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  অনুসন্ধান...
                </>
              ) : (
                <>
                  🔍 অনুসন্ধান
                </>
              )}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                🗑️ পরিষ্কার
              </button>
            )}
          </form>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {searchQuery ? '🔍' : '🛍️'}
            </div>
            <div className="text-gray-500 text-xl font-medium">
              {searchQuery ? 'কোনো পণ্য পাওয়া যায়নি' : 'কোনো পণ্য নেই'}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {searchQuery ? 'অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন' : 'একটু পরে আবার চেষ্টা করুন'}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="text-gray-600">
                {searchQuery ? (
                  <span>অনুসন্ধান ফলাফল: <strong>"{searchQuery}"</strong></span>
                ) : (
                  <span>সকল পণ্য দেখানো হচ্ছে</span>
                )}
                <span className="ml-2">({products.length}টি পণ্য)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer">
                    <div className="relative h-56 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="fallback flex flex-col items-center gap-2" style={{ display: product.image ? 'none' : 'flex' }}>
                      <span className="text-4xl">🥕</span>
                      <span className="text-gray-500 font-medium">ছবি নেই</span>
                    </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-green-700">
                        {product.category || 'পণ্য'}
                      </div>
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' : '⏳ অপেক্ষমান'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description || 'কোনো বিবরণ নেই'}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            ৳ {product.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.unit ? `প্রতি ${product.unit}` : 'প্রতি ইউনিট'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">স্টক:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.availableQuantity < 10
                              ? 'bg-red-100 text-red-800'
                              : product.availableQuantity < 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.availableQuantity}
                          </span>
                        </div>
                      </div>
                        <div className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-medium rounded-xl text-center shadow-md">
                          বিস্তারিত দেখুন
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}