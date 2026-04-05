import type { RecommendResult } from '@/domain/types';
import ResultCard from '@/components/ResultCard';
import CandidateList from '@/components/CandidateList';
import AnalyticsBlock from '@/components/AnalyticsBlock';

interface ResultPageProps {
  searchParams: Promise<{ data?: string }>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  let result: RecommendResult | null = null;

  if (params.data) {
    try {
      result = JSON.parse(decodeURIComponent(params.data)) as RecommendResult;
    } catch {
      // malformed data: show error state below
    }
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p className="text-slate-500">No result data was provided. Please try again.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 bg-slate-50 p-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">{result.title}</h1>
      <ResultCard mainSong={result.mainSong} eraLabel={result.eraLabel} />
      <CandidateList candidates={result.candidates} />
      <AnalyticsBlock analytics={result.analytics} />
    </main>
  );
}
