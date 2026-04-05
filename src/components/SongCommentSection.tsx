'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { SongComment } from '@/domain/types';

interface SongCommentSectionProps {
  songId: string;
  defaultOpen?: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function SongCommentSection({ songId, defaultOpen = false }: SongCommentSectionProps) {
  const [comments, setComments] = useState<SongComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!defaultOpen || loaded) return;
    setLoading(true);
    fetch(`/api/comments?songId=${encodeURIComponent(songId)}`)
      .then((r) => r.json())
      .then((data: SongComment[]) => { setComments(Array.isArray(data) ? data : []); setLoaded(true); })
      .catch(() => { setComments([]); setLoaded(true); })
      .finally(() => setLoading(false));
  }, [defaultOpen, loaded, songId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, nickname: nickname.trim(), content: content.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? '댓글 등록에 실패했습니다.');
      }
      const newComment = (await res.json()) as SongComment;
      setComments((prev) => [newComment, ...prev]);
      setNickname('');
      setContent('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!defaultOpen) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-7">
      {/* 헤더 */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#ff375f]">세대 댓글</span>
        {!loading && loaded && (
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-white/40">
            {comments.length}
          </span>
        )}
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="닉네임 (최대 30자)"
          maxLength={30}
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="block w-full rounded-xl border border-white/10 bg-[#0e0e0e] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#ff375f]/50 focus:ring-2 focus:ring-[#ff375f]/20"
        />
        <textarea
          ref={textareaRef}
          placeholder="같은 세대의 전우들에게 한마디... (최대 500자)"
          maxLength={500}
          required
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="block w-full resize-none rounded-xl border border-white/10 bg-[#0e0e0e] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#ff375f]/50 focus:ring-2 focus:ring-[#ff375f]/20"
        />
        {error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-950/40 px-3 py-2 text-xs font-medium text-red-400">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#ff375f] py-3 text-sm font-bold text-white transition hover:bg-[#e8293f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {submitting ? '등록 중...' : '댓글 남기기'}
        </button>
      </form>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-white/30">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          불러오는 중...
        </div>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/25">
          아직 댓글이 없습니다. 첫 번째 세대원이 되어보세요.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white/80">{c.nickname}</span>
                <span className="text-[11px] text-white/30">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/55">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
