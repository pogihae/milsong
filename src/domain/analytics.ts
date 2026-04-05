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
        ? `귀하의 입대 직전·직후 차트를 강하게 점령한 신곡입니다.`
        : `입대 직전·직후 신곡으로 차트에 강하게 노출된 곡입니다.`,
    );
  } else if (scored.isSilver) {
    lines.push(
      tone === 't_plus'
        ? `자대 배치 전부터 이미 상위권을 유지하던 롱런 곡입니다.`
        : `입대 전부터 이미 차트 상위권을 지키던 롱런 곡입니다.`,
    );
  }

  if (scored.song.groupType === 'female_group' && scored.song.genre === 'dance') {
    lines.push(
      tone === 't_plus'
        ? `휴게실 TV에서 반복 노출된 걸그룹 댄스 장르입니다.`
        : `군 생활 중 TV와 라디오에서 자주 흘러나오던 걸그룹 댄스 곡입니다.`,
    );
  }

  if (scored.winCount > 0) {
    lines.push(
      tone === 't_plus'
        ? `귀하의 이병 시절 음방 ${scored.winCount}관왕을 달성했습니다.`
        : `이병 시절 음악 방송에서 ${scored.winCount}관왕을 달성한 곡입니다.`,
    );
  }

  if (scored.scoreExposure > 0) {
    const days = Math.round(scored.scoreExposure);
    const pct = days;
    lines.push(
      tone === 't_plus'
        ? `이병 100일 구간 중 ${days}일(${pct}%)을 TOP 10 안에 머물렀습니다.`
        : `이병 기간 100일 중 ${days}일 동안 차트 TOP 10을 지킨 곡입니다.`,
    );
  }

  return lines;
}
