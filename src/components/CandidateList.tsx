import type { Candidate } from '@/domain/types';

interface CandidateListProps {
  candidates: Candidate[];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-950">Top {candidates.length} candidates</h2>
      <ol className="space-y-3">
        {candidates.map((c) => (
          <li key={c.rank} className="rounded-xl border border-slate-200 p-4">
            <p className="font-medium text-slate-900">
              {c.rank}. {c.artist} - {c.title}
            </p>
            <p className="text-sm text-slate-500">
              Total {c.totalScore.toFixed(1)} | Rank {c.breakdown.rankComponent.toFixed(1)} |
              Exposure {c.breakdown.exposure.toFixed(1)} | Wins{' '}
              {c.breakdown.wins !== null ? c.breakdown.wins : 'N/A'}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
