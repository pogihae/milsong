interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
}

export default function ResultCard({ mainSong, eraLabel }: ResultCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Main Song</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {mainSong.artist} - {mainSong.title}
      </p>
      <p className="mt-3 text-base text-slate-600">{eraLabel}</p>
    </section>
  );
}
