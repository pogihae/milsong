export default function Loading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-6 py-12">
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-3xl filter" />
      <div className="absolute bottom-0 left-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/15 blur-3xl filter" />

      <section className="relative z-10 mx-auto max-w-3xl space-y-10">
        {/* header */}
        <div className="space-y-4">
          <div className="h-5 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-9 w-2/3 animate-pulse rounded-xl bg-white/10" />
        </div>

        {/* main card skeleton */}
        <div className="glass-panel rounded-[2rem] p-8 text-center sm:p-10">
          <div className="mx-auto mb-6 h-40 w-40 animate-pulse rounded-2xl bg-white/10" />
          <div className="mx-auto mb-3 h-7 w-3/5 animate-pulse rounded-xl bg-white/10" />
          <div className="mx-auto h-5 w-2/5 animate-pulse rounded-lg bg-white/10" />
        </div>

        {/* candidates skeleton */}
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-6 h-6 w-36 animate-pulse rounded-lg bg-white/10" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/2 animate-pulse rounded-lg bg-white/10" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 animate-pulse rounded-md bg-white/10" />
                    <div className="h-4 w-16 animate-pulse rounded-md bg-white/10" />
                    <div className="h-4 w-20 animate-pulse rounded-md bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
