"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import clsx from "clsx";
import {
  createJournalEntry,
  initialCreateJournalEntryState,
} from "@/app/journal/actions";

const moodOptions = [
  { value: "", label: "No mood tag" },
  { value: "joy", label: "Joy" },
  { value: "gratitude", label: "Gratitude" },
  { value: "calm", label: "Calm" },
  { value: "sadness", label: "Sadness" },
  { value: "stress", label: "Stress" },
  { value: "anger", label: "Anger" },
  { value: "fear", label: "Fear" },
  { value: "excitement", label: "Excitement" },
  { value: "other", label: "Other" },
];

export function EntryForm() {
  const [state, formAction] = useFormState(createJournalEntry, initialCreateJournalEntryState);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");

  const wordCount = useMemo(() => {
    if (!content.trim()) {
      return 0;
    }
    return content.trim().split(/\s+/).length;
  }, [content]);

  useEffect(() => {
    if (state.status === "success") {
      startTransition(() => {
        setTitle("");
        setContent("");
        setMood("");
      });
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New entry</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Write how you feel today. Sapling will analyze it and grow your tree.
        </p>
      </header>
      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Title <span className="text-xs font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none ring-emerald-500 transition focus:ring dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="Morning reflections"
            maxLength={120}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Journal entry
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            minLength={1}
            rows={8}
            className="min-h-[180px] rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none ring-emerald-500 transition focus:ring dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Let your thoughts flow…"
            required
          />
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{wordCount} words</span>
            <span className="uppercase tracking-[0.2em] text-emerald-500">Analyzed automatically</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="mood" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Mood tag
          </label>
          <select
            id="mood"
            name="mood"
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none ring-emerald-500 transition focus:ring dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {moodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <SubmitButton />

        <StatusMessage status={state.status} message={state.status === "idle" ? undefined : state.message} />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving entry…" : "Save entry"}
    </button>
  );
}

function StatusMessage({
  status,
  message,
}: {
  status: "idle" | "success" | "error";
  message?: string;
}) {
  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={clsx(
        "rounded-xl border px-3 py-3 text-sm",
        status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
      )}
    >
      {message}
    </div>
  );
}
