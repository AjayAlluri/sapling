import { Color } from "three";

export type EmotionName =
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

export type EmotionPalette = {
  barkColor: string;
  barkHighlight: string;
  leafPrimary: string;
  leafSecondary: string;
  accentColor: string;
  ambientLight: string;
  particle: "fireflies" | "embers" | "rain" | "sparks" | "motes" | null;
  branchLean: number;
  branchTwist: number;
  windStrength: number;
};

type EmotionProfile = EmotionPalette & {
  mood: "uplifting" | "grounded" | "melancholic" | "tense";
};

const BASE_PROFILES: Record<EmotionName, EmotionProfile> = {
  joy: {
    barkColor: "#5a3f2e",
    barkHighlight: "#a97c50",
    leafPrimary: "#3fe27f",
    leafSecondary: "#b8ffcd",
    accentColor: "#ffe066",
    ambientLight: "#ffe9d6",
    particle: "fireflies",
    branchLean: 0.12,
    branchTwist: 0.6,
    windStrength: 0.5,
    mood: "uplifting",
  },
  gratitude: {
    barkColor: "#5b3c2b",
    barkHighlight: "#c89f6a",
    leafPrimary: "#6ae07c",
    leafSecondary: "#d8ffd9",
    accentColor: "#ffd08a",
    ambientLight: "#fff1de",
    particle: "motes",
    branchLean: 0.08,
    branchTwist: 0.45,
    windStrength: 0.35,
    mood: "uplifting",
  },
  calm: {
    barkColor: "#3a3f56",
    barkHighlight: "#69749d",
    leafPrimary: "#5aa5f5",
    leafSecondary: "#c7e1ff",
    accentColor: "#8fd1ff",
    ambientLight: "#e0f3ff",
    particle: "motes",
    branchLean: 0.02,
    branchTwist: 0.2,
    windStrength: 0.2,
    mood: "grounded",
  },
  sadness: {
    barkColor: "#2d2f45",
    barkHighlight: "#4a5170",
    leafPrimary: "#4f6bbd",
    leafSecondary: "#9db0e0",
    accentColor: "#6d82c4",
    ambientLight: "#d0d8ee",
    particle: "rain",
    branchLean: -0.18,
    branchTwist: 0.15,
    windStrength: 0.1,
    mood: "melancholic",
  },
  stress: {
    barkColor: "#403c3b",
    barkHighlight: "#6d5b58",
    leafPrimary: "#9aa0a6",
    leafSecondary: "#c9cccc",
    accentColor: "#c16363",
    ambientLight: "#e3e0dd",
    particle: "sparks",
    branchLean: -0.05,
    branchTwist: 0.4,
    windStrength: 0.65,
    mood: "tense",
  },
  anger: {
    barkColor: "#3d1f1c",
    barkHighlight: "#8a3c2b",
    leafPrimary: "#f0523a",
    leafSecondary: "#ffc0a8",
    accentColor: "#ff7847",
    ambientLight: "#ffe4d7",
    particle: "embers",
    branchLean: -0.12,
    branchTwist: 0.75,
    windStrength: 0.55,
    mood: "tense",
  },
  fear: {
    barkColor: "#2f1c3f",
    barkHighlight: "#6a4f92",
    leafPrimary: "#8c6fe6",
    leafSecondary: "#d1b7ff",
    accentColor: "#c587ff",
    ambientLight: "#f2e8ff",
    particle: "sparks",
    branchLean: -0.08,
    branchTwist: 0.5,
    windStrength: 0.4,
    mood: "tense",
  },
  excitement: {
    barkColor: "#6b402d",
    barkHighlight: "#c98b64",
    leafPrimary: "#ff9933",
    leafSecondary: "#ffd6a8",
    accentColor: "#ffcd50",
    ambientLight: "#ffeed9",
    particle: "fireflies",
    branchLean: 0.2,
    branchTwist: 0.85,
    windStrength: 0.7,
    mood: "uplifting",
  },
  other: {
    barkColor: "#445149",
    barkHighlight: "#7f897f",
    leafPrimary: "#9dd28b",
    leafSecondary: "#dff5d8",
    accentColor: "#b0dfc0",
    ambientLight: "#f1f6ef",
    particle: "motes",
    branchLean: 0,
    branchTwist: 0.35,
    windStrength: 0.3,
    mood: "grounded",
  },
  neutral: {
    barkColor: "#4d4a3f",
    barkHighlight: "#837a6a",
    leafPrimary: "#88c084",
    leafSecondary: "#d9ebd6",
    accentColor: "#cddbb7",
    ambientLight: "#f3f1ec",
    particle: null,
    branchLean: 0,
    branchTwist: 0.25,
    windStrength: 0.25,
    mood: "grounded",
  },
};

type EmotionInput = {
  lastEmotion: string | null;
  dominantEmotions: Array<{ name: string; confidence: number; colorHex?: string | null }>;
  sentimentScore: number;
};

function normalizeEmotionName(name: string | null | undefined): EmotionName {
  if (!name) return "neutral";
  const key = name.toLowerCase() as EmotionName;
  if (key in BASE_PROFILES) {
    return key;
  }
  return "other";
}

function blendColors(colors: string[], weights: number[]): string {
  const accumulator = new Color(0x000000);
  const temp = new Color();
  let total = 0;

  colors.forEach((hex, index) => {
    const weight = weights[index] ?? 0;
    if (weight <= 0) return;
    temp.set(hex);
    accumulator.r += temp.r * weight;
    accumulator.g += temp.g * weight;
    accumulator.b += temp.b * weight;
    total += weight;
  });

  if (total <= 0) {
    return "#ffffff";
  }

  accumulator.multiplyScalar(1 / total);
  return `#${accumulator.getHexString()}`;
}

function blendNumbers(values: number[], weights: number[]): number {
  let total = 0;
  let sum = 0;
  values.forEach((value, index) => {
    const weight = weights[index] ?? 0;
    sum += value * weight;
    total += weight;
  });
  return total > 0 ? sum / total : 0;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function resolveEmotionPalette(input: EmotionInput): EmotionPalette {
  const dominant = input.dominantEmotions.length
    ? input.dominantEmotions
    : input.lastEmotion
    ? [{ name: input.lastEmotion, confidence: 1 }]
    : [{ name: "neutral", confidence: 1 }];

  const normalized = dominant.map((emotion) => ({
    key: normalizeEmotionName(emotion.name),
    confidence: clamp01(emotion.confidence ?? 0.6),
    colorHex: emotion.colorHex ?? null,
  }));

  const confidences = normalized.map((item) => item.confidence);
  const totalConfidence = confidences.reduce((sum, value) => sum + value, 0) || 1;
  const weights = confidences.map((value) => value / totalConfidence);

  const profiles = normalized.map((emotion) => BASE_PROFILES[emotion.key]);

  const sentimentFactor = clamp01((input.sentimentScore + 1) / 2); // 0 = negative, 1 = positive

  const baseLeafColors = profiles.map((profile, index) => {
    const explicit = normalized[index].colorHex;
    return explicit ?? profile.leafPrimary;
  });

  const leafPrimary = blendColors(baseLeafColors, weights);
  const leafSecondary = blendColors(
    profiles.map((profile) => profile.leafSecondary),
    weights
  );
  const barkColor = blendColors(profiles.map((profile) => profile.barkColor), weights);
  const barkHighlight = blendColors(
    profiles.map((profile) => profile.barkHighlight),
    weights
  );
  const accentColor = blendColors(profiles.map((profile) => profile.accentColor), weights);
  const ambientLight = blendColors(profiles.map((profile) => profile.ambientLight), weights);

  const branchLean = blendNumbers(
    profiles.map((profile) => profile.branchLean),
    weights
  );
  const branchTwist = blendNumbers(
    profiles.map((profile) => profile.branchTwist),
    weights
  );
  const windStrength = blendNumbers(
    profiles.map((profile) => profile.windStrength),
    weights
  );

  const particle = profiles.reduce<EmotionPalette["particle"]>((current, profile, index) => {
    const weight = weights[index];
    if (!current && weight > 0.2) {
      return profile.particle;
    }
    if (current === "motes" && profile.particle && weight > 0.35) {
      return profile.particle;
    }
    return current;
  }, null);

  const sentimentAdjust = new Color(leafPrimary);
  const sentimentTarget =
    sentimentFactor >= 0.5 ? new Color("#e8ffe4") : new Color("#2f3a4c");
  sentimentAdjust.lerp(sentimentTarget, Math.abs(sentimentFactor - 0.5) * 0.6);

  return {
    barkColor,
    barkHighlight,
    leafPrimary: `#${sentimentAdjust.getHexString()}`,
    leafSecondary,
    accentColor,
    ambientLight,
    particle,
    branchLean,
    branchTwist,
    windStrength: clamp01(windStrength * 0.7 + sentimentFactor * 0.3),
  };
}
