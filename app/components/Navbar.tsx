'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type UserRole = 'customer' | 'vendor' | 'admin' | null;

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Demo toggle for testing roles
  const toggleLogin = (role: UserRole) => {
    setIsLoggedIn(role !== null);
    setUserRole(role);
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          অর্বান ফার্মিং
        </Link>

        <div className="flex gap-1 md:gap-4 mt-2 md:mt-0 items-center">
          <Link 
            href="/" 
            className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/' ? 'text-blue-600 font-medium' : ''}`}
          >
            হোম
          </Link>
          
          <Link 
            href="/products" 
            className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/products' ? 'text-blue-600 font-medium' : ''}`}
          >
            প্রোডাক্ট
          </Link>

          {userRole === 'customer' && (
            <>
              <Link 
                href="/orders" 
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/orders' ? 'text-blue-600 font-medium' : ''}`}
              >
                আমার অর্ডার
              </Link>
              <Link 
                href="/rentals" 
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/rentals' ? 'text-blue-600 font-medium' : ''}`}
              >
                রেন্টাল
              </Link>
              <Link 
                href="/community" 
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/community' ? 'text-blue-600 font-medium' : ''}`}
              >
                কমিউনিটি
              </Link>
              <Link 
                href="/sustainability" 
                className={`text-gray-600 hover:text-blue-600 px-3 py-2 rounded ${pathname === '/sustainability' ? 'text-blue-600 font-medium' : ''}`}
              >
                সাসটেইনেবিলিটি
              </Link>
            </>
          )}

          {userRole === 'vendor' && (
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

          {userRole === 'admin' && (
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
            </>
          )}

          {!isLoggedIn ? (
            <div className="flex gap-3">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2"
              >
                লগইন
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                <span className="font-medium">
                  {userRole === 'admin' ? 'এডমিন' : userRole === 'vendor' ? 'ভেন্ডর' : 'কাস্টমার'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <button
                    onClick={() => toggleLogin(null)}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    লগআউট
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Demo Role Switcher */}
      <div className="max-w-7xl mx-auto mt-3 flex gap-2 text-xs flex-wrap">
        <span className="text-gray-500 py-1">Demo Role:</span>
        <button onClick={() => toggleLogin('customer')} className={`px-2 py-1 rounded ${userRole === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Customer</button>
        <button onClick={() => toggleLogin('vendor')} className={`px-2 py-1 rounded ${userRole === 'vendor' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Vendor</button>
        <button onClick={() => toggleLogin('admin')} className={`px-2 py-1 rounded ${userRole === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>Admin</button>
        <button onClick={() => toggleLogin(null)} className={`px-2 py-1 rounded ${!userRole ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}>Logout</button>
      </div>
    </nav>
  );
}
