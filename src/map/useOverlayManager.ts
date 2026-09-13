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

    const map = engine.getMap();
    let instance: OverlayManager | null = null;

    // Gate on the style being loaded — image overlays add raster sources/layers
    // to the map, which the style must be ready for. Same fix as
    // useDrawingManager.ts (Terra Draw layers). `engine` is exposed before the
    // map's `load` event, so creating eagerly can add layers that never attach.
    const create = () => {
      instance = new OverlayManager(map);
      setOverlayManager(instance);
    };

    if (map.isStyleLoaded()) {
      create();
    } else {
      map.once("load", create);
    }

    return () => {
      map.off("load", create);
      instance?.destroy();
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
