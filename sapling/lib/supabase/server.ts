import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

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
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[Supabase] Unable to set cookies in this context (expected for server components)."
            );
          }
        }
      },
      remove(name: string, options: { domain?: string; path?: string } = {}) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[Supabase] Unable to remove cookies in this context (expected for server components)."
            );
          }
        }
      },
    },
  });
}
