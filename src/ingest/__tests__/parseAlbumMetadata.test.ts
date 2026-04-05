import { describe, expect, it } from 'vitest';
import { parseBugsAlbumMetadata } from '../bugs/parseAlbumMetadata';

describe('parseBugsAlbumMetadata', () => {
  it('extracts release date and genre from a Bugs album page', () => {
    const html = `
      <table class="info">
        <tr><th>아티스트</th><td>Red Velvet</td></tr>
        <tr><th>장르</th><td>댄스/팝</td></tr>
        <tr><th>발매일</th><td>2019.12.23</td></tr>
      </table>
    `;

    expect(parseBugsAlbumMetadata(html)).toEqual({
      genre: 'dance',
      releaseDate: '2019-12-23',
    });
  });
});
