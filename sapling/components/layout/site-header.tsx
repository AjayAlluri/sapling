"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, useSupabase } from "@/components/providers/supabase-provider";

export function SiteHeader() {
  const session = useSession();
  const supabase = useSupabase();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 text-slate-100 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-slate-100">
          Sapling
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/journal"
                className="hidden rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 sm:inline-flex"
              >
                Open journal
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex rounded-full bg-emerald-700/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex rounded-full bg-emerald-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500/80"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
