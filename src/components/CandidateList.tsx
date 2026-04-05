import type { Candidate } from '@/domain/types';

interface CandidateListProps {
  candidates: Candidate[];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Top {candidates.length} 후보곡</h2>
      <ol className="space-y-3">
        {candidates.map((c) => (
          <li key={c.rank} className="rounded border p-4">
            <p className="font-medium">
              {c.rank}위. {c.artist} — {c.title}
            </p>
            <p className="text-sm text-gray-500">
              총점 {c.totalScore.toFixed(1)} | 순위 {c.breakdown.rankComponent.toFixed(1)} | 노출{' '}
              {c.breakdown.exposure.toFixed(1)} | 음방{' '}
              {c.breakdown.wins !== null ? c.breakdown.wins : 'N/A'}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
