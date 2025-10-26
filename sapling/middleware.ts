import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

const protectedRoutes = ["/journal"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
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
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: { domain?: string; path?: string } = {}) {
        res.cookies.delete({ name, ...options });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!session && isProtectedRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/journal/:path*"],
};
