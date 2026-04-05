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
      // malformed data — show error state below
    }
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-gray-500">결과 데이터가 없습니다. 다시 시도해 주세요.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-8">
      <h1 className="text-2xl font-bold">{result.title}</h1>
      <ResultCard mainSong={result.mainSong} eraLabel={result.eraLabel} />
      <CandidateList candidates={result.candidates} />
      <AnalyticsBlock analytics={result.analytics} />
    </main>
  );
}
