import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeJournalEntry } from "@/lib/claude/analyze-entry";
import { upsertSentimentAnalysis } from "@/lib/sentiment/upsert-analysis";

const RequestSchema = z.object({
  entryId: z.string().uuid(),
  content: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { entryId, content } = RequestSchema.parse(json);

    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .select("id, user_id")
      .eq("id", entryId)
      .single();

    if (entryError || !entry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    if (entry.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const analysis = await analyzeJournalEntry(content);

    const { error: upsertError } = await upsertSentimentAnalysis({
      entryId,
      model: "claude-3-5-sonnet-20241022",
      analysis,
      rawResponse: analysis,
    });

    if (upsertError) {
      console.error("Failed to upsert sentiment analysis", upsertError);
      return NextResponse.json({ error: "Failed to store analysis" }, { status: 500 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing entry", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
