interface AnalyticsBlockProps {
  analytics: string[];
}

export default function AnalyticsBlock({ analytics }: AnalyticsBlockProps) {
  if (analytics.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-950">Why this song</h2>
      <ul className="list-disc space-y-1 pl-5">
        {analytics.map((line, i) => (
          <li key={i} className="text-slate-700">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
