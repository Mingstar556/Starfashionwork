'use client';

import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Plus, Trash2, Edit, X, Loader2, Upload, FileText, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  category: string;
  images: string[];
  sizes: string[];
  stock: number;
  is_featured: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState('starboy');
  const [imagesInput, setImagesInput] = useState('');
  const [sizesInput, setSizesInput] = useState('S, M, L, XL');
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk Upload state
  const [bulkInput, setBulkInput] = useState(
    JSON.stringify(
      [
        {
          name: "Starboy Cyber Jacket",
          description: "High-tech weatherproof shell with LED accents.",
          price: 195,
          cost_price: 85,
          category: "starboy",
          images: ["https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop"],
          sizes: ["S", "M", "L", "XL"],
          stock: 15,
          is_featured: true
        }
      ],
      null,
      2
    )
  );
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCostPrice('');
    setCategory('starboy');
    setImagesInput('');
    setSizesInput('S, M, L, XL');
    setStock('10');
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price.toString());
    setCostPrice((prod.cost_price || prod.price * 0.5).toString());
    setCategory(prod.category);
    setImagesInput(prod.images.join(', '));
    setSizesInput(prod.sizes.join(', '));
    setStock(prod.stock.toString());
    setIsFeatured(prod.is_featured);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Failed to delete product');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const images = imagesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const sizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload = {
      name,
      description,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || (parseFloat(price) || 0) * 0.5,
      category,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'],
      sizes,
      stock: parseInt(stock, 10) || 0,
      is_featured: isFeatured,
    };

    if (editingId) {
      const { error } = await supabaseAdmin.from('products').update(productPayload).eq('id', editingId);
      if (!error) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert('Failed to update product');
      }
    } else {
      const { error } = await supabaseAdmin.from('products').insert([productPayload]);
      if (!error) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert('Failed to create product');
      }
    }
    setSubmitting(false);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      const parsedItems = JSON.parse(bulkInput);
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: true, items: parsedItems }),
      });
      const data = await res.json();
      if (data.success) {
        setIsBulkModalOpen(false);
        fetchProducts();
        alert(`Successfully bulk uploaded ${data.count} products!`);
      } else {
        alert('Bulk upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Invalid JSON format for bulk upload: ' + err.message);
    }
    setBulkSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Product Management</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono mt-1">Add, edit, bulk upload, or remove store inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-5 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-zinc-800 transition shadow-lg"
          >
            <Upload className="w-4 h-4 text-emerald-400" /> Bulk Upload
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-white text-zinc-950 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-90 transition shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs animate-pulse">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center font-mono text-xs text-zinc-500 uppercase">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition duration-300 shadow-xl group"
            >
              <div>
                <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">No Image</div>
                  )}
                  {product.is_featured && (
                    <span className="absolute top-3 left-3 bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 shadow">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">{product.category}</span>
                  <h3 className="font-bold text-sm line-clamp-1 text-white">{product.name}</h3>
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-sm text-emerald-400">${product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500">Cost: ${product.cost_price ? product.cost_price.toFixed(2) : (product.price * 0.5).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">Stock: {product.stock} | Sizes: {product.sizes.join(', ')}</p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-2 border-t border-zinc-800 mt-4">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition text-white"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2.5 bg-red-950 text-red-400 hover:bg-red-900 transition border border-red-900/50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 max-w-xl w-full p-8 border border-zinc-800 shadow-2xl space-y-6 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Cost Price / Buy ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white uppercase"
                  >
                    <option value="starboy">Starboy</option>
                    <option value="old_money">Old Money</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="casual">Casual</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-white text-white"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="font-bold uppercase tracking-wider text-white">Featured Product</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-zinc-800 text-white font-bold uppercase tracking-wider hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider hover:opacity-95 transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 max-w-2xl w-full p-8 border border-zinc-800 shadow-2xl space-y-6 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-black uppercase tracking-wider text-white">Bulk Upload Products (JSON)</h2>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 text-zinc-300">
                  Paste JSON Array of Products
                </label>
                <textarea
                  rows={12}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-xs font-mono focus:outline-none focus:border-white text-emerald-300"
                />
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-400 space-y-1">
                <p className="font-bold text-white uppercase">Format Requirements:</p>
                <p>An array of objects containing: <code className="text-emerald-400">name, description, price, cost_price, category, images (array), sizes (array), stock, is_featured</code>.</p>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-6 py-3 bg-zinc-800 text-white font-bold uppercase tracking-wider hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitting}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold uppercase tracking-wider hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  {bulkSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Upload All Products
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
