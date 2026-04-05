'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Tone } from '@/domain/types';

export default function EnlistmentForm() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [tone, setTone] = useState<Tone>('nostalgic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enlistment_date: date, tone }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? '알 수 없는 오류가 발생했습니다.');
      }

      const data = await res.json();
      router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          입대일 (YYYY-MM-DD)
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <span className="block text-sm font-medium">문체 선택</span>
        <div className="mt-1 flex gap-4">
          {(['nostalgic', 't_plus'] as Tone[]).map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="tone"
                value={t}
                checked={tone === t}
                onChange={() => setTone(t)}
              />
              {t === 'nostalgic' ? '추억 소환' : '군대식'}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
      >
        {loading ? '분석 중…' : '입대곡 찾기'}
      </button>
    </form>
  );
}
