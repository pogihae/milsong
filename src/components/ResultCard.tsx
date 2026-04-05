interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
}

export default function ResultCard({ mainSong, eraLabel }: ResultCardProps) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <p className="text-lg font-semibold">
        {mainSong.artist} — {mainSong.title}
      </p>
      <p className="mt-2 text-gray-600">{eraLabel}</p>
    </div>
  );
}
