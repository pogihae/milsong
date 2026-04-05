import type { RecommendResult } from '@/domain/types';
import AnalyticsBlock from '@/components/AnalyticsBlock';
import CandidateList from '@/components/CandidateList';
import ResultCard from '@/components/ResultCard';

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
      result = null;
    }
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
        <p className="rounded-2xl bg-white px-6 py-5 text-center text-slate-600 shadow-sm">
          결과 데이터를 불러오지 못했습니다. 홈으로 돌아가 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <section className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Recommendation
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{result.title}</h1>
          {result.staleMode ? (
            <p className="text-sm text-amber-700">
              같은 시기 메가 히트곡이 뚜렷하지 않아 롱런한 스테디셀러 기준으로 추천했어요.
            </p>
          ) : null}
        </div>

        <ResultCard mainSong={result.mainSong} eraLabel={result.eraLabel} />
        <CandidateList candidates={result.candidates} />
        <AnalyticsBlock analytics={result.analytics} />
      </section>
    </main>
  );
}
