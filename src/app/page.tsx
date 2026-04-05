import EnlistmentForm from '@/components/EnlistmentForm';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0e0e0e] px-6 py-16 selection:bg-red-900/40">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff375f]/70 to-transparent" />

      <section className="w-full max-w-lg">
        {/* Service label */}
        <p className="mb-8 text-xs font-bold tracking-[0.25em] text-[#ff375f] uppercase">
          Milsong
        </p>

        {/* Hero headline */}
        <h1 className="mb-3 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
          입대일로 찾는
        </h1>
        <p className="mb-10 text-5xl font-black leading-none tracking-tight text-[#ff375f] sm:text-6xl">
          나의 입대곡
        </p>

        <p className="mb-12 text-sm leading-relaxed text-white/40 sm:text-base">
          이병 시절 부대 TV에서 울려 퍼졌던 그 노래.
          <br />
          입대일만 입력하면 내 세대의 입대곡 Top&nbsp;3를 알려드립니다.
        </p>

        <EnlistmentForm />
      </section>
    </main>
  );
}
