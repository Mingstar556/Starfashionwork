'use client';

import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Check, X, Edit, Truck, Package, Clock, ExternalLink, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  telegram_name: string;
  telegram_phone: string;
  address: string;
  items: Array<{ name: string; size: string; qty: number; price: number }>;
  total_price: number;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_status?: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Edit Order Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editTelegramName, setEditTelegramName] = useState('');
  const [editTelegramPhone, setEditTelegramPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTotalPrice, setEditTotalPrice] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editShippingCarrier, setEditShippingCarrier] = useState('DHL Express');
  const [editShippingStatus, setEditShippingStatus] = useState<'processing' | 'shipped' | 'out_for_delivery' | 'delivered'>('processing');
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    const { data, error } = await query;
    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }

  const updateOrderStatus = async (orderId: string, newStatus: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
    } else {
      alert('Failed to update order status');
    }
  };

  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditTelegramName(order.telegram_name || '');
    setEditTelegramPhone(order.telegram_phone || '');
    setEditAddress(order.address || '');
    setEditTotalPrice(order.total_price.toString());
    setEditTrackingNumber(order.tracking_number || '');
    setEditShippingCarrier(order.shipping_carrier || 'DHL Express');
    setEditShippingStatus(order.shipping_status || 'processing');
    setEditStatus(order.status || 'pending');
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);

    const payload = {
      id: selectedOrder.id,
      telegram_name: editTelegramName,
      telegram_phone: editTelegramPhone,
      address: editAddress,
      total_price: parseFloat(editTotalPrice) || selectedOrder.total_price,
      tracking_number: editTrackingNumber,
      shipping_carrier: editShippingCarrier,
      shipping_status: editShippingStatus,
      status: editStatus,
    };

    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setIsEditModalOpen(false);
      fetchOrders();
    } else {
      alert('Failed to update order');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Orders & Tracking Management</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono mt-1">Review, edit, track shipments, and approve orders</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition ${
                filter === status
                  ? 'bg-white text-zinc-950 shadow-lg'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs animate-pulse">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center font-mono text-xs text-zinc-500 uppercase">No orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-zinc-900 p-6 border border-zinc-800 flex flex-col lg:flex-row justify-between gap-6 hover:border-zinc-700 transition duration-300 shadow-xl"
            >
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-mono font-bold text-sm text-white">#{order.id.slice(0, 8).toUpperCase()}</span>
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
                  <span className="text-xs text-zinc-500 font-mono">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-400 bg-zinc-950 p-4 border border-zinc-800">
                  <div>
                    <p>
                      <strong className="text-zinc-200">Customer:</strong> @{order.telegram_name}
                    </p>
                    <p>
                      <strong className="text-zinc-200">Phone:</strong> {order.telegram_phone}
                    </p>
                    <p>
                      <strong className="text-zinc-200">Payment:</strong> {order.payment_method}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-zinc-200">Address:</strong> {order.address}
                    </p>
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span className="text-zinc-300 uppercase font-bold">
                        {order.shipping_carrier || 'DHL Express'}:{' '}
                        <span className="text-blue-400">{order.tracking_number || 'No Tracking #'}</span>
                      </span>
                    </div>
                    {order.shipping_status && (
                      <p className="mt-1 text-[10px] uppercase text-amber-400">
                        Shipping Status: <strong>{order.shipping_status.replace(/_/g, ' ')}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Ordered Items:</span>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="text-xs flex justify-between font-mono text-zinc-300 bg-zinc-950/50 p-2 border border-zinc-800/50">
                      <span>
                        • {item.name} (Size: {item.size}) x{item.qty}
                      </span>
                      <span className="font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-zinc-800 pt-4 lg:pt-0 lg:pl-6">
                <div className="text-right font-mono mb-4">
                  <span className="text-xs text-zinc-500 block uppercase">Total Amount</span>
                  <span className="text-2xl font-bold text-white">${order.total_price.toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-2 w-full lg:w-48">
                  <button
                    onClick={() => handleOpenEdit(order)}
                    className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit className="w-4 h-4" /> Edit & Tracking
                  </button>

                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'approved')}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'rejected')}
                      className="flex-1 px-3 py-2 bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 max-w-xl w-full p-8 border border-zinc-800 shadow-2xl space-y-6 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Edit Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Update customer details, status & shipping tracking</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Telegram Username</label>
                  <input
                    type="text"
                    required
                    value={editTelegramName}
                    onChange={(e) => setEditTelegramName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editTelegramPhone}
                    onChange={(e) => setEditTelegramPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white uppercase"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Total Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editTotalPrice}
                    onChange={(e) => setEditTotalPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" /> Shipping & Tracking Info
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Shipping Carrier</label>
                    <select
                      value={editShippingCarrier}
                      onChange={(e) => setEditShippingCarrier(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white uppercase"
                    >
                      <option value="DHL Express">DHL Express</option>
                      <option value="FedEx Global">FedEx Global</option>
                      <option value="EMS Priority">EMS Priority</option>
                      <option value="Local Express Delivery">Local Express Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Tracking Number</label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="e.g. TRK-98421037"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Shipping Status</label>
                  <select
                    value={editShippingStatus}
                    onChange={(e) => setEditShippingStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white uppercase"
                  >
                    <option value="processing">Processing / Packing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 bg-zinc-800 text-white font-bold uppercase tracking-wider hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider hover:opacity-95 transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Order & Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
