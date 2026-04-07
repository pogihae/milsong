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
  chartDominance: number;    // computed score: rank1*3 + rank1to3*1.5 + rank4to10*0.5
  daysTop3: number;          // days in TOP 3 within exposure window, for analytics
  daysRank4to10: number;     // days in rank 4–10 within exposure window, for analytics
  bestRank: number | null;
  temporalWeight: number;
  genreMultiplier: number;
  isGolden: boolean;
  isSilver: boolean;
  isBronze: boolean;
}

export interface Candidate {
  rank: number;
  songId: string;
  artist: string;
  title: string;
  totalScore: number;
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
  bronzeWeight?: number;
  genreDanceMultiplier?: number;
}

export interface RecommendInput {
  enlistmentDate: string; // YYYY-MM-DD
  scoringParams?: ScoringParams;
}
