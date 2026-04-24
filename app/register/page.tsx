'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../lib/api';

type UserRole = 'Customer' | 'Vendor' | 'Admin';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Customer');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      let userData: any = { name, email, password, role };

      if (role === 'Vendor') {
        userData.farmName = farmName;
        userData.farmLocation = farmLocation;
      } else if (role === 'Admin') {
        userData.adminCode = adminCode;
      }

      const response = await api.register(userData);

      if (!response.success) {
        throw new Error(response.message || 'রেজিস্ট্রেশন করা যাচ্ছে না');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রেজিস্ট্রেশন ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline">← হোম পেজে ফিরে যান</Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">রেজিস্ট্রেশন করুন</h2>
          <p className="mt-2 text-center text-sm text-gray-600">কাস্টমার, ভেন্ডর বা অ্যাডমিন হিসেবে রেজিস্ট্রেশন করুন</p>
        </div>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            রেজিস্ট্রেশন সফল! লগইন পেজে যাচ্ছে...
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">রোল নির্বাচন করুন</label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                >
                  <option value="Customer">কাস্টমার (Customer)</option>
                  <option value="Vendor">ভেন্ডর (Urban Farmer)</option>
                  <option value="Admin">অ্যাডমিন (Admin)</option>
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="আপনার নাম"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="আপনার ইমেইল"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="আপনার পাসওয়ার্ড"
                />
              </div>

              {role === 'Vendor' && (
                <>
                  <div>
                    <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">ফার্মের নাম</label>
                    <input
                      id="farmName"
                      name="farmName"
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="আপনার ফার্মের নাম"
                    />
                  </div>

                  <div>
                    <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700 mb-1">ফার্মের অবস্থান</label>
                    <input
                      id="farmLocation"
                      name="farmLocation"
                      type="text"
                      required
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="ফার্মের অবস্থান (শহর, জেলা)"
                    />
                  </div>
                </>
              )}

              {role === 'Admin' && (
                <div>
                  <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-1">অ্যাডমিন কোড</label>
                  <input
                    id="adminCode"
                    name="adminCode"
                    type="password"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="অ্যাডমিন রেজিস্ট্রেশন কোড"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {loading ? 'লোড হচ্ছে...' : 'রেজিস্ট্রেশন'}
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:underline text-sm">
                ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
