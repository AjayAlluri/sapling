import { EntryForm } from "@/components/journal/entry-form";
import { EntryList, type JournalEntryItem } from "@/components/journal/entry-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SentimentRow = Database["public"]["Tables"]["sentiment_analysis"]["Row"];
type JournalEntryRow = Database["public"]["Tables"]["journal_entries"]["Row"];

type JournalQueryResult = JournalEntryRow & {
  sentiment_analysis: SentimentRow[] | null;
};

export default async function JournalPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load journal entries", error);
  }

  const entries: JournalEntryItem[] =
    (data as JournalQueryResult[] | null)?.map((entry) => ({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      entryDate: entry.entry_date,
      createdAt: entry.created_at,
      moodTag: entry.mood_tag,
      wordCount: entry.word_count,
      analysis: normalizeAnalysis(entry.sentiment_analysis),
    })) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
          Phase 5 · Journal
        </span>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Daily reflections</h1>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
          Capture how you feel, let Sapling interpret the emotional currents, and watch your tree evolve.
          Entries stay local to your Supabase project—perfect for personal experiments.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,1.2fr)]">
        <EntryForm />
        <EntryList entries={entries} />
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

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}
