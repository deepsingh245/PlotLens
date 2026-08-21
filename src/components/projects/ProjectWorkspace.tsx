"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Marker } from "maplibre-gl";
import { TopBar } from "@/components/shell/TopBar";
import { MapCanvas } from "@/components/map/MapCanvas";
import { ToolRail, type ActiveTool, type MeasureTool } from "@/components/map/ToolRail";
import { LayersPanel } from "@/components/layers/LayersPanel";
import { MeasurementLabel } from "@/components/measurement/MeasurementLabel";
import { HistoryPanel } from "@/components/timeline/HistoryPanel";
import { useToolShortcuts } from "@/components/map/useToolShortcuts";
import { AnnotationPanel } from "@/components/annotations/AnnotationPanel";
import { AddOverlayDialog } from "@/components/overlays/AddOverlayDialog";
import { OverlayControlBar } from "@/components/overlays/OverlayControlBar";
import { useDrawingManager } from "@/map/useDrawingManager";
import { useOverlayManager } from "@/map/useOverlayManager";
import { fromGeoJsonPosition } from "@/gis/coordinates";
import {
  annotationTypeForTool,
  toAnnotationGeometry,
  validateDrawnFeature,
  type DrawTool,
} from "@/gis/annotationGeometry";
import { validateOverlayCorners, type OverlayCorners } from "@/gis/imageOverlayGeometry";
import { formatArea, formatDistance, measureArea, measureDistance } from "@/gis/measurement";
import { useAnnotations } from "@/projects/annotations/useAnnotations";
import { useOverlays } from "@/projects/overlays/useOverlays";
import { useSavedViews } from "@/projects/savedViews/useSavedViews";
import { useInvestigationEvents } from "@/projects/investigationEvents/useInvestigationEvents";
import { useMapStatePersistence } from "@/projects/maps/useMapStatePersistence";
import { deleteProject } from "@/storage/projects";
import type { MapEngine } from "@/map/MapEngine";
import type { SavedView } from "@/projects/savedViews/types";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { GeoJsonPosition } from "@/gis/coordinates";
import type { Project } from "@/projects/types";
import type { Annotation, NewAnnotationInput } from "@/projects/annotations/types";

function createTextMarkerElement(title: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    "bg-surface-elevated border border-border text-text-primary rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-sm";
  el.textContent = title || "Untitled note";
  return el;
}

/** Centered on the current map view, ~60% of the shorter viewport dimension — see docs/plans/plan-3.md. */
function computeDefaultCorners(engine: MapEngine): OverlayCorners {
  const map = engine.getMap();
  const { width, height } = map.getContainer().getBoundingClientRect();
  const half = Math.min(width, height) * 0.3;
  const centerPx = map.project(map.getCenter());
  const [tl, tr, br, bl] = [
    [centerPx.x - half, centerPx.y - half],
    [centerPx.x + half, centerPx.y - half],
    [centerPx.x + half, centerPx.y + half],
    [centerPx.x - half, centerPx.y + half],
  ].map(([x, y]) => map.unproject([x, y]));
  return [
    [tl.lng, tl.lat],
    [tr.lng, tr.lat],
    [br.lng, br.lat],
    [bl.lng, bl.lat],
  ];
}

/**
 * Client-side shell for a single project's map workspace — map, search,
 * drawing tools, image overlays, and the contextual panels for each. See
 * docs/plans/plan-3.md for the Phase 3 spec this implements, on top of
 * docs/plans/plan-2.md's drawing tools.
 */
export function ProjectWorkspace({ project }: { project: Project }) {
  const router = useRouter();
  const [engine, setEngine] = useState<MapEngine | null>(null);
  const searchMarkerRef = useRef<Marker | null>(null);
  const textMarkersRef = useRef(new Map<string, Marker>());
  const seededAnnotationsRef = useRef(false);
  const seededOverlaysRef = useRef(false);
  // Mirrors measurementResult state — read from the "create" handler below, which
  // doesn't re-subscribe on every draft vertex, so it can't rely on the state closure.
  const measurementResultRef = useRef<{ at: GeoJsonPosition; text: string } | null>(null);

  const drawingManager = useDrawingManager(engine);
  const { annotations, loading: annotationsLoading, createAnnotation, createAnnotations, updateAnnotation, deleteAnnotation } =
    useAnnotations(project.id);
  const { overlays, loading: overlaysLoading, createOverlay, updateOverlay, deleteOverlay } = useOverlays(project.id);
  const { savedViews, createSavedView, deleteSavedView } = useSavedViews(project.id);
  const { events, createEvent } = useInvestigationEvents(project.id);
  const saveStatus = useMapStatePersistence(engine, project.id);

  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [addOverlayDialogOpen, setAddOverlayDialogOpen] = useState(false);
  const [layersPanelCollapsed, setLayersPanelCollapsed] = useState(true);
  const [defaultOverlayCorners, setDefaultOverlayCorners] = useState<OverlayCorners | null>(null);
  const [measurementResult, setMeasurementResult] = useState<{ at: GeoJsonPosition; text: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const updateMeasurementResult = useCallback((result: { at: GeoJsonPosition; text: string } | null) => {
    measurementResultRef.current = result;
    setMeasurementResult(result);
  }, []);

  const handleCornersChanged = useCallback(
    (id: string, corners: OverlayCorners) => {
      const { valid, reason } = validateOverlayCorners(corners);
      if (!valid) {
        console.error(`Discarded invalid overlay corners: ${reason}`);
        return;
      }
      updateOverlay(id, { coordinates: corners }).catch((error) =>
        console.error("Failed to save overlay corners:", error),
      );
    },
    [updateOverlay],
  );
  const overlayManagerOptions = useMemo(() => ({ onCornersChanged: handleCornersChanged }), [handleCornersChanged]);
  const overlayManager = useOverlayManager(engine, overlayManagerOptions);

  function handleSearchSelect(result: GeocodeResult) {
    if (!engine) return;

    engine.flyTo(result.lngLat);

    searchMarkerRef.current?.remove();
    searchMarkerRef.current = new Marker({ color: "#b8ff52" })
      .setLngLat([result.lngLat.lng, result.lngLat.lat])
      .addTo(engine.getMap());
  }

  // Selection is exclusive across annotations and overlays — see docs/plans/plan-3.md
  // "Decisions locked" (avoids hit-test ambiguity between Terra Draw's select-mode
  // handles and overlay corner handles, and keeps OverlayControlBar's position math
  // from having to react to AnnotationPanel mount/unmount too).
  const selectAnnotation = useCallback(
    (id: string | null) => {
      setSelectedAnnotationId(id);
      if (id) {
        setSelectedOverlayId(null);
        overlayManager?.selectForEditing(null);
      }
    },
    [overlayManager],
  );

  const selectOverlay = useCallback(
    (id: string | null) => {
      setSelectedOverlayId(id);
      const overlay = overlays.find((o) => o.id === id);
      overlayManager?.selectForEditing(id, overlay?.locked ?? false);
      if (id) {
        setSelectedAnnotationId(null);
        drawingManager?.stop();
      }
    },
    [overlays, overlayManager, drawingManager],
  );

  const renderTextMarker = useCallback(
    (annotation: Annotation) => {
      if (!engine || annotation.geometry.type !== "Point") return;
      const existing = textMarkersRef.current.get(annotation.id);
      if (existing) existing.remove();

      const marker = new Marker({ element: createTextMarkerElement(annotation.title), anchor: "left" })
        .setLngLat(annotation.geometry.coordinates)
        .addTo(engine.getMap());
      marker.getElement().addEventListener("click", () => selectAnnotation(annotation.id));
      textMarkersRef.current.set(annotation.id, marker);
    },
    [engine, selectAnnotation],
  );

  const seedAnnotationOnMap = useCallback(
    (annotation: Annotation) => {
      if (annotation.type === "text") {
        renderTextMarker(annotation);
      } else {
        drawingManager?.addExistingFeature(annotation.type, annotation.id, annotation.geometry);
      }
    },
    [drawingManager, renderTextMarker],
  );

  // Seed already-persisted annotations into DrawingManager (or as text markers) once,
  // when the drawing manager is ready and the initial annotation load has resolved.
  // Gated on `loading` rather than `annotations.length === 0` — a brand-new project
  // starts with zero annotations too, and that guard would otherwise never flip the
  // ref, re-seeding (and duplicating) everything on the first annotation the project
  // ever gets (e.g. a bulk import) instead of doing nothing.
  useEffect(() => {
    if (!drawingManager || !engine || annotationsLoading || seededAnnotationsRef.current) return;
    seededAnnotationsRef.current = true;

    for (const annotation of annotations) seedAnnotationOnMap(annotation);
  }, [drawingManager, engine, annotationsLoading, annotations, seedAnnotationOnMap]);

  // Seed already-persisted overlays into OverlayManager once, mirroring the annotation seed
  // above — same fix, same reason: gating on `overlays.length === 0` instead of the hook's
  // real `loading` flag meant a brand-new project (zero overlays) never flipped the ref, so
  // the first overlay ever added (already added directly by AddOverlayDialog's onConfirm)
  // got re-added here too — a duplicate addSource() call MapLibre throws on.
  useEffect(() => {
    if (!overlayManager || overlaysLoading || seededOverlaysRef.current) return;
    seededOverlaysRef.current = true;

    for (const overlay of overlays) {
      overlayManager.add(overlay.id, overlay.imageUrl, overlay.coordinates, overlay.opacity, overlay.visible);
    }
  }, [overlayManager, overlaysLoading, overlays]);

  useEffect(() => {
    if (!drawingManager) return;

    const offCreate = drawingManager.on("create", async ({ tool, id, rawFeature }) => {
      if (activeTool === "measure-distance" || activeTool === "measure-area") {
        // The final value is already tracked via the `draft` events (see the effect
        // below) — just clear the drawn shape so repeated measurements don't clutter
        // the map with unstyled leftover lines/polygons.
        drawingManager.removeFeature(id);
        const result = measurementResultRef.current;
        if (result) {
          createEvent({
            projectId: project.id,
            type: "measurement_taken",
            summary: `${activeTool === "measure-distance" ? "Distance" : "Area"} measured: ${result.text}`,
            relatedEntityId: null,
          }).catch((error) => console.error("Failed to log measurement event:", error));
        }
        return;
      }

      const { valid, reason } = validateDrawnFeature(tool, rawFeature);
      if (!valid) {
        console.error(`Discarded invalid ${tool} drawing: ${reason}`);
        drawingManager.removeFeature(id);
        return;
      }

      const geometry = toAnnotationGeometry(tool, rawFeature);
      try {
        const created = await createAnnotation({
          projectId: project.id,
          type: annotationTypeForTool(tool),
          geometry,
          title: "",
          tags: [],
          attachments: [],
        });
        drawingManager.removeFeature(id);
        drawingManager.addExistingFeature(tool, created.id, geometry);
        // Open its panel immediately, same as the text tool already does — otherwise a
        // freshly-drawn pin/line/polygon/circle gives no visible confirmation at all that
        // anything happened (Terra Draw's own render of a new shape is easy to miss against
        // a busy basemap), which reads as "the tool doesn't work."
        selectAnnotation(created.id);
        setJustCreatedId(created.id);
        createEvent({
          projectId: project.id,
          type: "annotation_created",
          summary: `${created.type} annotation created`,
          relatedEntityId: created.id,
        }).catch((error) => console.error("Failed to log annotation event:", error));
      } catch (error) {
        console.error("Failed to save annotation:", error);
        drawingManager.removeFeature(id);
      }
    });

    const offUpdate = drawingManager.on("update", ({ id, rawFeature }) => {
      const annotation = annotations.find((a) => a.id === id);
      if (!annotation || annotation.type === "text") return;

      const { valid } = validateDrawnFeature(annotation.type, rawFeature);
      if (!valid) return;

      const geometry = toAnnotationGeometry(annotation.type, rawFeature);
      updateAnnotation(String(id), { geometry }).catch((error) =>
        console.error("Failed to save edited geometry:", error),
      );
    });

    const offSelect = drawingManager.on("select", ({ id }) => selectAnnotation(String(id)));
    const offDeselect = drawingManager.on("deselect", () => setSelectedAnnotationId(null));

    return () => {
      offCreate();
      offUpdate();
      offSelect();
      offDeselect();
    };
  }, [drawingManager, annotations, createAnnotation, updateAnnotation, project.id, selectAnnotation, activeTool, createEvent]);

  // Live measurement readout while drawing — see docs/design/MAP_INTERACTIONS.md §Measurement
  // UX ("click A -> move (live) -> click B -> finish"). `draft` fires on every vertex added
  // before the shape is finished (see DrawingManager.ts); geometry here isn't validated the
  // way a finished annotation is, so Turf calls are wrapped in try/catch and simply skip an
  // update on a transiently-incomplete shape (e.g. a line with only one point so far).
  useEffect(() => {
    if (!drawingManager) return;

    const offDraft = drawingManager.on("draft", ({ tool, rawFeature }) => {
      if (activeTool !== "measure-distance" && activeTool !== "measure-area") return;
      const coordinates = (rawFeature as { geometry?: { coordinates?: unknown } }).geometry?.coordinates;
      if (!Array.isArray(coordinates)) return;

      try {
        if (tool === "line" && coordinates.length >= 2) {
          const lineCoords = coordinates as GeoJsonPosition[];
          const text = formatDistance(measureDistance({ type: "LineString", coordinates: lineCoords }));
          updateMeasurementResult({ at: lineCoords[lineCoords.length - 1], text });
        } else if (tool === "polygon" && Array.isArray(coordinates[0]) && coordinates[0].length >= 3) {
          const ring = coordinates[0] as GeoJsonPosition[];
          const text = formatArea(measureArea({ type: "Polygon", coordinates: coordinates as GeoJsonPosition[][] }));
          updateMeasurementResult({ at: ring[ring.length - 1], text });
        }
      } catch {
        // Transiently-invalid in-progress geometry (e.g. an unclosed ring) — wait for the next draft.
      }
    });

    return () => offDraft();
  }, [drawingManager, activeTool, updateMeasurementResult]);

  // Text tool: a plain click handler, not a DrawingManager mode — see docs/ADR/0006-drawing-library.md.
  useEffect(() => {
    if (!engine || activeTool !== "text") return;
    const map = engine.getMap();

    async function handleClick(event: { lngLat: { lng: number; lat: number } }) {
      const geometry = { type: "Point" as const, coordinates: [event.lngLat.lng, event.lngLat.lat] as [number, number] };
      try {
        const created = await createAnnotation({
          projectId: project.id,
          type: "text",
          geometry,
          title: "",
          tags: [],
          attachments: [],
        });
        renderTextMarker(created);
        selectAnnotation(created.id);
        setJustCreatedId(created.id);
        setActiveTool(null);
        createEvent({
          projectId: project.id,
          type: "annotation_created",
          summary: "text annotation created",
          relatedEntityId: created.id,
        }).catch((eventError) => console.error("Failed to log annotation event:", eventError));
      } catch (error) {
        console.error("Failed to create text annotation:", error);
      }
    }

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [engine, activeTool, createAnnotation, project.id, renderTextMarker, selectAnnotation, createEvent]);

  const handleImportGeoJson = useCallback(
    async (inputs: Omit<NewAnnotationInput, "projectId">[]) => {
      const created = await createAnnotations(inputs.map((input) => ({ ...input, projectId: project.id })));
      for (const annotation of created) seedAnnotationOnMap(annotation);
    },
    [createAnnotations, project.id, seedAnnotationOnMap],
  );

  function handleSelectTool(tool: DrawTool | "text" | "image" | MeasureTool) {
    updateMeasurementResult(null); // any previous measurement readout is stale once the tool changes

    if (tool === "image") {
      if (engine) setDefaultOverlayCorners(computeDefaultCorners(engine));
      setAddOverlayDialogOpen(true); // one-shot action — deliberately never becomes the active tool
      return;
    }
    if (tool === "measure-distance" || tool === "measure-area") {
      setActiveTool(tool);
      drawingManager?.start(tool === "measure-distance" ? "line" : "polygon");
      return;
    }
    setActiveTool(tool);
    if (tool === "text") return;
    drawingManager?.start(tool);
  }

  function handleCancelTool() {
    drawingManager?.stop();
    setActiveTool(null);
    updateMeasurementResult(null);
  }

  useToolShortcuts(handleSelectTool, handleCancelTool);

  async function handleDeleteSelectedAnnotation() {
    if (!selectedAnnotationId) return;
    const annotation = annotations.find((a) => a.id === selectedAnnotationId);
    if (annotation?.type === "text") {
      textMarkersRef.current.get(selectedAnnotationId)?.remove();
      textMarkersRef.current.delete(selectedAnnotationId);
    } else {
      drawingManager?.removeFeature(selectedAnnotationId);
    }
    await deleteAnnotation(selectedAnnotationId);
    setSelectedAnnotationId(null);
  }

  async function handleDeleteSelectedOverlay() {
    if (!selectedOverlayId) return;
    overlayManager?.remove(selectedOverlayId);
    await deleteOverlay(selectedOverlayId);
    setSelectedOverlayId(null);
  }

  async function handleDeleteProject() {
    await deleteProject(project.id);
    router.push("/");
  }

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) ?? null;
  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        projectName={project.name}
        saveStatus={saveStatus}
        onSearchSelect={handleSearchSelect}
        annotations={annotations}
        onImportGeoJson={handleImportGeoJson}
        onOpenHistory={() => setHistoryOpen(true)}
        onDeleteProject={handleDeleteProject}
      />
      <div className="flex min-h-0 flex-1">
        <LayersPanel collapsed={layersPanelCollapsed} onCollapsedChange={setLayersPanelCollapsed} />
        <div className="relative min-h-0 flex-1">
          <MapCanvas
            initialCenter={fromGeoJsonPosition(project.map.center)}
            initialZoom={project.map.zoom}
            onEngineReady={setEngine}
          />
          {selectedOverlay && engine && (
            <OverlayControlBar
              key={selectedOverlay.id}
              overlay={selectedOverlay}
              engine={engine}
              onOpacityChange={(opacity) => {
                overlayManager?.updateOpacity(selectedOverlay.id, opacity);
                updateOverlay(selectedOverlay.id, { opacity }).catch((error) =>
                  console.error("Failed to save overlay opacity:", error),
                );
              }}
              onLockChange={(locked) => {
                updateOverlay(selectedOverlay.id, { locked }).catch((error) =>
                  console.error("Failed to save overlay lock state:", error),
                );
                if (locked) overlayManager?.selectForEditing(null);
              }}
              onCornersChange={(corners) => {
                overlayManager?.updateCorners(selectedOverlay.id, corners);
                handleCornersChanged(selectedOverlay.id, corners);
              }}
              onDelete={handleDeleteSelectedOverlay}
              onClose={() => selectOverlay(null)}
            />
          )}
          {measurementResult && engine && (
            <MeasurementLabel engine={engine} at={measurementResult.at} text={measurementResult.text} />
          )}
        </div>
        {selectedAnnotation && (
          <AnnotationPanel
            annotation={selectedAnnotation}
            autoFocusTitle={selectedAnnotation.id === justCreatedId}
            onClose={() => setSelectedAnnotationId(null)}
            onSave={(patch) => {
              updateAnnotation(selectedAnnotation.id, patch).catch((error) =>
                console.error("Failed to save annotation:", error),
              );
              if (selectedAnnotation.type === "text") {
                renderTextMarker({ ...selectedAnnotation, ...patch });
              }
            }}
            onDelete={handleDeleteSelectedAnnotation}
          />
        )}
        <ToolRail activeTool={activeTool} onSelectTool={handleSelectTool} />
      </div>

      <AddOverlayDialog
        open={addOverlayDialogOpen}
        onOpenChange={setAddOverlayDialogOpen}
        defaultCorners={defaultOverlayCorners ?? [[0, 0], [0, 0], [0, 0], [0, 0]]}
        onConfirm={async (input) => {
          try {
            const created = await createOverlay({ ...input, projectId: project.id });
            overlayManager?.add(created.id, created.imageUrl, created.coordinates, created.opacity, created.visible);
            selectOverlay(created.id);
            createEvent({
              projectId: project.id,
              type: "overlay_added",
              summary: `Image overlay "${created.name || "Untitled"}" added`,
              relatedEntityId: created.id,
            }).catch((error) => console.error("Failed to log overlay event:", error));
          } catch (error) {
            console.error("Failed to create overlay:", error);
          }
        }}
      />

      <HistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        savedViews={savedViews}
        events={events}
        onSaveView={(name) => {
          if (!engine) return;
          const viewState = engine.getViewState();
          createSavedView({
            projectId: project.id,
            name,
            map: {
              center: [viewState.center.lng, viewState.center.lat],
              zoom: viewState.zoom,
              bearing: viewState.bearing,
              pitch: viewState.pitch,
            },
            activeLayers: [],
            selectedFeatureId: selectedAnnotationId ?? selectedOverlayId ?? null,
          }).catch((error) => console.error("Failed to save view:", error));
        }}
        onRestoreView={(view: SavedView) => {
          if (!engine) return;
          engine.flyTo(fromGeoJsonPosition(view.map.center), {
            zoom: view.map.zoom,
            bearing: view.map.bearing,
            pitch: view.map.pitch,
          });
          if (view.selectedFeatureId) {
            if (annotations.some((a) => a.id === view.selectedFeatureId)) {
              selectAnnotation(view.selectedFeatureId);
            } else if (overlays.some((o) => o.id === view.selectedFeatureId)) {
              selectOverlay(view.selectedFeatureId);
            }
          }
          setHistoryOpen(false);
        }}
        onDeleteView={(id) => {
          deleteSavedView(id).catch((error) => console.error("Failed to delete saved view:", error));
        }}
        onAddNote={(text) => {
          createEvent({
            projectId: project.id,
            type: "note_added",
            summary: text,
            relatedEntityId: null,
          }).catch((error) => console.error("Failed to add note:", error));
        }}
      />
    </div>
  );
}
