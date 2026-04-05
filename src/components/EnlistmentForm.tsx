'use client';

import { FormEvent, useState } from 'react';
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
        const { error: msg } = (await res.json()) as { error?: string };
        throw new Error(msg ?? 'An unknown error occurred.');
      }

      const data = await res.json();
      router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-slate-700">
          Enlistment date (YYYY-MM-DD)
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Tone</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            {
              value: 'nostalgic',
              label: 'Nostalgic',
              description: 'A softer, memory-driven recommendation tone.',
            },
            {
              value: 't_plus',
              label: 'Military',
              description: 'A sharper, barracks-style recommendation tone.',
            },
          ] as const).map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:bg-sky-50"
            >
              <input
                type="radio"
                name="tone"
                value={option.value}
                checked={tone === option.value}
                onChange={() => setTone(option.value)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-slate-900">{option.label}</span>
                <span className="block text-sm text-slate-500">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Analyzing...' : 'Find my song'}
      </button>
    </form>
  );
}
