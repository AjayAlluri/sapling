import type { AnalysisResult } from "@/lib/claude/analyze-entry";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Json } from "@/types/database";

type Params = {
  entryId: string;
  model: string;
  analysis: AnalysisResult;
  rawResponse?: Json;
};

export async function upsertSentimentAnalysis({
  entryId,
  model,
  analysis,
  rawResponse,
}: Params) {
  const serviceClient = getSupabaseServiceRoleClient();

  return serviceClient
    .from("sentiment_analysis")
    .upsert(
      {
        entry_id: entryId,
        model,
        overall_sentiment: analysis.overallSentiment,
        dominant_emotions: analysis.dominantEmotions as Json,
        score: analysis.score,
        tone_summary: analysis.summary,
        raw_response: rawResponse ?? (analysis as unknown as Json),
      },
      {
        onConflict: "entry_id",
      }
    );
}
