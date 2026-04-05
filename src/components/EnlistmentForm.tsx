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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/40">
          입대일
        </label>
        <input
          id="date"
          type="text"
          inputMode="numeric"
          placeholder="숫자 8자리 입력 (예: 20140512)"
          required
          value={dateStr}
          onChange={handleDateChange}
          className="block w-full rounded-xl border border-white/10 bg-[#181818] px-5 py-4 text-white placeholder:text-white/25 outline-none transition-all focus:border-[#ff375f]/50 focus:ring-2 focus:ring-[#ff375f]/20"
        />
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-950/40 p-4 text-sm font-medium text-red-400">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="group relative w-full overflow-hidden rounded-xl bg-[#ff375f] px-8 py-4 font-bold text-white transition-all hover:bg-[#e8293f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {isPending ? '입대곡 계산 중...' : '내 입대곡 찾기 →'}
        </span>
      </button>
    </form>
  );
}
