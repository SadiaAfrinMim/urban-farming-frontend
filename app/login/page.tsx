'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#39FF14] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-black" />
          </div>
          <Link href="/" className="text-[#39FF14] hover:text-[#28CC0C] hover:underline text-sm">← হোম পেজে ফিরে যান</Link>
          <h2 className="mt-4 text-3xl font-bold text-[#39FF14]">লগইন করুন</h2>
          <p className="mt-2 text-sm text-gray-400">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>
        <form className="mt-8 space-y-6 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">ইমেইল</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition duration-200 sm:text-sm"
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
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition duration-200 sm:text-sm"
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#39FF14] hover:bg-[#28CC0C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39FF14] disabled:bg-gray-600 transition duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'লোড হচ্ছে...' : 'লগইন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
