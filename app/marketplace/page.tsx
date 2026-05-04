'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { Produce } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Product Status Modal Component
function ProductStatusModal({ product, isOpen, onClose }: {
  product: Produce | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !product) return null;

  const statusSteps = [
    { status: 'Pending', label: 'পেন্ডিং', icon: '⏳', description: 'প্রোডাক্ট রিভিউ করা হচ্ছে', color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Approved', label: 'অনুমোদিত', icon: '✅', description: 'প্রোডাক্ট বিক্রয়ের জন্য উপলব্ধ', color: 'bg-green-100 text-green-800' },
    { status: 'Rejected', label: 'প্রত্যাখ্যাত', icon: '❌', description: 'প্রোডাক্ট স্ট্যান্ডার্ড পূরণ করেনি', color: 'bg-red-100 text-red-800' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === product.certificationStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">প্রোডাক্ট স্ট্যাটাস ডিটেলস</h2>
              <p className="text-green-100">প্রোডাক্ট: {product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Progress */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">সার্টিফিকেশন প্রোগ্রেস</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
                    index <= currentStepIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <div className={`text-sm font-medium text-center ${
                    index <= currentStepIndex ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 w-full mt-4 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ minWidth: '50px' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Status Description */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {statusSteps.find(s => s.status === product.certificationStatus)?.icon}
              </span>
              <div>
                <h4 className="font-bold text-blue-800">
                  বর্তমান স্ট্যাটাস: {statusSteps.find(s => s.status === product.certificationStatus)?.label}
                </h4>
                <p className="text-blue-600">
                  {statusSteps.find(s => s.status === product.certificationStatus)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">প্রোডাক্ট ডিটেলস</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{product.name}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>🏷️ ক্যাটেগরি: {product.category}</p>
                    <p>💰 প্রাইস: ৳{product.price}</p>
                    <p>📦 স্টক: {product.availableQuantity} ইউনিট</p>
                    <p>📏 ইউনিট: {product.unit || 'প্রতি ইউনিট'}</p>
                    <p>🌱 অর্গানিক: {product.isOrganic ? 'হ্যাঁ' : 'না'}</p>
                  </div>
                </div>

                {/* Product Image */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">প্রোডাক্ট ইমেজ</h5>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🥕</span>
                    )}
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-800 mb-2">বিবরণ</h5>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Marketplace Page Component
export default function MarketplacePage() {
  const [products, setProducts] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrganic, setSelectedOrganic] = useState<string>('all');

  const [selectedCertification, setSelectedCertification] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Produce | null>(null);
  const [isProductStatusModalOpen, setIsProductStatusModalOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProduces();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'প্রোডাক্ট লিস্ট পেতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery && selectedCategory === 'all' && selectedOrganic === 'all' && selectedCertification === 'all') {
      fetchProducts();
      return;
    }
    try {
      setLoading(true);
      let filteredProducts = await api.getProduces();

      if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
          product.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }

      if (selectedOrganic !== 'all') {
        const isOrganic = selectedOrganic === 'organic';
        filteredProducts = filteredProducts.filter(product => product.isOrganic === isOrganic);
      }

      if (selectedCertification !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
          product.certificationStatus.toLowerCase() === selectedCertification.toLowerCase()
        );
      }

      setProducts(filteredProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সার্চ করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedOrganic, selectedCertification, searchQuery]);

  const openProductStatusModal = (product: Produce) => {
    setSelectedProduct(product);
    setIsProductStatusModalOpen(true);
  };

  const closeProductStatusModal = () => {
    setIsProductStatusModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
          </div>
          <div className="text-xl text-green-400 font-medium">মার্কেটপ্লেস লোড হচ্ছে...</div>
          <div className="text-sm text-gray-500">আপনার প্রোডাক্ট খুঁজে আনা হচ্ছে</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-500 text-6xl mb-4">🛒</div>
        <div className="text-red-500 text-2xl font-bold mb-4">❌</div>
        <div className="text-red-400 text-xl font-medium text-center max-w-md">{error}</div>
        <button
          onClick={fetchProducts}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🔄 আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
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

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-green-500/20">
            <span className="text-2xl">🛒</span>
            <span className="text-green-300 font-medium">মার্কেটপ্লেস</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-green-300 bg-clip-text text-transparent mb-6">
            তাজা প্রোডাক্ট কিনুন
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            স্থানীয় কৃষকদের থেকে তাজা এবং অর্গানিক প্রোডাক্ট কিনুন। স্বাস্থ্যকর এবং টেকসই খাদ্য নিশ্চিত করুন।
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-green-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{products.length}</div>
              <div className="text-sm text-gray-400">অনুমোদিত প্রোডাক্ট</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-blue-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {products.filter(p => p.isOrganic).length}
              </div>
              <div className="text-sm text-gray-400">অর্গানিক প্রোডাক্ট</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-yellow-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {products.filter(p => p.availableQuantity < 10).length}
              </div>
              <div className="text-sm text-gray-400">লো স্টক</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-green-500/30 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                ৳{products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">মোট মূল্য</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🔍 সার্চ করুন</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="প্রোডাক্ট নাম বা ক্যাটেগরি..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🏷️ ক্যাটেগরি</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white"
                >
                  <option value="all">সব ক্যাটেগরি</option>
                  <option value="vegetables">শাকসবজি</option>
                  <option value="fruits">ফল</option>
                  <option value="grains">শস্য</option>
                  <option value="dairy">দুগ্ধজাত</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🌱 অর্গানিক</label>
                <select
                  value={selectedOrganic}
                  onChange={(e) => setSelectedOrganic(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white"
                >
                  <option value="all">সব প্রোডাক্ট</option>
                  <option value="organic">অর্গানিক</option>
                  <option value="non-organic">নন-অর্গানিক</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">✅ সার্টিফিকেশন</label>
                <select
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="Approved">অনুমোদিত</option>
                  <option value="Pending">পেন্ডিং</option>
                  <option value="Rejected">প্রত্যাখ্যাত</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={searchProducts}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                🔍 ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒🌱</div>
            <div className="text-gray-300 text-2xl font-medium mb-4">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
            <div className="text-gray-500 text-lg mb-8">ফিল্টার পরিবর্তন করে চেষ্টা করুন অথবা একটু পরে দেখুন</div>
            <button
              onClick={fetchProducts}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              🔄 রিফ্রেশ করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-800 hover:border-green-500/30"
              >
                {/* Image Section */}
                <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
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
                        <div className="text-7xl mb-2">🥕</div>
                        <div className="text-gray-400 font-medium">{product.category}</div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-green-400 shadow-lg border border-gray-700">
                    {product.category}
                  </div>

                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                    product.certificationStatus === 'Approved'
                      ? 'bg-green-600/90 text-white'
                      : product.certificationStatus === 'Pending'
                      ? 'bg-yellow-600/90 text-white'
                      : 'bg-red-600/90 text-white'
                  }`}>
                    {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' :
                     product.certificationStatus === 'Pending' ? '⏳ পেন্ডিং' : '❌ প্রত্যাখ্যাত'}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Product Title and ID */}
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-[#39FF14] line-clamp-1 hover:text-[#28CC0C] transition-colors flex-1">{product.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded ml-2">#{String(product.id).slice(-6)}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {product.description || 'কোনো বিবরণ নেই'}
                    </p>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#39FF14] text-sm">🏷️</span>
                        <span className="text-xs text-gray-400">ক্যাটেগরি</span>
                      </div>
                      <span className="text-white font-medium text-sm">{product.category}</span>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400 text-sm">📦</span>
                        <span className="text-xs text-gray-400">স্টক</span>
                      </div>
                      <span className={`font-medium text-sm ${
                        product.availableQuantity < 10
                          ? 'text-red-400'
                          : product.availableQuantity < 50
                          ? 'text-yellow-400'
                          : 'text-[#39FF14]'
                      }`}>
                        {product.availableQuantity} ইউনিট
                      </span>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>ইউনিট: <span className="text-white font-medium">{product.unit || 'প্রতি ইউনিট'}</span></span>
                      <span>অর্গানিক: <span className={`font-medium ${product.isOrganic ? 'text-green-400' : 'text-gray-500'}`}>{product.isOrganic ? 'হ্যাঁ' : 'না'}</span></span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>তৈরি: <span className="text-white font-medium">{new Date(product.createdAt).toLocaleDateString('bn-BD')}</span></span>
                      <span>আপডেট: <span className="text-[#39FF14] font-medium">{new Date(product.updatedAt).toLocaleDateString('bn-BD')}</span></span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-3xl font-bold text-[#39FF14]">
                          ৳{product.price}
                        </span>
                        <div className="text-sm text-gray-400 mt-1">
                          ≈ ${(product.price / 120).toFixed(2)} USD
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">প্রতি</div>
                        <div className="text-sm text-white font-medium">
                          {product.unit || 'ইউনিট'}
                        </div>
                      </div>
                    </div>

                    {/* Organic Badge in Price Section */}
                     {product.isOrganic && (
                       <div className="flex items-center gap-2 mt-2">
                         <span className="text-green-400 text-sm">Organic</span>
                         <span className="text-green-400 text-xs font-medium">অর্গানিক প্রোডাক্ট</span>
                       </div>
                     )}
                  </div>

                  {/* Sustainability Information */}
                  {product.vendor?.sustainabilityCerts && product.vendor.sustainabilityCerts.length > 0 && (
                    <div className="mb-4 bg-green-900/10 rounded-lg p-3 border border-green-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-400 text-sm">🌱</span>
                        <span className="text-green-400 text-sm font-medium">টেকসই প্রমাণপত্র ({product.vendor.sustainabilityCerts.length})</span>
                      </div>
                      <div className="space-y-2">
                        {product.vendor.sustainabilityCerts.map((cert, index) => (
                          <div key={index} className="bg-green-900/20 rounded p-2 border border-green-700/30">
                            <div className="flex justify-between items-center">
                              <span className="text-green-300 text-xs font-medium">{cert.certifyingAgency}</span>
                              <span className="text-green-400 text-xs">{new Date(cert.certificationDate).getFullYear()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendor Information */}
                  {product.vendor && (
                    <div className="mb-4 bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-400 text-sm">🏢</span>
                        <span className="text-xs text-gray-400">ভেন্ডর তথ্য</span>
                      </div>
                       <div className="space-y-1">
                         <Link
                           href={`/users/${product.vendorId}`}
                           className="text-white font-medium text-sm hover:text-cyan-400 transition-colors cursor-pointer"
                         >
                           {product.vendor.farmName} 👤
                         </Link>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span>📍</span>
                          {product.vendor.farmLocation}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400">সার্টিফিকেশন:</div>
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
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
                          </div>
                        </div>
                        {product.vendor.user && (
                          <div className="text-xs text-gray-400">
                            <span>👤</span> {product.vendor.user.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href={`/marketplace/${product.id}`}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black text-sm font-semibold rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 block"
                    >
                      👁️ বিস্তারিত দেখুন
                    </Link>

                    {product.price < 60 && (
                       <p className="text-xs text-yellow-400 text-center mt-2 bg-yellow-900/20 py-1 px-2 rounded">
                         মিনিমাম পেমেন্ট $0.50 USD
                       </p>
                    )}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* Product Status Modal */}
        <ProductStatusModal
          product={selectedProduct}
          isOpen={isProductStatusModalOpen}
          onClose={closeProductStatusModal}
        />
      </div>
    </div>
  );
}