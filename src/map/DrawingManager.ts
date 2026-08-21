import type { Map as MapLibreMap } from "maplibre-gl";
import {
  TerraDraw,
  TerraDrawCircleMode,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import type { AnnotationGeometry } from "@/gis/geojson";
import type { DrawTool } from "@/gis/annotationGeometry";

/**
 * Terra Draw's own mode-name strings, verified against the installed
 * package (node_modules/terra-draw/dist/terra-draw.cjs) — "linestring",
 * not "line". This is the only place that translates between our DrawTool
 * vocabulary and Terra Draw's — see docs/ADR/0006-drawing-library.md.
 */
const TERRA_DRAW_MODE: Record<DrawTool, string> = {
  point: "point",
  line: "linestring",
  polygon: "polygon",
  circle: "circle",
};

const SELECT_MODE = "select";

export type FeatureId = string | number;

export interface DrawingManagerEventMap {
  /** A brand-new geometry finished drawing (double-click/Enter, or a single click for point). */
  create: (payload: { tool: DrawTool; id: FeatureId; rawFeature: unknown }) => void;
  /** An existing feature's geometry was edited (vertex drag / scale) via select-mode editing. */
  update: (payload: { id: FeatureId; rawFeature: unknown }) => void;
  /** Fires on every vertex added while a feature is still being drawn (pre-finish) — see start(). */
  draft: (payload: { tool: DrawTool; rawFeature: unknown }) => void;
  select: (payload: { id: FeatureId }) => void;
  deselect: () => void;
}

/**
 * Wraps Terra Draw the way MapEngine.ts wraps vanilla maplibre-gl — nothing
 * outside this file (and useDrawingManager.ts) should import from
 * "terra-draw" directly. See docs/ADR/0006-drawing-library.md.
 */
export class DrawingManager {
  private terraDraw: TerraDraw;
  private map: MapLibreMap;
  private listeners: { [K in keyof DrawingManagerEventMap]: Set<DrawingManagerEventMap[K]> } = {
    create: new Set(),
    update: new Set(),
    draft: new Set(),
    select: new Set(),
    deselect: new Set(),
  };
  /** Ids Terra Draw has already told us about via `finish` — used to tell a genuinely
   *  new `change` event apart from an edit to something already created/loaded. */
  private knownIds = new Set<FeatureId>();
  /** Set by start(), cleared by stop() — lets handleChange forward pre-finish
   *  vertex updates as `draft` events without change events exposing the mode. */
  private activeDraftTool: DrawTool | null = null;

  constructor(map: MapLibreMap) {
    this.map = map;

    this.terraDraw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPointMode(),
        new TerraDrawLineStringMode(),
        new TerraDrawPolygonMode(),
        // Default drawInteraction is "click-move" (click center, move, click again to set
        // radius) — most users instinctively try to click-and-drag instead, which silently
        // does nothing under that default. "click-move-or-drag" accepts either gesture.
        new TerraDrawCircleMode({ drawInteraction: "click-move-or-drag" }),
        new TerraDrawSelectMode({
          flags: {
            point: { feature: { draggable: true } },
            linestring: {
              feature: { draggable: true, coordinates: { draggable: true, deletable: true } },
            },
            polygon: {
              feature: { draggable: true, coordinates: { draggable: true, deletable: true } },
            },
            // Circle resize-after-creation depends on select mode's scale behavior for circle
            // features — see docs/plans/plan-2.md's "known risk, not blocking" note. If this
            // doesn't work cleanly in practice, drop `scaleable` and ship circle as
            // create/delete-only rather than hand-rolling a resize handle.
            circle: { feature: { draggable: true, scaleable: true } },
          },
        }),
      ],
    });

    this.terraDraw.start();
    this.terraDraw.setMode(SELECT_MODE);

    this.terraDraw.on("finish", this.handleFinish);
    this.terraDraw.on("change", this.handleChange);
    this.terraDraw.on("select", this.handleSelect);
    this.terraDraw.on("deselect", this.handleDeselect);
  }

  /** Begins drawing a new feature of the given tool. Call stop() to return to select mode. */
  start(tool: DrawTool): void {
    this.activeDraftTool = tool;
    this.terraDraw.setMode(TERRA_DRAW_MODE[tool]);
    this.map.getCanvas().style.cursor = "crosshair";
  }

  /** Returns to select mode — existing features stay visible/clickable, never fully "off". */
  stop(): void {
    this.activeDraftTool = null;
    this.terraDraw.setMode(SELECT_MODE);
    this.map.getCanvas().style.cursor = "";
  }

  /**
   * Renders an already-persisted annotation with `id` set to the Annotation's own id, so a
   * later select/update event resolves directly — no id-bridging needed for loaded features.
   */
  addExistingFeature(tool: DrawTool, id: FeatureId, geometry: AnnotationGeometry): void {
    this.terraDraw.addFeatures([
      { type: "Feature", id, geometry, properties: { mode: TERRA_DRAW_MODE[tool] } },
    ]);
    this.knownIds.add(id);
  }

  removeFeature(id: FeatureId): void {
    if (this.terraDraw.hasFeature(id)) {
      this.terraDraw.removeFeatures([id]);
    }
    this.knownIds.delete(id);
  }

  on<K extends keyof DrawingManagerEventMap>(event: K, callback: DrawingManagerEventMap[K]): () => void {
    this.listeners[event].add(callback);
    return () => this.listeners[event].delete(callback);
  }

  destroy(): void {
    this.terraDraw.off("finish", this.handleFinish);
    this.terraDraw.off("change", this.handleChange);
    this.terraDraw.off("select", this.handleSelect);
    this.terraDraw.off("deselect", this.handleDeselect);
    this.terraDraw.stop(); // Terra Draw's own stop() is the real teardown (clears store, deregisters adapter).
  }

  private handleFinish = (id: string | number, context: { mode: string }): void => {
    const rawFeature = this.terraDraw.getSnapshotFeature(id);
    const tool = (Object.keys(TERRA_DRAW_MODE) as DrawTool[]).find(
      (key) => TERRA_DRAW_MODE[key] === context.mode,
    );
    if (!tool || !rawFeature) return;

    this.knownIds.add(id);
    for (const callback of this.listeners.create) callback({ tool, id, rawFeature });
  };

  /** `change` fires for in-progress drawing too. Ids we already know about (post-finish or
   *  pre-loaded) forward as our own `update` event; ids we don't know about yet are the
   *  feature currently being drawn (pre-finish) and forward as `draft` instead, so callers
   *  like live measurement can react to every vertex without waiting for `create`. */
  private handleChange = (ids: (string | number)[], type: string): void => {
    if (type !== "update" && type !== "create") return;
    for (const id of ids) {
      const rawFeature = this.terraDraw.getSnapshotFeature(id);
      if (!rawFeature) continue;

      if (this.knownIds.has(id)) {
        if (type === "update") {
          for (const callback of this.listeners.update) callback({ id, rawFeature });
        }
      } else if (this.activeDraftTool) {
        for (const callback of this.listeners.draft) callback({ tool: this.activeDraftTool, rawFeature });
      }
    }
  };

  private handleSelect = (id: string | number): void => {
    for (const callback of this.listeners.select) callback({ id });
  };

  private handleDeselect = (): void => {
    for (const callback of this.listeners.deselect) callback();
  };
}
