import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-700 bg-emerald-800 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Sapling. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="transition hover:text-white/90">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-white/90">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
