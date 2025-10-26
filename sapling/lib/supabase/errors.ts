import type { PostgrestError } from "@supabase/supabase-js";

const ERROR_MESSAGES: Record<string, string> = {
  "42P01": "Sapling couldn’t find the required tables. Run the SQL in supabase/migrations/0001_core_schema.sql.",
  "42501": "Supabase rejected the request due to row-level security. Ensure your policies allow the operation.",
  P0001: "Supabase rejected the request due to row-level security. Ensure your policies allow the operation.",
  PGRST301:
    "Row Level Security is enabled and blocked the request. Confirm the user is authenticated and policies are configured.",
  400: "Supabase reported a bad request. Double-check the sent payload and schema.",
};

export function describePostgrestError(error?: PostgrestError | null): string | null {
  if (!error) {
    return null;
  }

  return ERROR_MESSAGES[error.code] ?? null;
}
