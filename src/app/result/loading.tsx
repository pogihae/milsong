export default function Loading() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] px-6 py-12">
      <section className="mx-auto max-w-2xl space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
            <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 animate-pulse rounded-lg bg-white/10" />
            <div className="h-7 w-20 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>

        {/* Main card skeleton */}
        <div className="glass-panel-active rounded-2xl p-7">
          <div className="flex gap-6">
            <div className="h-[120px] w-[120px] shrink-0 animate-pulse rounded-xl bg-white/10" />
            <div className="flex flex-1 flex-col justify-center space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-8 w-4/5 animate-pulse rounded-lg bg-white/10" />
              <div className="h-6 w-3/5 animate-pulse rounded-lg bg-white/10" />
              <div className="h-4 w-2/5 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Candidates skeleton */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <div className="mb-1 h-3 w-12 animate-pulse rounded bg-white/10" />
          <div className="mb-6 h-6 w-16 animate-pulse rounded-lg bg-white/10" />
          <div className="divide-y divide-white/[0.06]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                <div className="h-5 w-5 animate-pulse rounded bg-white/10" />
                <div className="h-[52px] w-[52px] shrink-0 animate-pulse rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-5 w-12 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
