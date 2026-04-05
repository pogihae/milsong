export const ERA_ALIASES: Record<string, string> = {};

function stripSubtitle(title: string): string {
  return title
    .replace(/\s*[\(\[（【][^\)\]）】]*[\)\]）】]/g, '')
    .trim()
    .split(/\s+/)[0];
}

export function buildEraLabel(songId: string, songTitle: string): string {
  const alias = ERA_ALIASES[songId] ?? stripSubtitle(songTitle);
  return `당신은 확실한 [${alias}] 세대입니다.`;
}
