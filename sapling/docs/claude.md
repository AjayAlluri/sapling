# Claude Integration (Phase 4)

Sapling uses Anthropic's Claude models to analyze journal entries and translate sentiment into structured data for the 3D tree.

## Key pieces

- `lib/claude/client.ts` – initializes the Anthropic SDK with the API key from `.env.local`.
- `lib/claude/analyze-entry.ts` – wraps the Claude call, enforces a JSON schema response, and returns a typed analysis payload.
- `app/api/analyze-entry/route.ts` – authenticated API endpoint that:
  1. Verifies the journal entry belongs to the requesting user.
  2. Calls Claude to analyze the entry content.
  3. Persists the results to `sentiment_analysis` via a Supabase service-role client.

## Running the analyzer

1. Ensure `.env.local` contains `ANTHROPIC_API_KEY`.
2. Make sure the Supabase schema (`supabase/migrations/0001_core_schema.sql`) has been applied.
3. Start the dev server: `npm run dev`.
4. Send a request (use `curl`, Postman, or within the app):

```bash
curl -X POST http://localhost:3000/api/analyze-entry \
  -H "Content-Type: application/json" \
  -d '{"entryId":"<uuid-from-journal_entries>", "content":"<journal text>"}' \
  --cookie "sb-access-token=<auth-cookie>"
```

> The endpoint requires a valid Supabase session cookie because it checks ownership before calling Claude.

## Handling responses

The API returns:

```json
{
  "analysis": {
    "overallSentiment": "positive",
    "summary": "Supportive synopsis…",
    "dominantEmotions": [
      { "name": "joy", "confidence": 0.78, "colorHex": "#3fb544", "treeEffect": "brighter leaves" }
    ],
    "suggestions": ["Try to celebrate…"],
    "score": 0.62
  }
}
```

The raw payload is stored in Supabase for auditing or future reprocessing. Tree mutation logic can read `dominantEmotions` and `score` to adjust visuals.

## Troubleshooting

- Missing keys → double-check `.env.local`.
- 401 responses → ensure the client includes the Supabase auth cookie.
- 4xx from Claude → confirm the model name is available to your account and that usage limits aren’t exceeded.
- To rotate keys, update `.env.local` and restart `npm run dev`.
