# Database Setup (Phase 3)

This project tracks Supabase schema changes via SQL migration files stored in `supabase/migrations`. The current baseline is `0001_core_schema.sql`, which provisions:

- `journal_entries` – user-authored reflections
- `sentiment_analysis` – Claude results linked to entries
- `tree_state` – aggregate metrics that drive the 3D visualization
- Row Level Security policies protecting user data

## Applying migrations

You have two options for applying the SQL to your Supabase project:

### Option A: Supabase SQL Editor

1. Open your project at [supabase.com](https://supabase.com/).
2. Go to **SQL Editor → New query**.
3. Paste the contents of `supabase/migrations/0001_core_schema.sql`.
4. Run the script; verify the tables appear under **Table Editor**.

### Option B: Supabase CLI (local migrations)

1. Install the Supabase CLI if you haven’t already: `npm install -g supabase`.
2. Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. From the project root run:
   ```bash
   supabase db push
   ```
   > The CLI will apply all migrations in chronological order.

## Generating TypeScript types

After updating the database, refresh the locally maintained types to keep TypeScript in sync:

```bash
supabase gen types typescript --project-id <your-project-ref> \
  --schema public > sapling/types/database.ts
```

> The repository currently tracks a hand-written version of these types. When you regenerate them, review the diff before committing to ensure any local refinements are preserved.

## Next steps

- Seed a few `journal_entries` rows for development testing.
- Add future migrations as `0002_description.sql`, `0003_description.sql`, etc., to preserve ordering.
- Extend the schema as new features (analytics dashboards, emotion history, etc.) come online.
