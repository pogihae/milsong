/**
 * Returns a new Date that is `days` offset from `base`.
 * Positive values move forward, negative values move backward.
 */
export function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Formats a Date as YYYY-MM-DD (UTC).
 */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns true if `date` falls within [start, end] (inclusive, all UTC dates as strings).
 */
export function isInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * Returns the [start, end] window strings given a base date string and day offsets.
 * E.g. dateWindow('2023-03-15', -14, 30) → ['2023-03-01', '2023-04-14']
 */
export function dateWindow(baseDate: string, startOffset: number, endOffset: number): [string, string] {
  const base = new Date(baseDate);
  return [toDateString(addDays(base, startOffset)), toDateString(addDays(base, endOffset))];
}
