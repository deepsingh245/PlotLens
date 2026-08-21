export type SaveStatus = "idle" | "saving" | "saved" | "error";

const LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

/** Driven by useMapStatePersistence's real status (ProjectWorkspace.tsx) — never a static "Saved". */
export function SaveStatusIndicator({ status = "idle" }: { status?: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <span
      className={
        "font-mono text-xs " +
        (status === "error" ? "text-destructive" : "text-text-secondary")
      }
    >
      {LABEL[status]}
    </span>
  );
}
