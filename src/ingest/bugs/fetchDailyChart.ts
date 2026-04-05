import { parseBugsDailyChart } from './parseDailyChart';
import type { DailyChartSnapshot } from '../types';
import { fetchBugsHtml } from './fetchHtml';

export async function fetchBugsDailyChart(chartDate: string): Promise<DailyChartSnapshot> {
  const compactDate = chartDate.replaceAll('-', '');
  const url = `https://music.bugs.co.kr/chart/track/day/total?chartdate=${compactDate}`;
  const html = await fetchBugsHtml(url);
  const snapshot = parseBugsDailyChart(html);

  if (snapshot.chartDate !== chartDate) {
    throw new Error(
      `Bugs returned chart date ${snapshot.chartDate} while ${chartDate} was requested. Treating response as invalid.`,
    );
  }

  return snapshot;
}
