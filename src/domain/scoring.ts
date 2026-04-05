import type { Song } from './types';

/**
 * Genre_Multiplier: 1.5 for female group dance songs, 1.0 for all others.
 */
export function genreMultiplier(song: Song): number {
  return song.groupType === 'female_group' && song.genre === 'dance' ? 1.5 : 1.0;
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
 * Score_exposure = (days_in_top10_in_[D, D+100] / 100) × 100
 */
export function scoreExposure(daysInTop10: number): number {
  return (daysInTop10 / 100) * 100;
}

/**
 * Total_Score = Rank_Component + Score_exposure + (Win_Count × 5)
 */
export function totalScore(rc: number, exposure: number, winCount: number): number {
  return rc + exposure + winCount * 5;
}

/**
 * Stale-chart formula (§6.4):
 * Total_Score_stale = w_long × days_top20_in_[D-60, D] + Score_exposure + Win_Count × 5
 */
export function totalScoreStale(
  daysTop20InStalePeriod: number,
  exposure: number,
  winCount: number,
  wLong: number = 1.0,
): number {
  return wLong * daysTop20InStalePeriod + exposure + winCount * 5;
}
