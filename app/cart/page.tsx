'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Token is sent via cookies automatically

      if (!token) {
        router.push('/login');
        return;
      }

      // Create order with cart items
      await api.createOrder({
        items: items.map(item => ({
          produceId: item.productId,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity
        })),
        totalAmount: total
      });

      clearCart();
      alert('✅ অর্ডার সফলভাবে করা হয়েছে!');
      router.push('/orders');

    } catch (error) {
      console.error('Checkout error:', error);
      alert('অর্ডার করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center bg-gray-900 rounded-2xl shadow-lg p-12 max-w-md">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-[#39FF14] mb-4">কার্ট খালি</h1>
          <p className="text-gray-400 mb-8 text-lg">আপনার কার্টে কোনো প্রোডাক্ট নেই</p>
          <button
            onClick={() => router.push('/products')}
            className="px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black rounded-xl hover:from-[#28CC0C] hover:to-[#39FF14] transition-all duration-200 shadow-md hover:shadow-lg font-medium text-lg"
          >
            🛍️ প্রোডাক্ট দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#39FF14] mb-4">
            🛒 আমার কার্ট
          </h1>
          <p className="text-lg text-gray-400">আপনার নির্বাচিত প্রোডাক্টসমূহ</p>
        </div>

        <div className="space-y-6 mb-10">
          {items.map((item) => (
            <div key={item.productId} className="bg-gray-900 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-700">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-5xl">🥬</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-[#39FF14] mb-2">{item.name}</h3>
                  <p className="text-xl text-[#39FF14] font-semibold">
                    ৳ {item.price} {item.unit ? `প্রতি ${item.unit}` : 'প্রতি ইউনিট'}
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 shadow-sm transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-300" />
                  </button>
                  <span className="w-12 text-center font-bold text-xl text-[#39FF14]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 shadow-sm transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#39FF14]">
                    ৳ {item.price * item.quantity}
                  </p>
                  <p className="text-sm text-gray-400">সর্বমোট</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-3 text-red-400 hover:bg-red-900 rounded-xl transition-colors"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <span className="text-2xl text-gray-300 font-medium">মোট পরিমাণ</span>
            <span className="text-4xl font-bold text-[#39FF14]">
              ৳ {total}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-[#39FF14] to-[#28CC0C] text-black text-2xl font-bold rounded-2xl hover:from-[#28CC0C] hover:to-[#39FF14] disabled:from-gray-600 disabled:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? '⏳ প্রসেস হচ্ছে...' : '✅ অর্ডার কনফার্ম করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}
