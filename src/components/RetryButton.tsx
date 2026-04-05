'use client';

import { useRouter } from 'next/navigation';

export default function RetryButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
    >
      ← 다시 조회하기
    </button>
  );
}
