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
  it('returns the nostalgic golden sentence', () => {
    const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 'nostalgic');
    expect(lines).toContain(
      'This song surged as a new release during the days around your enlistment.',
    );
  });

  it('returns the military golden sentence for t_plus', () => {
    const lines = buildAnalytics(makeScoredSong({ isGolden: true }), 't_plus');
    expect(lines).toContain('This new release dominated the chart right around your enlistment.');
  });

  it('returns the silver sentence without the golden sentence', () => {
    const lines = buildAnalytics(makeScoredSong({ isSilver: true }), 'nostalgic');
    expect(lines).toContain(
      'This was a long-running hit that stayed high on the chart before enlistment.',
    );
    expect(lines.some((line) => line.includes('new release'))).toBe(false);
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
      'nostalgic',
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
      'nostalgic',
    );

    expect(withGenre).toContain(
      'Its girl-group dance sound matches the songs that often cycled through shared spaces.',
    );
    expect(withoutGenre.some((line) => line.includes('girl-group dance'))).toBe(false);
  });

  it('includes win and exposure lines when present', () => {
    const lines = buildAnalytics(makeScoredSong({ winCount: 8, scoreExposure: 42 }), 'nostalgic');
    expect(lines).toContain(
      'It earned 8 music-show wins during the period that shaped your era.',
    );
    expect(lines).toContain(
      'It remained in the Top 10 for 42 days during the first 100 days after enlistment.',
    );
  });

  it('omits win and exposure lines when absent', () => {
    const lines = buildAnalytics(makeScoredSong({ winCount: 0, scoreExposure: 0 }), 'nostalgic');
    expect(lines.some((line) => line.includes('music-show wins'))).toBe(false);
    expect(lines.some((line) => line.includes('Top 10'))).toBe(false);
  });
});
