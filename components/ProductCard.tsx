'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  is_featured: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono uppercase">
            No Image
          </div>
        )}

        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
            Featured
          </span>
        )}

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300" />
      </Link>

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
