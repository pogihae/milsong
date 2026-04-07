import { describe, it, expect } from 'vitest';
import {
  genreMultiplier,
  baseRank,
  rankComponent,
  scoreExposure,
  totalScore,
  totalScoreStale,
  chartDominance,
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
  it('returns 1.3 for female_group + dance', () => {
    expect(genreMultiplier(makeSong({ groupType: 'female_group', genre: 'dance' }))).toBe(1.3);
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
    // bestRank=1 → baseRank=20, tw=1.3, gm=1.3 → 20 * 1.3 * 1.3 = 33.8
    expect(rankComponent(1, 1.3, 1.3)).toBeCloseTo(33.8, 5);
  });

  it('returns 0 when bestRank is null', () => {
    expect(rankComponent(null, 1.5, 1.5)).toBe(0);
  });

  it('returns 0 when temporalWeight is 0', () => {
    expect(rankComponent(1, 0, 1.5)).toBe(0);
  });
});

describe('scoreExposure', () => {
  it('returns correctly stratified score', () => {
    // top3=10 (10*1.2=12), top10=20 (20*1.0=20), top20=30 (30*0.1=3) → 35/100*100 = 35
    expect(scoreExposure(10, 20, 30)).toBe(35);
  });

  it('returns 0 for 0 days', () => {
    expect(scoreExposure(0, 0, 0)).toBe(0);
  });
});

describe('chartDominance', () => {
  it('calculates dominance correctly based on rank thresholds', () => {
    // rank1=5 (15), rank1to3=10 (15), rank4to10=20 (10) → 40
    expect(chartDominance(5, 10, 20)).toBe(40);
  });

  it('returns 0 for all zeros', () => {
    expect(chartDominance(0, 0, 0)).toBe(0);
  });
});

describe('totalScore', () => {
  it('sums rank_component + dominance + exposure', () => {
    // 30 + 20 + 35 = 85
    expect(totalScore(30, 20, 35)).toBe(85);
  });

  it('returns only rank+dominance when exposure is 0', () => {
    expect(totalScore(20, 10, 0)).toBe(30);
  });
});

describe('totalScoreStale', () => {
  it('sums recencyScore + exposure + dominance', () => {
    // 30 + 20 + 10 = 60
    expect(totalScoreStale(30, 20, 10)).toBe(60);
  });

  it('returns 0 for all zeros', () => {
    expect(totalScoreStale(0, 0, 0)).toBe(0);
  });
});
