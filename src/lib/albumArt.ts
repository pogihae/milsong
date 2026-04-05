export async function fetchAlbumArt(artist: string, title: string): Promise<string | null> {
  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&country=KR&limit=1`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: { artworkUrl100?: string }[] };
    const art = json.results?.[0]?.artworkUrl100;
    if (!art) return null;
    return art.replace('100x100bb', '600x600bb');
  } catch {
    return null;
  }
}
