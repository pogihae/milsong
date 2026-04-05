import { addDays, eachDateInclusive, todayUtc } from './dateRange';
import { getIngestSupabaseClient } from './env';
import {
  completeSyncRun,
  createSyncRun,
  getCheckpoint,
  updateCheckpoint,
  upsertDailyChartSnapshot,
} from './repository';
import { fetchBugsDailyChart } from './bugs/fetchDailyChart';
import type { IngestOptions, IngestSummary } from './types';

function resolveRange(options: IngestOptions): { from: string; to: string } {
  if (options.mode === 'backfill') {
    if (!options.from || !options.to) {
      throw new Error('Backfill mode requires both --from and --to.');
    }

    return { from: options.from, to: options.to };
  }

  const to = options.to ?? addDays(todayUtc(), -1);

  if (options.from) {
    return { from: options.from, to };
  }

  if (typeof options.days === 'number') {
    return { from: addDays(to, -(options.days - 1)), to };
  }

  return { from: to, to };
}

export async function runIngestion(options: IngestOptions): Promise<IngestSummary> {
  if (options.source !== 'bugs') {
    throw new Error(`Unsupported source "${options.source}".`);
  }

  const supabase = getIngestSupabaseClient();
  const checkpoint =
    options.mode === 'incremental' && !options.from && typeof options.days !== 'number'
      ? await getCheckpoint(supabase, options.source)
      : null;

  const range = resolveRange({
    ...options,
    from: options.from ?? (checkpoint ? addDays(checkpoint, 1) : undefined),
  });

  if (range.from > range.to) {
    return {
      source: options.source,
      mode: options.mode,
      from: range.from,
      to: range.to,
      processedDays: 0,
      syncedChartRows: 0,
    };
  }

  const run = await createSyncRun(supabase, options.source, options.mode, range.from, range.to);
  let processedDays = 0;
  let syncedChartRows = 0;
  let lastSuccessfulChartDate: string | null = null;

  try {
    for (const chartDate of eachDateInclusive(range.from, range.to)) {
      const snapshot = await fetchBugsDailyChart(chartDate);
      syncedChartRows += await upsertDailyChartSnapshot(supabase, snapshot);
      processedDays += 1;
      lastSuccessfulChartDate = chartDate;
    }

    if (lastSuccessfulChartDate) {
      await updateCheckpoint(supabase, options.source, lastSuccessfulChartDate);
    }

    await completeSyncRun(supabase, run.id, 'succeeded', processedDays, syncedChartRows);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ingestion error';
    await completeSyncRun(supabase, run.id, 'failed', processedDays, syncedChartRows, message);
    throw error;
  }

  return {
    source: options.source,
    mode: options.mode,
    from: range.from,
    to: range.to,
    processedDays,
    syncedChartRows,
  };
}
