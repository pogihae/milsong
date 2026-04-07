import type { ScoredSong } from './types';

/**
 * Builds the analytics sentence array for the recommendation result.
 * Each sentence is generated only when its trigger condition is met.
 */
export function buildAnalytics(scored: ScoredSong): string[] {
  const lines: string[] = [];

  if (scored.isGolden) {
    lines.push('입대 직전·직후에 신곡으로 차트에 강하게 노출된 곡입니다.');
  } else if (scored.isSilver) {
    lines.push('입대 전부터 이미 차트 상위권을 유지하던 롱런 곡입니다.');
  }

  if (scored.song.groupType === 'female_group' && scored.song.genre === 'dance') {
    lines.push('걸그룹 댄스 장르로, 공용 공간에서 자주 흘러나오던 유형의 곡입니다.');
  }

  if (scored.chartDominance > 0) {
    lines.push('입대 전후 핵심 기간 동안 차트 1위권을 강하게 유지했습니다.');
  }

  if (scored.scoreExposure > 0) {
    const totalTopDays = scored.daysTop3 + scored.daysRank4to10;
    lines.push(`입대 전후 핵심 기간 동안 TOP 10에 ${totalTopDays}일간 머물렀습니다.`);
  }

  return lines;
}
