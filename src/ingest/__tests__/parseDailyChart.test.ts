import { describe, expect, it } from 'vitest';
import { parseBugsDailyChart } from '../bugs/parseDailyChart';

describe('parseBugsDailyChart', () => {
  it('extracts the chart date and top 20 rows from Bugs markup', () => {
    const rows = Array.from({ length: 20 }, (_, index) => {
      const rank = index + 1;
      return `
        <tr rowType="track" trackId="track-${rank}" artistId="artist-${rank}" albumId="album-${rank}">
          <td>
            <div class="ranking"><strong>${rank}</strong></div>
          </td>
          <th scope="row">
            <p class="title"><a title="Song ${rank}">Song ${rank}</a></p>
          </th>
          <td class="left">
            <p class="artist"><a title="Artist ${rank}">Artist ${rank}</a></p>
          </td>
          <td class="left">
            <a class="album" title="Album ${rank}">Album ${rank}</a>
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <body>
          <time datetime="2020.01.01 12:00"></time>
          <table>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const snapshot = parseBugsDailyChart(html);

    expect(snapshot.chartDate).toBe('2020-01-01');
    expect(snapshot.rows).toHaveLength(20);
    expect(snapshot.rows[0]).toMatchObject({
      rank: 1,
      title: 'Song 1',
      artist: 'Artist 1',
      sourceSongId: 'track-1',
    });
  });
});
