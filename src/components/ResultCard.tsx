interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
}

export default function ResultCard({ mainSong, eraLabel }: ResultCardProps) {
  return (
    <section className="glass-panel-active relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-10">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <p className="text-2xl font-extrabold text-slate-900 text-balance sm:text-3xl">{eraLabel}</p>
      <p className="mt-6 text-sm font-black text-indigo-600">대표곡</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900 text-balance drop-shadow-sm sm:text-3xl">
        <span className="mb-1 block text-lg font-bold text-slate-600 sm:text-xl">{mainSong.artist}</span>
        {mainSong.title}
      </p>
    </section>
  );
}
