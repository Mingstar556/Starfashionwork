'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import CartDrawer from '@/components/CartDrawer';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  stock: number;
  is_featured: boolean;
}

interface StoreSettings {
  banner_images: string[];
  announcement_text: string;
  is_store_open: boolean;
  categories?: string[];
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<StoreSettings>({
    banner_images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    ],
    announcement_text: '⚡ FREE WORLDWIDE SHIPPING ON ORDERS OVER $150 | USE CODE: STAR10',
    is_store_open: true,
    categories: ['Starboy', 'Old Money', 'Casual', 'Streetwear'],
  });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = useCartStore((state) => state.cartCount());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (settingsData) {
        setSettings(settingsData);
      }

      let query = supabase.from('products').select('*');
      if (currentCategory !== 'all') {
        query = query.eq('category', currentCategory);
      }

      const { data: productData, error } = await query.order('created_at', { ascending: false });
      if (!error && productData && productData.length > 0) {
        setProducts(productData);
      } else {
        setProducts([
          {
            id: 'mock-1',
            name: 'Starboy Oversized Heavyweight Hoodie',
            description: 'Premium French terry cotton, acid wash finish, custom metal hardware.',
            price: 120,
            category: 'starboy',
            images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'],
            sizes: ['S', 'M', 'L', 'XL'],
            stock: 15,
            is_featured: true,
          },
          {
            id: 'mock-2',
            name: 'Old Money Cashmere Blend Turtleneck',
            description: 'Ultra-luxurious merino wool and cashmere blend for timeless elegance.',
            price: 185,
            category: 'old_money',
            images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'],
            sizes: ['M', 'L', 'XL'],
            stock: 8,
            is_featured: true,
          },
          {
            id: 'mock-3',
            name: 'Cyberpunk Techwear Cargo Pants',
            description: 'Multi-pocket utilitarian design with adjustable straps and water-resistant fabric.',
            price: 145,
            category: 'streetwear',
            images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop'],
            sizes: ['S', 'M', 'L'],
            stock: 12,
            is_featured: false,
          },
          {
            id: 'mock-4',
            name: 'Minimalist Relaxed Fit Linen Shirt',
            description: 'Breathable organic linen tailored for effortless casual sophistication.',
            price: 90,
            category: 'casual',
            images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'],
            sizes: ['S', 'M', 'L', 'XL'],
            stock: 20,
            is_featured: false,
          },
        ]);
      }
      setLoading(false);
    }

    fetchData();
  }, [currentCategory]);

  useEffect(() => {
    if (!settings.banner_images || settings.banner_images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % settings.banner_images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [settings.banner_images]);

  const dynamicCategories = settings.categories && settings.categories.length > 0
    ? settings.categories
    : ['Starboy', 'Old Money', 'Casual', 'Streetwear'];

  const categories = [
    { label: 'All', value: 'all' },
    ...dynamicCategories.map((c) => ({
      label: c,
      value: c.toLowerCase().trim().replace(/\s+/g, '_'),
    })),
  ];

  const handleCategoryChange = (val: string) => {
    const url = val === 'all' ? '/' : `/?category=${val}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 md:pb-0">
      {/* Announcement Bar */}
      <div className="bg-black text-white dark:bg-white dark:text-black py-2.5 px-4 text-center text-xs font-mono font-bold tracking-widest uppercase overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={settings.announcement_text}
        >
          {settings.announcement_text}
        </motion.div>
      </div>

      <Navbar categories={dynamicCategories} />

      {/* Hero Banner */}
      {settings.banner_images && settings.banner_images.length > 0 && (
        <section className="relative w-full h-[65vh] sm:h-[75vh] bg-zinc-900 overflow-hidden">
          {settings.banner_images.map((img, idx) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: idx === currentBannerIndex ? 1 : 0, scale: idx === currentBannerIndex ? 1 : 1.05 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <img src={img} alt="Hero Banner" loading="eager" className="w-full h-full object-cover opacity-75" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-8 sm:p-16 max-w-7xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xs font-mono uppercase tracking-widest text-zinc-300 mb-2"
            >
              Spring / Summer 2026 Collection
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-3xl sm:text-6xl font-black uppercase tracking-tighter text-white max-w-2xl leading-none"
            >
              Redefining Modern Luxury & Streetwear
            </motion.h1>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex overflow-x-auto space-x-2 pb-4 mb-12 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none"
        >
          {categories.map((cat) => {
            const isActive = currentCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Product Grid / Skeleton with Smooth Transition */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="flex flex-col space-y-3 animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-800 w-full rounded-sm" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-3/4" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-1/2" />
                </div>
              ))}
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 space-y-4"
            >
              <p className="text-zinc-500 uppercase tracking-widest text-sm">No products found in this category.</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
            >
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Cart Button for Mobile */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 px-6 pointer-events-none">
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs flex items-center justify-between px-6 shadow-2xl rounded-full"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart ({cartCount})</span>
              </div>
              <span className="font-mono">Open →</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-mono">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">STARFASHION</span>
              <span>— Modern Editorial Luxury & Streetwear</span>
            </div>
            <p>© 2026 Star Fashion Brand. All rights reserved. Protected under Commercial Enterprise & Copyright License.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/checkout" className="hover:text-zinc-900 dark:hover:text-white transition">
              Checkout & Paygate
            </Link>
            <span className="text-emerald-500 font-bold">🔒 Firewall & SSL Secured</span>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-2 border-white rounded-full animate-spin border-t-transparent" />
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Loading StarFashion...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
