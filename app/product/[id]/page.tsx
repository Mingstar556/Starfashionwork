'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/lib/store/cartStore';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { ShoppingBag, ArrowLeft, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

      if (!error && data) {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }

        // Fetch related products
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(4);

        if (related) setRelatedProducts(related);
      } else {
        // Fallback mock data if not in DB
        const mockProduct: Product = {
          id: id,
          name: id === 'mock-1' ? 'Starboy Oversized Heavyweight Hoodie' : 'Exclusive Fashion Piece',
          description: 'Crafted from premium French terry cotton with custom distressed wash and metal hardware.',
          price: 135,
          category: 'starboy',
          images: [
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
          ],
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 10,
          is_featured: true,
        };
        setProduct(mockProduct);
        setSelectedSize(mockProduct.sizes[0]);
      }
      setLoading(false);
    }

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart(product, selectedSize, qty, product.stock);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-6">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-3/4" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 w-1/4" />
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-center py-32">
        <h2 className="text-xl font-bold uppercase">Product not found</h2>
        <button onClick={() => router.push('/')} className="mt-4 underline text-xs font-bold uppercase tracking-widest">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-24 flex-shrink-0 bg-zinc-100 dark:bg-zinc-955 border-2 transition ${
                      selectedImage === idx ? 'border-black dark:border-white' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  {product.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mt-1">
                  {product.name}
                </h1>
                <p className="text-xl font-mono font-bold mt-4">${product.price.toFixed(2)}</p>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 text-xs font-mono font-bold uppercase transition border ${
                          selectedSize === size
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Quantity</label>
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 w-32">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full py-5 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition shadow-lg ${
                  product.stock <= 0
                    ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-95'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart Successfully
                  </>
                ) : product.stock <= 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart — ${(product.price * qty).toFixed(2)}
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <div className="flex flex-col items-center space-y-1 text-zinc-500">
                  <Truck className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Express Shipping</span>
                </div>
                <div className="flex flex-col items-center space-y-1 text-zinc-500">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center space-y-1 text-zinc-500">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verified Authentic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel, idx) => (
                <ProductCard key={rel.id} product={rel} index={idx} />
              ))}
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
