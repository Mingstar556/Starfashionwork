export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-black dark:bg-white rounded-full" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Loading StarFashion...</span>
      </div>
    </div>
  );
}
