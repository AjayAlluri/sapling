
## What Is Sapling?

Sapling is an emotional journaling studio that turns written reflections into a living 3D tree. Each entry affects three pillars:

1. **Focused Writing** – The journal workspace keeps you in flow, with optional mood tags and word-count feedback.
2. **Insightful Analysis** – Anthropic’s Claude model extracts dominant emotions, tone summaries, and next-step suggestions, storing everything securely in Supabase.
3. **Visual Feedback** – A React Three Fiber scene renders an evolving tree whose trunk, branches, leaves, and particle effects shift with your emotional landscape and consistency streaks.

Because Sapling runs locally with your Supabase and Claude keys, your thoughts remain private while you gain AI-assisted insight and motivational visuals.

### Key Features

- Supabase authentication and row-level security protect every journal entry.
- Server actions handle entry submission, analysis, and tree-state updates in one atomic flow.
- An emotion palette blends colors, wind animations, and particles to reflect sentiment.
- The landing page highlights the journaling journey, while the tree panel surfaces streaks, sentiment scores, and dominant emotions.

### Next Possibilities

- Deepen emotion-driven animations (e.g., rain, sparks, growth boosts).
- Add dashboards with emotion timelines, word-count trends, and sentiment distributions.
- Explore AI-generated narrative recaps or guided reflection prompts.

Sapling transforms reflection into something you can literally watch grow.


### 1. Install dependencies

```bash
npm install
```

### 2. Provide environment variables

Duplicate `.env.example` to `.env.local` and fill in your Supabase + Anthropic credentials. See `docs/prerequisites.md` for the full walkthrough.

### 3. Apply database migrations

Run the SQL in `supabase/migrations/0001_core_schema.sql` using the Supabase SQL editor or CLI. Details live in `docs/database.md`.

### 4. Start the dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start exploring the app at `app/page.tsx`. Auth pages live under `app/auth/*`, and the protected journal prototype is at `/journal`.

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - build the 3D tree scene.
- [Anthropic API Docs](https://docs.anthropic.com/) - integrate Claude models for sentiment.
- Internal docs: `docs/prerequisites.md`, `docs/database.md`, `docs/claude.md`, `docs/journal.md`, `docs/tree.md`.
