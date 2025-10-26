# Phase 0 — Prerequisites Setup

This guide walks through gathering the credentials needed before development begins. Keep real keys out of version control and store them in `sapling/.env.local`.

## 1. Supabase Project

1. Sign in at [supabase.com](https://supabase.com/) and create a new project (free tier is fine).
2. Choose the closest region, set a secure database password, and wait for provisioning to finish.
3. In the project dashboard open **Project Settings → API**.
   - Copy the **Project URL** → set `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy the **anon public key** → set `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - (Server-side features) Copy the **service_role key** → set `SUPABASE_SERVICE_ROLE_KEY`. Keep this secret; never expose it client-side.
4. Open **Project Settings → Database** and note the **reference ID**; you may need it when calling Supabase support.

## 2. Anthropic API Access

1. Go to [console.anthropic.com](https://console.anthropic.com/), create an account, and add a payment method if required.
2. Generate an API key under **API Keys**.
3. Store it as `ANTHROPIC_API_KEY` in `.env.local`.
4. Restrict or rotate the key as needed via the Anthropic console.

## 3. Local Environment File

Create `sapling/.env.local` with the following entries:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
```

> Tip: duplicate `.env.example` and update the placeholder values.

After saving the file, restart the Next.js dev server (if running) so it picks up the new environment variables.
