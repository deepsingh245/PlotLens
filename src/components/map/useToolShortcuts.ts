import { useEffect } from "react";
import type { DrawTool } from "@/gis/annotationGeometry";
import type { MeasureTool } from "./ToolRail";

const SHORTCUT_TOOL: Record<string, DrawTool | "text" | "image" | MeasureTool> = {
  p: "point",
  l: "line",
  g: "polygon",
  c: "circle",
  n: "text",
  i: "image",
  m: "measure-distance",
  a: "measure-area",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

/**
 * P/L/G/C/N/I/M/A select a tool, Esc cancels the in-progress draw — see
 * docs/design/MAP_INTERACTIONS.md §Keyboard shortcuts (that doc's own list
 * is "indicative, finalize during implementation" — it names one shortcut,
 * `M`, for a single "measure" concept; this app splits distance/area into
 * two tools, so `A` was picked for area since it isn't used elsewhere).
 * Guarded against firing while the user is typing into an input/textarea
 * (e.g. AnnotationForm).
 */
export function useToolShortcuts(
  onSelectTool: (tool: DrawTool | "text" | "image" | MeasureTool) => void,
  onCancel: () => void,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Escape") {
        onCancel();
        return;
      }

      const tool = SHORTCUT_TOOL[event.key.toLowerCase()];
      if (tool) onSelectTool(tool);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectTool, onCancel]);
}
