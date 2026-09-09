/**
 * Logistik Agent – Operative supply chain monitoring (Thomas Müller).
 *
 * Role: Logistik
 * Systems: Manhattan WMS, SAP, Teams
 * Event Types: disruption, kpi_alert
 * Responsibilities: Operative Lieferketten-Überwachung, Eskalation an den Einkauf
 *
 * Requirements: 4.4
 */

import type { AgentAction, AgentConfig, SimEvent } from "../orchestrator.js";
import { RoleAgent } from "../role-agent.js";

const LOGISTIK_CONFIG: AgentConfig = {
  roleId: "logistics",
  eventTypes: ["disruption", "kpi_alert"],
  channels: ["teams", "outlook"],
  systemsAccess: ["manhattan_wms", "sap", "teams"],
};

export class LogistikAgent extends RoleAgent {
  constructor() {
    super(LOGISTIK_CONFIG, "thomas.mueller@aldi-sued.de");
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    const payload = JSON.parse(event.payload);

    switch (event.type) {
      case "disruption": {
        // Logistics monitors warehouse impact and reports
        const affectedSkus: string[] = payload.affected_skus ?? [];
        const durationDays = payload.duration ?? 7;

        actions.push(
          this.createMessageAction({
            recipient: "markus.weber@aldi-sued.de",
            subject: `Logistics Update: Impact on Warehouse Operations`,
            body: `Hi Markus,\n\nthe current disruption is affecting warehouse operations:\n- ${affectedSkus.length} SKUs impacted at goods receiving\n- Expected duration: ${durationDays} days\n- DC Mülheim and DC Duisburg are being checked\n\nI'll keep you posted.\n\nBest, Thomas`,
            resolutionTimeHours: durationDays * 24,
          }),
        );

        // Also inform SC Coordinator
        actions.push(
          this.createMessageAction({
            recipient: "sandra.klein@aldi-sued.de",
            subject: `Logistics: Goods Receiving Disruption Reported`,
            body: `Hi Sandra,\n\nthe disruption is impacting goods receiving. ${affectedSkus.length} SKUs affected. Please factor this into the coordination.\n\nBest, Thomas`,
            resolutionTimeHours: 8,
          }),
        );
        break;
      }

      case "kpi_alert": {
        // Logistics escalates OTD or coverage issues
        const kpiName = payload.kpi_name ?? payload.trigger_kpi ?? "unknown";
        const value = payload.value ?? payload.trigger_value ?? 0;

        if (kpiName === "otd" || kpiName === "coverage_days") {
          actions.push(
            this.createMessageAction({
              recipient: "markus.weber@aldi-sued.de",
              subject: `Logistics Escalation: ${kpiName.toUpperCase()} below threshold`,
              body: `Hi Markus,\n\n${kpiName.toUpperCase()} has dropped to ${value}. This requires alignment with the supplier.\n\nBest, Thomas`,
              resolutionTimeHours: 12,
            }),
          );
        }
        break;
      }
    }

    return actions;
  }
}
