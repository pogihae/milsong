import { parseBugsDailyChart } from './parseDailyChart';
import type { DailyChartSnapshot } from '../types';

const BUGS_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

export async function fetchBugsDailyChart(chartDate: string): Promise<DailyChartSnapshot> {
  const compactDate = chartDate.replaceAll('-', '');
  const url = `https://music.bugs.co.kr/chart/track/day/total?chartdate=${compactDate}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': BUGS_USER_AGENT,
      accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Bugs daily chart request failed for ${chartDate}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const snapshot = parseBugsDailyChart(html);

  if (snapshot.chartDate !== chartDate) {
    throw new Error(
      `Bugs returned chart date ${snapshot.chartDate} while ${chartDate} was requested. Treating response as invalid.`,
    );
  }

  return snapshot;
}
