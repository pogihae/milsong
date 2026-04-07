import { describe, it, expect } from 'vitest';
import { buildAnalytics } from '../analytics';
import type { ScoredSong, Song } from '../types';

function makeScoredSong(overrides: Partial<ScoredSong> = {}): ScoredSong {
  const song: Song = {
    id: 'song-id',
    title: 'Test Song',
    artist: 'Test Artist',
    genre: 'ballad',
    groupType: 'male_group',
    releaseDate: '2023-03-15',
  };

  return {
    song,
    totalScore: 50,
    rankComponent: 30,
    scoreExposure: 20,
    chartDominance: 0,
    daysTop3: 0,
    daysRank4to10: 0,
    bestRank: 5,
    temporalWeight: 1.5,
    genreMultiplier: 1.0,
    isGolden: false,
    isSilver: false,
    isBronze: false,
    ...overrides,
  };
}

describe('buildAnalytics', () => {
  it('returns the golden sentence', () => {
    const lines = buildAnalytics(makeScoredSong({ isGolden: true }));
    expect(lines).toContain(
      '입대 직전·직후에 신곡으로 차트에 강하게 노출된 곡입니다.',
    );
  });

  it('returns the silver sentence without the golden sentence', () => {
    const lines = buildAnalytics(makeScoredSong({ isSilver: true }));
    expect(lines).toContain(
      '입대 전부터 이미 차트 상위권을 유지하던 롱런 곡입니다.',
    );
    expect(lines.some((line) => line.includes('신곡'))).toBe(false);
  });

  it('adds the genre sentence only for female group dance songs', () => {
    const withGenre = buildAnalytics(
      makeScoredSong({
        song: {
          id: 'x',
          title: 'T',
          artist: 'A',
          genre: 'dance',
          groupType: 'female_group',
          releaseDate: '2023-01-01',
        },
      }),
    );

    const withoutGenre = buildAnalytics(
      makeScoredSong({
        song: {
          id: 'x',
          title: 'T',
          artist: 'A',
          genre: 'dance',
          groupType: 'male_group',
          releaseDate: '2023-01-01',
        },
      }),
    );

    expect(withGenre).toContain(
      '걸그룹 댄스 장르로, 공용 공간에서 자주 흘러나오던 유형의 곡입니다.',
    );
    expect(withoutGenre.some((line) => line.includes('걸그룹 댄스'))).toBe(false);
  });

  it('includes dominance and exposure lines when present', () => {
    const lines = buildAnalytics(
      makeScoredSong({ chartDominance: 40, scoreExposure: 42, daysTop3: 20, daysRank4to10: 15 }),
    );
    expect(lines).toContain('입대 전후 핵심 기간 동안 차트 1위권을 강하게 유지했습니다.');
    expect(lines).toContain('입대 전후 핵심 기간 동안 TOP 10에 35일간 머물렀습니다.');
  });

  it('omits dominance and exposure lines when absent', () => {
    const lines = buildAnalytics(makeScoredSong({ chartDominance: 0, scoreExposure: 0 }));
    expect(lines.some((line) => line.includes('1위권'))).toBe(false);
    expect(lines.some((line) => line.includes('TOP 10'))).toBe(false);
  });
});
