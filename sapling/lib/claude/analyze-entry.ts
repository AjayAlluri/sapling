import type { Json } from "@/types/database";
import { getAnthropicClient } from "@/lib/claude/client";

const MODEL = "claude-3-7-sonnet-latest";

export type EmotionDescriptor = {
  name: string;
  confidence: number;
  colorHex?: string;
  treeEffect?: string;
};

export type AnalysisResult = {
  overallSentiment: "very_negative" | "negative" | "neutral" | "positive" | "very_positive";
  summary: string;
  dominantEmotions: EmotionDescriptor[];
  suggestions: string[];
  score: number; // -1 to 1
};

export async function analyzeJournalEntry(content: string): Promise<AnalysisResult> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0.2,
    system:
      "You are an assistant that evaluates personal journal entries and returns strictly formatted JSON summarizing the emotional landscape. Respond with a minified JSON object containing keys overallSentiment, summary, dominantEmotions, suggestions, and score. dominantEmotions must be an array (1-4 items) with objects {\"name\": string, \"confidence\": number between 0 and 1, \"colorHex\"?: hex string, \"treeEffect\"?: string}. summary should be a compassionate paragraph. suggestions should be 1-3 short strings. score must be a number between -1 and 1. Return ONLY JSON with no commentary.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the following journal entry. Focus on emotional content and actionable insights:\n\n${content}`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find(
    (item): item is { type: "text"; text: string } => item.type === "text"
  );

  if (!textBlock) {
    throw new Error("Unexpected response format from Claude");
  }

  try {
    const parsed = JSON.parse(textBlock.text) as AnalysisResult;
    return parsed;
  } catch (error) {
    console.error("Failed to parse Claude response", { content: textBlock.text, error });
    throw new Error("Claude returned an unexpected response. Please try again.");
  }
}

export type SentimentUpsert = {
  entryId: string;
  model: string;
  result: AnalysisResult;
  rawResponse: Json;
};
