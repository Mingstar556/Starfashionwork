import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StarFashion Admin Portal',
  description: 'Protected management dashboard for StarFashion store inventory and orders.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('star_admin_session');
  const isAuthenticated = session?.value === 'authenticated_token_active';

  return (
    <div className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 flex`}>
      {isAuthenticated && (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between hidden md:flex">
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tighter text-white">StarFashion Admin</h2>
              <p className="text-[10px] font-mono uppercase text-zinc-500 mt-0.5">Management Console</p>
            </div>

            <nav className="space-y-1 font-mono text-xs">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                <ShoppingCart className="w-4 h-4" /> Orders
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                <Package className="w-4 h-4" /> Products
              </Link>
              <Link
                href="/admin/store"
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                <Settings className="w-4 h-4" /> Store Settings
              </Link>
            </nav>
          </div>

          <div className="p-6 border-t border-zinc-800">
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/50 hover:bg-red-950 text-red-400 font-mono text-xs uppercase tracking-wider transition border border-red-900/30"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </form>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 px-8 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
          <div className="font-mono text-xs uppercase text-zinc-400">StarFashion Management System</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition underline">
              View Storefront →
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
