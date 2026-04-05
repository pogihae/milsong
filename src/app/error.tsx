'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel relative z-10 w-full max-w-md space-y-6 rounded-[2rem] p-8 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-50/50">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">오류가 발생했습니다</h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            요청하신 작업을 처리하는 중 예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98]"
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
