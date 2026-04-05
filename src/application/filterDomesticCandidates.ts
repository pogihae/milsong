import type { ScoredSong } from '@/domain/types';
import { fetchBugsHtml } from '@/ingest/bugs/fetchHtml';
import { parseBugsArtistMetadata } from '@/ingest/bugs/parseArtistMetadata';

const HANGUL_REGEX = /[\uac00-\ud7a3]/;
const KOREAN_NATIONALITY = '대한민국';

function requiresNationalityCheck(song: ScoredSong['song']): boolean {
  return !HANGUL_REGEX.test(song.title);
}

export async function filterDomesticCandidates(scoredSongs: ScoredSong[]): Promise<ScoredSong[]> {
  const nationalityCache = new Map<string, string | null>();
  const artistIdsToFetch = [
    ...new Set(
      scoredSongs
        .filter((scoredSong) => requiresNationalityCheck(scoredSong.song) && scoredSong.song.sourceArtistId)
        .map((scoredSong) => scoredSong.song.sourceArtistId as string),
    ),
  ];

  await Promise.all(
    artistIdsToFetch.map(async (artistId) => {
      const html = await fetchBugsHtml(`https://music.bugs.co.kr/artist/${artistId}`);
      const { nationality } = parseBugsArtistMetadata(html);
      nationalityCache.set(artistId, nationality);
    }),
  );

  return scoredSongs.filter((scoredSong) => {
    if (!requiresNationalityCheck(scoredSong.song)) {
      return true;
    }

    const artistId = scoredSong.song.sourceArtistId;
    if (!artistId) {
      return false;
    }

    return nationalityCache.get(artistId) === KOREAN_NATIONALITY;
  });
}
