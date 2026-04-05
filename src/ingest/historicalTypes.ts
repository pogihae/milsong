import type { Genre, GroupType } from '../domain/types';

export interface HistoricalChartInputRow {
  year: number;
  rank: number;
  title: string;
  artist: string;
  source: string;
  genre?: Genre;
  groupType?: GroupType;
  releaseDate?: string | null;
  notes?: string | null;
}

export interface HistoricalBootstrapSummary {
  source: string;
  fromYear: number;
  toYear: number;
  importedSongs: number;
  importedChartRows: number;
}
