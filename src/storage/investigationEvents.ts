import { collection, doc, getDocs, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { InvestigationEvent, NewInvestigationEventInput } from "@/projects/investigationEvents/types";

/**
 * Track B — real Firestore CRUD against `projects/{projectId}/investigationEvents`
 * (see firestore.rules). Append-only (no update/delete) — "simple event
 * logging, not a full audit system" per docs/PROJECT_SPEC.md §25.
 */
function investigationEventsCollection(projectId: string) {
  return collection(db, "projects", projectId, "investigationEvents");
}

function toInvestigationEvent(id: string, data: Record<string, unknown>): InvestigationEvent {
  return { id, ...data } as InvestigationEvent;
}

export async function listInvestigationEvents(projectId: string): Promise<InvestigationEvent[]> {
  const snapshot = await getDocs(investigationEventsCollection(projectId));
  return snapshot.docs.map((snap) => toInvestigationEvent(snap.id, snap.data()));
}

export function subscribeToInvestigationEvents(
  projectId: string,
  onChange: (events: InvestigationEvent[]) => void,
): Unsubscribe {
  return onSnapshot(investigationEventsCollection(projectId), (snapshot) => {
    onChange(snapshot.docs.map((snap) => toInvestigationEvent(snap.id, snap.data())));
  });
}

export async function createInvestigationEvent(input: NewInvestigationEventInput): Promise<InvestigationEvent> {
  const id = crypto.randomUUID();
  const payload = { ...input, timestamp: new Date().toISOString() };
  await setDoc(doc(investigationEventsCollection(input.projectId), id), payload);
  return { id, ...payload };
}
