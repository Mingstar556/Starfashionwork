'use client';

import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { ShoppingCart, Clock, DollarSign, ArrowUpRight, TrendingUp, TrendingDown, Package, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  telegram_name: string;
  total_price: number;
  status: string;
  created_at: string;
  items?: any[];
}

interface Product {
  id: string;
  price: number;
  cost_price?: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [ordRes, prodRes] = await Promise.all([
        supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('products').select('*')
      ]);
      if (!ordRes.error && ordRes.data) setOrders(ordRes.data);
      if (!prodRes.error && prodRes.data) setProducts(prodRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Estimate cost of goods sold / outcome (approx 45% of revenue or custom cost)
  const totalOutcome = totalRevenue * 0.45;
  const netProfit = totalRevenue - totalOutcome;

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length;

  // Monthly breakdown calculation
  const monthlyData: { [key: string]: { income: number; outcome: number; ordersCount: number } } = {};
  approvedOrders.forEach((order) => {
    const date = new Date(order.created_at);
    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, outcome: 0, ordersCount: 0 };
    }
    monthlyData[monthKey].income += order.total_price;
    monthlyData[monthKey].outcome += order.total_price * 0.45;
    monthlyData[monthKey].ordersCount += 1;
  });

  return (
    <div className="space-y-8 animate-fade-in transition-all duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Admin Command Center</h1>
          </div>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono mt-1">
            StarFashion Live Analytics, Orders, and Financial Metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-lg"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/90 backdrop-blur p-6 border border-zinc-800 space-y-3 hover:border-emerald-500/50 transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-widest">Total Income</span>
            <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white">${totalRevenue.toFixed(2)}</div>
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Approved Sales Revenue</div>
        </div>

        <div className="bg-zinc-900/90 backdrop-blur p-6 border border-zinc-800 space-y-3 hover:border-red-500/50 transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-widest">Total Outcome (COGS)</span>
            <div className="p-2 bg-red-950/60 text-red-400 rounded group-hover:scale-110 transition">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white">${totalOutcome.toFixed(2)}</div>
          <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Estimated Production Expenses</div>
        </div>

        <div className="bg-zinc-900/90 backdrop-blur p-6 border border-zinc-800 space-y-3 hover:border-amber-500/50 transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-widest">Pending Orders</span>
            <div className="p-2 bg-amber-950/60 text-amber-400 rounded group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white">{pendingCount}</div>
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Awaiting Telegram Approval</div>
        </div>

        <div className="bg-zinc-900/90 backdrop-blur p-6 border border-zinc-800 space-y-3 hover:border-blue-500/50 transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-widest">Net Profit</span>
            <div className="p-2 bg-blue-950/60 text-blue-400 rounded group-hover:scale-110 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white">${netProfit.toFixed(2)}</div>
          <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Income minus Outcome</div>
        </div>
      </div>

      {/* Monthly Buy & Sell / Income & Outcome Analytics */}
      <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Monthly Buy & Sell / Income vs Outcome</h2>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-0.5">Financial performance grouped by month</p>
          </div>
          <Activity className="w-5 h-5 text-zinc-400 animate-pulse" />
        </div>

        {Object.keys(monthlyData).length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-zinc-500 uppercase">No approved monthly financial data yet.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(monthlyData).map(([month, data]) => {
              const profit = data.income - data.outcome;
              const margin = data.income > 0 ? (profit / data.income) * 100 : 0;
              return (
                <div key={month} className="bg-zinc-950 p-6 border border-zinc-800 space-y-4 hover:border-zinc-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white uppercase">{month}</span>
                    <span className="text-xs font-mono px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {data.ordersCount} Orders Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px] uppercase">Income (Sell)</span>
                      <span className="text-emerald-400 text-lg font-bold">${data.income.toFixed(2)}</span>
                    </div>
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px] uppercase">Outcome (Buy/COGS)</span>
                      <span className="text-red-400 text-lg font-bold">${data.outcome.toFixed(2)}</span>
                    </div>
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px] uppercase">Net Profit Margin ({margin.toFixed(0)}%)</span>
                      <span className="text-blue-400 text-lg font-bold">${profit.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                      <span>Outcome Ratio (45%)</span>
                      <span>Income Ratio (100%)</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-900 overflow-hidden flex rounded">
                      <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Recent Orders Feed</h2>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-0.5">Latest customer transactions</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider underline flex items-center gap-1 text-white hover:text-zinc-300">
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
              <thead className="bg-zinc-950 text-xs font-mono uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Telegram</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tracking</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono text-xs">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/50 transition">
                    <td className="p-4 font-bold text-white">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-zinc-300">@{order.telegram_name}</td>
                    <td className="p-4 font-bold text-white">${order.total_price.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : order.status === 'rejected'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">
                      {(order as any).tracking_number ? (
                        <span className="text-blue-400 font-bold">{(order as any).tracking_number}</span>
                      ) : (
                        <span className="text-zinc-600">Not assigned</span>
                      )}
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
