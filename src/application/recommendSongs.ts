import { buildAnalytics } from '@/domain/analytics';
import { filterDomesticCandidates } from './filterDomesticCandidates';
import { isEligibleKoreanSong } from '@/domain/isEligibleKoreanSong';
import { buildEraLabel } from '@/domain/eraLabel';
import { genreMultiplier, rankComponent, scoreExposure, totalScore, totalScoreStale, chartDominance } from '@/domain/scoring';
import type { ChartEntry, RecommendInput, RecommendResult, ScoredSong } from '@/domain/types';
import { isGoldenWindow, isSilverWindow, isBronzeWindow, temporalWeight } from '@/domain/windows';
import { getBroadcastWins } from '@/infrastructure/supabase/broadcastRepository';
import { getChartEntries } from '@/infrastructure/supabase/chartRepository';
import { getSongsByIds } from '@/infrastructure/supabase/songRepository';
import { dateWindow, isInRange } from '@/lib/dateUtils';

const STALE_W_LONG = 1.0;

function computeExposureAndBestRank(
  entries: ChartEntry[],
  exposureStart: string,
  exposureEnd: string,
  goldenStart: string,
  goldenEnd: string,
  dominanceStart: string,
  dominanceEnd: string,
) {
  const exposureEntries = entries.filter((e) => isInRange(e.chartDate, exposureStart, exposureEnd));
  const daysTop3 = exposureEntries.filter((e) => e.rank <= 3).length;
  const daysTop10 = exposureEntries.filter((e) => e.rank > 3 && e.rank <= 10).length;
  const daysTop20 = exposureEntries.filter((e) => e.rank > 10 && e.rank <= 20).length;

  const dominanceEntries = entries.filter((e) => isInRange(e.chartDate, dominanceStart, dominanceEnd));
  const daysRank1 = dominanceEntries.filter((e) => e.rank === 1).length;
  const daysRank1to3 = dominanceEntries.filter((e) => e.rank >= 2 && e.rank <= 3).length;
  const daysRank4to10 = dominanceEntries.filter((e) => e.rank >= 4 && e.rank <= 10).length;

  const goldenEntries = entries.filter((e) => isInRange(e.chartDate, goldenStart, goldenEnd));
  const bestRank = goldenEntries.length > 0 ? Math.min(...goldenEntries.map((e) => e.rank)) : null;

  return {
    exposure: scoreExposure(daysTop3, daysTop10, daysTop20),
    dominance: chartDominance(daysRank1, daysRank1to3, daysRank4to10),
    bestRank
  };
}

export async function recommendSongs(input: RecommendInput): Promise<RecommendResult> {
  const { enlistmentDate: D, scoringParams } = input;

  const [goldenStart, goldenEnd] = dateWindow(D, -14, 30);
  const [silverStart, silverEnd] = dateWindow(D, -60, -1);
  const [bronzeStart, bronzeEnd] = dateWindow(D, -90, -1);
  const [exposureStart, exposureEnd] = dateWindow(D, 0, 100);
  const [dominanceStart, dominanceEnd] = dateWindow(D, -90, 100);
  const [winStart, winEnd] = dateWindow(D, -90, 100);
  const [staleStart, staleEnd] = dateWindow(D, -60, 0);
  // Fetch from D-90 to cover both dominance/bronze windows and candidate windows
  const [candidateWindowStart, candidateWindowEnd] = dateWindow(D, -90, 100);

  const [chartEntries, broadcastWins] = await Promise.all([
    getChartEntries(candidateWindowStart, candidateWindowEnd, 'daily'),
    getBroadcastWins(winStart, winEnd),
  ]);

  // Group entries by songId once to avoid O(n×m) repeated scans per song in scoring loops
  const entriesBySong = new Map<string, ChartEntry[]>();
  for (const e of chartEntries) {
    const list = entriesBySong.get(e.songId);
    if (list) list.push(e);
    else entriesBySong.set(e.songId, [e]);
  }

  const songIds = [...entriesBySong.keys()];
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

    const entries = entriesBySong.get(songId)!;

    const daysTop20Silver = entries.filter(
      (e) => isInRange(e.chartDate, silverStart, silverEnd) && e.rank <= 20,
    ).length;
    const daysTop20Bronze = entries.filter(
      (e) => isInRange(e.chartDate, bronzeStart, bronzeEnd) && e.rank <= 20,
    ).length;

    const golden = song.releaseDate ? isGoldenWindow(D, song.releaseDate) : false;
    const silver = song.releaseDate ? isSilverWindow(D, song.releaseDate, daysTop20Silver) : false;
    const bronze = song.releaseDate ? isBronzeWindow(D, song.releaseDate, daysTop20Bronze) : false;

    const tw = temporalWeight(golden, silver, bronze, scoringParams);
    if (tw === 0) continue;

    const gm = genreMultiplier(song, scoringParams);
    const { exposure, dominance, bestRank } = computeExposureAndBestRank(
      entries, exposureStart, exposureEnd, goldenStart, goldenEnd, dominanceStart, dominanceEnd
    );
    const rc = rankComponent(bestRank, tw, gm);
    const winCount = winCountMap.get(songId) ?? 0;
    const ts = totalScore(rc, dominance, exposure, winCount, scoringParams);

    scoredSongs.push({
      song,
      totalScore: ts,
      rankComponent: rc,
      chartDominance: dominance,
      scoreExposure: exposure,
      winCount,
      bestRank,
      temporalWeight: tw,
      genreMultiplier: gm,
      isGolden: golden,
      isSilver: silver,
      isBronze: bronze,
    });
  }

  const hasGoldenTop10 = chartEntries.some(
    (e) => eligibleSongIds.has(e.songId) && isInRange(e.chartDate, goldenStart, goldenEnd) && e.rank <= 10,
  );

  let staleMode = false;
  if (!hasGoldenTop10 && scoredSongs.length === 0) {
    staleMode = true;
    const staleSongIds = songIds.filter((songId) =>
      entriesBySong.get(songId)!.some((e) => isInRange(e.chartDate, staleStart, staleEnd)),
    );

    for (const songId of staleSongIds) {
      const song = songMap.get(songId);
      if (!song) continue;
      if (!eligibleSongIds.has(songId)) continue;

      const entries = entriesBySong.get(songId)!;

      const daysTop20Stale = entries.filter(
        (e) => isInRange(e.chartDate, staleStart, staleEnd) && e.rank <= 20,
      ).length;
      const { exposure, dominance, bestRank } = computeExposureAndBestRank(
        entries, exposureStart, exposureEnd, goldenStart, goldenEnd, dominanceStart, dominanceEnd
      );
      const winCount = winCountMap.get(songId) ?? 0;
      const ts = totalScoreStale(daysTop20Stale, exposure, winCount, STALE_W_LONG, scoringParams);

      scoredSongs.push({
        song,
        totalScore: ts,
        rankComponent: 0,
        chartDominance: dominance,
        scoreExposure: exposure,
        winCount,
        bestRank,
        temporalWeight: 0,
        genreMultiplier: 1.0,
        isGolden: false,
        isSilver: false,
        isBronze: false,
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

  if (process.env.NODE_ENV === 'development') {
    console.log('--- SCORE BREAKDOWN ---');
    console.table(scoredSongs.slice(0, 10).map(s => ({
      title: s.song.title,
      totalScore: s.totalScore.toFixed(1),
      rankComp: s.rankComponent.toFixed(1),
      dominance: s.chartDominance.toFixed(1),
      exposure: s.scoreExposure.toFixed(1),
      wins: s.winCount,
      bestRank: s.bestRank
    })));
  }

  const domesticScoredSongs = await filterDomesticCandidates(scoredSongs);
  const top3 = domesticScoredSongs.slice(0, 3);

  if (top3.length === 0) {
    throw new Error('No candidate songs found for the given enlistment date.');
  }

  const mainScoredSong = top3[0];
  const candidates = top3.map((s, i) => ({
    rank: i + 1,
    artist: s.song.artist,
    title: s.song.title,
    totalScore: s.totalScore,
    breakdown: {
      rankComponent: s.rankComponent,
      dominance: s.chartDominance,
      exposure: s.scoreExposure,
      wins: s.winCount,
    },
  }));

  const analytics = buildAnalytics(mainScoredSong);
  const eraLabel = buildEraLabel(mainScoredSong.song.id, mainScoredSong.song.title);
  const title = '그 시절 군생활을 정의한 바로 그 노래';

  return {
    title,
    mainSong: { artist: mainScoredSong.song.artist, title: mainScoredSong.song.title },
    candidates,
    analytics,
    eraLabel,
    staleMode,
  };
}
