import { describe, it, expect } from 'vitest';
import {
  genreMultiplier,
  baseRank,
  rankComponent,
  scoreExposure,
  totalScore,
  totalScoreStale,
} from '../scoring';
import type { Song } from '../types';

function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 'test-id',
    title: 'Test Song',
    artist: 'Test Artist',
    genre: 'dance',
    groupType: 'female_group',
    releaseDate: '2023-01-01',
    ...overrides,
  };
}

describe('genreMultiplier', () => {
  it('returns 1.5 for female_group + dance', () => {
    expect(genreMultiplier(makeSong({ groupType: 'female_group', genre: 'dance' }))).toBe(1.5);
  });

  it('returns 1.0 for female_group + ballad', () => {
    expect(genreMultiplier(makeSong({ groupType: 'female_group', genre: 'ballad' }))).toBe(1.0);
  });

  it('returns 1.0 for male_group + dance', () => {
    expect(genreMultiplier(makeSong({ groupType: 'male_group', genre: 'dance' }))).toBe(1.0);
  });

  it('returns 1.0 for male_solo + ballad', () => {
    expect(genreMultiplier(makeSong({ groupType: 'male_solo', genre: 'ballad' }))).toBe(1.0);
  });
});

describe('baseRank', () => {
  it('returns 20 for bestRank 1 (highest rank)', () => {
    expect(baseRank(1)).toBe(20);
  });

  it('returns 1 for bestRank 20', () => {
    expect(baseRank(20)).toBe(1);
  });

  it('returns 0 for null (no chart entry)', () => {
    expect(baseRank(null)).toBe(0);
  });

  it('returns 15 for bestRank 6', () => {
    expect(baseRank(6)).toBe(15);
  });
});

describe('rankComponent', () => {
  it('computes Base_Rank × Temporal_Weight × Genre_Multiplier', () => {
    // bestRank=1 → baseRank=20, tw=1.5, gm=1.5 → 45
    expect(rankComponent(1, 1.5, 1.5)).toBe(45);
  });

  it('returns 0 when bestRank is null', () => {
    expect(rankComponent(null, 1.5, 1.5)).toBe(0);
  });

  it('returns 0 when temporalWeight is 0', () => {
    expect(rankComponent(1, 0, 1.5)).toBe(0);
  });
});

describe('scoreExposure', () => {
  it('returns 100 for 100 days in top 10', () => {
    expect(scoreExposure(100)).toBe(100);
  });

  it('returns 50 for 50 days', () => {
    expect(scoreExposure(50)).toBe(50);
  });

  it('returns 0 for 0 days', () => {
    expect(scoreExposure(0)).toBe(0);
  });
});

describe('totalScore', () => {
  it('sums rank_component + exposure + win_count × 5', () => {
    expect(totalScore(30, 50, 4)).toBe(100);
  });

  it('returns only rank+exposure when winCount is 0', () => {
    expect(totalScore(20, 30, 0)).toBe(50);
  });
});

describe('totalScoreStale', () => {
  it('uses default w_long of 1.0', () => {
    // 1.0 × 30 + 20 + 2 × 5 = 60
    expect(totalScoreStale(30, 20, 2)).toBe(60);
  });

  it('applies custom w_long', () => {
    // 2.0 × 30 + 20 + 2 × 5 = 90
    expect(totalScoreStale(30, 20, 2, 2.0)).toBe(90);
  });
});
