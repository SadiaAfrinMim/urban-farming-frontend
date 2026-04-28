'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { Produce } from '../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await api.getProduces();
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API থেকে ডেটা পেতে সমস্যা হয়েছে');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
          <div className="text-xl text-[#39FF14] font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-400 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center">{error}</div>
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
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#39FF14] hover:text-[#28CC0C] font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#39FF14] mb-4">
            🛒 সমস্ত প্রোডাক্ট
          </h1>
          <p className="text-lg text-gray-400">আমাদের মার্কেটপ্লেস থেকে তাজা পণ্য বেছে নিন</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <div className="text-gray-400 text-xl font-medium">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
            <div className="text-gray-500 text-sm mt-2">একটু পরে আবার চেষ্টা করুন</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 cursor-pointer">
                  <div className="relative h-56 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🥕</span>
                        <span className="text-gray-400 font-medium">ছবি নেই</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#39FF14]/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#39FF14]">
                      {product.category || 'পণ্য'}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#39FF14] text-black px-2 py-1 rounded-full text-xs font-medium">
                      {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' : '⏳ অপেক্ষমান'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#39FF14] mb-3 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[#39FF14]">
                          ৳ {product.price}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.unit ? `প্রতি ${product.unit}` : 'প্রতি ইউনিট'}
                        </span>
                      </div>
                      <div className="px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black text-sm font-medium rounded-xl text-center shadow-md">
                        বিস্তারিত দেখুন
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
