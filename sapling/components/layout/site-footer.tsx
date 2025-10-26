import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020711]/80 text-slate-300 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          &copy; {new Date().getFullYear()} Sapling
        </p>
        <div className="flex items-center gap-3 text-slate-300">
          <Link href="/privacy" className="transition hover:text-emerald-300">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-emerald-300">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
