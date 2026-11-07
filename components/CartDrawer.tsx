'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQty, cartTotal } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-wider uppercase">Your Cart ({items.length})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-500">
                  <ShoppingBag className="w-16 h-16 stroke-1" />
                  <p className="text-sm tracking-wide">Your cart is empty.</p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-none hover:opacity-80 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-900"
                  >
                    <div className="relative w-20 h-24 bg-zinc-100 dark:bg-zinc-900 flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-semibold tracking-wide line-clamp-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-zinc-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 uppercase font-medium">
                          Size: {item.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-zinc-300 dark:border-zinc-700">
                          <button
                            onClick={() => updateQty(item.id, item.size, item.qty - 1)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-mono">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-mono font-bold">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 uppercase tracking-wider text-xs">Subtotal</span>
                  <span className="font-mono font-bold text-lg">${cartTotal().toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Shipping & taxes calculated at checkout. Telegram order verification.
                </p>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
