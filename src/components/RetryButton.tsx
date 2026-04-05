'use client';

import { useRouter } from 'next/navigation';

export default function RetryButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/12 hover:text-white active:scale-95"
    >
      ← 다시 조회
    </button>
  );
}
