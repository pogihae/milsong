import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildEraLabel, ERA_ALIASES } from '../eraLabel';

describe('buildEraLabel', () => {
  const SONG_ID = 'test-song-id';

  beforeEach(() => {
    ERA_ALIASES[SONG_ID] = 'Tell Me';
  });

  afterEach(() => {
    delete ERA_ALIASES[SONG_ID];
  });

  it('uses the alias mapping when songId is registered', () => {
    expect(buildEraLabel(SONG_ID, 'Tell Me')).toBe('당신은 확실한 [Tell Me] 세대입니다.');
  });

  it('falls back to the first word of the title when songId is not registered', () => {
    expect(buildEraLabel('unknown-id', 'Rollin')).toBe('당신은 확실한 [Rollin] 세대입니다.');
  });

  it('strips parenthetical subtitles in fallback titles', () => {
    expect(buildEraLabel('unknown-id', 'Fancy (feat. Someone)')).toBe(
      '당신은 확실한 [Fancy] 세대입니다.',
    );
  });

  it('strips square bracket subtitles in fallback titles', () => {
    expect(buildEraLabel('unknown-id', 'Dynamite [English Ver.]')).toBe(
      '당신은 확실한 [Dynamite] 세대입니다.',
    );
  });

  it('strips parenthetical subtitles from other fallback titles', () => {
    expect(buildEraLabel('unknown-id', 'My Wind (Acoustic Ver.)')).toBe(
      '당신은 확실한 [My] 세대입니다.',
    );
  });
});
