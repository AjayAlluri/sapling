"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
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
          <MoodSelect value={mood} onChange={setMood} />
          <input type="hidden" name="mood" id="mood" value={mood} />
        </div>

        <SubmitButton />

        <StatusMessage status={state.status} message={state.status === "idle" ? undefined : state.message} />
      </form>
    </div>
  );
}

function MoodSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) return;
    if (event.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  const selectedLabel = moodOptions.find((m) => m.value === value)?.label ?? "No mood tag";

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full h-11 rounded-full border bg-white/10 px-4 pr-10 text-left text-sm backdrop-blur transition",
          "border-white/40 text-white hover:border-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-300/50",
          value === "" && "text-white/70"
        )}
      >
        {selectedLabel}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/20 bg-zinc-900/95 p-1 text-sm text-white shadow-xl backdrop-blur"
        >
          {moodOptions.map((option) => {
            const selected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(option.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }
                }}
                className={clsx(
                  "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 outline-none",
                  selected
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "hover:bg-white/10 focus:bg-white/10"
                )}
              >
                <span>{option.label}</span>
                {selected ? (
                  <span className="text-emerald-300">✓</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
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
