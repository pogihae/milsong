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
        ? '귀하의 입대 전후로 신곡으로 차트를 강타한 곡입니다.'
        : '입대 직전·직후에 신곡으로 차트에 강하게 노출된 곡입니다.',
    );
  } else if (scored.isSilver) {
    lines.push(
      tone === 't_plus'
        ? '자대 배치 이전부터 이미 차트 상위권을 장기 점령 중이던 곡입니다.'
        : '입대 전부터 이미 차트 상위권을 유지하던 롱런 곡입니다.',
    );
  }

  if (scored.song.groupType === 'female_group' && scored.song.genre === 'dance') {
    lines.push(
      tone === 't_plus'
        ? '걸그룹 댄스 장르 특성상 휴게실 TV에서 반복 노출되기 좋은 곡입니다.'
        : '걸그룹 댄스 장르로, 공용 공간에서 자주 흘러나오던 유형의 곡입니다.',
    );
  }

  if (scored.winCount > 0) {
    lines.push(
      tone === 't_plus'
        ? `귀하의 이병 구간 동안 음방 ${scored.winCount}관왕을 달성했습니다.`
        : `이 곡은 해당 시기 음악 방송에서 ${scored.winCount}회 1위를 차지했습니다.`,
    );
  }

  if (scored.scoreExposure > 0) {
    const days = Math.round(scored.scoreExposure);
    lines.push(
      tone === 't_plus'
        ? `입대 후 100일간 TOP 10에 ${days}일 체류했습니다.`
        : `입대 후 첫 100일 동안 TOP 10에 ${days}일간 머물렀습니다.`,
    );
  }

  return lines;
}
