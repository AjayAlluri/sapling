export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Sapling documentation</h1>
      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
        Detailed implementation docs will land here as we progress through the build. For
        now, reference `plan.md` at the project root for the full roadmap.
      </p>
    </div>
  );
}
