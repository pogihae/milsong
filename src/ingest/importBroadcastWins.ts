import { getIngestSupabaseClient } from './env';
import { fetchWikipediaPage } from './wiki/fetchWikipediaPage';
import { parseMusicShowWinners, type MusicShowWinnerRow } from './wiki/parseMusicShowWinners';

type Channel = 'KBS' | 'MBC' | 'SBS' | 'Mnet';

interface SourceConfig {
  channel: Channel;
  year: number;
  url: string;
}

interface SongLookupRow {
  id: string;
  title: string;
  artist: string;
}

export interface BroadcastImportOptions {
  fromYear?: number;
  toYear?: number;
}

export interface BroadcastImportSummary {
  fromYear: number;
  toYear: number;
  skippedSources: number;
  importedWins: number;
  matchedWins: number;
  unmatchedWins: number;
}

const FIRST_SUPPORTED_YEAR = 2019;

const CHANNEL_PATHS: Record<Channel, string> = {
  KBS: 'Music_Bank',
  SBS: 'Inkigayo',
  Mnet: 'M_Countdown',
  MBC: 'Show!_Music_Core',
};

function buildSources(fromYear: number, toYear: number): SourceConfig[] {
  const sources: SourceConfig[] = [];

  for (let year = fromYear; year <= toYear; year += 1) {
    for (const channel of Object.keys(CHANNEL_PATHS) as Channel[]) {
      sources.push({
        channel,
        year,
        url: `https://en.wikipedia.org/wiki/List_of_${CHANNEL_PATHS[channel]}_Chart_winners_(${year})`,
      });
    }
  }

  return sources;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\(feat\.[^)]+\)/gi, '')
    .replace(/\(featuring[^)]+\)/gi, '')
    .replace(/[^a-z0-9\u3131-\u318e\uac00-\ud7a3]/g, '');
}

function artistAliases(rawArtist: string): string[] {
  const aliases = new Set<string>();
  const cleaned = rawArtist.replace(/[~\u2010-\u2015]/g, '-');

  aliases.add(normalizeText(cleaned));
  aliases.add(normalizeText(cleaned.replace(/\([^)]*\)/g, ' ')));

  for (const part of [...cleaned.matchAll(/\(([^)]+)\)/g)].map((match) => match[1])) {
    aliases.add(normalizeText(part));
  }

  for (const part of cleaned.split(/[,/&+]| and | x | X | feat\.|Feat\./)) {
    aliases.add(normalizeText(part));
  }

  return [...aliases].filter(Boolean);
}

function chooseSongMatch(winner: MusicShowWinnerRow, songs: SongLookupRow[]): SongLookupRow | null {
  const normalizedTitle = normalizeText(winner.song);
  const candidates = songs.filter((song) => normalizeText(song.title) === normalizedTitle);

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const winnerArtistAliases = new Set(artistAliases(winner.artist));
  const matchedByArtist = candidates.filter((song) =>
    artistAliases(song.artist).some((alias) => winnerArtistAliases.has(alias)),
  );

  if (matchedByArtist.length === 1) {
    return matchedByArtist[0];
  }

  return matchedByArtist[0] ?? candidates[0];
}

function currentUtcYear(): number {
  return new Date().getUTCFullYear();
}

function resolveYearRange(options: BroadcastImportOptions): { fromYear: number; toYear: number } {
  const fromYear = options.fromYear ?? FIRST_SUPPORTED_YEAR;
  const toYear = options.toYear ?? currentUtcYear();

  if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
    throw new Error('Broadcast win import requires integer year values.');
  }

  if (fromYear < FIRST_SUPPORTED_YEAR) {
    throw new Error(`Broadcast win import only supports years >= ${FIRST_SUPPORTED_YEAR}.`);
  }

  if (fromYear > toYear) {
    throw new Error('--from-year must be less than or equal to --to-year.');
  }

  return { fromYear, toYear };
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('404');
}

export async function importBroadcastWins(
  options: BroadcastImportOptions = {},
): Promise<BroadcastImportSummary> {
  const { fromYear, toYear } = resolveYearRange(options);
  const supabase = getIngestSupabaseClient();

  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .select('id, title, artist')
    .eq('source', 'bugs');

  if (songsError) {
    throw new Error(`Failed to load songs for broadcast import: ${songsError.message}`);
  }

  const songRows = (songs ?? []) as SongLookupRow[];
  const winnersByChannel = new Map<Channel, MusicShowWinnerRow[]>();
  let skippedSources = 0;

  for (const source of buildSources(fromYear, toYear)) {
    try {
      const html = await fetchWikipediaPage(source.url);
      const rows = parseMusicShowWinners(html, source.year);
      winnersByChannel.set(source.channel, [...(winnersByChannel.get(source.channel) ?? []), ...rows]);
    } catch (error) {
      if (isNotFoundError(error)) {
        skippedSources += 1;
        continue;
      }

      throw error;
    }
  }

  let matchedWins = 0;
  let unmatchedWins = 0;
  const inserts: Array<{ song_id: string; broadcast_date: string; channel: Channel }> = [];

  for (const [channel, winners] of winnersByChannel.entries()) {
    for (const winner of winners) {
      const match = chooseSongMatch(winner, songRows);
      if (!match) {
        unmatchedWins += 1;
        continue;
      }

      inserts.push({
        song_id: match.id,
        broadcast_date: winner.broadcastDate,
        channel,
      });
      matchedWins += 1;
    }
  }

  const { error: deleteError } = await supabase
    .from('broadcast_wins')
    .delete()
    .gte('broadcast_date', `${fromYear}-01-01`)
    .lte('broadcast_date', `${toYear}-12-31`);

  if (deleteError) {
    throw new Error(`Failed to clear existing broadcast wins: ${deleteError.message}`);
  }

  const uniqueInserts = inserts.filter(
    (value, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.song_id === value.song_id &&
          candidate.broadcast_date === value.broadcast_date &&
          candidate.channel === value.channel,
      ) === index,
  );

  const { error: insertError } = await supabase.from('broadcast_wins').insert(uniqueInserts, {
    defaultToNull: false,
  });

  if (insertError) {
    throw new Error(`Failed to insert broadcast wins: ${insertError.message}`);
  }

  return {
    fromYear,
    toYear,
    skippedSources,
    importedWins: uniqueInserts.length,
    matchedWins,
    unmatchedWins,
  };
}
