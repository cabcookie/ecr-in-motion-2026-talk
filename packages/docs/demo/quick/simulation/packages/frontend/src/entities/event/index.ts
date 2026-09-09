/**
 * Entity: Event
 * Domain-Modell für Simulation-Events (Event-Queue).
 */

export interface SimEvent {
  id: number;
  timestamp: string;
  type: "disruption" | "communication" | "escalation" | "kpi_alert";
  source_role: string;
  target_role: string | null;
  payload: string;
  status: "pending" | "processing" | "completed";
  scenario_id: string | null;
}
