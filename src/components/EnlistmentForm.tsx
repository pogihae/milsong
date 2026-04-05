'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Tone } from '@/domain/types';
import { TONE_OPTIONS } from '@/domain/constants';

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
        const { error: msg } = (await res.json()) as { error?: string };
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="group relative">
        <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
          입대일
        </label>
        <div className="relative">
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="peer block w-full appearance-none rounded-2xl border border-slate-200 bg-white/50 px-5 py-4 text-slate-900 outline-none backdrop-blur-md transition-all focus:border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/20 shadow-sm"
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition-all peer-focus:border-indigo-400" aria-hidden="true" />
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-700">문체 선택</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {TONE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                tone === option.value
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-indigo-100'
                  : 'border-slate-200 bg-white/50 hover:border-indigo-300'
              }`}
            >
              <input
                type="radio"
                name="tone"
                value={option.value}
                checked={tone === option.value}
                onChange={() => setTone(option.value)}
                className="peer sr-only"
              />
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  tone === option.value
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300 bg-white group-hover:border-indigo-400'
                }`}
              >
                <div className={`h-2 w-2 rounded-full bg-white transition-transform ${tone === option.value ? 'scale-100' : 'scale-0'}`} />
              </div>
              <span>
                <span className={`block font-bold transition-colors ${tone === option.value ? 'text-indigo-900' : 'text-slate-700'}`}>{option.label}</span>
                <span className="block text-sm text-slate-500 mt-1 leading-relaxed">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      >
        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
          <div className="relative h-full w-8 bg-white/20" />
        </div>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              입대곡 찾는 중...
            </>
          ) : (
            '내 입대곡 찾기'
          )}
        </span>
      </button>
    </form>
  );
}
