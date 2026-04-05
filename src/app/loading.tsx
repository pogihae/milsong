export default function Loading() {
  return (
    <div className="relative flex min-h-[50vh] flex-col items-center justify-center space-y-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 animate-pulse rounded-full bg-indigo-400/10 blur-2xl filter" />
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-400/20" />
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600 shadow-sm" />
      </div>
      <p className="relative animate-pulse text-sm font-bold tracking-widest text-slate-500 uppercase">
        Loading
      </p>
    </div>
  );
}
