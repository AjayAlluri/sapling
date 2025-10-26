const roadmap = [
  {
    title: "Phase 2 · Authentication",
    description:
      "Supabase-powered auth flows with protected routes to keep journals secure.",
  },
  {
    title: "Phase 4 · Claude Integration",
    description:
      "Claude analyzes each entry to extract emotions, sentiments, and actionable insights.",
  },
  {
    title: "Phase 6 · 3D Tree",
    description:
      "React Three Fiber scene that visualizes emotional growth as a living tree.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-20 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200">
            Phase 1 · Foundations
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
            Grow with your emotions.
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-300">
            Sapling is an emotional journal that transforms your reflections into a
            dynamic 3D tree. Log feelings, let Claude analyze sentiment, and watch
            your habits become living art.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row">
            <a
              href="/journal"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500"
            >
              View journal prototype
            </a>
            <a
              href="https://github.com/ajayalluri/sapling"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:text-white"
            >
              Follow progress on GitHub
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {roadmap.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-2xl font-semibold">What’s ready today</h2>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
              <li>✅ Phase plan captured in `plan.md` for a guided build.</li>
              <li>✅ Environment credentials template and setup instructions.</li>
              <li>✅ Core dependencies installed for Supabase, Claude, and 3D rendering.</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/60 p-8 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
            <div>
              <h2 className="text-2xl font-semibold">Up next</h2>
              <p className="mt-3 text-sm">
                Wire up Supabase auth, connect Claude for sentiment analysis, and grow the
                procedural tree as emotions flow into the journal.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.3em]">Let’s build.</p>
          </div>
        </section>
      </section>
    </div>
  );
}
