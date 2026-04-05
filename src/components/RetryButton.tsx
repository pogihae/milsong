'use client';

import { useRouter } from 'next/navigation';

export default function RetryButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
    >
      ← 다시 조회하기
    </button>
  );
}
