import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildEraLabel, ERA_ALIASES } from '../eraLabel';

describe('buildEraLabel', () => {
  const SONG_ID = 'test-song-id';

  beforeEach(() => {
    // Register a test alias
    ERA_ALIASES[SONG_ID] = '텔미';
  });

  afterEach(() => {
    delete ERA_ALIASES[SONG_ID];
  });

  it('uses the alias mapping when songId is registered', () => {
    expect(buildEraLabel(SONG_ID, 'Tell Me')).toBe('당신은 확실한 [텔미] 세대입니다.');
  });

  it('falls back to first word of title when songId is not registered', () => {
    expect(buildEraLabel('unknown-id', 'Rollin')).toBe('당신은 확실한 [Rollin] 세대입니다.');
  });

  it('strips parenthetical subtitles in fallback', () => {
    expect(buildEraLabel('unknown-id', 'Fancy (feat. Someone)')).toBe(
      '당신은 확실한 [Fancy] 세대입니다.',
    );
  });

  it('strips square bracket subtitles in fallback', () => {
    expect(buildEraLabel('unknown-id', 'Dynamite [English Ver.]')).toBe(
      '당신은 확실한 [Dynamite] 세대입니다.',
    );
  });

  it('strips Korean parenthetical subtitles in fallback', () => {
    expect(buildEraLabel('unknown-id', '눈의 꽃（피아노 ver.）')).toBe(
      '당신은 확실한 [눈의] 세대입니다.',
    );
  });
});
