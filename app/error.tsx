'use client';

import React from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">Something Went Wrong</h2>
        <p className="text-xs text-zinc-500 font-mono">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
