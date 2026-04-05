interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
}

export default function ResultCard({ mainSong, eraLabel }: ResultCardProps) {
  return (
    <section className="glass-panel-active relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-10">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-indigo-600">Main Song</p>
      <p className="text-3xl font-extrabold text-slate-900 sm:text-5xl text-balance drop-shadow-sm">
        <span className="block text-xl text-slate-600 sm:text-2xl font-bold mb-2">{mainSong.artist}</span>
        {mainSong.title}
      </p>
      <div className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-100/80 px-4 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-md">
        {eraLabel}
      </div>
    </section>
  );
}
