'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import {
  useFeaturedProducts,
  useCategories,
  useStatistics,
  useTestimonials,
  useFeaturedVendors
} from './hooks/useApi';

export default function Home() {
  const { isAuthenticated } = useAuth();

  // Fetch all data using hooks
  const { data: products = [], isLoading: productsLoading, error: productsError } = useFeaturedProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: statistics = {}, isLoading: statsLoading } = useStatistics();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials();
  const { data: vendors = [], isLoading: vendorsLoading } = useFeaturedVendors();

  const loading = productsLoading || categoriesLoading || statsLoading || testimonialsLoading || vendorsLoading;
  const error = productsError?.message;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <div className="text-xl text-gray-700 font-medium">লোড হচ্ছে...</div>
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
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-fade-in">
              🌱 অর্বান ফার্মিং
              <br />
              <span className="text-yellow-300">মার্কেটপ্লেস</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              তাজা, স্বাস্থ্যকর এবং স্থানীয়ভাবে উৎপাদিত পণ্য কিনুন।
              কৃষকদের সাথে সরাসরি যুক্ত হোন।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-yellow-500 text-green-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🛒 শপিং শুরু করুন
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                👨‍🌾 ভেন্ডর হোন
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* 2. Featured Products */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">🌟 ফিচার্ড প্রোডাক্টস</h2>
            <p className="text-xl text-gray-600">আমাদের সেরা এবং সবচেয়ে জনপ্রিয় পণ্য</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <div className="text-gray-500 text-xl font-medium">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl">🥕</span>
                        <span className="text-gray-500 font-medium">ছবি নেই</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {product.category || 'পণ্য'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">
                        ৳ {product.price} {product.unit ? `/ ${product.unit}` : ''}
                      </span>
                      {isAuthenticated ? (
                        <Link
                          href={`/products/${product.id}`}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          কিনুন
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          লগইন করে কিনুন
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/marketplace"
              className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg"
            >
              মার্কেটপ্লেস দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">📂 ক্যাটেগরি</h2>
            <p className="text-xl text-gray-600">আপনার পছন্দের ক্যাটেগরি বেছে নিন</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/marketplace?category=${category.key}`}
                className={`bg-gradient-to-br ${category.color} text-white p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group`}
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">{category.icon}</div>
                <h3 className="text-xl font-bold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">🚀 কিভাবে কাজ করে</h2>
            <p className="text-xl text-gray-600">খুব সহজেই শুরু করুন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                title: 'রেজিস্টার করুন',
                description: 'আপনার অ্যাকাউন্ট তৈরি করুন এবং প্রোফাইল সেটআপ করুন',
                icon: '📝'
              },
              {
                step: 2,
                title: 'পণ্য বেছে নিন',
                description: 'আমাদের বিভিন্ন ক্যাটেগরি থেকে আপনার পছন্দের পণ্য বেছে নিন',
                icon: '🛍️'
              },
              {
                step: 3,
                title: 'ডেলিভারি পান',
                description: 'আপনার দরজায় তাজা পণ্য ডেলিভারি পান',
                icon: '🚚'
              }
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">✨ কেন আমাদের বেছে নেবেন</h2>
            <p className="text-xl text-gray-600">আমাদের সুবিধাগুলো জেনে নিন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'তাজা পণ্য',
                description: 'সরাসরি কৃষকদের কাছ থেকে তাজা পণ্য',
                icon: '🥬',
                color: 'bg-green-100 text-green-600'
              },
              {
                title: 'স্থানীয় সমর্থন',
                description: 'স্থানীয় কৃষকদের সমর্থন করুন',
                icon: '🌱',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                title: 'অর্গানিক',
                description: 'কেমিক্যাল মুক্ত এবং স্বাস্থ্যকর পণ্য',
                icon: '🌿',
                color: 'bg-purple-100 text-purple-600'
              },
              {
                title: 'দ্রুত ডেলিভারি',
                description: 'আপনার দরজায় দ্রুত ডেলিভারি',
                icon: '⚡',
                color: 'bg-yellow-100 text-yellow-600'
              },
              {
                title: 'বিশ্বস্ত',
                description: 'সর্বোচ্চ মানের প্রোডাক্ট গ্যারান্টি',
                icon: '🛡️',
                color: 'bg-red-100 text-red-600'
              },
              {
                title: 'সাশ্রয়ী',
                description: 'সেরা দামে সেরা কোয়ালিটি',
                icon: '💰',
                color: 'bg-indigo-100 text-indigo-600'
              }
            ].map((benefit) => (
              <div key={benefit.title} className={`${benefit.color} p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 shadow-lg`}>
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Statistics */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">📊 আমাদের পরিসংখ্যান</h2>
            <p className="text-xl opacity-90">আমাদের সাফল্যের সংখ্যা</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: statistics.totalVendors || 0, label: 'সক্রিয় ভেন্ডর', icon: '👨‍🌾' },
              { number: statistics.totalUsers || 0, label: 'মোট ইউজার', icon: '👥' },
              { number: statistics.totalProducts || 0, label: 'পণ্য সংখ্যা', icon: '📦' },
              { number: statistics.totalOrders || 0, label: 'সফল অর্ডার', icon: '✅' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.number.toLocaleString('bn-BD')}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">💬 কাস্টমার রিভিউ</h2>
            <p className="text-xl text-gray-600">আমাদের কাস্টমাররা কি বলছেন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Featured Vendors */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">🏪 ফিচার্ড ভেন্ডর</h2>
            <p className="text-xl text-gray-600">আমাদের শীর্ষ ভেন্ডরদের সাথে পরিচিত হোন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{vendor.name}</h3>
                    <p className="text-gray-600">{vendor.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{vendor.products}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-bold">{vendor.rating.toFixed(1)}</span>
                  </div>
                  <Link
                    href={`/vendors/${vendor.id}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    দেখুন →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter & CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-green-700 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">📧 নিউজলেটারে যোগ দিন</h2>
          <p className="text-xl mb-8 opacity-90">
            নতুন পণ্য, অফার এবং ফার্মিং টিপস পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করুন
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <input
              type="email"
              placeholder="আপনার ইমেইল এড্রেস"
              className="px-6 py-3 rounded-full text-gray-800 flex-1 max-w-md"
            />
            <button className="px-8 py-3 bg-yellow-500 text-green-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-lg">
              সাবস্ক্রাইব করুন
            </button>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="text-lg opacity-90 mb-6">
              আজই শুরু করুন এবং তাজা, স্বাস্থ্যকর খাবারের সাথে যুক্ত হোন!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-green-700 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                🎯 শুরু করুন
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                📞 যোগাযোগ করুন
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}