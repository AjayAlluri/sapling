import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Sapling. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="transition hover:text-zinc-950 dark:hover:text-zinc-50">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-950 dark:hover:text-zinc-50">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
