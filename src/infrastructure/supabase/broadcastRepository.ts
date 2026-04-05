import type { BroadcastWin } from '@/domain/types';
import { getSupabaseClient } from './client';

/**
 * Fetches broadcast win records for songs within a date range.
 * Used to compute Win_Count in [D-90, D+100].
 */
export async function getBroadcastWins(
  startDate: string,
  endDate: string,
): Promise<BroadcastWin[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('broadcast_wins')
    .select('song_id, broadcast_date, channel')
    .gte('broadcast_date', startDate)
    .lte('broadcast_date', endDate);

  if (error) throw new Error(`broadcastRepository.getBroadcastWins: ${error.message}`);

  return (data ?? []).map((row) => ({
    songId: row.song_id,
    broadcastDate: row.broadcast_date,
    channel: row.channel,
  }));
}
