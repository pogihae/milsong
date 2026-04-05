import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ChartUpsertRecord,
  DailyChartSnapshot,
  IngestMode,
  IngestSource,
  SongUpsertRecord,
  SyncRunRecord,
} from './types';

function nowIso() {
  return new Date().toISOString();
}

export async function createSyncRun(
  supabase: SupabaseClient,
  source: IngestSource,
  mode: IngestMode,
  rangeStart: string,
  rangeEnd: string,
): Promise<SyncRunRecord> {
  const { data, error } = await supabase
    .from('sync_runs')
    .insert({
      source,
      job_type: mode,
      chart_type: 'daily',
      range_start: rangeStart,
      range_end: rangeEnd,
      status: 'running',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create sync run: ${error?.message ?? 'missing response data'}`);
  }

  return data;
}

export async function completeSyncRun(
  supabase: SupabaseClient,
  runId: string,
  status: 'succeeded' | 'failed',
  processedDays: number,
  rowsSynced: number,
  message?: string,
) {
  const { error } = await supabase
    .from('sync_runs')
    .update({
      status,
      processed_days: processedDays,
      rows_synced: rowsSynced,
      message: message ?? null,
      finished_at: nowIso(),
    })
    .eq('id', runId);

  if (error) {
    throw new Error(`Failed to finalize sync run ${runId}: ${error.message}`);
  }
}

export async function updateCheckpoint(
  supabase: SupabaseClient,
  source: IngestSource,
  chartDate: string,
) {
  const { error } = await supabase.from('sync_checkpoints').upsert(
    {
      source,
      chart_type: 'daily',
      last_synced_at: chartDate,
      updated_at: nowIso(),
    },
    {
      onConflict: 'source,chart_type',
    },
  );

  if (error) {
    throw new Error(`Failed to update checkpoint for ${source}: ${error.message}`);
  }
}

export async function getCheckpoint(supabase: SupabaseClient, source: IngestSource): Promise<string | null> {
  const { data, error } = await supabase
    .from('sync_checkpoints')
    .select('last_synced_at')
    .eq('source', source)
    .eq('chart_type', 'daily')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load checkpoint for ${source}: ${error.message}`);
  }

  return data?.last_synced_at ?? null;
}

export async function upsertDailyChartSnapshot(
  supabase: SupabaseClient,
  snapshot: DailyChartSnapshot,
): Promise<number> {
  const timestamp = nowIso();
  const songs: SongUpsertRecord[] = snapshot.rows.map((row) => ({
    id: crypto.randomUUID(),
    title: row.title,
    artist: row.artist,
    genre: 'other',
    group_type: 'other',
    release_date: null,
    source: snapshot.source,
    source_song_id: row.sourceSongId,
    source_artist_id: row.sourceArtistId,
    source_album_id: row.sourceAlbumId,
    updated_at: timestamp,
  }));

  const sourceSongIds = snapshot.rows.map((row) => row.sourceSongId);
  const { data: existingSongs, error: existingSongsError } = await supabase
    .from('songs')
    .select('source_song_id')
    .eq('source', snapshot.source)
    .in('source_song_id', sourceSongIds);

  if (existingSongsError) {
    throw new Error(`Failed to load existing songs for ${snapshot.chartDate}: ${existingSongsError.message}`);
  }

  const existingSourceIds = new Set((existingSongs ?? []).map((row) => row.source_song_id as string));
  const songsToInsert = songs.filter((song) => !existingSourceIds.has(song.source_song_id));

  const { error: songInsertError } =
    songsToInsert.length > 0
      ? await supabase.from('songs').insert(songsToInsert, { defaultToNull: false })
      : { error: null };

  if (songInsertError) {
    throw new Error(`Failed to insert songs for ${snapshot.chartDate}: ${songInsertError.message}`);
  }

  const { data: songRows, error: songQueryError } = await supabase
    .from('songs')
    .select('id, source_song_id')
    .eq('source', snapshot.source)
    .in('source_song_id', sourceSongIds);

  if (songQueryError) {
    throw new Error(`Failed to resolve song ids for ${snapshot.chartDate}: ${songQueryError.message}`);
  }

  const songIdBySourceId = new Map((songRows ?? []).map((row) => [row.source_song_id as string, row.id as string]));

  const charts: ChartUpsertRecord[] = snapshot.rows.map((row) => {
    const songId = songIdBySourceId.get(row.sourceSongId);

    if (!songId) {
      throw new Error(`Missing mapped song id for source song ${row.sourceSongId} on ${snapshot.chartDate}.`);
    }

    return {
      chart_date: snapshot.chartDate,
      rank: row.rank,
      song_id: songId,
      chart_type: 'daily',
      source: snapshot.source,
    };
  });

  const { error: chartDeleteError } = await supabase
    .from('charts')
    .delete()
    .eq('source', snapshot.source)
    .eq('chart_date', snapshot.chartDate)
    .eq('chart_type', snapshot.chartType);

  if (chartDeleteError) {
    throw new Error(`Failed to clear charts for ${snapshot.chartDate}: ${chartDeleteError.message}`);
  }

  const { error: chartInsertError } = await supabase.from('charts').insert(charts, {
    defaultToNull: false,
  });

  if (chartInsertError) {
    throw new Error(`Failed to insert charts for ${snapshot.chartDate}: ${chartInsertError.message}`);
  }

  return charts.length;
}
