'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  orderId: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'পেমেন্ট ব্যর্থ হয়েছে');
      toast.error(error.message || 'পেমেন্ট ব্যর্থ হয়েছে');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded
      setMessage('পেমেন্ট সফল হয়েছে!');
      toast.success('পেমেন্ট সফল হয়েছে!');

      // Clear the stored order ID
      localStorage.removeItem('pendingOrderId');

      // Redirect to success page
      setTimeout(() => {
        router.push('/marketplace?payment=success');
      }, 2000);
    } else {
      setMessage('অপ্রত্যাশিত ত্রুটি ঘটেছে');
      toast.error('অপ্রত্যাশিত ত্রুটি ঘটেছে');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          বিলিং তথ্য
        </label>
        <AddressElement
          options={{
            mode: 'billing',
            allowedCountries: ['BD'], // Bangladesh
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          পেমেন্ট তথ্য
        </label>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('সফল') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <button
        disabled={!stripe || isLoading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            প্রসেসিং...
          </>
        ) : (
          <>
            💳 পেমেন্ট সম্পন্ন করুন
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        আপনার পেমেন্ট তথ্য Stripe এর মাধ্যমে সুরক্ষিতভাবে প্রসেস করা হয়
      </p>
    </form>
  );
};

export default CheckoutForm;