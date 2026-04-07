export type GroupType = 'female_group' | 'male_group' | 'male_solo' | 'female_solo' | 'mixed' | 'other';
export type Genre = 'dance' | 'ballad' | 'hip_hop' | 'r_and_b' | 'trot' | 'other';
export type ChartType = 'daily' | 'weekly';

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  groupType: GroupType;
  releaseDate: string | null; // YYYY-MM-DD
  sourceArtistId?: string | null;
  albumArtUrl?: string | null;
}

export interface ChartEntry {
  chartDate: string; // YYYY-MM-DD
  rank: number; // 1–20
  songId: string;
  chartType: ChartType;
  source?: string;
}

export interface BroadcastWin {
  songId: string;
  broadcastDate: string; // YYYY-MM-DD
  channel: 'KBS' | 'MBC' | 'SBS' | 'Mnet';
}

export interface ScoredSong {
  song: Song;
  totalScore: number;
  rankComponent: number;
  scoreExposure: number;
  chartDominance: number;
  daysTop3: number;
  daysRank4to10: number;
  bestRank: number | null;
  temporalWeight: number;
  genreMultiplier: number;
  isGolden: boolean;
  isSilver: boolean;
}

export interface Candidate {
  rank: number;
  songId: string;
  artist: string;
  title: string;
  totalScore: number;
  albumArtUrl?: string | null;
  breakdown: {
    rankComponent: number;
    dominance: number;
    exposure: number;
  };
}

export interface SongComment {
  id: string;
  songId: string;
  nickname: string;
  content: string;
  createdAt: string; // ISO string
}

export interface RecommendResult {
  title: string;
  mainSong: { artist: string; title: string };
  candidates: Candidate[];
  analytics: string[];
  eraLabel: string;
  staleMode: boolean;
}

export interface ScoringParams {
  goldenWeight?: number;
  silverWeight?: number;
}

export interface RecommendInput {
  enlistmentDate: string; // YYYY-MM-DD
  scoringParams?: ScoringParams;
}
