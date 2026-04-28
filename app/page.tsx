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
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse animation-delay-200"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse animation-delay-400"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-700/20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#39FF14]/30 border-t-[#39FF14]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#39FF14] animate-spin animation-delay-200" style={{animationDirection: 'reverse'}}></div>
          </div>
            <div className="text-center">
              <div className="text-2xl text-[#39FF14] font-bold mb-2">🌱 অর্বান ফার্মিং</div>
              <div className="text-lg text-gray-400 font-medium">লোড হচ্ছে...</div>
            <div className="flex gap-1 mt-4">
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-600 text-2xl font-bold mb-4">❌</div>
            <div className="text-[#39FF14] text-xl font-medium text-center">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[#39FF14] text-black rounded-lg hover:bg-[#28CC0C] transition-colors font-medium shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 1. Hero Section */}
      <section className="relative bg-[#39FF14] text-black overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-black/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-black/10 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-black/10 rounded-full blur-md animate-ping"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32 w-full">
          <div className="text-center">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6 animate-fade-in">
              <span className="text-2xl">🚀 নতুন যুগের কৃষি প্রযুক্তি</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-fade-in text-black">
              🌱 অর্বান ফার্মিং
              <br />
              <span className="text-black drop-shadow-lg">মার্কেটপ্লেস</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90 animate-fade-in animation-delay-200">
              তাজা, স্বাস্থ্যকর এবং স্থানীয়ভাবে উৎপাদিত পণ্য কিনুন।
              কৃষকদের সাথে সরাসরি যুক্ত হোন।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
              <Link
                href="/marketplace"
                className="group relative px-8 py-4 bg-black text-[#39FF14] font-bold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🛒 শপিং শুরু করুন
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-white/10"
              >
                👨‍🌾 ভেন্ডর হোন
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
      </section>

      {/* 2. Featured Products */}
      <section className="py-20 px-4 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#39FF14]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#39FF14]/10 to-transparent rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full text-sm font-semibold mb-4 animate-fade-in">
              ✨ প্রিমিয়াম কোয়ালিটি
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#39FF14] mb-4 animate-fade-in animation-delay-200">🌟 ফিচার্ড প্রোডাক্টস</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in animation-delay-400">আমাদের সেরা এবং সবচেয়ে জনপ্রিয় পণ্য - তাজা এবং স্বাস্থ্যকর</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200/50 animate-scale-in">
              <div className="text-8xl mb-6 animate-bounce">🛒</div>
              <div className="text-gray-500 text-2xl font-bold mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
              <div className="text-gray-400 text-lg">শীঘ্রই নতুন পণ্য যোগ হবে</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product, index) => (
                <div
                  key={product.id}
                  className="bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-[#39FF14]/20 transition-all duration-500 transform hover:-translate-y-3 border border-gray-700/50 group animate-scale-in"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-6xl animate-pulse">🥕</span>
                        <span className="text-gray-400 font-medium bg-black/80 px-3 py-1 rounded-full">ছবি নেই</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20">
                      {product.category || 'পণ্য'}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#39FF14] mb-2 line-clamp-1 group-hover:text-[#28CC0C] transition-colors">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-3xl font-bold bg-gradient-to-r from-[#39FF14] to-[#28CC0C] bg-clip-text text-transparent">
                          ৳ {product.price}
                        </span>
                        {product.unit && (
                          <span className="text-xs text-gray-400">প্রতি {product.unit}</span>
                        )}
                      </div>
                      {isAuthenticated ? (
                        <Link
                          href={`/products/${product.id}`}
                          className="px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black rounded-xl hover:from-[#28CC0C] hover:to-[#39FF14] transition-all duration-300 font-semibold shadow-lg hover:shadow-[#39FF14]/30 transform hover:scale-105"
                        >
                          কিনুন 🛒
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black rounded-xl hover:from-[#28CC0C] hover:to-[#39FF14] transition-all duration-300 font-semibold shadow-lg hover:shadow-[#39FF14]/30 transform hover:scale-105"
                        >
                          লগইন করুন 🔐
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16 animate-fade-in animation-delay-600">
            <Link
              href="/marketplace"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black font-bold rounded-full hover:from-[#28CC0C] hover:to-[#39FF14] transition-all duration-300 shadow-xl hover:shadow-[#39FF14]/30 transform hover:scale-105"
            >
              <span>মার্কেটপ্লেস দেখুন</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Categories */}
      <section className="py-20 px-4 bg-black relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#39FF14] rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border-2 border-[#39FF14] rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-[#39FF14] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#39FF14] mb-4 animate-fade-in">📂 ক্যাটেগরি</h2>
            <p className="text-xl text-gray-400 animate-fade-in animation-delay-200">আপনার পছন্দের ক্যাটেগরি বেছে নিন - বিভিন্ন ধরনের তাজা পণ্য</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.key}
                href={`/marketplace?category=${category.key}`}
                className={`bg-gradient-to-br ${category.color} text-white p-8 rounded-3xl text-center hover:scale-110 hover:rotate-1 transition-all duration-500 shadow-xl hover:shadow-2xl group relative overflow-hidden animate-scale-in border border-white/20`}
                style={{animationDelay: `${index * 150}ms`}}
              >
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="text-6xl mb-4 group-hover:animate-bounce group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="text-xl lg:text-2xl font-bold group-hover:scale-105 transition-transform duration-300">{category.name}</h3>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                    দেখুন →
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#39FF14]/10 rounded-full blur-2xl animate-pulse animation-delay-400"></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-[#39FF14]/10 rounded-full blur-2xl animate-pulse animation-delay-200"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#39FF14] mb-4 animate-fade-in">🚀 কিভাবে কাজ করে</h2>
            <p className="text-xl text-gray-400 animate-fade-in animation-delay-200">খুব সহজেই শুরু করুন - মাত্র ৩টি ধাপে</p>
          </div>

          {/* Progress line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="w-4 h-4 bg-[#39FF14] rounded-full"></div>
              <div className="flex-1 h-1 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] mx-4 rounded"></div>
              <div className="w-4 h-4 bg-[#28CC0C] rounded-full"></div>
              <div className="flex-1 h-1 bg-gradient-to-r from-[#28CC0C] to-[#39FF14] mx-4 rounded"></div>
              <div className="w-4 h-4 bg-[#39FF14] rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              {
                step: 1,
                title: 'রেজিস্টার করুন',
                description: 'আপনার অ্যাকাউন্ট তৈরি করুন এবং প্রোফাইল সেটআপ করুন',
                icon: '📝',
                color: 'from-green-400 to-green-600',
                bgColor: 'bg-green-50'
              },
              {
                step: 2,
                title: 'পণ্য বেছে নিন',
                description: 'আমাদের বিভিন্ন ক্যাটেগরি থেকে আপনার পছন্দের পণ্য বেছে নিন',
                icon: '🛍️',
                color: 'from-blue-400 to-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                step: 3,
                title: 'ডেলিভারি পান',
                description: 'আপনার দরজায় তাজা পণ্য ডেলিভারি পান',
                icon: '🚚',
                color: 'from-purple-400 to-purple-600',
                bgColor: 'bg-purple-50'
              }
            ].map((step, index) => (
              <div
                key={step.step}
                className={`text-center animate-scale-in bg-gray-900/80 p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 group`}
                style={{animationDelay: `${index * 200}ms`}}
              >
                <div className={`bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{step.icon}</span>
                </div>
                <div className={`bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md`}>
                  {step.step}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#39FF14] mb-4 group-hover:text-[#28CC0C] transition-colors">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{step.description}</p>

                {/* Arrow for mobile */}
                {index < 2 && (
                  <div className="md:hidden mt-8 flex justify-center">
                    <svg className="w-8 h-8 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-[#39FF14]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-tr from-[#39FF14]/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#39FF14] mb-4 animate-fade-in">✨ কেন আমাদের বেছে নেবেন</h2>
            <p className="text-xl text-gray-400 animate-fade-in animation-delay-200">আমাদের অনন্য সুবিধাগুলো জেনে নিন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'তাজা পণ্য',
                description: 'সরাসরি কৃষকদের কাছ থেকে তাজা পণ্য - কোনো মধ্যস্বত্ব নেই',
                icon: '🥬',
                color: 'from-green-400 to-emerald-500',
                bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
                textColor: 'text-green-700'
              },
              {
                title: 'স্থানীয় সমর্থন',
                description: 'স্থানীয় কৃষকদের সমর্থন করুন এবং কমিউনিটি গড়ে তুলুন',
                icon: '🌱',
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                textColor: 'text-blue-700'
              },
              {
                title: 'অর্গানিক',
                description: 'কেমিক্যাল মুক্ত এবং স্বাস্থ্যকর পণ্য - প্রকৃতির উপহার',
                icon: '🌿',
                color: 'from-purple-400 to-violet-500',
                bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
                textColor: 'text-purple-700'
              },
              {
                title: 'দ্রুত ডেলিভারি',
                description: 'আপনার দরজায় দ্রুত এবং নিরাপদ ডেলিভারি সার্ভিস',
                icon: '⚡',
                color: 'from-yellow-400 to-orange-500',
                bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
                textColor: 'text-yellow-700'
              },
              {
                title: 'বিশ্বস্ত',
                description: 'সর্বোচ্চ মানের প্রোডাক্ট গ্যারান্টি এবং কাস্টমার সাপোর্ট',
                icon: '🛡️',
                color: 'from-red-400 to-pink-500',
                bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
                textColor: 'text-red-700'
              },
              {
                title: 'সাশ্রয়ী',
                description: 'সেরা দামে সেরা কোয়ালিটি - আপনার বাজেটের সাথে মিলিয়ে',
                icon: '💰',
                color: 'from-indigo-400 to-purple-500',
                bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
                textColor: 'text-indigo-700'
              }
            ].map((benefit, index) => (
              <div
                key={benefit.title}
                className={`bg-gray-900/80 text-[#39FF14] p-8 rounded-3xl text-center hover:scale-105 hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl border border-gray-700/50 backdrop-blur-sm group animate-scale-in relative overflow-hidden`}
                style={{animationDelay: `${index * 100}ms`}}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>

                <div className="relative z-10">
                  <div className={`bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-4xl">{benefit.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{benefit.description}</p>
                </div>

                {/* Decorative corner */}
                <div className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-full opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Statistics */}
      <section className="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black text-[#39FF14] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#39FF14]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-[#39FF14]/10 rounded-full blur-lg animate-pulse animation-delay-400"></div>
        <div className="absolute top-1/2 right-10 w-12 h-12 bg-[#39FF14]/10 rounded-full blur-md animate-pulse animation-delay-200"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 animate-fade-in">
              📈 বৃদ্ধির সংখ্যা
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 animate-fade-in animation-delay-200">📊 আমাদের পরিসংখ্যান</h2>
            <p className="text-xl opacity-90 animate-fade-in animation-delay-400">আমাদের সাফল্যের সংখ্যা - দিন দিন বাড়ছে</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: statistics.totalVendors || 0, label: 'সক্রিয় ভেন্ডর', icon: '👨‍🌾', color: 'from-green-400 to-green-500' },
              { number: statistics.totalUsers || 0, label: 'মোট ইউজার', icon: '👥', color: 'from-blue-400 to-blue-500' },
              { number: statistics.totalProducts || 0, label: 'পণ্য সংখ্যা', icon: '📦', color: 'from-purple-400 to-purple-500' },
              { number: statistics.totalOrders || 0, label: 'সফল অর্ডার', icon: '✅', color: 'from-yellow-400 to-yellow-500' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center bg-gray-900/20 backdrop-blur-lg rounded-3xl p-8 hover:bg-gray-800/20 transition-all duration-500 transform hover:scale-105 shadow-xl border border-[#39FF14]/20 animate-scale-in group"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <div className={`bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <div className="text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] bg-clip-text text-transparent">
                  {stat.number.toLocaleString('bn-BD')}
                </div>
                <div className="text-lg opacity-90 font-medium group-hover:opacity-100 transition-opacity">{stat.label}</div>
                <div className="mt-2 w-12 h-1 bg-gradient-to-r from-white/50 to-transparent rounded-full mx-auto group-hover:w-16 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#39FF14]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#39FF14]/10 to-transparent rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#39FF14] mb-4 animate-fade-in">💬 কাস্টমার রিভিউ</h2>
            <p className="text-xl text-gray-400 animate-fade-in animation-delay-200">আমাদের কাস্টমাররা কি বলছেন - তাদের অভিজ্ঞতা</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-700/50 group hover:-translate-y-2 animate-scale-in relative overflow-hidden"
                style={{animationDelay: `${index * 200}ms`}}
              >
                {/* Quote mark */}
                <div className="absolute top-4 left-4 text-6xl text-gray-600 font-serif leading-none">"</div>

                {/* Rating stars */}
                <div className="flex mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl animate-pulse" style={{animationDelay: `${i * 100}ms`}}>⭐</span>
                  ))}
                </div>

                <p className="text-gray-300 mb-8 italic leading-relaxed text-lg relative z-10">"{testimonial.content}"</p>

                <div className="flex items-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#39FF14] via-[#28CC0C] to-[#39FF14] rounded-full flex items-center justify-center text-black font-bold text-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#39FF14] text-lg group-hover:text-[#28CC0C] transition-colors">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm font-medium">{testimonial.role}</div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-[#39FF14]/20 to-[#28CC0C]/20 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="absolute top-8 right-8 w-4 h-4 bg-gradient-to-br from-[#39FF14]/30 to-[#28CC0C]/30 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Featured Vendors */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#39FF14] mb-4">🏪 ফিচার্ড ভেন্ডর</h2>
            <p className="text-xl text-gray-400">আমাদের শীর্ষ ভেন্ডরদের সাথে পরিচিত হোন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#39FF14] to-[#28CC0C] rounded-full flex items-center justify-center text-black font-bold text-xl mr-4">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#39FF14]">{vendor.name}</h3>
                    <p className="text-gray-400">{vendor.location}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{vendor.products}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-bold">{vendor.rating.toFixed(1)}</span>
                  </div>
                  <Link
                    href={`/vendors/${vendor.id}`}
                    className="text-[#39FF14] hover:text-[#28CC0C] font-medium"
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
      <section className="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black text-[#39FF14] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(57,255,20,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(57,255,20,0.1),transparent_50%),radial-gradient(circle_at_40%_80%,rgba(57,255,20,0.1),transparent_50%)]"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-[#39FF14]/60 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-[#28CC0C]/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-[#39FF14]/60 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 right-1/3 w-4 h-4 bg-[#28CC0C]/60 rounded-full animate-pulse animation-delay-400"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="bg-gray-900/20 backdrop-blur-lg rounded-3xl p-12 border border-[#39FF14]/20 shadow-2xl animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 animate-fade-in animation-delay-200">📧 নিউজলেটারে যোগ দিন</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-fade-in animation-delay-400">
              নতুন পণ্য, অফার এবং ফার্মিং টিপস পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করুন
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in animation-delay-600">
              <div className="relative flex-1 max-w-md">
                <input
                  type="email"
                  placeholder="আপনার ইমেইল এড্রেস"
                  className="w-full px-6 py-4 rounded-2xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#39FF14] shadow-lg border-2 border-transparent focus:border-[#39FF14] transition-all duration-300 bg-white/95 backdrop-blur-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black font-bold rounded-2xl hover:from-[#28CC0C] hover:to-[#39FF14] transition-all duration-300 shadow-xl hover:shadow-[#39FF14]/30 transform hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  সাবস্ক্রাইব করুন
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <div className="border-t border-white/20 pt-8 animate-fade-in animation-delay-800">
              <p className="text-lg opacity-90 mb-8">
                আজই শুরু করুন এবং তাজা, স্বাস্থ্যকর খাবারের সাথে যুক্ত হোন!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-black text-[#39FF14] font-bold rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-black/30 transform hover:scale-105"
                  >
                  <span className="flex items-center gap-2">
                    🎯 শুরু করুন
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-4 bg-gray-900/20 backdrop-blur-lg text-[#39FF14] font-bold rounded-2xl border-2 border-[#39FF14]/30 hover:bg-gray-800/20 hover:border-[#39FF14]/50 transition-all duration-300 shadow-xl hover:shadow-[#39FF14]/10 transform hover:scale-105"
                  >
                  📞 যোগাযোগ করুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}