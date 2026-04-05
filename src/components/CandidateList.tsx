import Image from 'next/image';
import type { Candidate } from '@/domain/types';
import SongCommentSection from './SongCommentSection';

interface CandidateListProps {
  candidates: Candidate[];
  artUrls: (string | null)[];
}

const RANK_STYLES = [
  'text-[#f5a623]', // 1st — gold
  'text-[#94a3b8]', // 2nd — silver
  'text-[#b87333]', // 3rd — bronze
];

export default function CandidateList({ candidates, artUrls }: CandidateListProps) {
  return (
    <section className="glass-panel rounded-2xl p-6 sm:p-8">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff375f]">
        후보곡
      </h2>
      <p className="mb-6 text-lg font-black text-white">Top {candidates.length}</p>

      <ol className="divide-y divide-white/[0.06]">
        {candidates.map((c, i) => (
          <li key={c.rank} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-4">
              {/* Rank number */}
              <span className={`w-6 shrink-0 text-center text-lg font-black tabular-nums ${RANK_STYLES[i] ?? 'text-white/40'}`}>
                {c.rank}
              </span>

              {/* Album art */}
              {artUrls[i] ? (
                <Image
                  src={artUrls[i]!}
                  alt={`${c.title} 앨범`}
                  width={52}
                  height={52}
                  className="shrink-0 rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-[52px] w-[52px] shrink-0 rounded-lg bg-white/8" />
              )}

              {/* Title + artist */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{c.title}</p>
                <p className="mt-0.5 truncate text-sm text-white/45">{c.artist}</p>
              </div>

              {/* Score + breakdown */}
              <div className="shrink-0 text-right">
                <p className="text-base font-black tabular-nums text-white">
                  {c.totalScore.toFixed(1)}
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-white/35">
                  순위 {c.breakdown.rankComponent.toFixed(0)} · 노출 {c.breakdown.exposure.toFixed(0)}
                  {c.breakdown.wins !== null ? ` · 음방 ${c.breakdown.wins}회` : ''}
                </p>
              </div>
            </div>

            <SongCommentSection songId={c.songId} />
          </li>
        ))}
      </ol>
    </section>
  );
}
