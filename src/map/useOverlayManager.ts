import { useEffect, useState } from "react";
import type { MapEngine } from "./MapEngine";
import { OverlayManager, type OverlayManagerOptions } from "./OverlayManager";

/**
 * Owns OverlayManager's React lifecycle — same shape as useDrawingManager.ts.
 * Creates an OverlayManager once a MapEngine exists, destroys it on unmount
 * or when the engine changes.
 */
export function useOverlayManager(engine: MapEngine | null, options?: OverlayManagerOptions) {
  const [overlayManager, setOverlayManager] = useState<OverlayManager | null>(null);

  useEffect(() => {
    if (!engine) return;

    const instance = new OverlayManager(engine.getMap());
    // Not a "sync state to a changing prop" case (what this rule normally guards against) —
    // `engine` starts null and this effect runs exactly once per real MapEngine instance,
    // initializing OverlayManager the moment its dependency becomes available. Same accepted
    // shape as useMapEngine.ts's own instance-creation effect and useDrawingManager.ts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverlayManager(instance);

    return () => {
      instance.destroy();
      setOverlayManager(null);
    };
  }, [engine]);

  // Kept separate from the creation effect above: rebuilding the whole manager (tearing
  // down live sources/layers/markers) every time this callback identity changes would be
  // far worse than just re-pointing the callback on an existing instance.
  useEffect(() => {
    overlayManager?.setOnCornersChanged(options?.onCornersChanged ?? null);
  }, [overlayManager, options?.onCornersChanged]);

  return overlayManager;
}
