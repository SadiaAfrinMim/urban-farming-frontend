'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, loading } = useAuth();

  const fillAdminCredentials = () => {
    setEmail('admin@example.com');
    setPassword('password123');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'লগইন ব্যর্থ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="text-[#39FF14] hover:text-[#28CC0C] hover:underline">← হোম পেজে ফিরে যান</Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-[#39FF14]">লগইন করুন</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">ইমেইল</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 focus:outline-none focus:ring-[#39FF14] focus:border-[#39FF14] focus:z-10 sm:text-sm"
                placeholder="আপনার ইমেইল"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">পাসওয়ার্ড</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 focus:outline-none focus:ring-[#39FF14] focus:border-[#39FF14] focus:z-10 sm:text-sm"
                placeholder="আপনার পাসওয়ার্ড"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="text-sm text-[#39FF14] hover:text-[#28CC0C] underline"
            >
              Admin Login (Auto-fill)
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#39FF14] hover:bg-[#28CC0C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39FF14] disabled:bg-gray-600"
            >
              {loading ? 'লোড হচ্ছে...' : 'লগইন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
