import EnlistmentForm from '@/components/EnlistmentForm';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16 text-slate-900">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Milsong
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            입대일로 찾는 나의 입대곡
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            입대일과 문체를 입력하면, 입대 전후 차트 흐름과 이병 시절 노출도를 바탕으로
            가장 그럴듯한 입대곡 Top 3를 추천합니다.
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 p-6 sm:p-8">
          <EnlistmentForm />
        </div>
      </section>
    </main>
  );
}
