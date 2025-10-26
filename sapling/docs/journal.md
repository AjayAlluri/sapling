# Journal Interface (Phase 5)

The `/journal` route now lets you write entries, trigger Claude analysis automatically, and review prior reflections with sentiment insights.

## Creating entries

- The entry form captures an optional title, an optional mood tag, and the main entry content.
- Submitting the form uses a server action (`app/journal/actions.ts`) that:
  1. Validates input with Zod.
  2. Saves the entry to `journal_entries`.
  3. Calls Claude via `analyzeJournalEntry`.
  4. Stores the structured result in `sentiment_analysis`.
- On success the page revalidates and the form resets.

## Reviewing history

`components/journal/entry-list.tsx` renders recent entries with:

- Word count and mood tag metadata.
- Sentiment label + score returned by Claude.
- Tone summary and dominant emotions (if available).
- A sentiment filter dropdown so you can focus on specific emotional ranges.

Entries display in reverse chronological order. If Claude fails, the entry still appears and can be re-analyzed later.

## Local workflow tips

- Keep Supabase and Anthropic credentials in `.env.local`.
- Apply migrations (`supabase/migrations/0001_core_schema.sql`) before testing the page.
- Seed a few entries manually through the form to observe how the dominant emotions alter your planned tree visuals.
