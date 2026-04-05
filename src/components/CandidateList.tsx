import type { Candidate } from '@/domain/types';

interface CandidateListProps {
  candidates: Candidate[];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">후보곡 Top {candidates.length}</h2>
      <ol className="space-y-3">
        {candidates.map((c) => (
          <li key={c.rank} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-900">
              {c.rank}위. {c.artist} - {c.title}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              총점 {c.totalScore.toFixed(1)} | 순위 점수 {c.breakdown.rankComponent.toFixed(1)} |
              노출 점수 {c.breakdown.exposure.toFixed(1)} | 음방 1위 {c.breakdown.wins ?? 0}회
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
