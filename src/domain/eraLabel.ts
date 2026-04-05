/**
 * Alias mapping table: song ID → short display keyword used in the era label.
 * Example: { 'song-uuid-telme': '텔미', 'song-uuid-rollin': '롤린' }
 * Populate this map as songs are added to the database.
 */
export const ERA_ALIASES: Record<string, string> = {
  // TODO: populate with real song IDs after seeding
};

/**
 * Strips parentheses, subtitles, and excess whitespace from a song title,
 * then returns the first meaningful segment.
 */
function stripSubtitle(title: string): string {
  return title.replace(/\s*[\(\[（【][^\)\]）】]*[\)\]）】]/g, '').trim().split(/\s+/)[0];
}

/**
 * Generates the era label string for the given song.
 * Template: "당신은 확실한 [ALIAS] 세대입니다."
 */
export function buildEraLabel(songId: string, songTitle: string): string {
  const alias = ERA_ALIASES[songId] ?? stripSubtitle(songTitle);
  return `당신은 확실한 [${alias}] 세대입니다.`;
}
