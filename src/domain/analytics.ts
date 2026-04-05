import type { ScoredSong, Tone } from './types';

export function buildAnalytics(scored: ScoredSong, tone: Tone): string[] {
  const lines: string[] = [];

  if (scored.isGolden) {
    lines.push(
      tone === 't_plus'
        ? '귀하의 입대 직전과 직후에 차트를 강하게 장악한 신곡이라 체감 존재감이 확실합니다.'
        : '입대 직전과 직후에 강하게 떠오른 신곡이라 당시 기억과 맞닿아 있을 가능성이 큽니다.',
    );
  } else if (scored.isSilver) {
    lines.push(
      tone === 't_plus'
        ? '귀하의 입대 전부터 상위권을 지키던 롱런곡이라 부대에서도 꾸준히 들렸을 가능성이 높습니다.'
        : '입대 전부터 이미 상위권을 유지하던 롱런곡이라 자연스럽게 기억에 남기 쉬운 곡입니다.',
    );
  }

  if (scored.song.groupType === 'female_group' && scored.song.genre === 'dance') {
    lines.push(
      tone === 't_plus'
        ? '걸그룹 댄스곡 계열이라 귀하의 TV 시청과 생활관 환경에서 반복 노출됐을 확률이 높습니다.'
        : '걸그룹 댄스곡 특유의 높은 노출 빈도 덕분에 집단 기억으로 이어졌을 가능성이 큽니다.',
    );
  }

  if (scored.winCount > 0) {
    lines.push(
      tone === 't_plus'
        ? `귀하의 체감과 별개로 음악방송 1위 ${scored.winCount}관왕 기록까지 있는 곡입니다.`
        : `음악방송 1위 ${scored.winCount}관왕을 기록해 당시 화제성과 대중성이 분명한 곡입니다.`,
    );
  }

  if (scored.scoreExposure > 0) {
    const days = Math.round(scored.scoreExposure);
    lines.push(
      tone === 't_plus'
        ? `귀하의 입대 후 100일 구간 중 약 ${days}일 동안 차트 Top 10에 머물렀습니다.`
        : `입대 후 100일 동안 약 ${days}일가량 차트 Top 10을 유지해 이병 시절 노출도가 높았습니다.`,
    );
  }

  return lines;
}
