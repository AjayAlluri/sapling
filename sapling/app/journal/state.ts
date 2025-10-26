export type CreateJournalEntryState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const createJournalEntryInitialState: CreateJournalEntryState = {
  status: "idle",
};
