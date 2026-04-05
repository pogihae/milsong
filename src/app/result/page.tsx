import { recommendSongs } from '@/application/recommendSongs';
import { isValidCalendarDate } from '@/lib/dateUtils';
import { fetchAlbumArt } from '@/lib/albumArt';
import AnalyticsBlock from '@/components/AnalyticsBlock';
import CandidateList from '@/components/CandidateList';
import ResultCard from '@/components/ResultCard';
import RetryButton from '@/components/RetryButton';
import ShareButton from '@/components/ShareButton';
import type { RecommendResult } from '@/domain/types';

interface ResultPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { q } = await searchParams;

  if (!q || !isValidCalendarDate(q)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0e0e0e] p-8">
        <div className="glass-panel rounded-2xl px-8 py-6 text-center">
          <p className="font-medium text-white/60">
            유효한 입대일이 없습니다. 홈으로 돌아가 다시 시도해 주세요.
          </p>
        </div>
      </main>
    );
  }

  let result: RecommendResult;
  let mainArt: string | null = null;
  let candidateArts: (string | null)[] = [];
  try {
    result = await recommendSongs({ enlistmentDate: q });
    const artResults = await Promise.all(
      [result.mainSong, ...result.candidates].map((s) => fetchAlbumArt(s.artist, s.title)),
    );
    [mainArt, ...candidateArts] = artResults;
  } catch (err) {
    const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0e0e0e] p-8">
        <div className="glass-panel rounded-2xl px-8 py-6 text-center">
          <p className="font-medium text-white/60">{message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e0e] px-6 py-12 selection:bg-red-900/40">
      {/* Top accent line */}
      <div className="fixed inset-x-0 top-0 z-50 h-px bg-gradient-to-r from-transparent via-[#ff375f]/70 to-transparent" />

      <section className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff375f]">Milsong</p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">{result.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton
              eraLabel={result.eraLabel}
              artist={result.mainSong.artist}
              title={result.mainSong.title}
            />
            <RetryButton />
          </div>
        </div>

        {result.staleMode ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm font-medium text-amber-400">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            같은 시기 메가 히트곡이 뚜렷하지 않아 롱런한 스테디셀러 기준으로 추천했어요.
          </div>
        ) : null}

        <ResultCard mainSong={result.mainSong} eraLabel={result.eraLabel} imageUrl={mainArt} />
        <CandidateList candidates={result.candidates} artUrls={candidateArts} />
        <AnalyticsBlock analytics={result.analytics} />
      </section>
    </main>
  );
}
