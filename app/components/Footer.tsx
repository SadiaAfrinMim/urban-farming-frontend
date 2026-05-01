'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-md border-t border-gray-700/50 text-white py-12 sm:py-16 mt-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#39FF14]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#39FF14]/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-[#39FF14] hover:scale-105 transition-transform duration-300">🌱 অর্বান ফার্মিং</h3>
            <p className="text-gray-300 mb-6 text-base sm:text-lg leading-relaxed">
              সিটি লাইফের জন্য স্থায়ী এবং টেকসই কৃষি সমাধান। তাজা শাকসবজি এবং কমিউনিটি গার্ডেনিংয়ের মাধ্যমে শহরকে সবুজ করে তুলুন।
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <a href="#" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[#39FF14] hover:text-white transition-colors duration-200">দ্রুত লিংক</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/marketplace" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">🛍️ মার্কেটপ্লেস</Link></li>
              <li><Link href="/rentals" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">🌱 রেন্টাল স্পেস</Link></li>
              <li><Link href="/community" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">👥 কমিউনিটি</Link></li>
              <li><Link href="/sustainability" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">🌍 সাস্টেইনেবিলিটি</Link></li>
              <li><Link href="/plants" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">📚 প্ল্যান্ট গাইড</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[#39FF14] hover:text-white transition-colors duration-200">সাপোর্ট</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/help" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">🆘 হেল্প সেন্টার</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">📞 যোগাযোগ</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">❓ FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">🔒 প্রাইভেসি পলিসি</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-[#39FF14] transition-all duration-200 hover:translate-x-1 inline-block">📋 টার্মস অফ সার্ভিস</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600/50 mt-12 sm:mt-16 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {new Date().getFullYear()} অর্বান ফার্মিং। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p className="text-[#39FF14] text-sm text-center sm:text-right font-medium hover:text-white transition-colors duration-200">
              শহরকে সবুজ করে তুলুন, একটি করে প্লট।
            </p>
          </div>

          {/* Additional decorative elements */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}