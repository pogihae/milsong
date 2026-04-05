import { parseBugsDailyChart } from './parseDailyChart';
import type { DailyChartSnapshot } from '../types';

const BUGS_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchBugsDailyChart(chartDate: string): Promise<DailyChartSnapshot> {
  const compactDate = chartDate.replaceAll('-', '');
  const url = `https://music.bugs.co.kr/chart/track/day/total?chartdate=${compactDate}`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError ?? new Error(`Unknown Bugs fetch failure for ${chartDate}.`);
}
