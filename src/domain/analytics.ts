import type { ScoredSong, Tone } from './types';

/**
 * Builds the analytics sentence array for the recommendation result.
 * Each sentence is generated only when its trigger condition is met.
 */
export function buildAnalytics(scored: ScoredSong, tone: Tone): string[] {
  const lines: string[] = [];

  if (scored.isGolden) {
    lines.push(
      tone === 't_plus'
        ? 'This new release dominated the chart right around your enlistment.'
        : 'This song surged as a new release during the days around your enlistment.',
    );
  } else if (scored.isSilver) {
    lines.push(
      tone === 't_plus'
        ? 'This was already a long-running chart staple before you settled into base life.'
        : 'This was a long-running hit that stayed high on the chart before enlistment.',
    );
  }

  if (scored.song.groupType === 'female_group' && scored.song.genre === 'dance') {
    lines.push(
      tone === 't_plus'
        ? 'Its girl-group dance profile matches the kind of repeat TV exposure common in service.'
        : 'Its girl-group dance sound matches the songs that often cycled through shared spaces.',
    );
  }

  if (scored.winCount > 0) {
    lines.push(
      tone === 't_plus'
        ? `It picked up ${scored.winCount} music-show wins during your early-service window.`
        : `It earned ${scored.winCount} music-show wins during the period that shaped your era.`,
    );
  }

  if (scored.scoreExposure > 0) {
    const days = Math.round(scored.scoreExposure);
    lines.push(
      tone === 't_plus'
        ? `It stayed in the Top 10 for ${days} days during the first 100 days of service.`
        : `It remained in the Top 10 for ${days} days during the first 100 days after enlistment.`,
    );
  }

  return lines;
}
