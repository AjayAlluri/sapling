"use client";

import { useEffect, useMemo, useState } from "react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

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

const pulseMetrics = [
  { label: "Daily reflections", value: "1.8k+", description: "entries written with Claude insights" },
  { label: "Emotion palette", value: "12", description: "nuanced moods mapped to the 3D tree" },
  { label: "Average uplift", value: "+42%", description: "increase in positive sentiment after a week" },
];

const journey = [
  {
    stage: "Capture",
    detail: "Free-form bedside journaling, with real-time tone checks and gentle prompts.",
  },
  {
    stage: "Understand",
    detail: "Claude extracts emotions, confidence scores, and actionable next steps.",
  },
  {
    stage: "Transform",
    detail: "Each entry feeds the tree—branches bend, leaves glow, and particles dance to match your mood.",
  },
];

export default function Home() {
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.3 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const { innerWidth, innerHeight } = window;
      setCursor({
        x: event.clientX / innerWidth,
        y: event.clientY / innerHeight,
      });
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const spotlightStyle = useMemo(
    () => ({
      background: `radial-gradient(650px at ${cursor.x * 100}% ${cursor.y * 100}%, rgba(56,189,248,0.24), transparent 70%)`,
    }),
    [cursor]
  );

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 transition duration-300"
          style={spotlightStyle}
        />
        <div className="absolute -top-48 -left-48 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle_at_center,#1f5bff33,#0a1120_65%)] blur-3xl animate-[spin_90s_linear_infinite]" />
        <div className="absolute top-[-12rem] right-[-14rem] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,#22d3ee33,#0b1224_65%)] blur-3xl animate-[spin_110s_linear_infinite_reverse]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_380px_at_50%_-10%,rgba(136,196,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[url('/window.svg')] opacity-[0.03]" />
      </div>

      <section
        className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-24 sm:px-6 lg:gap-20 lg:py-28"
        onPointerMove={(event) => {
          const element = event.currentTarget;
          const rect = element.getBoundingClientRect();
          setCursor({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          });
        }}
      >
        <div className="max-w-3xl space-y-6 text-slate-100">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
            Emotional journaling, reimagined
          </span>
          <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
            Visualize your thinking. Compose your mind.
          </h1>
          <p className="text-lg text-slate-200/90">
            Sapling is a private studio for endless thoughts. Write freely, watch a living tree grow from your
            patterns, and keep every entry secured to your account.
          </p>
          <div className="flex flex-col gap-3 text-sm sm:flex-row">
            <a
              href="/journal"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 font-medium text-slate-900 transition hover:bg-emerald-400"
            >
              Start journaling
            </a>
            <a
              href="https://github.com/ajayalluri/sapling"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10"
            >
              Explore the roadmap
            </a>
          </div>
        </div>

        {/* Quote */}
        <div className="relative">
          <blockquote
            className={`mx-auto max-w-4xl text-center text-4xl text-slate-100 sm:text-5xl ${instrumentSerif.className}`}
          >
            “Never stop thinking”
          </blockquote>
          <div className="mx-auto mt-4 h-[2px] w-44 rounded bg-emerald-400/60" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-emerald-300/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 transition group-hover:via-emerald-500/10 group-hover:to-emerald-500/20" />
              <h3 className="relative text-sm font-semibold uppercase tracking-wide text-emerald-200">
                {feature.title}
              </h3>
              <p className="relative mt-3 text-sm text-slate-200/80">{feature.description}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-100 shadow-lg backdrop-blur">
            <h2 className="text-2xl font-semibold">Why Sapling works</h2>
            <ul className="space-y-4 text-sm text-slate-200/90">
              <li>✅ Built with privacy in mind—keep everything on your personal Supabase project.</li>
              <li>✅ Intelligence that feels supportive, not clinical, thanks to carefully crafted Claude prompts.</li>
              <li>✅ Visual accountability that motivates streaks and celebrates emotional progress.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-slate-100 backdrop-blur">
            {highlights.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
              Pulse
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {pulseMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="group rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-300/40 hover:bg-emerald-400/10"
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-2 text-xs text-slate-300/80">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#030915]/80 p-8 shadow-lg backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
              Journey
            </h3>
            <div className="space-y-6">
              {journey.map((step, index) => (
                <div key={step.stage} className="relative pl-6">
                  <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
                  <h4 className="text-lg font-semibold text-white">{index + 1}. {step.stage}</h4>
                  <p className="text-sm text-slate-300/85">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
