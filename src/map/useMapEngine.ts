import { useEffect, useRef, useState } from "react";
import { MapEngine, type MapEngineOptions } from "./MapEngine";

/**
 * Owns MapEngine's React lifecycle: creates it once the container is mounted,
 * destroys it on unmount. Does not read/write persistence — see
 * src/projects/maps/useMapStatePersistence.ts for that (Track B).
 */
export function useMapEngine(options: Omit<MapEngineOptions, "container">) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<MapEngine | null>(null);
  const [engine, setEngine] = useState<MapEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new MapEngine({ container: containerRef.current, ...options });
    engineRef.current = instance;
    setEngine(instance);

    return () => {
      instance.destroy();
      engineRef.current = null;
      setEngine(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only (re)create on mount; center/zoom changes go through engine methods, not re-init.
  }, []);

  return { containerRef, engine };
}
