import { redirect } from "next/navigation";
import { EntryForm } from "@/components/journal/entry-form";
import { EntryList, type JournalEntryItem } from "@/components/journal/entry-list";
import { TreePanel } from "@/components/tree/tree-panel";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapRowToVisualState } from "@/lib/tree/state";
import type { Database } from "@/types/database";
import { describePostgrestError } from "@/lib/supabase/errors";

type SentimentRow = Database["public"]["Tables"]["sentiment_analysis"]["Row"];
type JournalEntryRow = Database["public"]["Tables"]["journal_entries"]["Row"];

type JournalQueryResult = JournalEntryRow & {
  sentiment_analysis: SentimentRow[] | null;
};

export default async function JournalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const [{ data, error }, { data: treeStateRow, error: treeError }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select(
        `
        id,
        title,
        content,
        entry_date,
        created_at,
        mood_tag,
        word_count,
        sentiment_analysis (
          overall_sentiment,
          score,
          tone_summary,
          dominant_emotions
        )
      `
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("tree_state")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle(),
  ]);

  let entryLoadMessage: string | null = null;
  if (error) {
    console.error("Failed to load journal entries", error);
    entryLoadMessage =
      describePostgrestError(error) ??
      "Sapling couldn't read your journal entries. Confirm the Supabase migrations ran (see docs/database.md) and try again.";
  }

  let treeLoadMessage: string | null = null;
  if (treeError) {
    console.error("Failed to load tree state", treeError);
    treeLoadMessage =
      describePostgrestError(treeError) ??
      "Sapling couldn't read the tree state yet. Make sure the tree_state table exists and policies allow access.";
  }

  const entries: JournalEntryItem[] =
    !error && (data as JournalQueryResult[] | null)
      ? (data as JournalQueryResult[]).map((entry) => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          entryDate: entry.entry_date,
          createdAt: entry.created_at,
          moodTag: entry.mood_tag,
          wordCount: entry.word_count,
          analysis: normalizeAnalysis(entry.sentiment_analysis),
        }))
      : [];

  const treeState = mapRowToVisualState(treeStateRow);
  const latestSummary = entries[0]?.analysis?.tone_summary ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-4 text-white">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Your daily reflection studio
        </span>
        <h1 className="text-3xl font-semibold">Daily reflections</h1>
        <p className="max-w-3xl text-sm text-white/90">
          Capture how you feel, let Sapling interpret the emotional currents, and watch your tree evolve.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.1fr)]">
        <div className="flex flex-col gap-8">
          <EntryForm />
          <TreePanel state={treeState} lastAnalysisSummary={latestSummary} />
          {treeLoadMessage ? (
            <ErrorNotice message={treeLoadMessage} hint="Check supabase/migrations/0001_core_schema.sql and docs/tree.md for setup steps." />
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          {entryLoadMessage ? (
            <ErrorNotice
              message={entryLoadMessage}
              hint="Review docs/database.md for migration instructions and confirm your Supabase credentials."
            />
          ) : null}
          <EntryList entries={entries} />
        </div>
      </div>
    </div>
  );
}

function normalizeAnalysis(
  relation: SentimentRow[] | SentimentRow | null
): JournalEntryItem["analysis"] {
  if (!relation) {
    return null;
  }

  const item = Array.isArray(relation) ? relation[0] : relation;

  type Allowed = "very_negative" | "negative" | "neutral" | "positive" | "very_positive";
  function isAllowed(value: string | null): value is Allowed {
    return (
      value === "very_negative" ||
      value === "negative" ||
      value === "neutral" ||
      value === "positive" ||
      value === "very_positive"
    );
  }

  const overall = isAllowed(item.overall_sentiment) ? item.overall_sentiment : null;

  return {
    overall_sentiment: overall,
    score: typeof item.score === "number" ? item.score : null,
    tone_summary: item.tone_summary,
    dominant_emotions: item.dominant_emotions as unknown,
  };
}

function ErrorNotice({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
      <p className="font-semibold">Heads up</p>
      <p className="mt-1">{message}</p>
      {hint ? <p className="mt-2 text-xs text-red-600/80 dark:text-red-200/80">{hint}</p> : null}
    </div>
  );
}
