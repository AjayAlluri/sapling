import type { Json } from "@/types/database";
import { getAnthropicClient } from "@/lib/claude/client";

const MODEL = "claude-3-5-sonnet-20241022";

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
    max_output_tokens: 1024,
    temperature: 0.2,
    system:
      "You are an assistant that evaluates personal journal entries and returns strictly formatted JSON summarizing the emotional landscape. Keep language supportive, empathetic, and concise.",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "SaplingSentimentAnalysis",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["overallSentiment", "summary", "dominantEmotions", "suggestions", "score"],
          properties: {
            overallSentiment: {
              type: "string",
              enum: ["very_negative", "negative", "neutral", "positive", "very_positive"],
            },
            summary: {
              type: "string",
              description: "One-paragraph summary written in a compassionate tone.",
            },
            dominantEmotions: {
              type: "array",
              minItems: 1,
              maxItems: 4,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "confidence"],
                properties: {
                  name: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                  colorHex: {
                    type: "string",
                    pattern: "^#(?:[0-9a-fA-F]{6})$",
                    description: "Hex color associated with this emotion for the tree visualization.",
                  },
                  treeEffect: {
                    type: "string",
                    description: "Short description of how the emotion should affect the tree.",
                  },
                },
              },
            },
            suggestions: {
              type: "array",
              minItems: 1,
              maxItems: 3,
              items: {
                type: "string",
              },
            },
            score: {
              type: "number",
              minimum: -1,
              maximum: 1,
              description: "Overall sentiment score in the range [-1, 1].",
            },
          },
        },
      },
    },
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

  const firstBlock = response.content[0];
  if (!firstBlock || firstBlock.type !== "json_schema") {
    throw new Error("Unexpected response format from Claude");
  }

  return firstBlock.parsed as AnalysisResult;
}

export type SentimentUpsert = {
  entryId: string;
  model: string;
  result: AnalysisResult;
  rawResponse: Json;
};
