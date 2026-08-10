export type SaveStatus = "idle" | "saving" | "saved" | "error";

const LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

/**
 * Track A: driven by a prop. Track B wires this to
 * useMapStatePersistence's real status — see docs/plans/plan-1.md.
 * Never show a static "Saved" that isn't tied to a real write result.
 */
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
