'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.cartCount());

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-zinc-800 dark:text-zinc-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter uppercase font-mono">
              STARFASHION
            </span>
            <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">
              Home
            </Link>
            <Link href="/?category=starboy" className="hover:text-black dark:hover:text-white transition">
              Starboy
            </Link>
            <Link href="/?category=old_money" className="hover:text-black dark:hover:text-white transition">
              Old Money
            </Link>
            <Link href="/?category=streetwear" className="hover:text-black dark:hover:text-white transition">
              Streetwear
            </Link>
            <Link href="/?category=casual" className="hover:text-black dark:hover:text-white transition">
              Casual
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-6 space-y-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200"
            >
              All Products
            </Link>
            <Link
              href="/?category=starboy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200"
            >
              Starboy Collection
            </Link>
            <Link
              href="/?category=old_money"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200"
            >
              Old Money Collection
            </Link>
            <Link
              href="/?category=streetwear"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200"
            >
              Streetwear
            </Link>
            <Link
              href="/?category=casual"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200"
            >
              Casual Wear
            </Link>
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
