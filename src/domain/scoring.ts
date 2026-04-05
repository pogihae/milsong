import type { Song, ScoringParams } from './types';

/**
 * Genre_Multiplier: 1.3 for female group dance songs, 1.0 for all others.
 */
export function genreMultiplier(song: Song, params?: ScoringParams): number {
  return song.groupType === 'female_group' && song.genre === 'dance'
    ? (params?.genreDanceMultiplier ?? 1.3)
    : 1.0;
}

/**
 * Base_Rank = 21 - best_rank (peak chart position in [D-14, D+30]).
 * Returns 0 if the song never entered the chart in that window.
 */
export function baseRank(bestRank: number | null): number {
  if (bestRank === null) return 0;
  return 21 - bestRank;
}

/**
 * Rank_Component = Base_Rank × Temporal_Weight × Genre_Multiplier
 */
export function rankComponent(
  bestRank: number | null,
  twWeight: number,
  gMultiplier: number,
): number {
  return baseRank(bestRank) * twWeight * gMultiplier;
}

/**
 * Score_exposure_v2 (Tightened)
 * Stratified by rank: TOP 3, TOP 10 (excluding 3), and TOP 20 (excluding 10).
 * Multipliers lowered to prevent exposure score from becoming too broad.
 */
export function scoreExposure(daysTop3: number, daysTop10: number, daysTop20: number): number {
  return ((daysTop3 * 1.2 + daysTop10 * 1.0 + daysTop20 * 0.1) / 100) * 100;
}

/**
 * Chart Dominance = sum of days in different top tiers across [D-90, D+100]
 */
export function chartDominance(daysRank1: number, daysRank1to3: number, daysRank4to10: number): number {
  return daysRank1 * 3 + daysRank1to3 * 1.5 + daysRank4to10 * 0.5;
}

/**
 * Total_Score = Rank_Component + Chart_Dominance + Score_exposure + (Win_Count × 8)
 */
export function totalScore(
  rc: number,
  dominance: number,
  exposure: number,
  winCount: number,
  params?: ScoringParams,
): number {
  const winMultiplier = params?.winCountMultiplier ?? 8;
  return rc + dominance + exposure + winCount * winMultiplier;
}

/**
 * Stale-chart formula (§6.4):
 * Total_Score_stale = w_long × days_top20_in_[D-60, D] + Score_exposure + Win_Count × 8
 */
export function totalScoreStale(
  daysTop20InStalePeriod: number,
  exposure: number,
  winCount: number,
  wLong: number = 1.0,
  params?: ScoringParams,
): number {
  const winMultiplier = params?.winCountMultiplier ?? 8;
  return wLong * daysTop20InStalePeriod + exposure + winCount * winMultiplier;
}
