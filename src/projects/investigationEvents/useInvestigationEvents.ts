"use client";

import { useCallback, useEffect, useState } from "react";
import { createInvestigationEvent as createEventInStorage, listInvestigationEvents } from "@/storage/investigationEvents";
import type { InvestigationEvent, NewInvestigationEventInput, UseInvestigationEventsResult } from "./types";

/** Track A body — local useState, mirrors useAnnotations.ts/useOverlays.ts exactly. */
export function useInvestigationEvents(projectId: string): UseInvestigationEventsResult {
  const [events, setEvents] = useState<InvestigationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listInvestigationEvents(projectId).then((loaded) => {
      if (!cancelled) {
        setEvents(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createEvent = useCallback(async (input: NewInvestigationEventInput) => {
    const created = await createEventInStorage(input);
    setEvents((current) => [...current, created]);
    return created;
  }, []);

  return { events, loading, createEvent };
}
