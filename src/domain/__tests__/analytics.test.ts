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
    winCount: 0,
    bestRank: 5,
    temporalWeight: 1.5,
    genreMultiplier: 1.0,
    isGolden: false,
    isSilver: false,
    ...overrides,
  };
}

describe('buildAnalytics', () => {
  describe('Golden Window', () => {
    it('includes golden sentence when isGolden is true', () => {
      const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 'nostalgic');
      expect(lines.some((l) => l.includes('신곡'))).toBe(true);
    });

    it('does NOT include silver sentence when isGolden is true', () => {
      const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 'nostalgic');
      expect(lines.some((l) => l.includes('롱런'))).toBe(false);
    });

    it('uses military tone for t_plus', () => {
      const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 't_plus');
      expect(lines.some((l) => l.includes('귀하'))).toBe(true);
    });
  });

  describe('Silver Window', () => {
    it('includes silver sentence when isSilver is true', () => {
      const lines = buildAnalytics(makeScoredSong({ isSilver: true }), 'nostalgic');
      expect(lines.some((l) => l.includes('롱런'))).toBe(true);
    });

    it('does NOT include golden sentence when only isSilver is true', () => {
      const lines = buildAnalytics(makeScoredSong({ isSilver: true }), 'nostalgic');
      expect(lines.some((l) => l.includes('신곡'))).toBe(false);
    });
  });

  describe('Genre bonus', () => {
    it('includes genre sentence for female_group + dance', () => {
      const lines = buildAnalytics(
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
        'nostalgic',
      );
      expect(lines.some((l) => l.includes('걸그룹'))).toBe(true);
    });

    it('does NOT include genre sentence for male_group + dance', () => {
      const lines = buildAnalytics(
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
        'nostalgic',
      );
      expect(lines.some((l) => l.includes('걸그룹'))).toBe(false);
    });
  });

  describe('Win count', () => {
    it('includes win sentence when winCount > 0', () => {
      const lines = buildAnalytics(makeScoredSong({ winCount: 8 }), 'nostalgic');
      expect(lines.some((l) => l.includes('8관왕'))).toBe(true);
    });

    it('omits win sentence when winCount is 0', () => {
      const lines = buildAnalytics(makeScoredSong({ winCount: 0 }), 'nostalgic');
      expect(lines.some((l) => l.includes('관왕'))).toBe(false);
    });
  });

  describe('Exposure', () => {
    it('includes exposure sentence when scoreExposure > 0', () => {
      const lines = buildAnalytics(makeScoredSong({ scoreExposure: 42 }), 'nostalgic');
      expect(lines.some((l) => l.includes('42일'))).toBe(true);
    });

    it('omits exposure sentence when scoreExposure is 0', () => {
      const lines = buildAnalytics(makeScoredSong({ scoreExposure: 0 }), 'nostalgic');
      expect(lines.some((l) => l.includes('TOP 10'))).toBe(false);
    });
  });

  describe('tone', () => {
    it('t_plus uses 관물대 style phrasing', () => {
      const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 't_plus');
      expect(lines.join(' ')).toContain('귀하');
    });

    it('nostalgic uses softer phrasing without 귀하', () => {
      const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 'nostalgic');
      expect(lines.join(' ')).not.toContain('귀하');
    });
  });
});
