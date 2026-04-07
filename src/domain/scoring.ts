import type { Song } from './types';

/**
 * Genre_Multiplier: 1.3 for female group dance songs, 1.0 for all others.
 */
export function genreMultiplier(song: Song): number {
  return song.groupType === 'female_group' && song.genre === 'dance' ? 1.3 : 1.0;
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
 * Score_exposure — stratified by rank depth, applied to window [D-7, D+45].
 * TOP 3, rank 4–10 (daysTop10), and rank 11–20 (daysTop20) weighted differently.
 * Multipliers keep exposure from dominating when chart presence is broad but shallow.
 */
export function scoreExposure(daysTop3: number, daysTop10: number, daysTop20: number): number {
  return daysTop3 * 1.2 + daysTop10 * 1.0 + daysTop20 * 0.1;
}

/**
 * Chart Dominance — weighted rank-tier score in Golden Window [D-14, D+30].
 * rank1*3 + rank1to3*1.5 + rank4to10*0.5
 */
export function chartDominance(daysRank1: number, daysRank1to3: number, daysRank4to10: number): number {
  return daysRank1 * 3 + daysRank1to3 * 1.5 + daysRank4to10 * 0.5;
}

/**
 * Total_Score = Rank_Component + Chart_Dominance + Score_exposure
 * Win_Count removed: chart dominance replaces external broadcast wins data.
 */
export function totalScore(
  rc: number,
  dominance: number,
  exposure: number,
): number {
  return rc + dominance + exposure;
}

/**
 * Stale-chart formula (§6.4):
 * Total_Score_stale = recencyScore + Score_exposure + Chart_Dominance
 *
 * recencyScore = max(0, 365 - daysBetweenReleaseDateAndD)
 * This rewards songs released closer to D over long-running steady sellers.
 */
export function totalScoreStale(
  recencyScore: number,
  exposure: number,
  dominance: number,
): number {
  return recencyScore + exposure + dominance;
}
