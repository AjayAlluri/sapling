# 3D Tree Visualization (Phase 6)

The tree view provides a visual snapshot of your emotional journaling progress. It lives beside the journal workspace and runs entirely on the client with React Three Fiber.

## Components

- `components/tree/tree-panel.tsx` – UI wrapper that renders metadata cards, the canvas, and latest sentiment highlights.
- `components/tree/tree-scene.tsx` – Sets up the Three.js canvas, lighting, and controls.
- `components/tree/tree-model.tsx` – Generates the trunk, branches, and leaves based on the current tree state.
- `lib/tree/state.ts` / `lib/tree/visuals.ts` – Translate Supabase rows into the simplified visual state and provide helper utilities for colors, health, and geometry sizing.

## Data flow

1. Server action (`app/journal/actions.ts`) saves each entry and runs Claude, then updates `tree_state` with new branch/leaf counts and health metrics.
2. The journal page fetches both the entries and the `tree_state` row using the authenticated Supabase server client.
3. The mapped `TreeVisualState` is passed into the client-side tree panel to drive the visualization.

### How metrics map to the scene

| Metric | Visual Impact |
| ------ | ------------- |
| `branch_count` | Controls trunk height and number of branch meshes |
| `leaf_count` | Adjusts leaf density and canopy volume |
| `overall_health` | Alters branch posture/length and overall tone |
| `last_emotion` | Picks the dominant color palette |
| `streak_length` | Currently surfaced in UI metadata (future hook for animation) |

## Local tips

- If your `tree_state` table is empty, the UI falls back to a default “seedling” state.
- To experiment without journaling, manually update the row in Supabase and refresh the `/journal` page.
- The visual generator keeps randomness constrained for repeatability; refresh the page to see small variations.

Next steps for later phases include morphing geometry with more emotion-specific behaviors and synchronizing animation to sentiment trends.
