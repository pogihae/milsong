import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getIngestSupabaseClient } from './env';
import type { HistoricalBootstrapSummary, HistoricalChartInputRow } from './historicalTypes';

type SongInsert = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  group_type: string;
  release_date: string | null;
  source: string;
  source_song_id: string;
  source_artist_id: null;
  source_album_id: null;
  updated_at: string;
};

const DATABASE_CHUNK_SIZE = 500;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeKeyPart(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceSongIdFor(row: HistoricalChartInputRow): string {
  return `${row.source}:${normalizeKeyPart(row.artist)}:${normalizeKeyPart(row.title)}`;
}

function chunkArray<T>(values: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

async function createBootstrapRun(
  supabase: SupabaseClient,
  source: string,
  fromYear: number,
  toYear: number,
): Promise<string> {
  const { data, error } = await supabase
    .from('historical_bootstrap_runs')
    .insert({
      source,
      from_year: fromYear,
      to_year: toYear,
      status: 'running',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create historical bootstrap run: ${error?.message ?? 'missing response data'}`);
  }

  return data.id as string;
}

async function completeBootstrapRun(
  supabase: SupabaseClient,
  runId: string,
  status: 'succeeded' | 'failed',
  rowsImported: number,
  message?: string,
) {
  const { error } = await supabase
    .from('historical_bootstrap_runs')
    .update({
      finished_at: nowIso(),
      rows_imported: rowsImported,
      status,
      message: message ?? null,
    })
    .eq('id', runId);

  if (error) {
    throw new Error(`Failed to finalize historical bootstrap run ${runId}: ${error.message}`);
  }
}

function validateRows(rows: HistoricalChartInputRow[]) {
  if (rows.length === 0) {
    throw new Error('Historical bootstrap input is empty.');
  }

  for (const row of rows) {
    if (!Number.isInteger(row.year) || row.year < 1900) {
      throw new Error(`Invalid historical year "${row.year}".`);
    }

    if (!Number.isInteger(row.rank) || row.rank < 1) {
      throw new Error(`Invalid historical rank "${row.rank}" for ${row.title}.`);
    }

    if (!row.title.trim() || !row.artist.trim() || !row.source.trim()) {
      throw new Error(`Historical rows require title, artist, and source. Received ${JSON.stringify(row)}.`);
    }
  }
}

export async function bootstrapHistoricalCharts(
  rows: HistoricalChartInputRow[],
): Promise<HistoricalBootstrapSummary> {
  validateRows(rows);

  const supabase = getIngestSupabaseClient();
  const years = rows.map((row) => row.year);
  const fromYear = Math.min(...years);
  const toYear = Math.max(...years);
  const source = rows[0].source;

  if (rows.some((row) => row.source !== source)) {
    throw new Error('Historical bootstrap input must contain a single source per run.');
  }

  const runId = await createBootstrapRun(supabase, source, fromYear, toYear);
  const timestamp = nowIso();

  try {
    const songRecordsMap = new Map<string, SongInsert>();
    for (const row of rows) {
      const sourceSongId = sourceSongIdFor(row);
      if (songRecordsMap.has(sourceSongId)) {
        continue;
      }

      songRecordsMap.set(sourceSongId, {
        id: randomUUID(),
        title: row.title.trim(),
        artist: row.artist.trim(),
        genre: row.genre ?? 'other',
        group_type: row.groupType ?? 'other',
        release_date: row.releaseDate ?? null,
        source,
        source_song_id: sourceSongId,
        source_artist_id: null,
        source_album_id: null,
        updated_at: timestamp,
      });
    }
    const songRecords = [...songRecordsMap.values()];

    const sourceSongIds = songRecords.map((record) => record.source_song_id);
    const existingIds = new Set<string>();
    for (const sourceSongIdChunk of chunkArray(sourceSongIds, DATABASE_CHUNK_SIZE)) {
      const { data: existingSongs, error: existingSongsError } = await supabase
        .from('songs')
        .select('source_song_id')
        .eq('source', source)
        .in('source_song_id', sourceSongIdChunk);

      if (existingSongsError) {
        throw new Error(`Failed to load historical songs: ${existingSongsError.message}`);
      }

      for (const row of existingSongs ?? []) {
        existingIds.add(row.source_song_id as string);
      }
    }

    const songsToInsert = songRecords.filter((record) => !existingIds.has(record.source_song_id));

    for (const songInsertChunk of chunkArray(songsToInsert, DATABASE_CHUNK_SIZE)) {
      if (songInsertChunk.length === 0) {
        continue;
      }

      const { error: insertSongsError } = await supabase.from('songs').insert(songInsertChunk, {
        defaultToNull: false,
      });
      if (insertSongsError) {
        throw new Error(`Failed to insert historical songs: ${insertSongsError.message}`);
      }
    }

    const songIdBySourceSongId = new Map<string, string>();
    for (const sourceSongIdChunk of chunkArray(sourceSongIds, DATABASE_CHUNK_SIZE)) {
      const { data: songRows, error: songRowsError } = await supabase
        .from('songs')
        .select('id, source_song_id')
        .eq('source', source)
        .in('source_song_id', sourceSongIdChunk);

      if (songRowsError) {
        throw new Error(`Failed to resolve historical song ids: ${songRowsError.message}`);
      }

      for (const row of songRows ?? []) {
        songIdBySourceSongId.set(row.source_song_id as string, row.id as string);
      }
    }

    const yearRange = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
    const { error: deleteError } = await supabase
      .from('historical_charts')
      .delete()
      .eq('source', source)
      .in('chart_year', yearRange);

    if (deleteError) {
      throw new Error(`Failed to clear historical chart rows: ${deleteError.message}`);
    }

    const chartRows = rows.map((row) => {
      const songId = songIdBySourceSongId.get(sourceSongIdFor(row));
      if (!songId) {
        throw new Error(`Missing historical song mapping for ${row.artist} - ${row.title} (${row.year}).`);
      }

      return {
        source,
        chart_year: row.year,
        rank: row.rank,
        song_id: songId,
        notes: row.notes ?? null,
      };
    });

    for (const chartInsertChunk of chunkArray(chartRows, DATABASE_CHUNK_SIZE)) {
      const { error: insertChartsError } = await supabase.from('historical_charts').insert(chartInsertChunk, {
        defaultToNull: false,
      });

      if (insertChartsError) {
        throw new Error(`Failed to insert historical chart rows: ${insertChartsError.message}`);
      }
    }

    await completeBootstrapRun(supabase, runId, 'succeeded', chartRows.length);

    return {
      source,
      fromYear,
      toYear,
      importedSongs: songsToInsert.length,
      importedChartRows: chartRows.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown historical bootstrap error';
    await completeBootstrapRun(supabase, runId, 'failed', 0, message);
    throw error;
  }
}
