import { mockInvestigationEvents } from "@/projects/investigationEvents/mockInvestigationEvents";
import type { InvestigationEvent, NewInvestigationEventInput } from "@/projects/investigationEvents/types";

/**
 * Track A body — in-memory only. Append-only (no update/delete) — "simple event
 * logging, not a full audit system" per docs/PROJECT_SPEC.md §25.
 */
const store = new Map<string, InvestigationEvent[]>();

function seedIfNeeded(projectId: string): InvestigationEvent[] {
  if (!store.has(projectId)) {
    store.set(
      projectId,
      mockInvestigationEvents.filter((event) => event.projectId === projectId).map((e) => ({ ...e })),
    );
  }
  return store.get(projectId)!;
}

function nextId(): string {
  return crypto.randomUUID();
}

export async function listInvestigationEvents(projectId: string): Promise<InvestigationEvent[]> {
  return [...seedIfNeeded(projectId)];
}

export async function createInvestigationEvent(input: NewInvestigationEventInput): Promise<InvestigationEvent> {
  const event: InvestigationEvent = { ...input, id: nextId(), timestamp: new Date().toISOString() };
  seedIfNeeded(input.projectId).push(event);
  return event;
}
