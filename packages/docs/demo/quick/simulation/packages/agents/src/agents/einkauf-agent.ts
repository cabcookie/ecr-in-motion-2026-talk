/**
 * Einkauf Agent – Buyer, handles supplier negotiations.
 *
 * Role: Einkauf (configured buyer name)
 * Systems: SAP Ariba, Outlook, Teams
 * Event Types: disruption, escalation, communication, purchase_order_confirmed
 * Responsibilities: 54-60 SKUs, Lieferantenverhandlungen, Vertragsmanagement
 *
 * Requirements: 4.2
 */

import type { AgentAction, AgentConfig, SimEvent } from "../orchestrator.js";
import { RoleAgent } from "../role-agent.js";
import { generateAgentResponse } from "../kiro-client.js";
import { getBuyerName } from "../../../db/src/index.js";

const EINKAUF_CONFIG: AgentConfig = {
  roleId: "buyer",
  eventTypes: [
    "disruption",
    "escalation",
    "communication",
    "purchase_order_confirmed",
  ],
  channels: ["outlook", "teams"],
  systemsAccess: ["sap_ariba", "outlook", "teams"],
};

export class EinkaufAgent extends RoleAgent {
  constructor() {
    const buyerName = getBuyerName();
    const buyerEmail =
      buyerName.toLowerCase().split(" ").join(".") + "@aldi-sued.de";
    super(EINKAUF_CONFIG, buyerEmail);
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    const payload = JSON.parse(event.payload);
    const buyerName = getBuyerName();
    const firstName = buyerName.split(" ")[0];

    switch (event.type) {
      case "purchase_order_confirmed": {
        // Update PO status in the database
        actions.push({
          type: "po_update",
          payload: {
            po_number: payload.po_number,
            status: "confirmed",
            confirmed_delivery_date: payload.confirmed_delivery_date,
          },
        });

        // Notify SC Coordinator via Teams
        actions.push(
          this.createMessageAction({
            recipient: "sandra.klein@aldi-sued.de",
            body: `Info: Order confirmation for ${payload.po_number} (${payload.product_name}, ${payload.quantity} units) received from ${payload.supplier_name}. Delivery date confirmed: ${payload.confirmed_delivery_date}.`,
            resolutionTimeHours: 4,
          }),
        );
        break;
      }

      case "disruption": {
        // Buyer acknowledges disruption and coordinates with SC Coordinator
        const affectedSkus: string[] = payload.affected_skus ?? [];

        const roleContext = `You are ${buyerName}, a buyer at ALDI SÜD. You coordinate with Sandra Klein (SC Coordinator) on supply disruptions.`;
        const situation = `There is a disruption of type "${payload.type ?? "supply disruption"}". ${affectedSkus.length} SKUs are affected: ${affectedSkus.join(", ")}. Expected duration: ${payload.duration ?? "unknown"} days.`;
        const instruction = `Write a short Teams message to Sandra Klein. Ask her for an assessment of the inventory situation and the impact. Sign with "Best, ${firstName}".`;

        let body = await generateAgentResponse(
          roleContext,
          situation,
          instruction,
        );
        if (!body) {
          body = `Hi Sandra,\n\nI've received the disruption alert. ${affectedSkus.length} SKUs are affected.\n\nCould you please check the inventory situation and give me an impact assessment?\n\nBest, ${firstName}`;
        }

        actions.push(
          this.createMessageAction({
            recipient: "sandra.klein@aldi-sued.de",
            subject: `Procurement: Disruption Alignment – ${payload.type ?? "Supply Disruption"}`,
            body,
            resolutionTimeHours: payload.duration ? payload.duration * 24 : 48,
          }),
        );
        break;
      }

      case "escalation": {
        // Buyer responds to escalation with action plan
        const level = payload.level ?? 1;
        const resolutionHours = level >= 2 ? 48 : 12;
        actions.push(
          this.createMessageAction({
            recipient: "sandra.klein@aldi-sued.de",
            subject: `Procurement: Escalation Level ${level} – Action Plan`,
            body: `Hi Sandra,\n\nI've acknowledged the level ${level} escalation. I'm contacting the supplier directly and will follow up with an action plan.\n\nBest, ${firstName}`,
            resolutionTimeHours: resolutionHours,
          }),
        );
        break;
      }

      case "communication": {
        // Buyer processes internal communications
        if (event.source_role && event.source_role !== "buyer") {
          actions.push(
            this.createMessageAction({
              recipient: `${event.source_role}@aldi-sued.de`,
              subject: "RE: Confirmation Received",
              body: `Thanks for the info. I'll take care of it.\n\nBest, ${firstName}`,
              resolutionTimeHours: 8,
            }),
          );
        }
        break;
      }
    }

    return actions;
  }
}
