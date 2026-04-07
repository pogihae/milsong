import { buildAnalytics } from '@/domain/analytics';
import { filterDomesticCandidates } from './filterDomesticCandidates';
import { isEligibleKoreanSong } from '@/domain/isEligibleKoreanSong';
import { buildEraLabel } from '@/domain/eraLabel';
import { genreMultiplier, rankComponent, scoreExposure, totalScore, totalScoreStale, chartDominance } from '@/domain/scoring';
import type { ChartEntry, RecommendInput, RecommendResult, ScoredSong } from '@/domain/types';
import { isGoldenWindow, isSilverWindow, temporalWeight } from '@/domain/windows';
import { getChartEntries } from '@/infrastructure/supabase/chartRepository';
import { getSongsByIds } from '@/infrastructure/supabase/songRepository';
import { dateWindow, isInRange } from '@/lib/dateUtils';

function computeExposureAndBestRank(
  entries: ChartEntry[],
  exposureStart: string,
  exposureEnd: string,
  goldenStart: string,
  goldenEnd: string,
  dominanceStart: string,
  dominanceEnd: string,
) {
  let daysTop3 = 0, daysTop10 = 0, daysTop20 = 0;
  let daysRank1 = 0, daysRank1to3 = 0, daysRank4to10 = 0;
  let bestRank: number | null = null;

  for (const e of entries) {
    if (isInRange(e.chartDate, exposureStart, exposureEnd)) {
      if (e.rank <= 3) daysTop3++;
      else if (e.rank <= 10) daysTop10++;
      else if (e.rank <= 20) daysTop20++;
    }
    if (isInRange(e.chartDate, dominanceStart, dominanceEnd)) {
      if (e.rank === 1) daysRank1++;
      else if (e.rank <= 3) daysRank1to3++;
      else if (e.rank <= 10) daysRank4to10++;
    }
    if (isInRange(e.chartDate, goldenStart, goldenEnd)) {
      if (bestRank === null || e.rank < bestRank) bestRank = e.rank;
    }
  }

  return {
    daysTop3,
    daysRank4to10,
    exposure: scoreExposure(daysTop3, daysTop10, daysTop20),
    dominance: chartDominance(daysRank1, daysRank1to3, daysRank4to10),
    bestRank,
  };
}

export async function recommendSongs(input: RecommendInput): Promise<RecommendResult> {
  const { enlistmentDate: D, scoringParams } = input;

  const [goldenStart, goldenEnd] = dateWindow(D, -14, 30);
  // Silver: song must still be charting in [D-30, D-1] right before enlistment
  const [silverStart, silverEnd] = dateWindow(D, -30, -1);
  // Exposure focused on [D-7, D+45] — the period most strongly linked to 이병 memory
  const [exposureStart, exposureEnd] = dateWindow(D, -7, 45);
  // Dominance window = Golden Window [D-14, D+30]
  const [dominanceStart, dominanceEnd] = [goldenStart, goldenEnd];
  // Fetch from D-90 to cover Silver lower bound; end at D+45
  const [candidateWindowStart, candidateWindowEnd] = dateWindow(D, -90, 45);

  const chartEntries = await getChartEntries(candidateWindowStart, candidateWindowEnd, 'daily');

  // Group entries by songId once
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

  const scoredSongs: ScoredSong[] = [];

  for (const songId of songIds) {
    const song = songMap.get(songId);
    if (!song) continue;
    if (!eligibleSongIds.has(songId)) continue;

    const entries = entriesBySong.get(songId)!;

    // Silver: released within [D-90, D-14), still charting ≥10 days in [D-30, D-1]
    const daysTop20Silver = entries.filter(
      (e) => isInRange(e.chartDate, silverStart, silverEnd) && e.rank <= 20,
    ).length;

    const golden = song.releaseDate ? isGoldenWindow(D, song.releaseDate) : false;
    const silver = song.releaseDate ? isSilverWindow(D, song.releaseDate, daysTop20Silver) : false;

    const tw = temporalWeight(golden, silver, scoringParams);
    if (tw === 0) continue;

    const gm = genreMultiplier(song);
    const { daysTop3, daysRank4to10, exposure, dominance, bestRank } = computeExposureAndBestRank(
      entries, exposureStart, exposureEnd, goldenStart, goldenEnd, dominanceStart, dominanceEnd,
    );
    const rc = rankComponent(bestRank, tw, gm);
    const ts = totalScore(rc, dominance, exposure);

    scoredSongs.push({
      song,
      totalScore: ts,
      rankComponent: rc,
      chartDominance: dominance,
      scoreExposure: exposure,
      daysTop3,
      daysRank4to10,
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
    const dMillis = new Date(D).getTime();

    for (const songId of songIds) {
      const song = songMap.get(songId);
      if (!song) continue;
      if (!eligibleSongIds.has(songId)) continue;

      const entries = entriesBySong.get(songId)!;
      const { daysTop3, daysRank4to10, exposure, dominance, bestRank } = computeExposureAndBestRank(
        entries, exposureStart, exposureEnd, goldenStart, goldenEnd, dominanceStart, dominanceEnd,
      );

      // Recency score: songs released closer to D score higher (max 365 for same-day)
      const pMillis = song.releaseDate ? new Date(song.releaseDate).getTime() : 0;
      const daysBefore = song.releaseDate ? Math.max(0, (dMillis - pMillis) / 86400000) : 999;
      const recencyScore = Math.max(0, 365 - daysBefore);

      const ts = totalScoreStale(recencyScore, exposure, dominance);

      scoredSongs.push({
        song,
        totalScore: ts,
        rankComponent: 0,
        chartDominance: dominance,
        scoreExposure: exposure,
        daysTop3,
        daysRank4to10,
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
    if (b.chartDominance !== a.chartDominance) return b.chartDominance - a.chartDominance;
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
      bestRank: s.bestRank,
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
    songId: s.song.id,
    artist: s.song.artist,
    title: s.song.title,
    totalScore: s.totalScore,
    albumArtUrl: s.song.albumArtUrl ?? null,
    breakdown: {
      rankComponent: s.rankComponent,
      dominance: s.chartDominance,
      exposure: s.scoreExposure,
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
