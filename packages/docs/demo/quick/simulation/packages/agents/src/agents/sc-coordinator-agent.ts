/**
 * SC Coordinator Agent – Supply Chain Coordinator (Sandra Klein).
 *
 * Role: SC Coordinator
 * Systems: SAP, Manhattan WMS, Teams
 * Event Types: disruption, escalation, kpi_alert
 * Responsibilities: Coordination, Logistik-Know-how für Einkaufsteams
 *
 * Requirements: 4.3
 */

import type { AgentAction, AgentConfig, SimEvent } from "../orchestrator.js";
import { RoleAgent } from "../role-agent.js";

const SC_COORDINATOR_CONFIG: AgentConfig = {
  roleId: "sc_coordinator",
  eventTypes: ["disruption", "escalation", "kpi_alert"],
  channels: ["teams", "outlook"],
  systemsAccess: ["sap", "manhattan_wms", "teams"],
};

export class ScCoordinatorAgent extends RoleAgent {
  constructor() {
    super(SC_COORDINATOR_CONFIG, "sandra.klein@aldi-sued.de");
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    const payload = JSON.parse(event.payload);

    switch (event.type) {
      case "disruption": {
        // SC Coordinator assesses impact and coordinates response
        const affectedSkus: string[] = payload.affected_skus ?? [];
        const durationDays = payload.duration ?? 7;

        // Notify buyer with assessment
        actions.push(
          this.createMessageAction({
            recipient: "markus.weber@aldi-sued.de",
            subject: `SC Update: Impact Analysis ${payload.type ?? "Disruption"}`,
            body: `Hi Markus,\n\nImpact analysis for the current disruption:\n- Affected SKUs: ${affectedSkus.length}\n- Expected duration: ${durationDays} days\n- Inventory situation: under review\n\nI'm coordinating with logistics and will follow up with recommendations.\n\nBest, Sandra`,
            resolutionTimeHours: durationDays * 24,
          }),
        );

        // Notify logistics for warehouse check
        actions.push(
          this.createMessageAction({
            recipient: "thomas.mueller@aldi-sued.de",
            subject: `SC Coordinator: Inventory Check Requested`,
            body: `Hi Thomas,\n\nplease check the inventory situation for ${affectedSkus.length} affected SKUs in the WMS. We need a current coverage days assessment.\n\nThanks\nSandra`,
            resolutionTimeHours: 8,
          }),
        );
        break;
      }

      case "escalation": {
        // SC Coordinator manages escalation routing
        const level = payload.level ?? 1;
        const resolutionHours = level >= 2 ? 72 : 24;

        actions.push(
          this.createMessageAction({
            recipient: "markus.weber@aldi-sued.de",
            subject: `Escalation Level ${level}: Coordination in progress`,
            body: `Hi Markus,\n\nI've picked up the level ${level} escalation and am coordinating the next steps.\n\nTrigger: ${payload.trigger_kpi ?? "unknown"} (Value: ${payload.trigger_value ?? "n/a"})\n\nBest, Sandra`,
            resolutionTimeHours: resolutionHours,
          }),
        );
        break;
      }

      case "kpi_alert": {
        // SC Coordinator alerts buyer about KPI breaches
        const kpiName = payload.kpi_name ?? payload.trigger_kpi ?? "unknown";
        const value = payload.value ?? payload.trigger_value ?? 0;

        actions.push(
          this.createMessageAction({
            recipient: "markus.weber@aldi-sued.de",
            subject: `KPI Warning: ${kpiName.toUpperCase()} critical`,
            body: `Hi Markus,\n\nthe KPI ${kpiName.toUpperCase()} has reached a critical value (${value}). Please let's align on countermeasures.\n\nBest, Sandra`,
            resolutionTimeHours: 12,
          }),
        );
        break;
      }
    }

    return actions;
  }
}
