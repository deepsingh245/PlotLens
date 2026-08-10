import { useEffect, useState } from "react";
import type { MapEngine } from "./MapEngine";
import { DrawingManager } from "./DrawingManager";

/**
 * Owns DrawingManager's React lifecycle — same shape as useMapEngine.ts.
 * Creates a DrawingManager once a MapEngine exists, destroys it on
 * unmount or when the engine changes.
 */
export function useDrawingManager(engine: MapEngine | null) {
  const [drawingManager, setDrawingManager] = useState<DrawingManager | null>(null);

  useEffect(() => {
    if (!engine) return;

    const instance = new DrawingManager(engine.getMap());
    // Not a "sync state to a changing prop" case (what this rule normally guards against) —
    // `engine` starts null and this effect runs exactly once per real MapEngine instance,
    // initializing DrawingManager the moment its dependency becomes available. Same accepted
    // shape as useMapEngine.ts's own instance-creation effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawingManager(instance);

    return () => {
      instance.destroy();
      setDrawingManager(null);
    };
  }, [engine]);

  return drawingManager;
}
