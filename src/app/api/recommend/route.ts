import { NextRequest, NextResponse } from 'next/server';
import { recommendSongs } from '@/application/recommendSongs';
import type { RecommendInput, Tone } from '@/domain/types';
import { isValidCalendarDate } from '@/lib/dateUtils';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { enlistment_date, tone } = body as Record<string, string>;

  if (!enlistment_date || !isValidCalendarDate(enlistment_date)) {
    return NextResponse.json(
      { error: 'enlistment_date must be a valid YYYY-MM-DD string.' },
      { status: 400 },
    );
  }

  const validTones: Tone[] = ['t_plus', 'nostalgic'];
  const resolvedTone: Tone = validTones.includes(tone as Tone) ? (tone as Tone) : 'nostalgic';

  const input: RecommendInput = {
    enlistmentDate: enlistment_date,
    tone: resolvedTone,
  };

  try {
    const result = await recommendSongs(input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
