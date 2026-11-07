import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StarFashion — Modern Luxury & Streetwear',
  description: 'Gen Z aesthetic editorial clothing brand store with instant Telegram bot order verification.',
  keywords: ['fashion', 'streetwear', 'starboy', 'old money', 'clothing store', 'telegram shopping'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
