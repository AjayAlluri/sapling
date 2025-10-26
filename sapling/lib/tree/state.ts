import type { Database } from "@/types/database";
import { normalizeHealth } from "@/lib/tree/visuals";
import { resolveEmotionPalette, type EmotionPalette } from "@/lib/tree/palette";

type TreeStateRow = Database["public"]["Tables"]["tree_state"]["Row"];

export type TreeVisualState = {
  branchCount: number;
  leafCount: number;
  overallHealth: number;
  lastEmotion: string | null;
  streakLength: number;
  sentimentScore: number;
  overallSentiment: string | null;
  dominantEmotions: DominantEmotion[];
  palette: EmotionPalette;
  seed: number;
};

export const defaultTreeVisualState: TreeVisualState = {
  branchCount: 3,
  leafCount: 30,
  overallHealth: 0.5,
  lastEmotion: null,
  streakLength: 0,
  sentimentScore: 0,
  overallSentiment: null,
  dominantEmotions: [],
  palette: resolveEmotionPalette({
    lastEmotion: null,
    dominantEmotions: [],
    sentimentScore: 0,
  }),
  seed: 1,
};

type TreeSnapshot = {
  capturedAt?: string;
  sentimentScore?: number;
  primaryEmotion?: string | null;
  overallSentiment?: string | null;
  dominantEmotions?: DominantEmotion[];
  suggestions?: string[];
  score?: number;
  seed?: number;
};

export type DominantEmotion = {
  name: string;
  confidence: number;
  colorHex?: string | null;
  treeEffect?: string | null;
};

function normalizeDominantEmotions(value: unknown): DominantEmotion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : null;
      const confidence =
        typeof record.confidence === "number"
          ? record.confidence
          : typeof record.confidence === "string"
          ? Number(record.confidence)
          : null;
      if (!name || confidence === null || Number.isNaN(confidence)) {
        return null;
      }
      return {
        name,
        confidence: Math.max(0, Math.min(1, confidence)),
        colorHex: typeof record.colorHex === "string" ? record.colorHex : undefined,
        treeEffect: typeof record.treeEffect === "string" ? record.treeEffect : undefined,
      };
    })
    .filter(Boolean) as DominantEmotion[];
}

export function mapRowToVisualState(row?: TreeStateRow | null): TreeVisualState {
  if (!row) {
    return defaultTreeVisualState;
  }

  const snapshot = (row.tree_snapshot ?? {}) as TreeSnapshot;
  const dominantEmotions = normalizeDominantEmotions(snapshot.dominantEmotions);
  const sentimentScore =
    typeof snapshot.sentimentScore === "number"
      ? snapshot.sentimentScore
      : typeof snapshot.score === "number"
      ? snapshot.score
      : 0;

  const palette = resolveEmotionPalette({
    lastEmotion: row.last_emotion,
    dominantEmotions,
    sentimentScore,
  });

  const seed =
    typeof snapshot.seed === "number"
      ? snapshot.seed
      : snapshot.capturedAt
      ? new Date(snapshot.capturedAt).getTime()
      : Date.now();

  return {
    branchCount: Math.max(row.branch_count ?? 0, 3),
    leafCount: Math.max(row.leaf_count ?? 0, 20),
    overallHealth: normalizeHealth(row.overall_health),
    lastEmotion: row.last_emotion,
    streakLength: row.streak_length ?? 0,
    sentimentScore,
    overallSentiment:
      typeof snapshot.overallSentiment === "string" ? snapshot.overallSentiment : null,
    dominantEmotions:
      dominantEmotions.length > 0
        ? dominantEmotions
        : row.last_emotion
        ? [{ name: row.last_emotion, confidence: 1 }]
        : [],
    palette,
    seed,
  };
}
