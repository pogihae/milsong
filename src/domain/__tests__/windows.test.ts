import { describe, it, expect } from 'vitest';
import { isGoldenWindow, isSilverWindow, temporalWeight } from '../windows';

describe('isGoldenWindow', () => {
  const D = '2023-03-15';

  it('returns true for release date exactly at D-14', () => {
    expect(isGoldenWindow(D, '2023-03-01')).toBe(true);
  });

  it('returns true for release date exactly at D+30', () => {
    expect(isGoldenWindow(D, '2023-04-14')).toBe(true);
  });

  it('returns true for release date equal to D', () => {
    expect(isGoldenWindow(D, '2023-03-15')).toBe(true);
  });

  it('returns false for release date one day before D-14', () => {
    expect(isGoldenWindow(D, '2023-02-28')).toBe(false);
  });

  it('returns false for release date one day after D+30', () => {
    expect(isGoldenWindow(D, '2023-04-15')).toBe(false);
  });
});

describe('isSilverWindow', () => {
  const D = '2023-03-15';

  it('returns true when P is within [D-90, D-14) and daysInTop20 >= 10', () => {
    // P = '2023-01-01' is between D-90 (2022-12-15) and D-14 (2023-03-01)
    expect(isSilverWindow(D, '2023-01-01', 10)).toBe(true);
  });

  it('returns true when daysInTop20 is exactly 10', () => {
    expect(isSilverWindow(D, '2023-01-15', 10)).toBe(true);
  });

  it('returns false when P is within D-14 (golden range)', () => {
    // P = D-10, which is NOT < D-14
    expect(isSilverWindow(D, '2023-03-05', 20)).toBe(false);
  });

  it('returns false when daysInTop20 < 10', () => {
    expect(isSilverWindow(D, '2023-01-01', 9)).toBe(false);
  });

  it('returns false when P is exactly D-14 (golden boundary)', () => {
    expect(isSilverWindow(D, '2023-03-01', 15)).toBe(false);
  });

  it('returns false when P is older than D-90', () => {
    // P = '2022-12-01' is before D-90 (2022-12-15)
    expect(isSilverWindow(D, '2022-12-01', 15)).toBe(false);
  });

  it('returns true when P is exactly at D-90', () => {
    // D-90 of 2023-03-15 is 2022-12-15
    expect(isSilverWindow(D, '2022-12-15', 10)).toBe(true);
  });
});

describe('temporalWeight', () => {
  it('returns 1.3 for golden', () => {
    expect(temporalWeight(true, false)).toBe(1.3);
  });

  it('returns 1.0 for silver', () => {
    expect(temporalWeight(false, true)).toBe(1.0);
  });

  it('returns 0 for neither golden nor silver', () => {
    expect(temporalWeight(false, false)).toBe(0);
  });

  it('returns 1.3 when both golden and silver are true (golden takes priority)', () => {
    expect(temporalWeight(true, true)).toBe(1.3);
  });

  it('applies override goldenWeight if provided', () => {
    expect(temporalWeight(true, false, { goldenWeight: 2.0 })).toBe(2.0);
  });

  it('applies override silverWeight if provided', () => {
    expect(temporalWeight(false, true, { silverWeight: 1.5 })).toBe(1.5);
  });
});
