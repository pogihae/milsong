import type { ScoredSong } from '@/domain/types';
import { fetchBugsHtml } from '@/ingest/bugs/fetchHtml';
import { parseBugsArtistMetadata } from '@/ingest/bugs/parseArtistMetadata';

const HANGUL_REGEX = /[가-힣]/;

function requiresNationalityCheck(song: ScoredSong['song']): boolean {
  return !HANGUL_REGEX.test(song.title);
}

export async function filterDomesticCandidates(scoredSongs: ScoredSong[]): Promise<ScoredSong[]> {
  const nationalityCache = new Map<string, string | null>();
  const filtered: ScoredSong[] = [];

  for (const scoredSong of scoredSongs) {
    if (!requiresNationalityCheck(scoredSong.song)) {
      filtered.push(scoredSong);
      continue;
    }

    const artistId = scoredSong.song.sourceArtistId;
    if (!artistId) {
      continue;
    }

    let nationality = nationalityCache.get(artistId);
    if (nationality === undefined) {
      const html = await fetchBugsHtml(`https://music.bugs.co.kr/artist/${artistId}`);
      nationality = parseBugsArtistMetadata(html).nationality;
      nationalityCache.set(artistId, nationality);
    }

    if (nationality === '대한민국') {
      filtered.push(scoredSong);
    }
  }

  return filtered;
}
