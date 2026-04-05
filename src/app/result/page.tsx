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
      <main className="relative flex min-h-screen items-center justify-center bg-slate-50 p-8 selection:bg-indigo-200">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] animate-float rounded-full bg-indigo-400/10 mix-blend-multiply blur-3xl filter" />
        <p className="glass-panel relative z-10 rounded-3xl px-8 py-6 text-center font-medium text-slate-600 shadow-xl">
          결과 데이터를 불러오지 못했습니다. 홈으로 돌아가 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-12 selection:bg-indigo-200">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] animate-float rounded-full bg-indigo-400/20 mix-blend-multiply blur-3xl filter" />
      <div className="absolute bottom-0 left-[-10%] h-[600px] w-[600px] animate-float-delayed rounded-full bg-pink-400/20 mix-blend-multiply blur-3xl filter" />

      <section className="relative z-10 mx-auto max-w-3xl space-y-10">
        <div className="space-y-4 text-center sm:text-left">
          <p className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-widest text-indigo-600 uppercase shadow-sm">
            Recommendation
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{result.title}</h1>
          {result.staleMode ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              같은 시기 메가 히트곡이 뚜렷하지 않아 롱런한 스테디셀러 기준으로 추천했어요.
            </div>
          ) : null}
        </div>

        <ResultCard mainSong={result.mainSong} eraLabel={result.eraLabel} />
        <CandidateList candidates={result.candidates} />
        <AnalyticsBlock analytics={result.analytics} />
      </section>
    </main>
  );
}
