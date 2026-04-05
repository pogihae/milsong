import { describe, expect, it } from 'vitest';
import { parseMusicShowWinners } from '../wiki/parseMusicShowWinners';

describe('parseMusicShowWinners', () => {
  it('parses winner rows with rowspans', () => {
    const html = `
      <table class="wikitable sortable plainrowheaders">
        <tr><th>Date</th><th>Artist</th><th>Song</th><th>Points</th></tr>
        <tr><td rowspan="2">January 3</td><td>Red Velvet</td><td>"Psycho"</td><td>123</td></tr>
        <tr><td>Zico</td><td>"Any Song"</td><td>122</td></tr>
      </table>
    `;

    expect(parseMusicShowWinners(html, 2020)).toEqual([
      { broadcastDate: '2020-01-03', artist: 'Red Velvet', song: 'Psycho' },
      { broadcastDate: '2020-01-03', artist: 'Zico', song: 'Any Song' },
    ]);
  });
});
