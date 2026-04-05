import { load } from 'cheerio';
import type { BugsChartRow, DailyChartSnapshot } from '../types';

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const normalized = normalizeText(value ?? '');
    if (normalized) {
      return normalized;
    }
  }

  return '';
}

function toIsoDate(rawDate: string): string {
  const match = rawDate.match(/^(\d{4})\.(\d{2})\.(\d{2})/);

  if (!match) {
    throw new Error(`Unable to parse chart date from "${rawDate}".`);
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function parseBugsDailyChart(html: string): DailyChartSnapshot {
  const $ = load(html);
  const rawDate = $('time[datetime]').first().attr('datetime');

  if (!rawDate) {
    throw new Error('Unable to locate chart date in Bugs daily chart response.');
  }

  const rows: BugsChartRow[] = $('tr[rowtype="track"], tr[rowType="track"]')
    .toArray()
    .map((element) => {
      const row = $(element);
      const rank = Number.parseInt(normalizeText(row.find('div.ranking strong').first().text()), 10);
      const title = firstNonEmpty(
        row.find('p.title a').first().attr('title'),
        row.find('p.title a').first().text(),
        row.find('p.title').first().text(),
      );
      const artist = firstNonEmpty(
        row.find('p.artist a').first().attr('title'),
        row.find('p.artist a').first().text(),
        row.find('p.artist').first().text(),
      );
      const albumTitle = firstNonEmpty(
        row.find('a.album').first().attr('title'),
        row.find('a.album').first().text(),
      );
      const sourceSongId = row.attr('trackid') ?? row.attr('trackId') ?? '';
      const sourceArtistId = row.attr('artistid') ?? row.attr('artistId') ?? null;
      const sourceAlbumId = row.attr('albumid') ?? row.attr('albumId') ?? null;

      if (!Number.isFinite(rank) || !sourceSongId) {
        throw new Error('Encountered malformed chart row while parsing Bugs daily chart.');
      }

      return {
        rank,
        title: title || `unknown-title-${sourceSongId}`,
        artist: artist || `unknown-artist-${sourceSongId}`,
        albumTitle: albumTitle || null,
        sourceSongId,
        sourceArtistId,
        sourceAlbumId,
      };
    })
    .filter((row) => row.rank >= 1 && row.rank <= 20)
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 20);

  if (rows.length === 0) {
    throw new Error('Parsed zero chart rows from Bugs daily chart response.');
  }

  return {
    chartDate: toIsoDate(rawDate),
    chartType: 'daily',
    source: 'bugs',
    rows,
  };
}
