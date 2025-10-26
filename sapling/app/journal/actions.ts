"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeJournalEntry } from "@/lib/claude/analyze-entry";
import { upsertSentimentAnalysis } from "@/lib/sentiment/upsert-analysis";

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

export type CreateJournalEntryState =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    }
  | {
      status: "idle";
    };

export const initialCreateJournalEntryState: CreateJournalEntryState = {
  status: "idle",
};

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

    const supabase = createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        status: "error",
        message: "You need to be signed in to save entries.",
      };
    }

    const wordCount = calculateWordCount(content);
    const { data: entry, error: insertError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: session.user.id,
        title: title ?? null,
        content,
        mood_tag: mood ?? null,
        word_count: wordCount,
      })
      .select("id")
      .single();

    if (insertError || !entry) {
      console.error("Failed to insert journal entry", insertError);
      return {
        status: "error",
        message: "Could not save your entry. Please try again.",
      };
    }

    try {
      const analysis = await analyzeJournalEntry(content);
      const { error: upsertError } = await upsertSentimentAnalysis({
        entryId: entry.id,
        model: "claude-3-5-sonnet-20241022",
        analysis,
        rawResponse: analysis,
      });

      if (upsertError) {
        console.error("Failed to store sentiment analysis", upsertError);
      }
    } catch (analysisError) {
      console.error("Error analyzing journal entry", analysisError);
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
