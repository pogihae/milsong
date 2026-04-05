interface AnalyticsBlockProps {
  analytics: string[];
}

export default function AnalyticsBlock({ analytics }: AnalyticsBlockProps) {
  if (analytics.length === 0) return null;

  return (
    <section className="glass-panel rounded-2xl p-6 sm:p-8">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff375f]">
        선정 근거
      </h2>
      <p className="mb-6 text-lg font-black text-white">왜 이 노래인가</p>
      <ul className="space-y-4">
        {analytics.map((line, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/55">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff375f]" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
