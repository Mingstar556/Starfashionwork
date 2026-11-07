'use client';

import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Save, Loader2, Check, Send, Bot, ExternalLink } from 'lucide-react';

export default function AdminStorePage() {
  const [announcement, setAnnouncement] = useState('');
  const [bannersInput, setBannersInput] = useState('');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data, error } = await supabaseAdmin.from('store_settings').select('*').eq('id', 'main').single();
      if (!error && data) {
        setAnnouncement(data.announcement_text || '');
        setBannersInput((data.banner_images || []).join(', '));
        setIsStoreOpen(data.is_store_open ?? true);
        setTelegramChatId(data.admin_telegram_chat_id || '');
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const banner_images = bannersInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabaseAdmin
      .from('store_settings')
      .update({
        announcement_text: announcement,
        banner_images,
        is_store_open: isStoreOpen,
        admin_telegram_chat_id: telegramChatId.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main');

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Failed to update store settings');
    }
    setSaving(false);
  };

  const handleSendTestNotification = async () => {
    setTestingBot(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_name: 'test_buyer',
          telegram_phone: '+855 12 345 678',
          address: 'StarFashion Admin Test Order, Phnom Penh',
          items: [
            {
              name: 'Starboy Oversized Heavyweight Hoodie (Test)',
              size: 'L',
              qty: 1,
              price: 120,
            },
          ],
          payment_method: 'KHQR',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult('✅ Test receipt sent to Telegram! Check @Starfastionbot on your phone/desktop.');
      } else {
        setTestResult(`⚠️ ${data.error || 'Failed to send test notification. Is bot running?'}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message}`);
    }
    setTestingBot(false);
  };

  if (loading) {
    return <div className="py-20 text-center font-mono text-xs animate-pulse">Loading store settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Store Settings</h1>
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono mt-1">
          Manage announcements, banners, storefront status & Telegram notifications
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-mono uppercase flex items-center gap-2">
          <Check className="w-4 h-4" /> Store settings successfully updated!
        </div>
      )}

      {/* Telegram Bot Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Telegram Notification Bot</h2>
              <p className="text-[11px] text-zinc-400 font-mono">@Starfastionbot</p>
            </div>
          </div>
          <a
            href="https://t.me/Starfastionbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono rounded transition"
          >
            Open Bot in Telegram <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="block font-bold uppercase tracking-wider mb-2 text-zinc-300">
              Admin Telegram Chat ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Auto-detected when you send /start to bot"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm font-mono focus:outline-none focus:border-white text-white"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              💡 Tip: Open <a href="https://t.me/Starfastionbot" target="_blank" className="text-blue-400 underline">@Starfastionbot</a> and send <code className="bg-zinc-800 px-1 py-0.5 rounded text-white">/start</code> — your Chat ID will automatically link!
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={testingBot}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
            >
              {testingBot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Test Receipt to Telegram
            </button>
            {testResult && (
              <p className="mt-2 text-xs font-mono text-zinc-300 bg-zinc-950 p-3 border border-zinc-800">
                {testResult}
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Announcement Bar Text</label>
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm font-mono focus:outline-none focus:border-white text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">
            Hero Banner Image URLs (comma-separated)
          </label>
          <textarea
            rows={4}
            value={bannersInput}
            onChange={(e) => setBannersInput(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm font-mono focus:outline-none focus:border-white text-white"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
          <input
            type="checkbox"
            id="storeOpen"
            checked={isStoreOpen}
            onChange={(e) => setIsStoreOpen(e.target.checked)}
            className="w-5 h-5 accent-white"
          />
          <label htmlFor="storeOpen" className="text-xs font-bold uppercase tracking-wider">
            Store is Open for Orders
          </label>
        </div>

        <div className="pt-6 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 bg-white text-zinc-950 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
