'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Layers, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import CartDrawer from './CartDrawer';

export default function MobileBottomNav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useCartStore((state) => state.cartCount());

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
        </Link>
        <Link href="/?category=starboy" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Shop</span>
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 bg-black dark:bg-white text-white dark:text-black text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Cart</span>
        </button>
        <Link href="/admin" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Admin</span>
        </Link>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
