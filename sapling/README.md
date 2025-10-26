Sapling is an emotional journal that visualizes your feelings as a living 3D tree. It uses Next.js 16, Supabase for auth/data, and Claude for sentiment analysis. The project is currently in active development following the roadmap in `plan.md`.

## Getting Started

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- [Supabase Documentation](https://supabase.com/docs) - auth, RLS, and Postgres features.
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - build the 3D tree scene.
- [Anthropic API Docs](https://docs.anthropic.com/) - integrate Claude models for sentiment.
- Internal docs: `docs/prerequisites.md`, `docs/database.md`, `docs/claude.md`, `docs/journal.md`.
