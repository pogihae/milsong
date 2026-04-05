'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { SongComment } from '@/domain/types';

interface SongCommentSectionProps {
  songId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SongCommentSection({ songId }: SongCommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<SongComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/comments?songId=${encodeURIComponent(songId)}`)
      .then((r) => r.json())
      .then((data: SongComment[]) => setComments(data))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [open, songId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, nickname, content }),
      });
      if (!res.ok) {
        const { error: msg } = (await res.json()) as { error?: string };
        throw new Error(msg ?? '댓글 등록에 실패했습니다.');
      }
      const newComment = (await res.json()) as SongComment;
      setComments((prev) => [newComment, ...prev]);
      setNickname('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-white/[0.06] pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
      >
        {open ? '댓글 접기 ▲' : '댓글 보기 ▼'}
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {/* 댓글 목록 */}
          {loading ? (
            <p className="text-xs text-white/30">불러오는 중...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-white/30">아직 댓글이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-white/70">{c.nickname}</span>
                    <span className="shrink-0 text-[11px] text-white/30">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{c.content}</p>
                </li>
              ))}
            </ul>
          )}

          {/* 댓글 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="닉네임 (최대 30자)"
              maxLength={30}
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none transition focus:border-[#ff375f]/50 focus:ring-2 focus:ring-[#ff375f]/20"
            />
            <textarea
              placeholder="댓글을 남겨주세요 (최대 500자)"
              maxLength={500}
              required
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full resize-none rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none transition focus:border-[#ff375f]/50 focus:ring-2 focus:ring-[#ff375f]/20"
            />
            {error ? <p className="text-[11px] text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff375f] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e8293f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
