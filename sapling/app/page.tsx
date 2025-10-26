const featureCards = [
  {
    title: "AI-backed reflections",
    description:
      "Claude summarizes every entry, extracts dominant emotions, and suggests next steps so you always leave with insight.",
  },
  {
    title: "Secure by default",
    description:
      "Supabase authentication and row-level security keep personal thoughts locked behind your account.",
  },
  {
    title: "Living visual feedback",
    description:
      "A real-time 3D tree reacts to your mood, consistency, and sentiment trends to make progress feel tangible.",
  },
];

const highlights = [
  {
    title: "Log and explore",
    body: "Write freely with a calm, focused editor. Filter entries by emotion or sentiment to revisit pivotal days.",
  },
  {
    title: "Understand your patterns",
    body: "Sentiment scores, tone summaries, and emotion confidence levels help you spot recurring themes quickly.",
  },
  {
    title: "Watch growth unfold",
    body: "Each entry nudges the tree forward—healthier leaves, stronger branches, and evolving colors based on how you feel.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-20 sm:px-6 lg:gap-20 lg:py-24">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200">
            Emotional journaling, reimagined
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Grow a calmer mindset with every reflection.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Sapling turns daily thoughts into actionable insights. Write, analyze, and watch a 3D tree evolve
            as your emotional wellbeing improves.
          </p>
          <div className="flex flex-col gap-3 text-sm sm:flex-row">
            <a
              href="/journal"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500"
            >
              Start journaling
            </a>
            <a
              href="https://github.com/ajayalluri/sapling"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:text-white"
            >
              Explore the roadmap
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/85 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Why Sapling works</h2>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
              <li>✅ Built with privacy in mind—keep everything on your personal Supabase project.</li>
              <li>✅ Intelligence that feels supportive, not clinical, thanks to carefully crafted Claude prompts.</li>
              <li>✅ Visual accountability that motivates streaks and celebrates emotional progress.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/70 p-8 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
            {highlights.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
