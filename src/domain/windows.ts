import { addDays } from '@/lib/dateUtils';
import type { ScoringParams } from './types';

/**
 * Returns true if release date P falls within the Golden Window: [D-14, D+30]
 */
export function isGoldenWindow(enlistmentDate: string, releaseDate: string): boolean {
  const d = new Date(enlistmentDate);
  const p = new Date(releaseDate);
  return p >= addDays(d, -14) && p <= addDays(d, 30);
}

/**
 * Returns true if the song qualifies for the Silver Window.
 * Condition: P < D-14 AND the song appeared in TOP 20 for >= 15 days in [D-60, D-1].
 */
export function isSilverWindow(
  enlistmentDate: string,
  releaseDate: string,
  daysInTop20BeforeEnlistment: number,
): boolean {
  const d = new Date(enlistmentDate);
  const p = new Date(releaseDate);
  return p < addDays(d, -14) && daysInTop20BeforeEnlistment >= 15;
}

/**
 * Returns true if the song qualifies for the Bronze Window.
 * Condition: P < D-60 AND the song appeared in TOP 20 for >= 20 days in [D-90, D-1].
 */
export function isBronzeWindow(
  enlistmentDate: string,
  releaseDate: string,
  daysInTop20Bronze: number,
): boolean {
  const d = new Date(enlistmentDate);
  const p = new Date(releaseDate);
  return p < addDays(d, -60) && daysInTop20Bronze >= 20;
}

/**
 * Returns the Temporal_Weight for a song.
 * Golden → 1.3, Silver → 1.0, Bronze → 0.6, neither → 0
 * Optionally overridden by ScoringParams.
 */
export function temporalWeight(
  isGolden: boolean,
  isSilver: boolean,
  isBronze: boolean,
  params?: ScoringParams,
): number {
  if (isGolden) return params?.goldenWeight ?? 1.3;
  if (isSilver) return params?.silverWeight ?? 1.0;
  if (isBronze) return params?.bronzeWeight ?? 0.6;
  return 0;
}
