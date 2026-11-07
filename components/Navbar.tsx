'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.cartCount());

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-zinc-800 dark:text-zinc-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="text-xl font-black tracking-tighter uppercase font-mono group-hover:opacity-80 transition"
            >
              STARFASHION
            </motion.span>
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            {['Home', 'Starboy', 'Old Money', 'Streetwear', 'Casual'].map((item, i) => {
              const href = item === 'Home' ? '/' : `/?category=${item.toLowerCase().replace(' ', '_')}`;
              return (
                <motion.div key={item} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link href={href} className="hover:text-black dark:hover:text-white transition">
                    {item}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-6 space-y-4 overflow-hidden"
            >
              {[
                { label: 'All Products', href: '/' },
                { label: 'Starboy Collection', href: '/?category=starboy' },
                { label: 'Old Money Collection', href: '/?category=old_money' },
                { label: 'Streetwear', href: '/?category=streetwear' },
                { label: 'Casual Wear', href: '/?category=casual' },
              ].map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200 py-1"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
