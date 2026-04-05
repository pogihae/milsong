import { readFileSync } from 'node:fs';
import { bootstrapHistoricalCharts } from '../src/ingest/bootstrapHistorical';
import type { HistoricalChartInputRow } from '../src/ingest/historicalTypes';

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseCsv(path: string): HistoricalChartInputRow[] {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Historical bootstrap CSV must include a header and at least one row.');
  }

  const header = splitCsvLine(lines[0]);
  const indexOf = (name: string) => {
    const index = header.indexOf(name);
    if (index === -1) {
      throw new Error(`Historical bootstrap CSV is missing "${name}" column.`);
    }

    return index;
  };

  const yearIndex = indexOf('year');
  const rankIndex = indexOf('rank');
  const titleIndex = indexOf('title');
  const artistIndex = indexOf('artist');
  const sourceIndex = indexOf('source');
  const genreIndex = header.indexOf('genre');
  const groupTypeIndex = header.indexOf('group_type');
  const releaseDateIndex = header.indexOf('release_date');
  const notesIndex = header.indexOf('notes');

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return {
      year: Number.parseInt(cells[yearIndex], 10),
      rank: Number.parseInt(cells[rankIndex], 10),
      title: cells[titleIndex] ?? '',
      artist: cells[artistIndex] ?? '',
      source: cells[sourceIndex] ?? '',
      genre: genreIndex === -1 ? undefined : ((cells[genreIndex] || undefined) as HistoricalChartInputRow['genre']),
      groupType:
        groupTypeIndex === -1
          ? undefined
          : ((cells[groupTypeIndex] || undefined) as HistoricalChartInputRow['groupType']),
      releaseDate: releaseDateIndex === -1 ? undefined : cells[releaseDateIndex] || null,
      notes: notesIndex === -1 ? undefined : cells[notesIndex] || null,
    };
  });
}

async function main() {
  const file = readArg('file');
  if (!file) {
    throw new Error('Expected --file=/absolute/or/relative/path/to/historical.csv');
  }

  const rows = parseCsv(file);
  const summary = await bootstrapHistoricalCharts(rows);
  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
