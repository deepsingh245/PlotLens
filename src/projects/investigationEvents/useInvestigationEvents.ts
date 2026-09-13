"use client";

import { useCallback, useEffect, useState } from "react";
import { createInvestigationEvent as createEventInStorage, subscribeToInvestigationEvents } from "@/storage/investigationEvents";
import type { InvestigationEvent, NewInvestigationEventInput, UseInvestigationEventsResult } from "./types";

/** Track B — live onSnapshot subscription, mirrors useAnnotations.ts/useOverlays.ts. */
export function useInvestigationEvents(projectId: string): UseInvestigationEventsResult {
  const [events, setEvents] = useState<InvestigationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToInvestigationEvents(projectId, (loaded) => {
      setEvents(loaded);
      setLoading(false);
    });
  }, [projectId]);

  const createEvent = useCallback(async (input: NewInvestigationEventInput) => {
    return createEventInStorage(input);
  }, []);

  return { events, loading, createEvent };
}
