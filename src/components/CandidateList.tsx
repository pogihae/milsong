import type { Candidate } from '@/domain/types';

interface CandidateListProps {
  candidates: Candidate[];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  return (
    <section className="glass-panel relative rounded-[2rem] p-6 sm:p-8">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-900">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-inner">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
        </span>
        후보곡 Top {candidates.length}
      </h2>
      <ol className="space-y-4">
        {candidates.map((c) => (
          <li key={c.rank} className="group flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/50 bg-white/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-md">
                {c.rank}
              </span>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {c.title} <span className="text-slate-500 font-medium text-base ml-1">{c.artist}</span>
                </p>
                <p className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                  <span className="rounded-md bg-slate-100/80 px-2 py-1 backdrop-blur-sm">총점 {c.totalScore.toFixed(1)}</span>
                  <span className="rounded-md bg-slate-100/80 px-2 py-1 backdrop-blur-sm">순위 {c.breakdown.rankComponent.toFixed(1)}</span>
                  <span className="rounded-md bg-slate-100/80 px-2 py-1 backdrop-blur-sm">노출 {c.breakdown.exposure.toFixed(1)}</span>
                  <span className="rounded-md bg-slate-100/80 px-2 py-1 backdrop-blur-sm text-amber-700 bg-amber-50/80">음방 1위 {c.breakdown.wins !== null ? `${c.breakdown.wins}회` : '?'}</span>
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
