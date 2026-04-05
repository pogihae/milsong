import Image from 'next/image';
import type { Candidate } from '@/domain/types';

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
    <section className="glass-panel rounded-2xl p-5 sm:p-8">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff375f]">
        후보곡
      </h2>
      <p className="mb-5 text-lg font-black text-white">Top {candidates.length}</p>

      <ol className="divide-y divide-white/[0.06]">
        {candidates.map((c, i) => (
          <li key={c.rank} className="py-4 first:pt-0 last:pb-0">
            {/* 메인 행 */}
            <div className="flex items-center gap-3">
              <span className={`w-5 shrink-0 text-center text-base font-black tabular-nums ${RANK_STYLES[i] ?? 'text-white/40'}`}>
                {c.rank}
              </span>

              {artUrls[i] ? (
                <Image
                  src={artUrls[i]!}
                  alt={`${c.title} 앨범`}
                  width={48}
                  height={48}
                  className="shrink-0 rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-lg bg-white/8" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white sm:text-base">{c.title}</p>
                <p className="mt-0.5 truncate text-xs text-white/45">{c.artist}</p>
              </div>

              {/* 점수 — sm 이상만 표시 */}
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-sm font-black tabular-nums text-white">
                  {c.totalScore.toFixed(1)}
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-white/35">
                  순위 {c.breakdown.rankComponent.toFixed(0)} · 노출 {c.breakdown.exposure.toFixed(0)}
                  {c.breakdown.wins !== null ? ` · 음방 ${c.breakdown.wins}회` : ''}
                </p>
              </div>
            </div>

            {/* 점수 — 모바일 전용 두 번째 줄 */}
            <p className="mt-2 pl-[68px] text-[11px] tabular-nums text-white/30 sm:hidden">
              총점 {c.totalScore.toFixed(1)} · 순위 {c.breakdown.rankComponent.toFixed(0)} · 노출 {c.breakdown.exposure.toFixed(0)}
              {c.breakdown.wins !== null ? ` · 음방 ${c.breakdown.wins}회` : ''}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
