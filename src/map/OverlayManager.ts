import { ImageSource, Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { OverlayCorners } from "@/gis/imageOverlayGeometry";

export interface OverlayManagerOptions {
  /** Fires once a corner drag settles (dragend), never mid-drag. */
  onCornersChanged?: (id: string, corners: OverlayCorners) => void;
}

interface OverlayRecord {
  corners: OverlayCorners;
  cornerMarkers: Marker[] | null; // present only while this overlay is selected for editing
}

const CORNER_DRAG_COLOR = "#b8ff52";

/**
 * Wraps the native MapLibre image source/layer + 4 draggable corner Markers —
 * the sole point of contact with those APIs, the same role MapEngine plays for
 * vanilla maplibre-gl and DrawingManager plays for Terra Draw (see
 * docs/ADR/0006-drawing-library.md). Corner-drag gesture detection lives here,
 * not in ProjectWorkspace.tsx — see docs/plans/plan-3.md's "Decisions locked"
 * table for why (locked overlays need zero handles, and that bookkeeping
 * belongs where the Map/source/layer state already lives).
 *
 * No event-map/on() like DrawingManager: Terra Draw is an external gesture
 * *detector* DrawingManager forwards; here the same class detects (marker
 * drag) and acts (setCoordinates) — an emitter would add ceremony with no
 * independent producer behind it. A single onCornersChanged callback is enough.
 */
export class OverlayManager {
  private map: MapLibreMap;
  private options: OverlayManagerOptions;
  private overlays = new Map<string, OverlayRecord>();

  constructor(map: MapLibreMap, options: OverlayManagerOptions = {}) {
    this.map = map;
    this.options = options;
  }

  setOnCornersChanged(callback: OverlayManagerOptions["onCornersChanged"] | null): void {
    this.options.onCornersChanged = callback ?? undefined;
  }

  add(id: string, imageUrl: string, corners: OverlayCorners, opacity: number, visible: boolean): void {
    this.map.addSource(id, { type: "image", url: imageUrl, coordinates: corners });
    this.map.addLayer({
      id,
      type: "raster",
      source: id,
      paint: { "raster-opacity": opacity },
      layout: { visibility: visible ? "visible" : "none" },
    });
    this.overlays.set(id, { corners, cornerMarkers: null });
  }

  updateCorners(id: string, corners: OverlayCorners): void {
    const record = this.overlays.get(id);
    if (!record) return;
    record.corners = corners;

    const source = this.map.getSource(id);
    if (source instanceof ImageSource) {
      source.setCoordinates(corners);
    }

    record.cornerMarkers?.forEach((marker, index) => {
      const [lng, lat] = corners[index];
      marker.setLngLat([lng, lat]);
    });
  }

  updateOpacity(id: string, value: number): void {
    if (this.map.getLayer(id)) {
      this.map.setPaintProperty(id, "raster-opacity", value);
    }
  }

  setVisible(id: string, visible: boolean): void {
    if (this.map.getLayer(id)) {
      this.map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    }
  }

  /** Creates/destroys the 4 draggable corner handles for the given overlay. Pass null to clear. */
  selectForEditing(id: string | null, locked = false): void {
    for (const [overlayId, record] of this.overlays) {
      if (overlayId !== id && record.cornerMarkers) {
        record.cornerMarkers.forEach((marker) => marker.remove());
        record.cornerMarkers = null;
      }
    }

    if (!id) return;
    const record = this.overlays.get(id);
    if (!record || record.cornerMarkers || locked) return; // no-op if already editing, missing, or locked

    record.cornerMarkers = record.corners.map((corner, index) => {
      const marker = new Marker({ draggable: true, color: CORNER_DRAG_COLOR })
        .setLngLat([corner[0], corner[1]])
        .addTo(this.map);

      marker.on("drag", () => {
        const { lng, lat } = marker.getLngLat();
        const nextCorners = [...record.corners] as OverlayCorners;
        nextCorners[index] = [lng, lat];
        record.corners = nextCorners;
        this.reflowImageOnly(id, nextCorners);
      });

      marker.on("dragend", () => {
        this.options.onCornersChanged?.(id, record.corners);
      });

      return marker;
    });
  }

  /** Live-reflows the image source during a drag without touching the other markers (avoids feedback jitter). */
  private reflowImageOnly(id: string, corners: OverlayCorners): void {
    const source = this.map.getSource(id);
    if (source instanceof ImageSource) {
      source.setCoordinates(corners);
    }
  }

  remove(id: string): void {
    this.selectForEditing(null); // clears any active handles for this or any other overlay
    if (this.map.getLayer(id)) this.map.removeLayer(id);
    if (this.map.getSource(id)) this.map.removeSource(id);
    this.overlays.delete(id);
  }

  destroy(): void {
    for (const id of [...this.overlays.keys()]) this.remove(id);
  }
}
