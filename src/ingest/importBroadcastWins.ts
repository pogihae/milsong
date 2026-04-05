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

const SOURCES: SourceConfig[] = [
  { channel: 'KBS', year: 2019, url: 'https://en.wikipedia.org/wiki/List_of_Music_Bank_Chart_winners_(2019)' },
  { channel: 'KBS', year: 2020, url: 'https://en.wikipedia.org/wiki/List_of_Music_Bank_Chart_winners_(2020)' },
  { channel: 'SBS', year: 2019, url: 'https://en.wikipedia.org/wiki/List_of_Inkigayo_Chart_winners_(2019)' },
  { channel: 'SBS', year: 2020, url: 'https://en.wikipedia.org/wiki/List_of_Inkigayo_Chart_winners_(2020)' },
  { channel: 'Mnet', year: 2019, url: 'https://en.wikipedia.org/wiki/List_of_M_Countdown_Chart_winners_(2019)' },
  { channel: 'Mnet', year: 2020, url: 'https://en.wikipedia.org/wiki/List_of_M_Countdown_Chart_winners_(2020)' },
  { channel: 'MBC', year: 2019, url: 'https://en.wikipedia.org/wiki/List_of_Show!_Music_Core_Chart_winners_(2019)' },
  { channel: 'MBC', year: 2020, url: 'https://en.wikipedia.org/wiki/List_of_Show!_Music_Core_Chart_winners_(2020)' },
];

function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\(feat\.[^)]+\)/gi, '')
    .replace(/\(featuring[^)]+\)/gi, '')
    .replace(/[^a-z0-9가-힣]/g, '');
}

function artistAliases(rawArtist: string): string[] {
  const aliases = new Set<string>();
  const cleaned = rawArtist.replace(/[–—]/g, '-');
  aliases.add(normalizeText(cleaned));

  const baseWithoutParens = cleaned.replace(/\([^)]*\)/g, ' ');
  aliases.add(normalizeText(baseWithoutParens));

  const parentheticalParts = [...cleaned.matchAll(/\(([^)]+)\)/g)].map((match) => match[1]);
  for (const part of parentheticalParts) {
    aliases.add(normalizeText(part));
  }

  const splitParts = cleaned.split(/[,/&+]| and | x | X | feat\.|Feat\./);
  for (const part of splitParts) {
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

export interface BroadcastImportSummary {
  importedWins: number;
  matchedWins: number;
  unmatchedWins: number;
}

export async function importBroadcastWins(): Promise<BroadcastImportSummary> {
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

  for (const source of SOURCES) {
    const html = await fetchWikipediaPage(source.url);
    const rows = parseMusicShowWinners(html, source.year);
    winnersByChannel.set(source.channel, [...(winnersByChannel.get(source.channel) ?? []), ...rows]);
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
    .gte('broadcast_date', '2019-01-01')
    .lte('broadcast_date', '2020-12-31');

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
    importedWins: uniqueInserts.length,
    matchedWins,
    unmatchedWins,
  };
}
