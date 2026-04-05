import type { SongComment } from '@/domain/types';
import { getSupabaseClient } from './client';

interface CommentRow {
  id: string;
  song_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

export async function getCommentsBySongId(songId: string): Promise<SongComment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('song_comments')
    .select('id, song_id, nickname, content, created_at')
    .eq('song_id', songId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data as CommentRow[]).map((row) => ({
    id: row.id,
    songId: row.song_id,
    nickname: row.nickname,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function addComment(
  songId: string,
  nickname: string,
  content: string,
): Promise<SongComment> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('song_comments')
    .insert({ song_id: songId, nickname, content })
    .select('id, song_id, nickname, content, created_at')
    .single();

  if (error) throw new Error(error.message);

  const row = data as CommentRow;
  return {
    id: row.id,
    songId: row.song_id,
    nickname: row.nickname,
    content: row.content,
    createdAt: row.created_at,
  };
}
