import Image from 'next/image';
import type { Candidate } from '@/domain/types';

interface CandidateListProps {
  candidates: Candidate[];
  artUrls: (string | null)[];
}

export default function CandidateList({ candidates, artUrls }: CandidateListProps) {
  return (
    <section className="glass-panel relative rounded-[2rem] p-6 sm:p-8">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 shadow-inner">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
        </span>
        후보곡 Top {candidates.length}
      </h2>
      <ol className="space-y-4">
        {candidates.map((c, i) => (
          <li key={c.rank} className="group flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-white/4 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md">
                {c.rank}
              </span>
              {artUrls[i] ? (
                <Image
                  src={artUrls[i]!}
                  alt={`${c.title} 앨범`}
                  width={48}
                  height={48}
                  className="shrink-0 rounded-xl object-cover shadow-sm"
                  unoptimized
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-xl bg-white/10" />
              )}
              <div>
                <p className="text-lg font-bold text-white">
                  {c.title} <span className="ml-1 text-base font-medium text-white/50">{c.artist}</span>
                </p>
                <p className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-white/50">
                  <span className="rounded-md bg-white/8 px-2 py-1 backdrop-blur-sm">총점 {c.totalScore.toFixed(1)}</span>
                  <span className="rounded-md bg-white/8 px-2 py-1 backdrop-blur-sm">순위 {c.breakdown.rankComponent.toFixed(1)}</span>
                  <span className="rounded-md bg-white/8 px-2 py-1 backdrop-blur-sm">노출 {c.breakdown.exposure.toFixed(1)}</span>
                  <span className="rounded-md bg-amber-500/15 px-2 py-1 text-amber-300 backdrop-blur-sm">
                    음방 1위 {c.breakdown.wins !== null ? `${c.breakdown.wins}회` : '집계 불가'}
                  </span>
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
