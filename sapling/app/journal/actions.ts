"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { differenceInCalendarDays } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeJournalEntry, type AnalysisResult } from "@/lib/claude/analyze-entry";
import { upsertSentimentAnalysis } from "@/lib/sentiment/upsert-analysis";
import { clamp } from "@/lib/utils/math";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { describePostgrestError } from "@/lib/supabase/errors";
import type { CreateJournalEntryState } from "@/app/journal/state";

const EntrySchema = z.object({
  title: z
    .string()
    .max(120, "Keep the title under 120 characters.")
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  content: z
    .string()
    .min(1, "Journal entry cannot be empty.")
    .max(5000, "Let’s keep entries under 5000 characters for now.")
    .transform((value) => value.trim()),
  mood: z
    .string()
    .max(32, "Mood tags should be short.")
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

function calculateWordCount(content: string) {
  const words = content.trim().split(/\s+/);
  return content.trim() ? words.length : 0;
}

export async function createJournalEntry(
  _prevState: CreateJournalEntryState,
  formData: FormData
): Promise<CreateJournalEntryState> {
  try {
    const parsed = EntrySchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      mood: formData.get("mood"),
    });

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return {
        status: "error",
        message: firstError ?? "Please fix the highlighted fields.",
      };
    }

    const { title, content, mood } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Failed to fetch authenticated user", userError);
      return {
        status: "error",
        message:
          "You need to be signed in to save entries. Please refresh the page and log in again.",
      };
    }

    const wordCount = calculateWordCount(content);
    const { data: entry, error: insertError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        title: title ?? null,
        content,
        mood_tag: mood ?? null,
        word_count: wordCount,
      })
      .select("id")
      .single();

    if (insertError || !entry) {
      console.error("Failed to insert journal entry", insertError);
      const friendly = describePostgrestError(insertError);
      return {
        status: "error",
        message: friendly ?? "Could not save your entry. Please try again.",
      };
    }

    let analysis: AnalysisResult | null = null;
    let analysisWarning: string | null = null;

    try {
      analysis = await analyzeJournalEntry(content);
      const { error: upsertError } = await upsertSentimentAnalysis({
        entryId: entry.id,
        model: "claude-3-7-sonnet-latest",
        analysis,
        rawResponse: analysis,
      });

      if (upsertError) {
        console.error("Failed to store sentiment analysis", upsertError);
        analysisWarning =
          "Sapling saved your entry, but the Claude analysis could not be stored.";
      }
    } catch (analysisError) {
      console.error("Error analyzing journal entry", analysisError);
      analysisWarning =
        "Sapling saved your entry, but Claude could not analyze it. Check your Anthropic key and try again.";
    }

    if (analysis) {
      const treeStateWarning = await updateTreeState({
        supabase,
        userId: user.id,
        analysis,
        wordCount,
      });
      if (treeStateWarning) {
        const warning = analysisWarning
          ? `${analysisWarning} ${treeStateWarning}`
          : `Sapling saved your entry, but ${treeStateWarning}`;
        return {
          status: "error",
          message: warning,
        };
      }
    }

    if (analysisWarning) {
      return {
        status: "error",
        message: analysisWarning,
      };
    }

    revalidatePath("/journal");

    return {
      status: "success",
      message: "Entry saved and analyzed.",
    };
  } catch (error) {
    console.error("Unexpected error creating journal entry", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

async function updateTreeState({
  supabase,
  userId,
  analysis,
  wordCount,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  analysis: AnalysisResult;
  wordCount: number;
}): Promise<string | null> {
  const { data: currentState, error: stateError } = await supabase
    .from("tree_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (stateError) {
    console.error("Failed to load tree state", stateError);
    const friendly = describePostgrestError(stateError) ?? "Sapling couldn't read your tree data.";
    return friendly;
  }

  const now = new Date();
  const lastUpdated = currentState?.updated_at ? new Date(currentState.updated_at) : null;
  const daysSinceUpdate =
    lastUpdated != null ? differenceInCalendarDays(now, lastUpdated) : null;

  let streakLength = currentState?.streak_length ?? 0;
  if (daysSinceUpdate === null) {
    streakLength = 1;
  } else if (daysSinceUpdate === 0) {
    streakLength = Math.max(streakLength, 1);
  } else if (daysSinceUpdate === 1) {
    streakLength += 1;
  } else {
    streakLength = 1;
  }

  const primaryEmotion = analysis.dominantEmotions[0]?.name ?? currentState?.last_emotion ?? null;
  const sentimentScore = clamp((analysis.score + 1) / 2, 0, 1);
  const newHealth = currentState
    ? clamp(currentState.overall_health * 0.7 + sentimentScore * 0.3, 0, 1)
    : sentimentScore;
  const leafDelta = Math.max(3, Math.round(wordCount / 40));

  const { error: upsertTreeError } = await supabase.from("tree_state").upsert({
    user_id: userId,
    branch_count: (currentState?.branch_count ?? 0) + 1,
    leaf_count: Math.max((currentState?.leaf_count ?? 0) + leafDelta, 10),
    overall_health: newHealth,
    last_emotion: primaryEmotion,
    streak_length: streakLength,
    tree_snapshot: {
      capturedAt: now.toISOString(),
      sentimentScore,
      primaryEmotion,
      overallSentiment: analysis.overallSentiment,
      dominantEmotions: analysis.dominantEmotions,
      score: analysis.score,
      suggestions: analysis.suggestions,
      seed: now.getTime(),
    },
  });

  if (upsertTreeError) {
    console.error("Failed to update tree state", upsertTreeError);
    return (
      describePostgrestError(upsertTreeError) ?? "Sapling couldn't refresh the tree just yet."
    );
  }

  return null;
}
