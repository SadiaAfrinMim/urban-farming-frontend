'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { SustainabilityTip, Produce, RentalSpace } from '../lib/api';
import { useApprovedVendorCertificates } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

export default function SustainabilityPage() {
  const [tips, setTips] = useState<SustainabilityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tips' | 'myListings' | 'marketplace'>('marketplace');
  const [myProducts, setMyProducts] = useState<Produce[]>([]);
  const [myRentals, setMyRentals] = useState<RentalSpace[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produce | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalSpace | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const { data: approvedVendors } = useApprovedVendorCertificates();
  const { isAuthenticated, hasRole } = useAuth();

  const fetchTips = async () => {
    try {
      setLoading(true);
      const data = await api.getSustainabilityCerts();
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'টিপস লিস্ট পেতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    if (!isAuthenticated || !hasRole('Vendor')) return;

    try {
      setListingsLoading(true);
      const [products, rentals] = await Promise.all([
        api.getVendorProduces(),
        api.getVendorRentalSpaces()
      ]);
      setMyProducts(products);
      setMyRentals(rentals);
    } catch (err) {
      console.error('Failed to fetch vendor listings:', err);
      setError('আপনার লিস্টিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleViewMyListings = () => {
    if (viewMode !== 'myListings') {
      setViewMode('myListings');
      if (myProducts.length === 0 && myRentals.length === 0) {
        fetchMyListings();
      }
    } else {
      setViewMode('tips');
    }
  };

  const handleProductClick = (product: Produce, vendor: any) => {
    setSelectedProduct(product);
    setSelectedRental(null);
    setSelectedVendor(vendor);
    setShowVendorDetails(false);
  };

  const handleRentalClick = (rental: RentalSpace, vendor: any) => {
    setSelectedRental(rental);
    setSelectedProduct(null);
    setSelectedVendor(vendor);
    setShowVendorDetails(false);
  };

  const handleVendorClick = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowVendorDetails(true);
    setSelectedProduct(null);
    setSelectedRental(null);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedRental(null);
    setSelectedVendor(null);
    setShowVendorDetails(false);
  };

  useEffect(() => {
    fetchTips();
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
          <div className="text-xl text-[#39FF14] font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
       

      

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode('marketplace')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'marketplace'
                  ? 'bg-[#39FF14] text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🛍️ মার্কেটপ্লেস
            </button>
            <button
              onClick={() => setViewMode('tips')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'tips'
                  ? 'bg-[#39FF14] text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              💡 টিপস
            </button>
            {isAuthenticated && hasRole('Vendor') && (
              <button
                onClick={handleViewMyListings}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === 'myListings'
                    ? 'bg-[#39FF14] text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                👤 আমার লিস্টিংস
              </button>
            )}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'marketplace' ? (
          /* Marketplace View */
          <div className="space-y-12">
          </div>
        ) : viewMode === 'tips' ? (
          <></>
        ) : (
          /* Vendor Listings View */
          <div className="space-y-12">
            {listingsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto mb-4"></div>
                <div className="text-xl text-[#39FF14] font-medium">আপনার লিস্টিংস লোড হচ্ছে...</div>
              </div>
            ) : (
              <>
                {/* Products Section */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="text-3xl">📦</div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#39FF14] to-green-400 bg-clip-text text-transparent">
                      আমার প্রোডাক্টস ({myProducts.length})
                    </h2>
                  </div>

                  {myProducts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
                      <div className="text-6xl mb-4">📦</div>
                      <div className="text-gray-400 text-xl font-medium mb-2">কোনো প্রোডাক্ট নেই</div>
                      <div className="text-gray-500 text-sm mb-4">আপনার প্রোডাক্ট যোগ করুন</div>
                      <Link
                        href="/vendor/products"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black rounded-xl font-bold hover:from-[#28CC0C] hover:to-[#39FF14] transition-all duration-300"
                      >
                        প্রোডাক্ট যোগ করুন
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myProducts.map((product) => (
                        <div key={product.id} className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                          {product.image && (
                            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <h3 className="font-bold text-xl text-[#39FF14] mb-2">{product.name}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-[#39FF14]">৳{product.price}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.certificationStatus === 'Approved'
                                ? 'bg-green-600/20 text-green-400'
                                : product.certificationStatus === 'Pending'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {product.certificationStatus === 'Approved' ? '✅ অনুমোদিত' :
                               product.certificationStatus === 'Pending' ? '⏳ পেন্ডিং' : '❌ প্রত্যাখ্যাত'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rentals Section */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="text-3xl">🌱</div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      আমার রেন্টাল স্পেস ({myRentals.length})
                    </h2>
                  </div>

                  {myRentals.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
                      <div className="text-6xl mb-4">🌱</div>
                      <div className="text-gray-400 text-xl font-medium mb-2">কোনো রেন্টাল স্পেস নেই</div>
                      <div className="text-gray-500 text-sm mb-4">আপনার রেন্টাল স্পেস যোগ করুন</div>
                      <Link
                        href="/vendor/rentals"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300"
                      >
                        রেন্টাল স্পেস যোগ করুন
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myRentals.map((rental) => (
                        <div key={rental.id} className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                          {rental.image && (
                            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                              <img
                                src={rental.image}
                                alt={rental.location}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <h3 className="font-bold text-xl text-cyan-400 mb-2">{rental.location}</h3>
                          <p className="text-gray-400 text-sm mb-2">সাইজ: {rental.size}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-cyan-400">৳{rental.price}/মাস</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              rental.availability ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                            }`}>
                              {rental.availability ? '✅ উপলব্ধ' : '❌ বুকড'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Summary Section */}
        {approvedVendors && approvedVendors.length > 0 && (
          <div className="mt-16 bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
              📊 সামারি
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {approvedVendors.reduce((total, vendor) => total + (vendor.produces?.length || 0), 0)}
                </div>
                <div className="text-gray-300">মোট পণ্য</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {approvedVendors.reduce((total, vendor) => total + (vendor.rentalSpaces?.length || 0), 0)}
                </div>
                <div className="text-gray-300">মোট রেন্টাল স্পেস</div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Profiles Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              👨‍🌾 সার্টিফাইড ভেন্ডর প্রোফাইলস
            </h2>
            <p className="text-lg text-gray-300">সাস্টেইনেবিলিটি সার্টিফাইড ভেন্ডরদের সাথে পরিচিত হোন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(!approvedVendors || approvedVendors.length === 0) ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">👨‍🌾</div>
                <div className="text-gray-400 text-xl font-medium">কোনো অনুমোদিত ভেন্ডর পাওয়া যায়নি</div>
                <div className="text-gray-500 text-sm mt-2">শীঘ্রই যোগ করা হবে</div>
              </div>
            ) : (
              approvedVendors?.map((vendor) => (
                <div key={vendor.id} onClick={() => handleVendorClick(vendor)} className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 cursor-pointer">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {vendor.profilePhoto ? (
                        <img src={vendor.profilePhoto} alt={vendor.farmName} className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl text-white">👨‍🌾</span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-gray-100 mb-1">{vendor.user.name}</h3>
                    <p className="text-sm text-gray-400">{vendor.farmName}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">📍 অবস্থান:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.farmLocation}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">📧 ইমেইল:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">🌱 পণ্য:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.produces?.length || 0} টি</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">🏠 রেন্টাল স্পেস:</span>
                      <span className="text-sm text-gray-200 font-medium">{vendor.rentalSpaces?.length || 0} টি</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-sm font-medium text-green-400">সাস্টেইনেবিলিটি সার্টিফাইড</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">🌱</span>
                      <span className="text-sm font-medium text-gray-200">অনুমোদিত</span>
                    </div>
                  </div>

                  {/* <div className="flex gap-3">
                    <Link
                      href={`/marketplace?vendor=${vendor.id}`}
                      className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      🛍️ পণ্য দেখুন
                    </Link>
                    <Link
                      href={`/vendor/profile?id=${vendor.id}`}
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      👤 প্রোফাইল
                    </Link>
                  </div> */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {showVendorDetails && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">ভেন্ডর প্রোফাইল ডিটেলস</h2>
                  <p className="text-green-100">{selectedVendor.farmName}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Vendor Profile */}
              <div className="bg-gray-700 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    {selectedVendor.profilePhoto ? (
                      <img src={selectedVendor.profilePhoto} alt={selectedVendor.farmName} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl text-white">👨‍🌾</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedVendor.user.name}</h3>
                    <p className="text-gray-300 mb-2">{selectedVendor.farmName}</p>
                    <p className="text-gray-400">📍 {selectedVendor.farmLocation}</p>
                    <p className="text-gray-400">📧 {selectedVendor.user.email}</p>
                  </div>
                </div>
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✅</span>
                    <span className="text-green-400 font-medium">সাস্টেইনেবিলিটি সার্টিফাইড ভেন্ডর</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">এই ভেন্ডর টেকসই কৃষি মানদণ্ড পূরণ করে এবং সার্টিফাইড প্রোডাক্টস প্রোভাইড করে।</p>
                </div>
              </div>

              {/* Vendor Products */}
              {(selectedVendor.produces && selectedVendor.produces.length > 0) && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#39FF14] mb-4">📦 প্রোডাক্টস ({selectedVendor.produces.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVendor.produces.map((product: Produce) => (
                      <div key={product.id} onClick={() => handleProductClick(product, selectedVendor)} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                        {product.image && (
                          <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-bold text-white mb-2">{product.name}</h4>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-[#39FF14]">৳{product.price}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                            ✅ সার্টিফাইড
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendor Rentals */}
              {(selectedVendor.rentalSpaces && selectedVendor.rentalSpaces.length > 0) && (
                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">🏠 রেন্টাল স্পেস ({selectedVendor.rentalSpaces.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVendor.rentalSpaces.map((rental: RentalSpace) => (
                      <div key={rental.id} onClick={() => handleRentalClick(rental, selectedVendor)} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                        {rental.image && (
                          <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                            <img
                              src={rental.image}
                              alt={rental.location}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-bold text-white mb-2">{rental.location}</h4>
                        <p className="text-gray-300 text-sm mb-2">সাইজ: {rental.size}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-cyan-400">৳{rental.price}/মাস</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rental.availability ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                          }`}>
                            {rental.availability ? '✅ উপলব্ধ' : '❌ বুকড'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedVendor.produces || selectedVendor.produces.length === 0) &&
               (!selectedVendor.rentalSpaces || selectedVendor.rentalSpaces.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <div className="text-gray-400 text-xl font-medium mb-2">কোনো লিস্টিং নেই</div>
                  <div className="text-gray-500 text-sm">এই ভেন্ডরের কোনো প্রোডাক্ট বা রেন্টাল স্পেস নেই</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product/Rental Detail Modal */}
      {(selectedProduct || selectedRental) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedProduct ? 'প্রোডাক্ট ডিটেলস' : 'রেন্টাল স্পেস ডিটেলস'}
                  </h2>
                  <p className="text-green-100">
                    {selectedProduct ? selectedProduct.name : selectedRental?.location}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedProduct && selectedVendor && (
                <div className="space-y-6">
                  {/* Product Image */}
                  {selectedProduct.image && (
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#39FF14] mb-2">{selectedProduct.name}</h3>
                      <p className="text-gray-300 mb-4">{selectedProduct.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">ভেন্ডর: <span className="text-white">{selectedVendor.farmName}</span></p>
                        <p className="text-sm text-gray-400">অবস্থান: <span className="text-white">{selectedVendor.farmLocation}</span></p>
                        <p className="text-sm text-gray-400">মূল্য: <span className="text-2xl font-bold text-[#39FF14]">৳{selectedProduct.price}</span></p>
                      </div>
                    </div>
                    <div>
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-400">✅</span>
                          <span className="text-green-400 font-medium">সাস্টেইনেবিলিটি সার্টিফাইড</span>
                        </div>
                        <p className="text-sm text-gray-300">এই প্রোডাক্টটি সার্টিফাইড ভেন্ডর থেকে আসছে এবং টেকসই কৃষি মানদণ্ড পূরণ করে।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedRental && selectedVendor && (
                <div className="space-y-6">
                  {/* Rental Image */}
                  {selectedRental.image && (
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedRental.image}
                        alt={selectedRental.location}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Rental Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-cyan-400 mb-2">{selectedRental.location}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">ভেন্ডর: <span className="text-white">{selectedVendor.farmName}</span></p>
                        <p className="text-sm text-gray-400">অবস্থান: <span className="text-white">{selectedVendor.farmLocation}</span></p>
                        <p className="text-sm text-gray-400">সাইজ: <span className="text-white">{selectedRental.size}</span></p>
                        <p className="text-sm text-gray-400">মূল্য: <span className="text-2xl font-bold text-cyan-400">৳{selectedRental.price}/মাস</span></p>
                      </div>
                    </div>
                    <div>
                      <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-lg ${selectedRental.availability ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedRental.availability ? '✅' : '❌'}
                          </span>
                          <span className={`font-medium ${selectedRental.availability ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedRental.availability ? 'উপলব্ধ' : 'বুকড'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">এই রেন্টাল স্পেসটি সার্টিফাইড ভেন্ডর থেকে এবং টেকসই কৃষি পরিবেশে অবস্থিত।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}