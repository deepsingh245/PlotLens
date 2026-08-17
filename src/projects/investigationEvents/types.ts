/** The example types docs/DATA_MODEL.md's InvestigationEvent comment names, adapted to
 *  what this app actually auto-logs — see docs/plans/plan-8.md. */
export type InvestigationEventType = "annotation_created" | "overlay_added" | "measurement_taken" | "note_added";

/** Mirrors docs/DATA_MODEL.md's InvestigationEvent schema. */
export interface InvestigationEvent {
  id: string;
  projectId: string;
  timestamp: string;
  type: InvestigationEventType;
  summary: string;
  relatedEntityId: string | null;
}

export type NewInvestigationEventInput = Omit<InvestigationEvent, "id" | "timestamp">;

export interface UseInvestigationEventsResult {
  events: InvestigationEvent[];
  loading: boolean;
  createEvent: (input: NewInvestigationEventInput) => Promise<InvestigationEvent>;
}
