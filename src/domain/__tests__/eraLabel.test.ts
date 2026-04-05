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
    expect(buildEraLabel(SONG_ID, 'Tell Me')).toBe('You are clearly part of the [Tell Me] era.');
  });

  it('falls back to the first word of the title when songId is not registered', () => {
    expect(buildEraLabel('unknown-id', 'Rollin')).toBe('You are clearly part of the [Rollin] era.');
  });

  it('strips parenthetical subtitles in fallback titles', () => {
    expect(buildEraLabel('unknown-id', 'Fancy (feat. Someone)')).toBe(
      'You are clearly part of the [Fancy] era.',
    );
  });

  it('strips square bracket subtitles in fallback titles', () => {
    expect(buildEraLabel('unknown-id', 'Dynamite [English Ver.]')).toBe(
      'You are clearly part of the [Dynamite] era.',
    );
  });

  it('strips parenthetical subtitles from other fallback titles', () => {
    expect(buildEraLabel('unknown-id', 'My Wind (Acoustic Ver.)')).toBe(
      'You are clearly part of the [My] era.',
    );
  });
});
