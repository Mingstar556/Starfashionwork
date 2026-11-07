'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Check } from 'lucide-react';

export default function AdminStorePage() {
  const [announcement, setAnnouncement] = useState('');
  const [bannersInput, setBannersInput] = useState('');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'main').single();
      if (!error && data) {
        setAnnouncement(data.announcement_text || '');
        setBannersInput((data.banner_images || []).join(', '));
        setIsStoreOpen(data.is_store_open ?? true);
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

    const { error } = await supabase
      .from('store_settings')
      .update({
        announcement_text: announcement,
        banner_images,
        is_store_open: isStoreOpen,
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

  if (loading) {
    return <div className="py-20 text-center font-mono text-xs animate-pulse">Loading store settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Store Settings</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">Manage announcements, banners, and store status</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-600 dark:text-emerald-400 text-xs font-mono uppercase flex items-center gap-2">
          <Check className="w-4 h-4" /> Store settings successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Announcement Bar Text</label>
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm font-mono focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Hero Banner Image URLs (comma-separated)</label>
          <textarea
            rows={4}
            value={bannersInput}
            onChange={(e) => setBannersInput(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-sm font-mono focus:outline-none focus:border-black dark:focus:border-white"
          />
          <p className="text-[11px] text-zinc-400 font-mono mt-1">These images will auto-slide in the storefront hero section.</p>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <input
            type="checkbox"
            id="storeOpen"
            checked={isStoreOpen}
            onChange={(e) => setIsStoreOpen(e.target.checked)}
            className="w-5 h-5 accent-black dark:accent-white"
          />
          <label htmlFor="storeOpen" className="text-xs font-bold uppercase tracking-wider">
            Store is Open for Orders
          </label>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
