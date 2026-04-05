import EnlistmentForm from '@/components/EnlistmentForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Military Song Era Finder
          </p>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Find the song that defines your enlistment era
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              Use your enlistment date to weigh chart timing, early-service exposure, and music show
              wins, then surface the song that best matches your military era.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-slate-500">Golden Window</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Rewards songs that peaked from 14 days before enlistment through 30 days after.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-slate-500">Exposure Score</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Measures how long a song stayed in the Top 10 during the first 100 service days.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-slate-500">Era Label</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Turns the top recommendation into a reusable era label for the result card.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-slate-950">Get a recommendation</h2>
            <p className="text-sm leading-6 text-slate-600">
              Pick an enlistment date and tone to see the main song, candidate list, and scoring
              rationale.
            </p>
          </div>
          <EnlistmentForm />
        </section>
      </div>
    </main>
  );
}
