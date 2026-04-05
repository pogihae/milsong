import { load } from 'cheerio';
import type { Genre } from '@/domain/types';

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function mapGenre(rawGenre: string): Genre {
  const value = rawGenre.toLowerCase();

  if (value.includes('댄스')) return 'dance';
  if (value.includes('발라드')) return 'ballad';
  if (value.includes('힙합') || value.includes('랩')) return 'hip_hop';
  if (value.includes('알앤비') || value.includes('r&b') || value.includes('rnb') || value.includes('소울'))
    return 'r_and_b';
  if (value.includes('트로트') || value.includes('성인가요')) return 'trot';

  return 'other';
}

function normalizeReleaseDate(rawValue: string): string | null {
  const match = rawValue.match(/(\d{4})\s*(?:\.|-)\s*(\d{2})\s*(?:\.|-)\s*(\d{2})/);

  if (!match) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

export interface BugsAlbumMetadata {
  genre: Genre;
  releaseDate: string | null;
}

export function parseBugsAlbumMetadata(html: string): BugsAlbumMetadata {
  const $ = load(html);
  const rows = $('table.info tr').toArray();

  let rawGenre = '';
  let rawReleaseDate = '';

  for (const rowElement of rows) {
    const row = $(rowElement);
    const header = normalizeText(row.find('th').first().text());
    const value = normalizeText(row.find('td').first().text());

    if (header === '장르') {
      rawGenre = value;
    }

    if (header === '발매일') {
      rawReleaseDate = value;
    }
  }

  return {
    genre: mapGenre(rawGenre),
    releaseDate: normalizeReleaseDate(rawReleaseDate),
  };
}
