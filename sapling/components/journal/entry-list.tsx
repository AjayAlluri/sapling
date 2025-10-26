"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import clsx from "clsx";

type SentimentLabel =
  | "very_negative"
  | "negative"
  | "neutral"
  | "positive"
  | "very_positive"
  | null;

type DominantEmotion = {
  name: string;
  confidence: number;
  colorHex?: string;
  treeEffect?: string;
};

export type JournalEntryItem = {
  id: string;
  title: string | null;
  content: string;
  entryDate: string;
  createdAt: string;
  moodTag: string | null;
  wordCount: number | null;
  analysis: {
    overall_sentiment: SentimentLabel;
    score: number | null;
    tone_summary: string | null;
    dominant_emotions: unknown;
  } | null;
};

const sentimentFilters = [
  { value: "all", label: "All sentiments" },
  { value: "very_positive", label: "Very positive" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
  { value: "very_negative", label: "Very negative" },
] as const;

export function EntryList({ entries }: { entries: JournalEntryItem[] }) {
  const [sentimentFilter, setSentimentFilter] = useState<(typeof sentimentFilters)[number]["value"]>("all");

  const filteredEntries = useMemo(() => {
    if (sentimentFilter === "all") {
      return entries;
    }
    return entries.filter(
      (entry) => entry.analysis?.overall_sentiment === sentimentFilter
    );
  }, [entries, sentimentFilter]);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-8 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No entries yet. Write your first reflection to start growing your tree.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent entries</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Each entry is analyzed automatically—filter by sentiment to explore your patterns.
          </p>
        </div>
        <select
          value={sentimentFilter}
          onChange={(event) => setSentimentFilter(event.target.value as (typeof sentimentFilters)[number]["value"])}
          className="h-10 rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-700 outline-none ring-emerald-500 transition focus:ring dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
        >
          {sentimentFilters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </header>

      <div className="grid gap-4">
        {filteredEntries.map((entry) => {
          const emotions = parseDominantEmotions(entry.analysis?.dominant_emotions);
          const sentimentLabel = entry.analysis?.overall_sentiment;
          const score = entry.analysis?.score;
          const summary = entry.analysis?.tone_summary;
          const friendlySentiment = sentimentLabel ? formatSentiment(sentimentLabel) : "Pending analysis";

          return (
            <article
              key={entry.id}
              className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {entry.title ?? "Untitled entry"}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                    {format(new Date(entry.createdAt), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.moodTag ? <Tag label={entry.moodTag} tone="emerald" /> : null}
                  {typeof entry.wordCount === "number" ? <span>{entry.wordCount} words</span> : null}
                </div>
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                {entry.content}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {friendlySentiment}
                </span>
                {typeof score === "number" ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                    Score {score.toFixed(2)}
                  </span>
                ) : null}
              </div>

              {summary ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                  {summary}
                </div>
              ) : null}

              {emotions.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {emotions.map((emotion) => (
                    <EmotionPill key={`${entry.id}-${emotion.name}`} emotion={emotion} />
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function parseDominantEmotions(value: unknown): DominantEmotion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }
      const maybe = item as Record<string, unknown>;
      const name = typeof maybe.name === "string" ? maybe.name : null;
      const confidence = typeof maybe.confidence === "number" ? maybe.confidence : null;
      if (!name || confidence === null) {
        return null;
      }
      return {
        name,
        confidence,
        colorHex: typeof maybe.colorHex === "string" ? maybe.colorHex : undefined,
        treeEffect: typeof maybe.treeEffect === "string" ? maybe.treeEffect : undefined,
      };
    })
    .filter(Boolean) as DominantEmotion[];
}

function formatSentiment(sentiment: Exclude<SentimentLabel, null>) {
  return sentiment
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function Tag({ label, tone }: { label: string; tone: "emerald" | "zinc" }) {
  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 font-medium capitalize",
        tone === "emerald"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      )}
    >
      {label}
    </span>
  );
}

function EmotionPill({ emotion }: { emotion: DominantEmotion }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
      style={
        emotion.colorHex
          ? ({
              borderColor: emotion.colorHex,
              color: emotion.colorHex,
            } as CSSProperties)
          : undefined
      }
    >
      {emotion.name}
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
        {(emotion.confidence * 100).toFixed(0)}%
      </span>
    </span>
  );
}
