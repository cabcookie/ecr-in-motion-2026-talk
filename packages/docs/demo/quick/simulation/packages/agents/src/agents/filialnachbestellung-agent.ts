/**
 * Filialnachbestellung Agent – Auto-replenishment and OSA monitoring (Julia Braun).
 *
 * Role: Filialnachbestellung
 * Systems: SAP, Manhattan WMS
 * Event Types: kpi_alert, disruption
 * Responsibilities: Automatisierte Nachbestellung, OSA-Monitoring
 *
 * Requirements: 4.5
 */

import type { AgentAction, AgentConfig, SimEvent } from "../orchestrator.js";
import { RoleAgent } from "../role-agent.js";

const FILIALNACHBESTELLUNG_CONFIG: AgentConfig = {
  roleId: "store_replenishment",
  eventTypes: ["kpi_alert", "disruption"],
  channels: ["teams", "outlook"],
  systemsAccess: ["sap", "manhattan_wms"],
};

export class FilialnachbestellungAgent extends RoleAgent {
  constructor() {
    super(FILIALNACHBESTELLUNG_CONFIG, "julia.braun@aldi-sued.de");
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    const payload = JSON.parse(event.payload);

    switch (event.type) {
      case "kpi_alert": {
        // Monitor OSA and trigger alerts when below threshold
        const kpiName = payload.kpi_name ?? payload.trigger_kpi ?? "unknown";
        const value = payload.value ?? payload.trigger_value ?? 0;

        if (kpiName === "osa") {
          actions.push(
            this.createMessageAction({
              recipient: "markus.weber@aldi-sued.de",
              subject: `Store Replenishment: OSA Warning – ${value < 0.95 ? "critical" : "monitor"}`,
              body: `Hi Markus,\n\nauto-replenishment reports OSA issues:\n- Current value: ${(value * 100).toFixed(1)}%\n- Threshold: 95%\n\nAffected stores are being prioritized for restocking. Please check if the supplier has sufficient capacity.\n\nBest, Julia`,
              resolutionTimeHours: 12,
            }),
          );
        }
        break;
      }

      case "disruption": {
        // Disruption impacts replenishment planning
        const affectedSkus: string[] = payload.affected_skus ?? [];

        if (affectedSkus.length > 0) {
          actions.push(
            this.createMessageAction({
              recipient: "markus.weber@aldi-sued.de",
              subject: `Store Replenishment: Disruption Impact on Restocking`,
              body: `Hi Markus,\n\nthe current disruption affects ${affectedSkus.length} SKUs in auto-replenishment. I'm adjusting order quantities and prioritizing critical stores.\n\nIf necessary, I'll escalate to Sandra.\n\nBest, Julia`,
              resolutionTimeHours: 24,
            }),
          );
        }
        break;
      }
    }

    return actions;
  }
}
