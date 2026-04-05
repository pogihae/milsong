import Image from 'next/image';

interface ResultCardProps {
  mainSong: { artist: string; title: string };
  eraLabel: string;
  imageUrl: string | null;
}

export default function ResultCard({ mainSong, eraLabel, imageUrl }: ResultCardProps) {
  return (
    <section className="glass-panel-active relative overflow-hidden rounded-2xl p-7 sm:p-9">
      {/* Left accent border */}
      <div className="absolute inset-y-0 left-0 w-1 bg-[#ff375f]" />

      <div className="flex gap-6 sm:gap-8">
        {/* Album art */}
        <div className="shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${mainSong.artist} - ${mainSong.title} 앨범 표지`}
              width={120}
              height={120}
              className="rounded-xl shadow-2xl shadow-black/60 sm:h-[140px] sm:w-[140px]"
              unoptimized
            />
          ) : (
            <div className="h-[120px] w-[120px] rounded-xl bg-white/8 sm:h-[140px] sm:w-[140px]" />
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col justify-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#ff375f]">
            대표 입대곡
          </p>
          <p className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl">
            {eraLabel}
          </p>
          <p className="text-xl font-bold text-white sm:text-2xl">{mainSong.title}</p>
          <p className="mt-1 text-sm text-white/50">{mainSong.artist}</p>
        </div>
      </div>
    </section>
  );
}
