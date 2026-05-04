'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

export default function VendorSpacesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vendor/rentals');
  }, [router]);

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-sm p-10">
        <Building2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Rental Management</h1>
        <p className="text-gray-600 mb-6">
          আপনাকে vendor rental management page-এ নেওয়া হচ্ছে।
        </p>
        <Link
          href="/vendor/rentals"
          className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Go To Vendor Rentals
        </Link>
      </div>
    </div>
  );
}
