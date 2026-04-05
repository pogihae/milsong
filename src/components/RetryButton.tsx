'use client';

import { useRouter } from 'next/navigation';

export default function RetryButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white/80"
    >
      ← 다시 조회
    </button>
  );
}
