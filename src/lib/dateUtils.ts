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
 * Returns true if the string is a valid YYYY-MM-DD calendar date.
 */
export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Returns the [start, end] window strings given a base date string and day offsets.
 * E.g. dateWindow('2023-03-15', -14, 30) → ['2023-03-01', '2023-04-14']
 */
export function dateWindow(baseDate: string, startOffset: number, endOffset: number): [string, string] {
  const base = new Date(baseDate);
  return [toDateString(addDays(base, startOffset)), toDateString(addDays(base, endOffset))];
}

/**
 * Returns true only when `str` is a well-formed YYYY-MM-DD string *and* represents
 * an actual calendar date.  JavaScript's Date constructor silently rolls over
 * invalid dates (e.g. "2023-02-30" becomes 2023-03-02), so we cross-check by
 * re-formatting the parsed date and comparing it against the original string.
 */
export function isValidCalendarDate(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return false;
  return toDateString(parsed) === str;
}
