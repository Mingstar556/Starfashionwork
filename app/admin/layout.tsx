'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Home } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Store Settings', href: '/admin/store', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-mono font-black text-sm uppercase tracking-wider">StarFashion Admin</span>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Home className="w-4 h-4" /> View Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 flex items-center justify-between md:justify-end">
          <span className="md:hidden font-mono font-bold text-sm">StarFashion Admin</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-widest underline hidden sm:inline">
              Storefront →
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-widest text-red-600 md:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
