'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function EnlistmentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dateStr, setDateStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 5 && val.length <= 6) {
      formatted = `${val.slice(0, 4)}.${val.slice(4)}`;
    } else if (val.length >= 7) {
      formatted = `${val.slice(0, 4)}.${val.slice(4, 6)}.${val.slice(6, 8)}`;
    }
    setDateStr(formatted);
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const rawDate = dateStr.replace(/\D/g, '');
    if (rawDate.length !== 8) {
      setError('입대일을 정확히 입력해주세요. (예: 20140512)');
      return;
    }
    const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    startTransition(() => {
      router.push(`/result?q=${formattedDate}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="group relative">
        <label htmlFor="date" className="block text-sm font-semibold text-white/70 mb-2">
          입대일
        </label>
        <div className="relative">
          <input
            id="date"
            type="text"
            inputMode="numeric"
            placeholder="숫자 8자리 입력 (예: 20140512)"
            required
            value={dateStr}
            onChange={handleDateChange}
            className="peer block w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/30 outline-none backdrop-blur-md transition-all focus:border-transparent focus:bg-white/8 focus:ring-4 focus:ring-fuchsia-500/20 shadow-sm"
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition-all peer-focus:border-fuchsia-500/50" aria-hidden="true" />
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl bg-red-950/50 p-4 text-sm font-medium text-red-400 border border-red-500/20">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-fuchsia-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {!isPending && (
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
        )}
        <span className="relative z-10 flex items-center gap-2">
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {isPending ? '입대곡 계산 중...' : '내 입대곡 찾기'}
        </span>
      </button>
    </form>
  );
}
