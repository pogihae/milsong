import { load } from 'cheerio';
import type { GroupType } from '@/domain/types';

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function mapGroupType(rawType: string): GroupType {
  if (rawType.includes('그룹') && rawType.includes('여성')) return 'female_group';
  if (rawType.includes('그룹') && rawType.includes('남성')) return 'male_group';
  if (rawType.includes('솔로') && rawType.includes('남성')) return 'male_solo';
  if (rawType.includes('솔로') && rawType.includes('여성')) return 'female_solo';
  if (rawType.includes('혼성')) return 'mixed';
  return 'other';
}

export interface BugsArtistMetadata {
  groupType: GroupType;
  nationality: string | null;
}

export function parseBugsArtistMetadata(html: string): BugsArtistMetadata {
  const $ = load(html);
  const rows = $('table.info tr').toArray();
  let groupType: GroupType = 'other';
  let nationality: string | null = null;

  for (const rowElement of rows) {
    const row = $(rowElement);
    const header = normalizeText(row.find('th').first().text());
    const value = normalizeText(row.find('td').first().text());

    if (header === '유형') {
      groupType = mapGroupType(value);
    }

    if (header === '국적') {
      nationality = value || null;
    }
  }

  return { groupType, nationality };
}
