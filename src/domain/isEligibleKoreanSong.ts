import type { Song } from './types';

const HANGUL_REGEX = /[\uac00-\ud7a3]/;

export function isEligibleKoreanSong(song: Song): boolean {
  return song.groupType !== 'other' || song.genre !== 'other' || HANGUL_REGEX.test(song.title);
}
