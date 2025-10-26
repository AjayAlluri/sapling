"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, useSupabase } from "@/components/providers/supabase-provider";

const links = [
  { href: "/journal", label: "Journal" },
  { href: "/docs", label: "Docs" },
  { href: "https://github.com/ajayalluri/sapling", label: "GitHub", external: true },
];

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
    <header className="border-b border-emerald-600/30 bg-emerald-700 text-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          Sapling
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-white">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white/90"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white/90"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/journal"
                className="hidden rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-flex"
              >
                Open journal
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
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
