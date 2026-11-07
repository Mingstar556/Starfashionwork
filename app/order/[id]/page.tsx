'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { CheckCircle2, Clock, XCircle, ArrowRight, Package } from 'lucide-react';

interface Order {
  id: string;
  telegram_name: string;
  telegram_phone: string;
  address: string;
  items: Array<{ name: string; size: string; qty: number; price: number; image?: string }>;
  total_price: number;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

      if (!error && data) {
        setOrder(data);
      } else {
        // Fallback mock order if not found in DB
        setOrder({
          id: id,
          telegram_name: 'starboy',
          telegram_phone: '+855 12 345 678',
          address: '#123, Monivong Blvd, Phnom Penh',
          items: [
            { name: 'Starboy Oversized Heavyweight Hoodie', size: 'L', qty: 1, price: 120 },
          ],
          total_price: 120,
          payment_method: 'COD',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    }

    if (id) {
      fetchOrder();
    }

    // Poll for status updates so admin approval/rejection from Telegram reflects immediately
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!error && data) {
          setOrder(data);
          if (data.status !== 'pending') {
            clearInterval(pollInterval);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 2500);

    // Set up realtime subscription fallback
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload: any) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-1/2 mx-auto" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-center py-32">
        <h2 className="text-xl font-bold uppercase">Order Not Found</h2>
        <button onClick={() => router.push('/')} className="mt-4 underline text-xs font-bold uppercase tracking-widest">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-zinc-50 dark:bg-zinc-900 p-8 sm:p-12 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-xl">
          {/* Header Status */}
          <div className="flex flex-col items-center text-center space-y-4 pb-8 border-b border-zinc-200 dark:border-zinc-800">
            {order.status === 'pending' && (
              <>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-600 font-bold">
                    Pending Telegram Approval
                  </span>
                  <h1 className="text-2xl font-black uppercase tracking-tight mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                  <p className="text-xs text-zinc-500 mt-2 max-w-md">
                    Your order has been sent to our Telegram bot for verification. Once approved by our team, fulfillment will begin immediately.
                  </p>
                </div>
              </>
            )}

            {order.status === 'approved' && (
              <>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">
                    Order Approved & Confirmed
                  </span>
                  <h1 className="text-2xl font-black uppercase tracking-tight mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                  <p className="text-xs text-zinc-500 mt-2 max-w-md">
                    Your order has been verified and approved via Telegram. We are preparing your items for shipment!
                  </p>
                </div>
              </>
            )}

            {order.status === 'rejected' && (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-red-600 font-bold">
                    Order Rejected
                  </span>
                  <h1 className="text-2xl font-black uppercase tracking-tight mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                  <p className="text-xs text-zinc-500 mt-2 max-w-md">
                    Unfortunately, this order was rejected or could not be verified. Please contact support via Telegram.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400">Customer</span>
              <p className="font-semibold mt-0.5 font-mono">@{order.telegram_name}</p>
              <p className="text-zinc-500 font-mono text-xs">{order.telegram_phone}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400">Delivery Address</span>
              <p className="font-semibold mt-0.5">{order.address}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400">Payment Method</span>
              <p className="font-semibold mt-0.5 uppercase font-mono">{order.payment_method}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400">Order Date</span>
              <p className="font-semibold mt-0.5 font-mono">
                {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Package className="w-4 h-4" /> Ordered Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-zinc-500 uppercase font-mono">
                      Size: {item.size} | Qty: {item.qty}
                    </p>
                  </div>
                  <span className="font-mono font-bold">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800 text-base font-bold">
              <span>Total</span>
              <span className="font-mono text-xl">${order.total_price.toFixed(2)}</span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-6">
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-95 transition"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
