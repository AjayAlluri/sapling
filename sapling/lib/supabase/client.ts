"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!);
}
