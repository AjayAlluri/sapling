"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import clsx from "clsx";
import { createJournalEntry } from "@/app/journal/actions";
import { createJournalEntryInitialState } from "@/app/journal/state";

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
  const [state, formAction] = useFormState(createJournalEntry, createJournalEntryInitialState);
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
    <div className="rounded-2xl border border-white/30 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">New entry</h2>
        <p className="text-sm text-white/80">
          Write how you feel today. Sapling will analyze it and grow your tree.
        </p>
      </header>
      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-white/90">
            Title <span className="text-xs font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-white/60 transition placeholder:text-white/70 focus:ring"
            placeholder="Morning reflections"
            maxLength={120}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="content" className="text-sm font-medium text-white/90">
            Journal entry
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            minLength={1}
            rows={8}
            className="min-h-[180px] rounded-lg border border-white/40 bg-white/10 px-3 py-3 text-sm text-white outline-none ring-white/60 transition placeholder:text-white/70 focus:ring"
            placeholder="Let your thoughts flow…"
            required
          />
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>{wordCount} words</span>
            <span className="uppercase tracking-[0.2em] text-white/90">Analyzed automatically</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="mood" className="text-sm font-medium text-white/90">
            Mood tag
          </label>
          <select
            id="mood"
            name="mood"
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            className="rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-white/60 transition focus:ring"
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
      className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
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
          ? "border-white/40 bg-emerald-700/30 text-white"
          : "border-white/40 bg-red-700/30 text-white"
      )}
    >
      {message}
    </div>
  );
}
