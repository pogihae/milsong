import type { Genre, GroupType } from '../domain/types';

export type IngestSource = 'bugs';
export type IngestMode = 'backfill' | 'incremental';

export interface BugsChartRow {
  rank: number;
  title: string;
  artist: string;
  albumTitle: string | null;
  sourceSongId: string;
  sourceArtistId: string | null;
  sourceAlbumId: string | null;
}

export interface DailyChartSnapshot {
  chartDate: string;
  chartType: 'daily';
  source: IngestSource;
  rows: BugsChartRow[];
}

export interface SongUpsertRecord {
  title: string;
  artist: string;
  genre: Genre;
  group_type: GroupType;
  release_date: string | null;
  source: IngestSource;
  source_song_id: string;
  source_artist_id: string | null;
  source_album_id: string | null;
  updated_at: string;
}

export interface ChartUpsertRecord {
  chart_date: string;
  rank: number;
  song_id: string;
  chart_type: 'daily';
  source: IngestSource;
}

export interface SyncRunRecord {
  id: string;
}

export interface IngestOptions {
  source: IngestSource;
  mode: IngestMode;
  from?: string;
  to?: string;
  days?: number;
}

export interface IngestSummary {
  source: IngestSource;
  mode: IngestMode;
  from: string;
  to: string;
  processedDays: number;
  syncedChartRows: number;
}
