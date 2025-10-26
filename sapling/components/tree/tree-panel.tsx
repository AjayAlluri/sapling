"use client";

import { TreeScene } from "@/components/tree/tree-scene";
import type { TreeVisualState } from "@/lib/tree/state";
import { getEmotionColor, normalizeHealth } from "@/lib/tree/visuals";
import clsx from "clsx";

type Props = {
  state: TreeVisualState;
  lastAnalysisSummary?: string | null;
};

export function TreePanel({ state, lastAnalysisSummary }: Props) {
  const primaryColor = getEmotionColor(state.lastEmotion);
  const healthPercent = Math.round(normalizeHealth(state.overallHealth) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Sapling tree</h2>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
          Sentiment-powered visualization
        </p>
      </header>

      <TreeScene state={state} />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Branches"
          value={state.branchCount.toString()}
          description="Growth reflects total reflections made."
        />
        <MetricCard
          label="Leaves"
          value={state.leafCount.toString()}
          description="Leaf density reacts to consistency and length."
        />
        <MetricCard
          label="Health"
          value={`${healthPercent}%`}
          description="A weighted blend of recent sentiment scores."
        />
      </section>

      <footer className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-300">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="flex flex-col gap-1">
            <p className="font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Latest emotion
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              {state.lastEmotion ? state.lastEmotion : "Awaiting analysis"} · Streak{" "}
              {state.streakLength} days
            </p>
            {lastAnalysisSummary ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{lastAnalysisSummary}</p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 text-xs text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
      <p className="font-semibold uppercase tracking-[0.25em] text-zinc-400">{label}</p>
      <p
        className={clsx(
          "mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100"
        )}
      >
        {value}
      </p>
      <p className="mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
