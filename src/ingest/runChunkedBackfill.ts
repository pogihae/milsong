import { addDays } from './dateRange';
import { runIngestion } from './runIngestion';
import type { IngestSource } from './types';

export interface ChunkedBackfillOptions {
  source: IngestSource;
  from: string;
  to: string;
  chunkDays?: number;
}

export interface ChunkedBackfillSummary {
  source: IngestSource;
  from: string;
  to: string;
  chunkDays: number;
  processedChunks: number;
  processedDays: number;
  syncedChartRows: number;
}

function parseIsoDate(value: string): Date {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO date "${value}".`);
  }

  return parsed;
}

function minDate(a: string, b: string): string {
  return a <= b ? a : b;
}

export async function runChunkedBackfill(options: ChunkedBackfillOptions): Promise<ChunkedBackfillSummary> {
  const chunkDays = options.chunkDays ?? 31;
  if (!Number.isInteger(chunkDays) || chunkDays < 1) {
    throw new Error('Chunked backfill requires chunkDays >= 1.');
  }

  parseIsoDate(options.from);
  parseIsoDate(options.to);

  if (options.from > options.to) {
    throw new Error('--from must be less than or equal to --to.');
  }

  let cursor = options.from;
  let processedChunks = 0;
  let processedDays = 0;
  let syncedChartRows = 0;

  while (cursor <= options.to) {
    const chunkEnd = minDate(addDays(cursor, chunkDays - 1), options.to);
    const summary = await runIngestion({
      source: options.source,
      mode: 'backfill',
      from: cursor,
      to: chunkEnd,
    });

    processedChunks += 1;
    processedDays += summary.processedDays;
    syncedChartRows += summary.syncedChartRows;
    cursor = addDays(chunkEnd, 1);
  }

  return {
    source: options.source,
    from: options.from,
    to: options.to,
    chunkDays,
    processedChunks,
    processedDays,
    syncedChartRows,
  };
}
