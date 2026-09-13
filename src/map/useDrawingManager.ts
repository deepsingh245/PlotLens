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

    const map = engine.getMap();
    let instance: DrawingManager | null = null;

    // Terra Draw's MapLibre adapter can only add its render layers once the map
    // style has finished loading. `engine` is exposed synchronously at map
    // construction (before `load`), so creating the DrawingManager immediately
    // meant Terra Draw's layers silently failed to attach — drawn shapes never
    // appeared. Gate creation on the style being ready.
    const create = () => {
      instance = new DrawingManager(map);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrawingManager(instance);
    };

    if (map.isStyleLoaded()) {
      create();
    } else {
      map.once("load", create);
    }

    return () => {
      map.off("load", create);
      instance?.destroy();
      setDrawingManager(null);
    };
  }, [engine]);

  return drawingManager;
}
