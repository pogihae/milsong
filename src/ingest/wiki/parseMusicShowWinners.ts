import { load } from 'cheerio';

export interface MusicShowWinnerRow {
  broadcastDate: string;
  artist: string;
  song: string;
}

function normalizeText(value: string): string {
  return value.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
}

function cleanSong(value: string): string {
  return normalizeText(value).replace(/^"+|"+$/g, '').replace(/†/g, '').trim();
}

function parseDate(rawValue: string, year: number): string | null {
  const normalized = normalizeText(rawValue);
  const withYear = /\b\d{4}\b/.test(normalized) ? normalized : `${normalized} ${year}`;
  const parsed = new Date(`${withYear} UTC`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export function parseMusicShowWinners(html: string, year: number): MusicShowWinnerRow[] {
  const $ = load(html);
  const table = $('table.wikitable')
    .toArray()
    .map((element) => $(element))
    .find((candidate) => {
      const headers = candidate
        .find('tr')
        .first()
        .find('th')
        .toArray()
        .map((cell) => normalizeText($(cell).text()).toLowerCase());

      return headers.includes('date') && headers.includes('artist') && headers.includes('song');
    });

  if (!table) {
    throw new Error(`Unable to find a winner table for ${year}.`);
  }

  const rows: MusicShowWinnerRow[] = [];
  const headerCells = table
    .find('tr')
    .first()
    .find('th')
    .toArray()
    .map((cell) => normalizeText($(cell).text()).toLowerCase());

  const dateIndex = headerCells.indexOf('date');
  const artistIndex = headerCells.indexOf('artist');
  const songIndex = headerCells.indexOf('song');

  const rowspanState = new Map<number, { value: string; remaining: number }>();

  table
    .find('tr')
    .slice(1)
    .each((_, rowElement) => {
      const cells = $(rowElement).find('th, td').toArray();
      if (cells.length === 0) {
        return;
      }

      const values: string[] = [];
      let sourceIndex = 0;

      for (let targetIndex = 0; targetIndex < headerCells.length; targetIndex += 1) {
        const carried = rowspanState.get(targetIndex);
        if (carried && carried.remaining > 0) {
          values[targetIndex] = carried.value;
          carried.remaining -= 1;
          if (carried.remaining === 0) {
            rowspanState.delete(targetIndex);
          }
          continue;
        }

        const cell = cells[sourceIndex];
        if (!cell) {
          values[targetIndex] = '';
          continue;
        }

        const value = normalizeText($(cell).text());
        values[targetIndex] = value;

        const rowspan = Number.parseInt($(cell).attr('rowspan') ?? '1', 10);
        if (rowspan > 1) {
          rowspanState.set(targetIndex, { value, remaining: rowspan - 1 });
        }

        sourceIndex += 1;
      }

      const broadcastDate = parseDate(values[dateIndex] ?? '', year);
      const artist = normalizeText(values[artistIndex] ?? '');
      const song = cleanSong(values[songIndex] ?? '');

      if (!broadcastDate || !artist || !song) {
        return;
      }

      rows.push({
        broadcastDate,
        artist,
        song,
      });
    });

  return rows;
}
