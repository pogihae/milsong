interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
}

export default function ResultCard({ mainSong, eraLabel }: ResultCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-lg font-semibold text-slate-950">
        {mainSong.artist} - {mainSong.title}
      </p>
      <p className="mt-2 text-slate-600">{eraLabel}</p>
    </div>
  );
}
