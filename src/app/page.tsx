import EnlistmentForm from '@/components/EnlistmentForm';

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-16 text-slate-900 selection:bg-indigo-200">
      {/* Dynamic Background Blobs */}
      <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] animate-float rounded-full bg-indigo-400/20 mix-blend-multiply blur-3xl filter" />
      <div aria-hidden="true" className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] animate-float-delayed rounded-full bg-pink-400/20 mix-blend-multiply blur-3xl filter" />
      <div aria-hidden="true" className="absolute bottom-[-20%] left-[20%] h-[500px] w-[500px] animate-float rounded-full bg-sky-400/20 mix-blend-multiply blur-3xl filter" />

      <section className="relative z-10 w-full max-w-3xl rounded-[2.5rem] p-8 sm:p-12 glass-panel">
        <div className="space-y-4 text-center sm:text-left">
          <p className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-widest text-indigo-600 uppercase shadow-sm">
            Milsong
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">입대일</span>로 찾는 
            <br className="sm:hidden" /> 나의 입대곡
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:mx-0 sm:text-lg">
            그때 그 시절, 부대에서 가장 많이 들려왔던 노래는 무엇일까요?
            입대일과 선호하는 문체를 입력하면 가장 그럴듯한 입대곡 Top 3를 추천해 드립니다.
          </p>
        </div>

        <div className="mt-12">
          <EnlistmentForm />
        </div>
      </section>
    </main>
  );
}
