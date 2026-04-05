import { buildAnalytics } from '@/domain/analytics';
import { filterDomesticCandidates } from './filterDomesticCandidates';
import { isEligibleKoreanSong } from '@/domain/isEligibleKoreanSong';
import { buildEraLabel } from '@/domain/eraLabel';
import { genreMultiplier, rankComponent, scoreExposure, totalScore, totalScoreStale } from '@/domain/scoring';
import type { RecommendInput, RecommendResult, ScoredSong } from '@/domain/types';
import { isGoldenWindow, isSilverWindow, temporalWeight } from '@/domain/windows';
import { getBroadcastWins } from '@/infrastructure/supabase/broadcastRepository';
import { getChartEntries } from '@/infrastructure/supabase/chartRepository';
import { getSongsByIds } from '@/infrastructure/supabase/songRepository';
import { dateWindow, isInRange } from '@/lib/dateUtils';

const STALE_W_LONG = 1.0;

export async function recommendSongs(input: RecommendInput): Promise<RecommendResult> {
  const { enlistmentDate: D, tone } = input;

  const [goldenStart, goldenEnd] = dateWindow(D, -14, 30);
  const [silverStart, silverEnd] = dateWindow(D, -30, -1);
  const [exposureStart, exposureEnd] = dateWindow(D, 0, 100);
  const [winStart, winEnd] = dateWindow(D, -90, 100);
  const [staleStart, staleEnd] = dateWindow(D, -60, 0);
  const [candidateWindowStart, candidateWindowEnd] = dateWindow(D, -30, 100);

  const [chartEntries, broadcastWins] = await Promise.all([
    getChartEntries(candidateWindowStart, candidateWindowEnd, 'daily'),
    getBroadcastWins(winStart, winEnd),
  ]);

  const songIds = [...new Set(chartEntries.map((e) => e.songId))];
  const songs = await getSongsByIds(songIds);
  const songMap = new Map(songs.map((s) => [s.id, s]));
  const eligibleSongIds = new Set(songs.filter(isEligibleKoreanSong).map((song) => song.id));

  const winCountMap = new Map<string, number>();
  for (const win of broadcastWins) {
    winCountMap.set(win.songId, (winCountMap.get(win.songId) ?? 0) + 1);
  }

  const scoredSongs: ScoredSong[] = [];

  for (const songId of songIds) {
    const song = songMap.get(songId);
    if (!song) continue;
    if (!eligibleSongIds.has(songId)) continue;

    const daysTop20Silver = chartEntries.filter(
      (e) => e.songId === songId && isInRange(e.chartDate, silverStart, silverEnd) && e.rank <= 20,
    ).length;

    const golden = song.releaseDate ? isGoldenWindow(D, song.releaseDate) : false;
    const silver = song.releaseDate ? isSilverWindow(D, song.releaseDate, daysTop20Silver) : false;

    const tw = temporalWeight(golden, silver);
    if (tw === 0) continue;

    const gm = genreMultiplier(song);
    const goldenEntries = chartEntries.filter(
      (e) => e.songId === songId && isInRange(e.chartDate, goldenStart, goldenEnd),
    );
    const bestRank = goldenEntries.length > 0 ? Math.min(...goldenEntries.map((e) => e.rank)) : null;

    const rc = rankComponent(bestRank, tw, gm);
    const daysTop10 = chartEntries.filter(
      (e) => e.songId === songId && isInRange(e.chartDate, exposureStart, exposureEnd) && e.rank <= 10,
    ).length;

    const exposure = scoreExposure(daysTop10);
    const winCount = winCountMap.get(songId) ?? 0;
    const ts = totalScore(rc, exposure, winCount);

    scoredSongs.push({
      song,
      totalScore: ts,
      rankComponent: rc,
      scoreExposure: exposure,
      winCount,
      bestRank,
      temporalWeight: tw,
      genreMultiplier: gm,
      isGolden: golden,
      isSilver: silver,
    });
  }

  const hasGoldenTop10 = chartEntries.some(
    (e) => eligibleSongIds.has(e.songId) && isInRange(e.chartDate, goldenStart, goldenEnd) && e.rank <= 10,
  );

  let staleMode = false;
  if (!hasGoldenTop10 && scoredSongs.length === 0) {
    staleMode = true;
    const staleSongIds = [
      ...new Set(
        chartEntries
          .filter((e) => isInRange(e.chartDate, staleStart, staleEnd))
          .map((e) => e.songId),
      ),
    ];

    for (const songId of staleSongIds) {
      const song = songMap.get(songId);
      if (!song) continue;
      if (!eligibleSongIds.has(songId)) continue;

      const daysTop20Stale = chartEntries.filter(
        (e) => e.songId === songId && isInRange(e.chartDate, staleStart, staleEnd) && e.rank <= 20,
      ).length;
      const daysTop10 = chartEntries.filter(
        (e) => e.songId === songId && isInRange(e.chartDate, exposureStart, exposureEnd) && e.rank <= 10,
      ).length;

      const exposure = scoreExposure(daysTop10);
      const winCount = winCountMap.get(songId) ?? 0;
      const ts = totalScoreStale(daysTop20Stale, exposure, winCount, STALE_W_LONG);

      const goldenEntries = chartEntries.filter(
        (e) => e.songId === songId && isInRange(e.chartDate, goldenStart, goldenEnd),
      );
      const bestRank = goldenEntries.length > 0 ? Math.min(...goldenEntries.map((e) => e.rank)) : null;

      scoredSongs.push({
        song,
        totalScore: ts,
        rankComponent: 0,
        scoreExposure: exposure,
        winCount,
        bestRank,
        temporalWeight: 0,
        genreMultiplier: 1.0,
        isGolden: false,
        isSilver: false,
      });
    }
  }

  scoredSongs.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.scoreExposure !== a.scoreExposure) return b.scoreExposure - a.scoreExposure;
    if (b.winCount !== a.winCount) return b.winCount - a.winCount;
    const aRank = a.bestRank ?? 999;
    const bRank = b.bestRank ?? 999;
    return aRank - bRank;
  });

  const domesticScoredSongs = await filterDomesticCandidates(scoredSongs);
  const top3 = domesticScoredSongs.slice(0, 3);

  if (top3.length === 0) {
    throw new Error('주어진 입대일에 맞는 후보곡을 찾지 못했습니다.');
  }

  const mainScoredSong = top3[0];
  const candidates = top3.map((s, i) => ({
    rank: i + 1,
    artist: s.song.artist,
    title: s.song.title,
    totalScore: s.totalScore,
    breakdown: {
      rankComponent: s.rankComponent,
      exposure: s.scoreExposure,
      wins: s.winCount,
    },
  }));

  const analytics = buildAnalytics(mainScoredSong, tone);
  const eraLabel = buildEraLabel(mainScoredSong.song.id, mainScoredSong.song.title);
  const title =
    tone === 't_plus'
      ? '당신의 군번줄에 가장 가까운 입대곡입니다.'
      : '당신의 기억을 가장 닮은 입대곡입니다.';

  return {
    title,
    mainSong: { artist: mainScoredSong.song.artist, title: mainScoredSong.song.title },
    candidates,
    analytics,
    eraLabel,
    staleMode,
  };
}
