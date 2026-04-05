import { describe, expect, it } from 'vitest';
import { parseBugsArtistMetadata } from '../bugs/parseArtistMetadata';

describe('parseBugsArtistMetadata', () => {
  it('extracts group type from a Bugs artist page', () => {
    const html = `
      <table class="info">
        <tr><th>유형</th><td>그룹 (여성)</td></tr>
      </table>
    `;

    expect(parseBugsArtistMetadata(html)).toEqual({
      groupType: 'female_group',
      nationality: null,
    });
  });
});
