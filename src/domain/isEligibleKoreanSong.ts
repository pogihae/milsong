import type { Song } from './types';

const HANGUL_REGEX = /[가-힣]/;

export function isEligibleKoreanSong(song: Song): boolean {
  if (song.groupType !== 'other') {
    return true;
  }

  if (song.genre !== 'other') {
    return true;
  }

  return HANGUL_REGEX.test(song.title);
}
