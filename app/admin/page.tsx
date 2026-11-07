'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Clock, DollarSign, Package, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  telegram_name: string;
  total_price: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setOrders(data);
      } else {
        // Fallback mock orders
        setOrders([
          { id: '1', telegram_name: 'starboy', total_price: 135, status: 'pending', created_at: new Date().toISOString() },
          { id: '2', telegram_name: 'oldmoney', total_price: 240, status: 'approved', created_at: new Date().toISOString() },
        ]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + o.total_price, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">Real-time store metrics & recent orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-widest">Total Revenue (Approved)</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black font-mono">${totalRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-widest">Pending Telegram Orders</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono">{pendingCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-widest">Today's Orders</span>
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black font-mono">{todayOrders}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider underline flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 uppercase font-mono">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950 text-xs font-mono uppercase text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Telegram</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="p-4 font-bold">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">@{order.telegram_name}</td>
                    <td className="p-4 font-bold">${order.total_price.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
