import { addDays } from '@/lib/dateUtils';

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
 * Condition: P < D-14 AND the song appeared in TOP 20 for ≥10 days in [D-30, D-1].
 */
export function isSilverWindow(
  enlistmentDate: string,
  releaseDate: string,
  daysInTop20BeforeEnlistment: number,
): boolean {
  const d = new Date(enlistmentDate);
  const p = new Date(releaseDate);
  return p < addDays(d, -14) && daysInTop20BeforeEnlistment >= 10;
}

/**
 * Returns the Temporal_Weight for a song.
 * Golden → 1.5, Silver → 1.0, neither → 0
 */
export function temporalWeight(isGolden: boolean, isSilver: boolean): number {
  if (isGolden) return 1.5;
  if (isSilver) return 1.0;
  return 0;
}
