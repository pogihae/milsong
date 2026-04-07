import type { Song } from '@/domain/types';
import { getSupabaseClient } from './client';

/**
 * Fetches song metadata for a list of song IDs.
 */
export async function getSongsByIds(ids: string[]): Promise<Song[]> {
  if (ids.length === 0) return [];

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, genre, group_type, release_date, source_artist_id, album_art_url')
    .in('id', ids);

  if (error) throw new Error(`songRepository.getSongsByIds: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    groupType: row.group_type,
    releaseDate: row.release_date ?? null,
    sourceArtistId: row.source_artist_id ?? null,
    albumArtUrl: row.album_art_url ?? null,
  }));
}

/**
 * Fetches all songs (for seeding/debugging purposes only).
 */
export async function getAllSongs(): Promise<Song[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, genre, group_type, release_date, source_artist_id, album_art_url')
    .order('title', { ascending: true });

  if (error) throw new Error(`songRepository.getAllSongs: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    groupType: row.group_type,
    releaseDate: row.release_date ?? null,
    sourceArtistId: row.source_artist_id ?? null,
    albumArtUrl: row.album_art_url ?? null,
  }));
}
