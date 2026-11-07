export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
        <div className="absolute inset-0 border-2 border-white rounded-full animate-spin border-t-transparent" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-sm font-black uppercase tracking-widest text-white">StarFashion</h2>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 animate-pulse">Loading Collection...</p>
      </div>
    </div>
  );
}
