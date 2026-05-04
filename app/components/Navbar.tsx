'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVendorProfile, useUnreadMessagesCount } from '../hooks/useApi';

import ProfileImage from './ProfileImage';
import { NotificationDropdown } from './NotificationDropdown';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Always call the hook but use enabled to control when it runs
  const { data: vendorProfile } = useVendorProfile();
  const { data: unreadMessagesCount = 0 } = useUnreadMessagesCount();

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasRole('Vendor') && vendorProfile?.profilePhoto) {
      setProfilePhoto(vendorProfile.profilePhoto);
    } else {
      setProfilePhoto(null);
    }
  }, [isAuthenticated, user?.role, vendorProfile]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-2xl border-b border-green-500/20'
            : 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo with unique design */}
            <Link
              href="/"
              className="group relative flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight"
            >
              <div className="relative">
                <span className="absolute inset-0 blur-md bg-gradient-to-r from-green-600 to-[#39FF14] opacity-60 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative bg-gradient-to-r from-green-700 to-[#39FF14] bg-clip-text text-transparent dark:from-green-400 dark:to-[#39FF14]">
                  🌱
                </span>
              </div>
              <span className="bg-gradient-to-r from-green-800 to-green-600 dark:from-[#39FF14] dark:to-green-400 bg-clip-text text-transparent">
                অর্বান ফার্মিং
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-[#39FF14] group-hover:w-full transition-all duration-500"></div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {/* Navigation links with pill design */}
              <NavLink href="/" pathname={pathname}>
                🏠 হোম
              </NavLink>
              <NavLink href="/products" pathname={pathname}>
                🛒 প্রোডাক্ট
              </NavLink>
              <NavLink href="/marketplace" pathname={pathname}>
                🛍️ মার্কেটপ্লেস
              </NavLink>

              {isAuthenticated && hasRole('Customer') && (
                <>
                  <NavLink href="/orders" pathname={pathname}>
                    📦 অর্ডার
                  </NavLink>
                  <NavLink href="/rentals" pathname={pathname}>
                    🌱 রেন্টাল
                  </NavLink>
                  <NavLink href="/community" pathname={pathname}>
                    👥 কমিউনিটি
                  </NavLink>
                  <NavLink href="/sustainability" pathname={pathname}>
                    🌍 সাসটেইনেবিলিটি
                  </NavLink>
                  <NavLink href="/profile" pathname={pathname}>
                    👤 প্রোফাইল
                  </NavLink>
                </>
              )}

              {isAuthenticated && hasRole('Vendor') && (
                <>
                  <NavLink href="/vendor/dashboard" pathname={pathname}>
                    📊 ড্যাশবোর্ড
                  </NavLink>
                  <NavLink href="/vendor/profile" pathname={pathname}>
                    👤 প্রোফাইল
                  </NavLink>
                  <NavLink href="/vendor/products" pathname={pathname}>
                    📦 প্রোডাক্ট
                  </NavLink>
                  <NavLink href="/vendor/rentals" pathname={pathname}>
                    🔄 রেন্টাল
                  </NavLink>
                  <NavLink href="/vendor/plant-tracking" pathname={pathname}>
                    🌿 প্ল্যান্ট ট্র্যাকিং
                  </NavLink>
                  <NavLink href="/vendor/orders" pathname={pathname}>
                    📋 অর্ডার
                  </NavLink>
                  <NavLink href="/vendor/community" pathname={pathname}>
                    💬 কমিউনিটি
                  </NavLink>
                </>
              )}

              {isAuthenticated && hasRole('Admin') && (
                <>
                  <NavLink href="/admin/dashboard" pathname={pathname}>
                    👑 এডমিন ড্যাশবোর্ড
                  </NavLink>
                  <NavLink href="/admin/users" pathname={pathname}>
                    👥 ইউজার ম্যানেজ
                  </NavLink>
                  <NavLink href="/admin/products" pathname={pathname}>
                    ✅ প্রোডাক্ট রিভিউ
                  </NavLink>
                  <NavLink href="/admin/posts" pathname={pathname}>
                    📝 পোস্ট মডারেশন
                  </NavLink>
                  <NavLink href="/profile" pathname={pathname}>
                    👤 প্রোফাইল
                  </NavLink>
                </>
              )}

              {!isAuthenticated ? (
                <div className="flex items-center gap-3 ml-4">
                  <Link
                    href="/login"
                    className="relative px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-[#39FF14] transition-all duration-300 group"
                  >
                    🔐 লগইন
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-green-600 to-[#39FF14] scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                  <Link
                    href="/register"
                    className="relative px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-[#39FF14] rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                  >
                    <span className="relative z-10">📝 রেজিস্ট্রেশন</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14] to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-4">
                  <NotificationDropdown />
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-3 px-3 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-all duration-300 group"
                    >
                      <ProfileImage
                        user={{
                          name: user?.name,
                          role: user?.role,
                          profileImage: user?.profileImage,
                          profileData: vendorProfile ? { profilePhoto: vendorProfile.profilePhoto } : undefined,
                        }}
                        size="sm"
                        className="border-2 border-green-500 shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <div className="text-left">
                        <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                          {user?.role === 'Admin'
                            ? 'এডমিন'
                            : user?.role === 'Vendor'
                            ? 'ভেন্ডর'
                            : 'কাস্টমার'}
                        </span>
                        <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 max-w-[100px]">
                          {user?.name?.split(' ')[0]}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                          dropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fadeInUp">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="text-xl">👤</span>
                          <span className="font-medium">প্রোফাইল</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="text-xl">⚙️</span>
                          <span className="font-medium">সেটিংস</span>
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="text-xl">🚪</span>
                          <span className="font-medium">লগআউট</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute h-0.5 w-5 bg-gray-800 dark:bg-gray-200 transform transition-all duration-300 ${
                    mobileMenuOpen ? 'rotate-45 top-2' : 'rotate-0 top-0'
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-gray-800 dark:bg-gray-200 top-2 transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-gray-800 dark:bg-gray-200 transform transition-all duration-300 ${
                    mobileMenuOpen ? '-rotate-45 top-2' : 'rotate-0 top-4'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu with slide animation */}
        <div
          className={`lg:hidden fixed inset-x-0 top-16 lg:top-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-2xl transform transition-all duration-400 ${
            mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
          style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
        >
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <MobileNavLink href="/" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                🏠 হোম
              </MobileNavLink>
              <MobileNavLink href="/products" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                🛒 প্রোডাক্ট
              </MobileNavLink>
              <MobileNavLink href="/marketplace" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                🛍️ মার্কেটপ্লেস
              </MobileNavLink>

              {isAuthenticated && hasRole('Customer') && (
                <>
                  <MobileNavLink href="/orders" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    📦 অর্ডার
                  </MobileNavLink>
                  <MobileNavLink href="/rentals" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    🌱 রেন্টাল
                  </MobileNavLink>
                  <MobileNavLink href="/community" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    👥 কমিউনিটি
                  </MobileNavLink>
                  <MobileNavLink href="/sustainability" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    🌍 সাস্টেইনেবিলিটি
                  </MobileNavLink>
                  <MobileNavLink href="/profile" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    👤 প্রোফাইল
                  </MobileNavLink>
                </>
              )}

              {isAuthenticated && hasRole('Vendor') && (
                <>
                  <MobileNavLink href="/vendor/dashboard" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    📊 ড্যাশবোর্ড
                  </MobileNavLink>
                  <MobileNavLink href="/vendor/profile" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    👤 প্রোফাইল
                  </MobileNavLink>
                  <MobileNavLink href="/vendor/products" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    📦 প্রোডাক্ট
                  </MobileNavLink>
                  <MobileNavLink href="/vendor/rentals" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    🔄 রেন্টাল
                  </MobileNavLink>
                  <MobileNavLink href="/vendor/plant-tracking" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    🌿 প্ল্যান্ট ট্র্যাকিং
                  </MobileNavLink>
                  <MobileNavLink href="/vendor/orders" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    📋 অর্ডার
                  </MobileNavLink>
                  <MobileNavLink href="/vendor/community" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    💬 কমিউনিটি
                  </MobileNavLink>
                </>
              )}

              {isAuthenticated && hasRole('Admin') && (
                <>
                  <MobileNavLink href="/admin/dashboard" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    👑 এডমিন ড্যাশবোর্ড
                  </MobileNavLink>
                  <MobileNavLink href="/admin/users" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    👥 ইউজার ম্যানেজ
                  </MobileNavLink>
                  <MobileNavLink href="/admin/products" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    ✅ প্রোডাক্ট রিভিউ
                  </MobileNavLink>
                  <MobileNavLink href="/admin/posts" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    📝 পোস্ট মডারেশন
                  </MobileNavLink>
                  <MobileNavLink href="/profile" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                    👤 প্রোফাইল
                  </MobileNavLink>
                </>
              )}
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔐 লগইন
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center text-white font-bold bg-gradient-to-r from-green-600 to-[#39FF14] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📝 রেজিস্ট্রেশন
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <ProfileImage
                      user={{
                        name: user?.name,
                        role: user?.role,
                        profileImage: user?.profileImage,
                        profileData: vendorProfile ? { profilePhoto: vendorProfile.profilePhoto } : undefined,
                      }}
                      size="md"
                      className="border-2 border-green-500 shadow-md"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white">{user?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                      <div className="text-xs font-medium text-green-600 dark:text-[#39FF14] mt-1">
                        {user?.role === 'Admin' ? 'এডমিন' : user?.role === 'Vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">👤</span>
                    <span>প্রোফাইল</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">⚙️</span>
                    <span>সেটিংস</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                  >
                    <span className="text-xl">🚪</span>
                    <span>লগআউট</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 lg:h-20"></div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

// Helper component for desktop navigation links
function NavLink({
  href,
  pathname,
  children,
  badgeCount
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
  badgeCount?: number;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group ${
        isActive
          ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-[#39FF14]/20 text-green-800 dark:text-[#39FF14] shadow-md'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {badgeCount && badgeCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px] h-5">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </span>
      {!isActive && (
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600/20 to-[#39FF14]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      )}
    </Link>
  );
}

// Helper component for mobile navigation links
function MobileNavLink({
  href,
  pathname,
  onClick,
  children,
}: {
  href: string;
  pathname: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-[#39FF14]/20 text-green-800 dark:text-[#39FF14] font-semibold'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}