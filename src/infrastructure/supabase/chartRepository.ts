import type { ChartEntry } from '@/domain/types';
import { getSupabaseClient } from './client';

/**
 * Fetches chart entries for a given date range and chart type.
 * Returns all rows with rank 1–20 that fall within [startDate, endDate].
 */
export async function getChartEntries(
  startDate: string,
  endDate: string,
  chartType: 'daily' | 'weekly' = 'daily',
): Promise<ChartEntry[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('charts')
    .select('chart_date, rank, song_id, chart_type, source')
    .eq('chart_type', chartType)
    .gte('chart_date', startDate)
    .lte('chart_date', endDate)
    .order('chart_date', { ascending: true })
    .order('rank', { ascending: true });

  if (error) throw new Error(`chartRepository.getChartEntries: ${error.message}`);

  return (data ?? []).map((row) => ({
    chartDate: row.chart_date,
    rank: row.rank,
    songId: row.song_id,
    chartType: row.chart_type,
    source: row.source ?? undefined,
  }));
}
