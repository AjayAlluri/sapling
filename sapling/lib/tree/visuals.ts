import { clamp } from "@/lib/utils/math";

type EmotionKey =
  | "joy"
  | "gratitude"
  | "calm"
  | "sadness"
  | "stress"
  | "anger"
  | "fear"
  | "excitement"
  | "other"
  | "neutral";

const emotionColors: Record<EmotionKey, string> = {
  joy: "#3fb544",
  gratitude: "#2ecc71",
  calm: "#4ca9d8",
  sadness: "#4682b4",
  stress: "#808080",
  anger: "#ff5942",
  fear: "#8e44ad",
  excitement: "#f39c12",
  other: "#8fbc8f",
  neutral: "#3f7f4f",
};

export function getEmotionColor(emotion: string | null | undefined): string {
  const key = (emotion?.toLowerCase() ?? "neutral") as EmotionKey;
  return emotionColors[key] ?? emotionColors.neutral;
}

export function normalizeHealth(value: number | null | undefined): number {
  return clamp(typeof value === "number" ? value : 0.5, 0, 1);
}

export function computeLeafDensity(leafCount: number | null | undefined): number {
  if (!leafCount || leafCount <= 0) {
    return 0.1;
  }

  return clamp(leafCount / 150, 0.1, 1.2);
}

export function computeTrunkHeight(branchCount: number | null | undefined): number {
  const count = Math.max(branchCount ?? 1, 1);
  return clamp(2 + count * 0.12, 2, 5);
}
