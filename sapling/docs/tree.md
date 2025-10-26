# 3D Tree Visualization (Phase 6)

The tree view provides a visual snapshot of your emotional journaling progress. It lives beside the journal workspace and runs entirely on the client with React Three Fiber.

## Components

- `components/tree/tree-panel.tsx` – UI wrapper that renders metadata cards, the canvas, and latest sentiment highlights.
- `components/tree/tree-scene.tsx` – Sets up the Three.js canvas, lighting, and controls.
- `components/tree/tree-model.tsx` – Generates the curved trunk, branch tubes, animated leaves, and emotion particles.
- `lib/tree/state.ts` / `lib/tree/palette.ts` – Translate Supabase rows into `TreeVisualState` and derive color/animation palettes from dominant emotions and sentiment.

## Data flow

1. Server action (`app/journal/actions.ts`) saves each entry and runs Claude, then updates `tree_state` with new branch/leaf counts and health metrics.
2. The journal page fetches both the entries and the `tree_state` row using the authenticated Supabase server client.
3. The mapped `TreeVisualState` is passed into the client-side tree panel to drive the visualization.

### How metrics map to the scene

| Metric | Visual Impact |
| ------ | ------------- |
| `branch_count` | Extends trunk height and spawns additional curved branches |
| `leaf_count` | Adjusts instanced leaf density and canopy reach |
| `overall_health` | Changes trunk thickness and branch posture |
| `dominant_emotions` | Blends leaf colors, branch lean, particle type, and wind strength |
| `sentimentScore` | Tunes leaf brightness, branch length, and animation amplitude |
| `streak_length` | Displayed in the panel; reserved for future growth bonuses |

## Local tips

- If your `tree_state` table is empty, the UI falls back to a default “seedling” state.
- To experiment without journaling, manually update the row in Supabase and refresh the `/journal` page.
- The visual generator uses the snapshot timestamp as a seed, so each save produces a stable tree but still allows gentle variation.
- Emotion particles (fireflies, rain, sparks, etc.) are chosen from the dominant emotion palette—disable them by clearing the `tree_state` snapshot if needed.

Next steps for later phases include morphing geometry with more emotion-specific behaviors and synchronizing animation to long-term emotion streaks.
