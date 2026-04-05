import Image from 'next/image';

interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
  imageUrl: string | null;
}

export default function ResultCard({ mainSong, eraLabel, imageUrl }: ResultCardProps) {
  return (
    <section className="glass-panel-active relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-10">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${mainSong.artist} - ${mainSong.title} 앨범 표지`}
          width={160}
          height={160}
          className="mx-auto mb-6 rounded-2xl shadow-2xl shadow-indigo-500/20"
          unoptimized
        />
      ) : (
        <div className="mx-auto mb-6 h-40 w-40 rounded-2xl bg-slate-200/60" />
      )}
      <p className="text-2xl font-extrabold text-balance text-slate-900 sm:text-3xl">{eraLabel}</p>
      <p className="mt-6 text-sm font-black text-indigo-600">대표곡</p>
      <p className="mt-1 text-2xl font-extrabold text-balance drop-shadow-sm text-slate-900 sm:text-3xl">
        <span className="mb-1 block text-lg font-bold text-slate-600 sm:text-xl">{mainSong.artist}</span>
        {mainSong.title}
      </p>
    </section>
  );
}
