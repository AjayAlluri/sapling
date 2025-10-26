import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();

  return createServerClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(
        name: string,
        value: string,
        options: {
          domain?: string;
          path?: string;
          maxAge?: number;
          expires?: Date;
          httpOnly?: boolean;
          secure?: boolean;
          sameSite?: true | false | "lax" | "strict" | "none";
        } = {}
      ) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: { domain?: string; path?: string } = {}) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}
