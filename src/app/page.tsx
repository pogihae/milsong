import EnlistmentForm from '@/components/EnlistmentForm';

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-6 py-16 text-white selection:bg-fuchsia-900/50">
      {/* Dynamic Background Blobs */}
      <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] animate-float rounded-full bg-violet-600/20 mix-blend-screen blur-3xl filter" />
      <div aria-hidden="true" className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] animate-float-delayed rounded-full bg-fuchsia-600/20 mix-blend-screen blur-3xl filter" />
      <div aria-hidden="true" className="absolute bottom-[-20%] left-[20%] h-[500px] w-[500px] animate-float rounded-full bg-indigo-600/15 mix-blend-screen blur-3xl filter" />

      <section className="relative z-10 w-full max-w-3xl rounded-[2.5rem] p-8 sm:p-12 glass-panel">
        <div className="space-y-4 text-center sm:text-left">
          <p className="inline-block rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold tracking-widest text-violet-300 uppercase shadow-sm">
            Milsong
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">입대일</span>로 찾는
            <br className="sm:hidden" /> 나의 입대곡
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/60 sm:mx-0 sm:text-lg">
            그때 그 시절, 부대에서 가장 많이 들려왔던 노래는 무엇일까요?
            입대일만 입력하면 가장 그럴듯한 입대곡 Top 3를 추천해 드립니다.
          </p>
        </div>

        <div className="mt-12">
          <EnlistmentForm />
        </div>
      </section>
    </main>
  );
}
