'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVendorProfile } from '../hooks/useApi';

// ProfilePhoto component for consistent display
const ProfilePhoto = ({ src, alt, size = 32, fallback }: {
  src?: string | null;
  alt: string;
  size?: number;
  fallback: string;
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-${size/4} h-${size/4} rounded-full object-cover border-2 border-white shadow-sm`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`w-${size/4} h-${size/4} bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm`}
      style={{ width: size, height: size }}
    >
      {fallback}
    </div>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Always call the hook but use enabled to control when it runs
  const { data: vendorProfile } = useVendorProfile();

  useEffect(() => {
    if (isAuthenticated && hasRole('Vendor') && vendorProfile?.profilePhoto) {
      setProfilePhoto(vendorProfile.profilePhoto);
    } else {
      setProfilePhoto(null);
    }
  }, [isAuthenticated, user?.role, vendorProfile]);

  // Only fetch vendor profile when user is authenticated and is a vendor
  const shouldFetchProfile = isAuthenticated && hasRole('Vendor');

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg py-4 px-6 sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
          🌱 অর্বান ফার্মিং
        </Link>

        <div className="flex gap-2 md:gap-6 mt-2 md:mt-0 items-center">
          <Link
            href="/"
            className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
          >
            🏠 হোম
          </Link>

          <Link
            href="/products"
            className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/products' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
          >
            🛒 প্রোডাক্ট
          </Link>

          <Link
            href="/marketplace"
            className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/marketplace' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
          >
            🛍️ মার্কেটপ্লেস
          </Link>

          {isAuthenticated && hasRole('Customer') && (
            <>
              <Link
                href="/orders"
                className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/orders' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
              >
                📦 অর্ডার
              </Link>
              <Link
                href="/rentals"
                className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/rentals' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
              >
                🌱 রেন্টাল
              </Link>
              <Link
                href="/community"
                className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/community' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
              >
                👥 কমিউনিটি
              </Link>
              <Link
                href="/sustainability"
                className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/sustainability' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
              >
                🌍 সাসটেইনেবিলিটি
              </Link>
              <Link
                href="/profile"
                className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/profile' ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-md' : 'hover:bg-gray-50'}`}
              >
                👤 প্রোফাইল
              </Link>
            </>
          )}

          {isAuthenticated && hasRole('Vendor') && (
            <>
              <Link
                href="/vendor/dashboard"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/dashboard' ? 'text-blue-600 font-medium' : ''}`}
              >
                ড্যাশবোর্ড
              </Link>
              <Link
                href="/vendor/profile"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/profile' ? 'text-blue-600 font-medium' : ''}`}
              >
                প্রোফাইল
              </Link>
              <Link
                href="/vendor/products"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/products' ? 'text-blue-600 font-medium' : ''}`}
              >
                প্রোডাক্ট
              </Link>
              <Link
                href="/vendor/rentals"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/rentals' ? 'text-blue-600 font-medium' : ''}`}
              >
                রেন্টাল
              </Link>
              <Link
                href="/vendor/plant-tracking"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/plant-tracking' ? 'text-blue-600 font-medium' : ''}`}
              >
                প্ল্যান্ট ট্র্যাকিং
              </Link>
              <Link
                href="/vendor/orders"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/orders' ? 'text-blue-600 font-medium' : ''}`}
              >
                অর্ডার
              </Link>
              <Link
                href="/vendor/community"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/vendor/community' ? 'text-blue-600 font-medium' : ''}`}
              >
                কমিউনিটি
              </Link>
            </>
          )}

          {isAuthenticated && hasRole('Admin') && (
            <>
              <Link
                href="/admin/dashboard"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/admin/dashboard' ? 'text-blue-600 font-medium' : ''}`}
              >
                এডমিন ড্যাশবোর্ড
              </Link>
              <Link
                href="/admin/users"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/admin/users' ? 'text-blue-600 font-medium' : ''}`}
              >
                ইউজার ম্যানেজ
              </Link>
              <Link
                href="/admin/products"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/admin/products' ? 'text-blue-600 font-medium' : ''}`}
              >
                প্রোডাক্ট রিভিউ
              </Link>
              <Link
                href="/admin/posts"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/admin/posts' ? 'text-blue-600 font-medium' : ''}`}
              >
                পোস্ট মডারেশন
              </Link>
              <Link
                href="/profile"
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/profile' ? 'text-blue-600 font-medium' : ''}`}
              >
                প্রোফাইল
              </Link>
            </>
          )}

          {!isAuthenticated ? (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:bg-gray-50"
              >
                🔐 লগইন
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                📝 রেজিস্ট্রেশন
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-gradient-to-r from-gray-100 to-gray-200 px-5 py-2 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm"
              >
                <ProfilePhoto
                  src={profilePhoto}
                  alt="প্রোফাইল ফটো"
                  size={32}
                  fallback={user?.role === 'Admin' ? 'A' : user?.role === 'Vendor' ? 'V' : 'C'}
                />
                <span className="font-medium text-gray-800">
                  {user?.role === 'Admin' ? 'এডমিন' : user?.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                </span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mx-2 font-medium transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    👤 প্রোফাইল
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mx-2 font-medium transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ⚙️ সেটিংস
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mx-2 font-medium transition-colors"
                  >
                    🚪 লগআউট
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
