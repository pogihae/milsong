interface AnalyticsBlockProps {
  analytics: string[];
}

export default function AnalyticsBlock({ analytics }: AnalyticsBlockProps) {
  if (analytics.length === 0) return null;

  return (
    <section className="glass-panel relative rounded-[2rem] p-6 sm:p-8">
      <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 shadow-inner">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        선정 근거
      </h2>
      <ul className="space-y-4 text-white/70">
        {analytics.map((line, i) => (
          <li key={i} className="flex gap-4">
            <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-fuchsia-400" />
            <span className="leading-relaxed">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
