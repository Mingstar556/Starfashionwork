'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import Navbar from '@/components/Navbar';
import { ShieldCheck, ArrowRight, Loader2, QrCode, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCartStore();

  const [telegramName, setTelegramName] = useState('');
  const [telegramPhone, setTelegramPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'KHQR'>('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const khqrImageUrl = process.env.NEXT_PUBLIC_KHQR_IMAGE_URL || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramName || !telegramPhone || !address) {
      setError('Please fill in all contact and delivery details.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_name: telegramName,
          telegram_phone: telegramPhone,
          address,
          items,
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      clearCart();
      router.push(`/order/${data.orderId}`);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider">Your Cart is Empty</h2>
          <p className="text-zinc-500 text-sm">Add items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-mono uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Customer & Payment Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">1. Delivery Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Telegram Username</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-zinc-100 dark:bg-zinc-900 border border-r-0 border-zinc-300 dark:border-zinc-700 text-zinc-500 text-sm font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={telegramName}
                      onChange={(e) => setTelegramName(e.target.value)}
                      className="flex-1 px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Telegram Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+855 12 345 678"
                    value={telegramPhone}
                    onChange={(e) => setTelegramPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Street address, apartment, city, postal code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">2. Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'COD'
                      ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Truck className="w-5 h-5 mb-2" />
                  <div>
                    <div className="text-sm font-bold uppercase">Cash on Delivery</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Pay when order arrives</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('KHQR')}
                  className={`p-4 border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'KHQR'
                      ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-2" />
                  <div>
                    <div className="text-sm font-bold uppercase">KHQR Scan</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Scan QR code to pay</div>
                  </div>
                </button>
              </div>

              {paymentMethod === 'KHQR' && (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-4">
                  <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    Scan the KHQR code below using your banking app. Once paid, submit order for Telegram approval.
                  </p>
                  <div className="w-48 h-48 bg-white p-2 shadow-md">
                    <img src={khqrImageUrl} alt="KHQR Code" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">STARFASHION KHQR MERCHANT</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-4">
                Order Summary ({items.length} items)
              </h2>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover" />
                      <div>
                        <p className="font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-zinc-500 uppercase font-mono">
                          Size: {item.size} | Qty: {item.qty}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono">${cartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Shipping</span>
                  <span className="font-mono">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Total</span>
                  <span className="font-mono">${cartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Order...
                  </>
                ) : (
                  <>
                    Complete Order & Notify Telegram <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-zinc-400 text-[10px] uppercase font-mono">
                <ShieldCheck className="w-4 h-4" /> Secure Telegram Bot Verification
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
