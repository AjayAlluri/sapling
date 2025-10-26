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
        <div className="max-w-3xl space-y-6 text-white">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200">
            Emotional journaling, reimagined
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Grow a calmer mindset with every reflection.
          </h1>
          <p className="text-lg text-white/90">
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
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-5 py-3 font-medium text-white/90 transition hover:bg-white/10"
            >
              Explore the roadmap
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-sm backdrop-blur">
            <h2 className="text-2xl font-semibold">Why Sapling works</h2>
            <ul className="space-y-4 text-sm text-white/90">
              <li>✅ Built with privacy in mind—keep everything on your personal Supabase project.</li>
              <li>✅ Intelligence that feels supportive, not clinical, thanks to carefully crafted Claude prompts.</li>
              <li>✅ Visual accountability that motivates streaks and celebrates emotional progress.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-white/30 bg-emerald-700/30 p-8 text-white backdrop-blur">
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
