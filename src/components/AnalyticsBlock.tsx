interface AnalyticsBlockProps {
  analytics: string[];
}

export default function AnalyticsBlock({ analytics }: AnalyticsBlockProps) {
  if (analytics.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold text-slate-900">선정 근거</h2>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        {analytics.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
