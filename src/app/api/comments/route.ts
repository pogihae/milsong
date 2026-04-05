import { NextRequest, NextResponse } from 'next/server';
import { addComment, getCommentsBySongId } from '@/infrastructure/supabase/commentRepository';

export async function GET(req: NextRequest) {
  const songId = req.nextUrl.searchParams.get('songId');
  if (!songId) {
    return NextResponse.json({ error: 'songId is required' }, { status: 400 });
  }

  try {
    const comments = await getCommentsBySongId(songId);
    return NextResponse.json(comments);
  } catch (err) {
    const message = err instanceof Error ? err.message : '댓글을 불러오지 못했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
    if (!body || typeof body !== 'object') throw new Error();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const { songId, nickname, content } = body;

  if (typeof songId !== 'string' || !songId.trim()) {
    return NextResponse.json({ error: 'songId가 필요합니다.' }, { status: 400 });
  }
  if (typeof nickname !== 'string' || nickname.trim().length === 0 || nickname.trim().length > 30) {
    return NextResponse.json({ error: '닉네임은 1~30자여야 합니다.' }, { status: 400 });
  }
  if (typeof content !== 'string' || content.trim().length === 0 || content.trim().length > 500) {
    return NextResponse.json({ error: '댓글은 1~500자여야 합니다.' }, { status: 400 });
  }

  try {
    const comment = await addComment(songId.trim(), nickname.trim(), content.trim());
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '댓글 등록에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
