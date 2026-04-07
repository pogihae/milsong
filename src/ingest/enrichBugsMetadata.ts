import type { Genre, GroupType } from '@/domain/types';
import { getIngestSupabaseClient } from './env';
import { fetchBugsHtml } from './bugs/fetchHtml';
import { parseBugsAlbumMetadata } from './bugs/parseAlbumMetadata';
import { parseBugsArtistMetadata } from './bugs/parseArtistMetadata';

interface SongRow {
  id: string;
  source_album_id: string | null;
  source_artist_id: string | null;
}

interface AlbumRow {
  genre: Genre;
  releaseDate: string | null;
  albumArtUrl: string | null;
}

export interface EnrichSummary {
  processedSongs: number;
  updatedSongs: number;
  albumRequests: number;
  artistRequests: number;
}

async function retry<T>(fn: () => Promise<T>, label: string, attempts = 3): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw new Error(`${label}: ${lastError?.message ?? 'unknown error'}`);
}

async function loadSongsNeedingEnrichment(limit?: number): Promise<SongRow[]> {
  const supabase = getIngestSupabaseClient();
  let query = supabase
    .from('songs')
    .select('id, source_album_id, source_artist_id')
    .eq('source', 'bugs')
    .or('release_date.is.null,genre.eq.other,group_type.eq.other,album_art_url.is.null')
    .order('id', { ascending: true });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load songs for metadata enrichment: ${error.message}`);
  }

  return (data ?? []) as SongRow[];
}

export async function enrichBugsMetadata(limit?: number): Promise<EnrichSummary> {
  const supabase = getIngestSupabaseClient();
  const songs = await loadSongsNeedingEnrichment(limit);
  const albumCache = new Map<string, AlbumRow>();
  const artistCache = new Map<string, GroupType>();

  let albumRequests = 0;
  let artistRequests = 0;
  let updatedSongs = 0;

  for (const song of songs) {
    let genre: Genre = 'other';
    let releaseDate: string | null = null;
    let groupType: GroupType = 'other';
    let albumArtUrl: string | null = null;

    if (song.source_album_id) {
      const cached = albumCache.get(song.source_album_id);
      if (cached) {
        genre = cached.genre;
        releaseDate = cached.releaseDate;
        albumArtUrl = cached.albumArtUrl;
      } else {
        const html = await retry(
          () => fetchBugsHtml(`https://music.bugs.co.kr/album/${song.source_album_id}`),
          `Failed to fetch album ${song.source_album_id}`,
        );
        const metadata = parseBugsAlbumMetadata(html);
        albumCache.set(song.source_album_id, metadata);
        genre = metadata.genre;
        releaseDate = metadata.releaseDate;
        albumArtUrl = metadata.albumArtUrl;
        albumRequests += 1;
      }
    }

    if (song.source_artist_id) {
      const cached = artistCache.get(song.source_artist_id);
      if (cached) {
        groupType = cached;
      } else {
        const html = await retry(
          () => fetchBugsHtml(`https://music.bugs.co.kr/artist/${song.source_artist_id}`),
          `Failed to fetch artist ${song.source_artist_id}`,
        );
        const metadata = parseBugsArtistMetadata(html);
        artistCache.set(song.source_artist_id, metadata.groupType);
        groupType = metadata.groupType;
        artistRequests += 1;
      }
    }

    const error = await retry(async () => {
      const response = await supabase
        .from('songs')
        .update({
          genre,
          release_date: releaseDate,
          group_type: groupType,
          album_art_url: albumArtUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', song.id);

      return response.error;
    }, `Failed to update song ${song.id}`);

    if (error) {
      throw new Error(`Failed to update song ${song.id}: ${error.message}`);
    }

    updatedSongs += 1;
  }

  return {
    processedSongs: songs.length,
    updatedSongs,
    albumRequests,
    artistRequests,
  };
}
