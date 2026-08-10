"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Marker } from "maplibre-gl";
import { TopBar } from "@/components/shell/TopBar";
import { MapCanvas } from "@/components/map/MapCanvas";
import { ToolRail, type ActiveTool } from "@/components/map/ToolRail";
import { useToolShortcuts } from "@/components/map/useToolShortcuts";
import { AnnotationPanel } from "@/components/annotations/AnnotationPanel";
import { useDrawingManager } from "@/map/useDrawingManager";
import { fromGeoJsonPosition } from "@/gis/coordinates";
import {
  annotationTypeForTool,
  toAnnotationGeometry,
  validateDrawnFeature,
  type DrawTool,
} from "@/gis/annotationGeometry";
import { useAnnotations } from "@/projects/annotations/useAnnotations";
import type { MapEngine } from "@/map/MapEngine";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { Project } from "@/projects/types";
import type { Annotation } from "@/projects/annotations/types";

function createTextMarkerElement(title: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    "bg-surface-elevated border border-border text-text-primary rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-sm";
  el.textContent = title || "Untitled note";
  return el;
}

/**
 * Client-side shell for a single project's map workspace — map, search,
 * drawing tools, and the annotation contextual panel. See
 * docs/plans/plan-2.md for the full Phase 2 spec this implements.
 */
export function ProjectWorkspace({ project }: { project: Project }) {
  const [engine, setEngine] = useState<MapEngine | null>(null);
  const searchMarkerRef = useRef<Marker | null>(null);
  const textMarkersRef = useRef(new Map<string, Marker>());
  const seededRef = useRef(false);

  const drawingManager = useDrawingManager(engine);
  const { annotations, createAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations(project.id);

  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  function handleSearchSelect(result: GeocodeResult) {
    if (!engine) return;

    engine.flyTo(result.lngLat);

    searchMarkerRef.current?.remove();
    searchMarkerRef.current = new Marker({ color: "#b8ff52" })
      .setLngLat([result.lngLat.lng, result.lngLat.lat])
      .addTo(engine.getMap());
  }

  const renderTextMarker = useCallback(
    (annotation: Annotation) => {
      if (!engine || annotation.geometry.type !== "Point") return;
      const existing = textMarkersRef.current.get(annotation.id);
      if (existing) existing.remove();

      const marker = new Marker({ element: createTextMarkerElement(annotation.title), anchor: "left" })
        .setLngLat(annotation.geometry.coordinates)
        .addTo(engine.getMap());
      marker.getElement().addEventListener("click", () => setSelectedAnnotationId(annotation.id));
      textMarkersRef.current.set(annotation.id, marker);
    },
    [engine],
  );

  // Seed already-persisted annotations into DrawingManager (or as text markers) once,
  // when both the drawing manager and the initial annotation load are ready.
  useEffect(() => {
    if (!drawingManager || !engine || seededRef.current || annotations.length === 0) return;
    seededRef.current = true;

    for (const annotation of annotations) {
      if (annotation.type === "text") {
        renderTextMarker(annotation);
      } else {
        drawingManager.addExistingFeature(annotation.type, annotation.id, annotation.geometry);
      }
    }
  }, [drawingManager, engine, annotations, renderTextMarker]);

  useEffect(() => {
    if (!drawingManager) return;

    const offCreate = drawingManager.on("create", async ({ tool, id, rawFeature }) => {
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

    const offSelect = drawingManager.on("select", ({ id }) => setSelectedAnnotationId(String(id)));
    const offDeselect = drawingManager.on("deselect", () => setSelectedAnnotationId(null));

    return () => {
      offCreate();
      offUpdate();
      offSelect();
      offDeselect();
    };
  }, [drawingManager, annotations, createAnnotation, updateAnnotation, project.id]);

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
        setSelectedAnnotationId(created.id);
        setJustCreatedId(created.id);
        setActiveTool(null);
      } catch (error) {
        console.error("Failed to create text annotation:", error);
      }
    }

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [engine, activeTool, createAnnotation, project.id, renderTextMarker]);

  function handleSelectTool(tool: DrawTool | "text") {
    setActiveTool(tool);
    if (tool === "text") return; // no DrawingManager mode for text — see effect above
    drawingManager?.start(tool);
  }

  function handleCancelTool() {
    drawingManager?.stop();
    setActiveTool(null);
  }

  useToolShortcuts(handleSelectTool, handleCancelTool);

  async function handleDeleteSelected() {
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

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar projectName={project.name} onSearchSelect={handleSearchSelect} />
      <div className="flex flex-1">
        <MapCanvas
          initialCenter={fromGeoJsonPosition(project.map.center)}
          initialZoom={project.map.zoom}
          onEngineReady={setEngine}
        />
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
            onDelete={handleDeleteSelected}
          />
        )}
        <ToolRail activeTool={activeTool} onSelectTool={handleSelectTool} />
      </div>
    </div>
  );
}
