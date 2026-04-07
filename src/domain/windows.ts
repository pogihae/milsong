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
 * Condition: D-90 ≤ P < D-14 AND the song appeared in TOP 20 for >= 10 days in [D-30, D-1].
 *
 * Lower bound D-90 prevents songs released more than 3 months before enlistment from
 * qualifying. The chart window [D-30, D-1] ensures the song was still actively
 * charting right before enlistment.
 */
export function isSilverWindow(
  enlistmentDate: string,
  releaseDate: string,
  daysInTop20BeforeEnlistment: number,
): boolean {
  const d = new Date(enlistmentDate);
  const p = new Date(releaseDate);
  return p >= addDays(d, -90) && p < addDays(d, -14) && daysInTop20BeforeEnlistment >= 10;
}

/**
 * Returns the Temporal_Weight for a song.
 * Golden → 1.3, Silver → 1.0, neither → 0
 */
export function temporalWeight(
  isGolden: boolean,
  isSilver: boolean,
  params?: ScoringParams,
): number {
  if (isGolden) return params?.goldenWeight ?? 1.3;
  if (isSilver) return params?.silverWeight ?? 1.0;
  return 0;
}
