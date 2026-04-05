import { describe, expect, it } from 'vitest';
import { isEligibleKoreanSong } from '../isEligibleKoreanSong';
import type { Song } from '../types';

function song(overrides: Partial<Song>): Song {
  return {
    id: 'song-id',
    title: 'Song',
    artist: 'Artist',
    genre: 'other',
    groupType: 'other',
    releaseDate: '2020-01-01',
    ...overrides,
  };
}

describe('isEligibleKoreanSong', () => {
  it('keeps songs with classified Korean group types', () => {
    expect(isEligibleKoreanSong(song({ groupType: 'female_group' }))).toBe(true);
  });

  it('keeps songs with classified genres even when group type is unknown', () => {
    expect(isEligibleKoreanSong(song({ genre: 'ballad' }))).toBe(true);
  });

  it('keeps Korean-titled songs even when metadata is sparse', () => {
    expect(isEligibleKoreanSong(song({ title: '숨겨진 세상', genre: 'other', groupType: 'other' }))).toBe(true);
  });

  it('filters foreign-looking songs with sparse metadata', () => {
    expect(isEligibleKoreanSong(song({ title: 'Speechless (Full)', genre: 'other', groupType: 'other' }))).toBe(false);
  });
});
