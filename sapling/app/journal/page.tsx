export default function JournalPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
          Prototype
        </span>
        <h1 className="mt-3 text-3xl font-semibold">Journal workspace</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          This page will host the core journaling experience in upcoming phases:
          writing entries, triggering Claude sentiment analysis, and nurturing the 3D tree.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-8 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
        Interactive journaling UI to be implemented in Phase 5.
      </div>
    </div>
  );
}
