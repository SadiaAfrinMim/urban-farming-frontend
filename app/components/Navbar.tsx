'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVendorProfile } from '../hooks/useApi';

import ProfileImage from './ProfileImage';
import { NotificationDropdown } from './NotificationDropdown';

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
    <nav className="bg-white dark:bg-black/95 backdrop-blur-md shadow-lg py-4 px-6 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-green-800 dark:text-[#39FF14] hover:scale-105 hover:rotate-3 transition-transform duration-300">
          🌱 অর্বান ফার্মিং
        </Link>

        <div className="flex gap-2 md:gap-6 mt-2 md:mt-0 items-center">
          <Link
            href="/"
            className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            🏠 হোম
          </Link>

          <Link
            href="/products"
            className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/products' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            🛒 প্রোডাক্ট
          </Link>

          <Link
            href="/marketplace"
            className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/marketplace' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            🛍️ মার্কেটপ্লেস
          </Link>

          {isAuthenticated && hasRole('Customer') && (
            <>
              <Link
                href="/orders"
                className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/orders' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                📦 অর্ডার
              </Link>
              <Link
                href="/rentals"
                className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/rentals' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                🌱 রেন্টাল
              </Link>
              <Link
                href="/community"
                className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/community' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                👥 কমিউনিটি
              </Link>
              <Link
                href="/sustainability"
                className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/sustainability' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                🌍 সাসটেইনেবিলিটি
              </Link>
              <Link
                href="/profile"
                className={`text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === '/profile' ? 'bg-green-100 dark:bg-[#39FF14]/10 text-green-800 dark:text-[#39FF14] shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                👤 প্রোফাইল
              </Link>
            </>
          )}

          {isAuthenticated && hasRole('Vendor') && (
            <>
              <Link
                href="/vendor/dashboard"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/dashboard' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                ড্যাশবোর্ড
              </Link>
              <Link
                href="/vendor/profile"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/profile' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                প্রোফাইল
              </Link>
              <Link
                href="/vendor/products"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/products' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                প্রোডাক্ট
              </Link>
              <Link
                href="/vendor/rentals"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/rentals' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                রেন্টাল
              </Link>
              <Link
                href="/vendor/plant-tracking"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/plant-tracking' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                প্ল্যান্ট ট্র্যাকিং
              </Link>
              <Link
                href="/vendor/orders"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/orders' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                অর্ডার
              </Link>
              <Link
                href="/vendor/community"
                className={`text-gray-700 dark:text-gray-400 hover:text-green-800 dark:hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/vendor/community' ? 'text-green-800 dark:text-[#39FF14] font-medium' : ''}`}
              >
                কমিউনিটি
              </Link>
            </>
          )}

          {isAuthenticated && hasRole('Admin') && (
            <>
              <Link
                href="/admin/dashboard"
                className={`text-gray-400 hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/admin/dashboard' ? 'text-[#39FF14] font-medium' : ''}`}
              >
                এডমিন ড্যাশবোর্ড
              </Link>
              <Link
                href="/admin/users"
                className={`text-gray-400 hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/admin/users' ? 'text-[#39FF14] font-medium' : ''}`}
              >
                ইউজার ম্যানেজ
              </Link>
              <Link
                href="/admin/products"
                className={`text-gray-400 hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/admin/products' ? 'text-[#39FF14] font-medium' : ''}`}
              >
                প্রোডাক্ট রিভিউ
              </Link>
              <Link
                href="/admin/posts"
                className={`text-gray-400 hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/admin/posts' ? 'text-[#39FF14] font-medium' : ''}`}
              >
                পোস্ট মডারেশন
              </Link>
              <Link
                href="/profile"
                className={`text-gray-400 hover:text-[#39FF14] px-3 py-2 rounded ${pathname === '/profile' ? 'text-[#39FF14] font-medium' : ''}`}
              >
                প্রোফাইল
              </Link>
            </>
          )}

          {!isAuthenticated ? (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-[#39FF14] px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:bg-gray-800"
              >
                🔐 লগইন
              </Link>
              <Link
                href="/register"
                className="bg-[#39FF14] text-black px-6 py-2 rounded-lg hover:bg-[#28CC0C] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                📝 রেজিস্ট্রেশন
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 bg-gray-800 px-5 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-sm"
                >
                <ProfileImage
                  user={{
                    name: user?.name,
                    role: user?.role,
                    profileImage: user?.profileImage,
                    profileData: vendorProfile ? { profilePhoto: vendorProfile.profilePhoto } : undefined
                  }}
                  size="sm"
                  className="border-2 border-white shadow-sm"
                />
                <span className="font-medium text-gray-200">
                  {user?.role === 'Admin' ? 'এডমিন' : user?.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                </span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-gray-900 rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mx-2 font-medium transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    👤 প্রোফাইল
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mx-2 font-medium transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ⚙️ সেটিংস
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900 rounded-lg mx-2 font-medium transition-colors"
                  >
                    🚪 লগআউট
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
