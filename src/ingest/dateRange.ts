function toDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateString(date);
}

export function eachDateInclusive(from: string, to: string): string[] {
  const dates: string[] = [];
  let cursor = from;

  while (cursor <= to) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
}

export function todayUtc(): string {
  return toDateString(new Date());
}
