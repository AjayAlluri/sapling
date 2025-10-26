-- Phase 3: Core database schema for Sapling
-- Requires: Supabase project with PostgreSQL 15+

begin;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Journal entries authored by users.
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  content text not null,
  mood_tag text,
  entry_date date not null default (current_timestamp at time zone 'utc')::date,
  word_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

create index if not exists journal_entries_entry_date_idx
  on public.journal_entries (user_id, entry_date);

create table if not exists public.sentiment_analysis (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  model text not null,
  overall_sentiment text,
  dominant_emotions jsonb,
  score numeric(4,3),
  tone_summary text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists sentiment_analysis_entry_id_key
  on public.sentiment_analysis (entry_id);

-- Aggregated tree metrics per user.
create table if not exists public.tree_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  branch_count integer not null default 0,
  leaf_count integer not null default 0,
  overall_health numeric(4,3) not null default 0.5,
  last_emotion text,
  streak_length integer not null default 0,
  tree_snapshot jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists tree_state_updated_idx
  on public.tree_state (updated_at desc);

-- Maintain updated_at columns automatically.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_journal_updated_at on public.journal_entries;
create trigger set_journal_updated_at
  before update on public.journal_entries
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_tree_state_updated_at on public.tree_state;
create trigger set_tree_state_updated_at
  before update on public.tree_state
  for each row
  execute function public.handle_updated_at();

-- Row Level Security
alter table public.journal_entries enable row level security;
alter table public.sentiment_analysis enable row level security;
alter table public.tree_state enable row level security;

-- Journal entries policies
create policy "Users can view own journal entries"
  on public.journal_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their journal entries"
  on public.journal_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their journal entries"
  on public.journal_entries
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their journal entries"
  on public.journal_entries
  for delete
  using (auth.uid() = user_id);

-- Sentiment analysis policies
create policy "Users can view own sentiment analysis"
  on public.sentiment_analysis
  for select
  using (
    exists (
      select 1 from public.journal_entries je
      where je.id = sentiment_analysis.entry_id
        and je.user_id = auth.uid()
    )
  );

create policy "Service role can insert sentiment analysis"
  on public.sentiment_analysis
  for insert
  with check (auth.role() = 'service_role');

create policy "Service role can update sentiment analysis"
  on public.sentiment_analysis
  for update
  using (auth.role() = 'service_role');

create policy "Service role can delete sentiment analysis"
  on public.sentiment_analysis
  for delete
  using (auth.role() = 'service_role');

-- Tree state policies
create policy "Users can view their tree state"
  on public.tree_state
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their tree state"
  on public.tree_state
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their tree state"
  on public.tree_state
  for update
  using (auth.uid() = user_id);

commit;
