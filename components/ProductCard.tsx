'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  sizes?: string[];
  stock?: number;
  is_featured: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  onOpenCart?: () => void;
}

export default function ProductCard({ product, index = 0, onOpenCart }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    const availableStock = product.stock ?? 10;

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images || [],
      },
      selectedSize,
      1,
      availableStock
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    if (onOpenCart) {
      onOpenCart();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="group flex flex-col"
    >
      <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-sm">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono uppercase">
              No Image
            </div>
          )}

          {product.is_featured && (
            <span className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-md z-10">
              Featured
            </span>
          )}

          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Small Circle Shortcut Button with '+' in the middle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleQuickAdd}
          aria-label="Add item to cart"
          title="Quick add to cart"
          className={`absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 border ${
            added
              ? 'bg-emerald-500 border-emerald-400 text-white'
              : 'bg-white text-zinc-950 border-zinc-200 hover:bg-black hover:text-white dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-white dark:hover:text-black'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="mt-4 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
            {product.category}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100 mt-1 hover:underline line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
            ${product.price.toFixed(2)}
          </span>
          <Link
            href={`/product/${product.id}`}
            className="text-xs font-bold uppercase tracking-wider underline hover:opacity-70 transition"
          >
            View →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
