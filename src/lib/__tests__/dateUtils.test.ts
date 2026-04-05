import { describe, it, expect } from 'vitest';
import { addDays, toDateString, isInRange, dateWindow, isValidCalendarDate } from '../dateUtils';

describe('addDays', () => {
  it('advances date by positive offset', () => {
    const base = new Date('2023-03-15T00:00:00Z');
    expect(toDateString(addDays(base, 10))).toBe('2023-03-25');
  });

  it('moves date back by negative offset', () => {
    const base = new Date('2023-03-15T00:00:00Z');
    expect(toDateString(addDays(base, -14))).toBe('2023-03-01');
  });

  it('crosses month boundaries correctly', () => {
    const base = new Date('2023-01-25T00:00:00Z');
    expect(toDateString(addDays(base, 10))).toBe('2023-02-04');
  });
});

describe('isInRange', () => {
  it('returns true for a date equal to start', () => {
    expect(isInRange('2023-03-01', '2023-03-01', '2023-03-31')).toBe(true);
  });

  it('returns true for a date equal to end', () => {
    expect(isInRange('2023-03-31', '2023-03-01', '2023-03-31')).toBe(true);
  });

  it('returns true for a date strictly inside the range', () => {
    expect(isInRange('2023-03-15', '2023-03-01', '2023-03-31')).toBe(true);
  });

  it('returns false for a date before start', () => {
    expect(isInRange('2023-02-28', '2023-03-01', '2023-03-31')).toBe(false);
  });

  it('returns false for a date after end', () => {
    expect(isInRange('2023-04-01', '2023-03-01', '2023-03-31')).toBe(false);
  });
});

describe('dateWindow', () => {
  it('computes the correct window around a base date', () => {
    expect(dateWindow('2023-03-15', -14, 30)).toEqual(['2023-03-01', '2023-04-14']);
  });
});

describe('isValidCalendarDate', () => {
  it('accepts a real calendar date', () => {
    expect(isValidCalendarDate('2023-03-15')).toBe(true);
  });

  it('accepts a valid leap-year date', () => {
    expect(isValidCalendarDate('2024-02-29')).toBe(true);
  });

  it('rejects a non-leap-year Feb 29', () => {
    expect(isValidCalendarDate('2023-02-29')).toBe(false);
  });

  it('rejects a rolled-over date like Feb 30', () => {
    expect(isValidCalendarDate('2023-02-30')).toBe(false);
  });

  it('rejects month 13', () => {
    expect(isValidCalendarDate('2023-13-01')).toBe(false);
  });

  it('rejects day 00', () => {
    expect(isValidCalendarDate('2023-03-00')).toBe(false);
  });

  it('rejects wrong format', () => {
    expect(isValidCalendarDate('20230315')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidCalendarDate('')).toBe(false);
  });

  it('rejects non-date string', () => {
    expect(isValidCalendarDate('not-a-date')).toBe(false);
  });
});
