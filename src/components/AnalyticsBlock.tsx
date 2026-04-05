interface AnalyticsBlockProps {
  analytics: string[];
}

export default function AnalyticsBlock({ analytics }: AnalyticsBlockProps) {
  if (analytics.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">선정 근거</h2>
      <ul className="list-disc space-y-1 pl-5">
        {analytics.map((line, i) => (
          <li key={i} className="text-gray-700">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
