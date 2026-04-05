import { describe, it, expect } from 'vitest';
import { isGoldenWindow, isSilverWindow, isBronzeWindow, temporalWeight } from '../windows';

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

  it('returns true when P < D-14 and daysInTop20 >= 15', () => {
    expect(isSilverWindow(D, '2023-01-01', 15)).toBe(true);
  });

  it('returns false when P is within D-14 (golden range)', () => {
    // P = D-10, which is NOT < D-14
    expect(isSilverWindow(D, '2023-03-05', 20)).toBe(false);
  });

  it('returns false when daysInTop20 < 15', () => {
    expect(isSilverWindow(D, '2023-01-01', 14)).toBe(false);
  });

  it('returns false when P is exactly D-14 (golden boundary)', () => {
    expect(isSilverWindow(D, '2023-03-01', 15)).toBe(false);
  });

  it('returns true when daysInTop20 is exactly 15', () => {
    expect(isSilverWindow(D, '2023-01-01', 15)).toBe(true);
  });
});

describe('isBronzeWindow', () => {
  const D = '2023-03-15';

  it('returns true when P < D-60 and daysInTop20 >= 20', () => {
    expect(isBronzeWindow(D, '2022-12-01', 25)).toBe(true);
  });

  it('returns false when daysInTop20 < 20', () => {
    expect(isBronzeWindow(D, '2022-12-01', 19)).toBe(false);
  });

  it('returns false when P is exactly D-60', () => {
    // '2023-01-14' is D-60 for '2023-03-15'
    expect(isBronzeWindow(D, '2023-01-14', 20)).toBe(false);
  });
});

describe('temporalWeight', () => {
  it('returns 1.3 for golden', () => {
    expect(temporalWeight(true, false, false)).toBe(1.3);
  });

  it('returns 1.0 for silver', () => {
    expect(temporalWeight(false, true, false)).toBe(1.0);
  });

  it('returns 0.6 for bronze', () => {
    expect(temporalWeight(false, false, true)).toBe(0.6);
  });

  it('returns 0 for none', () => {
    expect(temporalWeight(false, false, false)).toBe(0);
  });

  it('returns 1.3 when both golden and silver are true (golden takes priority)', () => {
    expect(temporalWeight(true, true, false)).toBe(1.3);
  });

  it('applies override parameters if provided', () => {
    expect(temporalWeight(true, false, false, { goldenWeight: 2.0 })).toBe(2.0);
    expect(temporalWeight(false, true, false, { silverWeight: 1.5 })).toBe(1.5);
    expect(temporalWeight(false, false, true, { bronzeWeight: 0.8 })).toBe(0.8);
  });
});
