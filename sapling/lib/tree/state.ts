import type { Database } from "@/types/database";
import { normalizeHealth } from "@/lib/tree/visuals";

type TreeStateRow = Database["public"]["Tables"]["tree_state"]["Row"];

export type TreeVisualState = {
  branchCount: number;
  leafCount: number;
  overallHealth: number;
  lastEmotion: string | null;
  streakLength: number;
};

export const defaultTreeVisualState: TreeVisualState = {
  branchCount: 3,
  leafCount: 30,
  overallHealth: 0.5,
  lastEmotion: null,
  streakLength: 0,
};

export function mapRowToVisualState(row?: TreeStateRow | null): TreeVisualState {
  if (!row) {
    return defaultTreeVisualState;
  }

  return {
    branchCount: Math.max(row.branch_count ?? 0, 3),
    leafCount: Math.max(row.leaf_count ?? 0, 20),
    overallHealth: normalizeHealth(row.overall_health),
    lastEmotion: row.last_emotion,
    streakLength: row.streak_length ?? 0,
  };
}
