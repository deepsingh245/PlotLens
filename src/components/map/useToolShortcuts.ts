import { useEffect } from "react";
import type { DrawTool } from "@/gis/annotationGeometry";

const SHORTCUT_TOOL: Record<string, DrawTool | "text"> = {
  p: "point",
  l: "line",
  g: "polygon",
  c: "circle",
  n: "text",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

/**
 * P/L/G/C/N select a tool, Esc cancels the in-progress draw — see
 * docs/design/MAP_INTERACTIONS.md §Keyboard shortcuts. Guarded against
 * firing while the user is typing into an input/textarea (e.g. AnnotationForm).
 */
export function useToolShortcuts(onSelectTool: (tool: DrawTool | "text") => void, onCancel: () => void) {
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
