import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/types/database";

let serviceRoleClient:
  | ReturnType<typeof createClient<Database>>
  | null = null;

export function getSupabaseServiceRoleClient() {
  if (!serviceRoleClient) {
    serviceRoleClient = createClient<Database>(env.supabaseUrl!, serverEnv.supabaseServiceRoleKey!, {
      auth: {
        persistSession: false,
      },
    });
  }
  return serviceRoleClient;
}
