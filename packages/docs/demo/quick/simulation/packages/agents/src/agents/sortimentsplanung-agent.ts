/**
 * Sortimentsplanung Agent – Handles SKU decisions and substitutions.
 *
 * Role: Sortimentsplanung (Peter Hoffmann)
 * Systems: SAP (Artikelstammdaten, Sortimentsentscheidungen)
 * Event Types: disruption, kpi_alert
 * Responsibilities: SKU-Entscheidungen, Substitutionen
 *
 * Requirements: 4.1
 */

import type { AgentAction, AgentConfig, SimEvent } from "../orchestrator.js";
import { RoleAgent } from "../role-agent.js";

const SORTIMENTSPLANUNG_CONFIG: AgentConfig = {
  roleId: "assortment_planning",
  eventTypes: ["disruption", "kpi_alert"],
  channels: ["teams", "outlook"],
  systemsAccess: ["sap"],
};

export class SortimentsplanungAgent extends RoleAgent {
  constructor() {
    super(SORTIMENTSPLANUNG_CONFIG, "peter.hoffmann@aldi-sued.de");
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    const payload = JSON.parse(event.payload);

    if (event.type === "disruption") {
      // On disruption, evaluate if substitution is needed and notify buyer
      const affectedSkus: string[] = payload.affected_skus ?? [];
      if (affectedSkus.length > 0) {
        actions.push(
          this.createMessageAction({
            recipient: "markus.weber@aldi-sued.de",
            subject: `Assortment Planning: Substitution Check for ${affectedSkus.length} SKUs`,
            body: `Hi Markus,\n\ndue to the current disruption (${payload.type ?? "unknown"}) I'm evaluating substitution options for the affected ${affectedSkus.length} items.\n\nI'll get back to you with specific proposals.\n\nBest, Peter`,
            resolutionTimeHours: payload.duration ? payload.duration * 24 : 48,
          }),
        );
      }
    } else if (event.type === "kpi_alert") {
      // On KPI alert, check if OSA issues require sortiment adjustments
      const kpiName = payload.kpi_name ?? payload.trigger_kpi;
      if (kpiName === "osa") {
        actions.push(
          this.createMessageAction({
            recipient: "markus.weber@aldi-sued.de",
            subject:
              "Assortment Planning: OSA Alert – Checking Alternative Items",
            body: `Hi Markus,\n\nOSA has dropped below the critical threshold. I'm checking whether we can replace affected items with secondary suppliers on short notice.\n\nBest, Peter`,
            resolutionTimeHours: 12,
          }),
        );
      }
    }

    return actions;
  }
}
