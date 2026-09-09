/**
 * Lieferanten Agent – External supplier simulation.
 *
 * Role: Lieferanten-Agent (external)
 * Channels: ONLY outlook (never teams)
 * Event Types: disruption, communication, purchase_order_created
 * Responsibilities: Simulates external suppliers communicating with the buyer.
 *   Uses kiro-cli (LLM) to generate context-aware responses.
 *
 * CRITICAL INVARIANTS:
 * - Channel is ALWAYS 'outlook' (Requirement 3.5)
 * - Sender address NEVER ends in @aldi-sued.de (Requirement 13.2)
 * - Messages represent external supplier communications
 *
 * Requirements: 4.7, 3.5, 13.2
 */

import type { AgentAction, AgentConfig, SimEvent } from "../orchestrator.js";
import { RoleAgent } from "../role-agent.js";
import { generateAgentResponse } from "../kiro-client.js";
import { getBuyerName } from "../../../db/src/index.js";

const LIEFERANTEN_CONFIG: AgentConfig = {
  roleId: "supplier_agent",
  eventTypes: ["disruption", "communication", "purchase_order_created"],
  channels: ["outlook"], // ONLY outlook
  systemsAccess: ["outlook"],
};

/** External supplier addresses – never @aldi-sued.de */
const SUPPLIER_ADDRESSES: Record<string, string> = {
  newcoffee: "kontakt@newcoffee-trading.com",
  storck: "vertrieb@storck-gmbh.de",
  muellermilch: "qualitaet@muellermilch.de",
  freshfruit: "info@freshfruit-import.com",
  koelln: "service@koelln.de",
  bauckhof: "bestellung@bauckhof.de",
  dole: "logistics@dole-europe.com",
  teekanne: "vertrieb@teekanne.de",
  suedfruchte: "kontakt@suedfruchte-logistik.com",
  nordgrain: "bestellung@nordgrain.de",
};

/** Supplier contact persons for personalized responses */
const SUPPLIER_CONTACTS: Record<string, string> = {
  newcoffee: "Stefan Hartmann",
  storck: "Andreas Becker",
  muellermilch: "Dr. Katharina Schmid",
  freshfruit: "Maria Gonzalez",
  koelln: "Frank Müller",
  bauckhof: "Heinrich Bauer",
  dole: "Carlos Martinez",
  teekanne: "Sabine Fischer",
  suedfruchte: "Antonio Ruiz",
  nordgrain: "Jens Petersen",
};

export class LieferantenAgent extends RoleAgent {
  constructor() {
    super(LIEFERANTEN_CONFIG, "kontakt@lieferant.de");
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    const payload = JSON.parse(event.payload);

    switch (event.type) {
      case "purchase_order_created": {
        // Supplier confirms a purchase order with a delivery date
        const supplierAddress = this.resolveSupplierAddress(payload);
        const contactName = this.resolveContactName(payload);
        const buyerName = getBuyerName();
        const buyerLastName = buyerName.split(" ").slice(-1)[0];

        // Calculate a confirmed delivery date (usually 1-2 days before requested)
        const requestedDate = new Date(payload.requested_delivery_date);
        const confirmedDate = new Date(requestedDate);
        // Confirm with 0-1 day variation
        confirmedDate.setDate(
          confirmedDate.getDate() - Math.round(Math.random()),
        );
        const confirmedDateStr = confirmedDate.toISOString().split("T")[0];

        const roleContext = `You are ${contactName}, a sales representative at ${payload.supplier_name}. You confirm orders from ALDI SÜD professionally and in a friendly manner.`;
        const situation = `The buyer ${buyerName} from ALDI SÜD has placed an order:\n- Order number: ${payload.po_number}\n- Item: ${payload.product_name} (SKU ${payload.sku})\n- Quantity: ${payload.quantity} units\n- Requested delivery date: ${payload.requested_delivery_date}\n- Confirmed delivery date: ${confirmedDateStr}`;
        const instruction = `Write a short, professional order confirmation email to Mr. ${buyerLastName}. Confirm the order with the order number, quantity, and the confirmed delivery date ${confirmedDateStr}. Sign with your name and company. No subject line, only the email body.`;

        let body = await generateAgentResponse(
          roleContext,
          situation,
          instruction,
        );

        if (!body) {
          // Fallback if LLM fails
          body = `Dear Mr. ${buyerLastName},\n\nwe hereby confirm your order ${payload.po_number}:\n- Item: ${payload.product_name}\n- Quantity: ${payload.quantity} units\n- Confirmed delivery date: ${confirmedDateStr}\n\nThe goods will be shipped on schedule.\n\nBest regards,\n${contactName}\n${payload.supplier_name}`;
        }

        actions.push(
          this.createSupplierMessage({
            sender: supplierAddress,
            recipient: this.deriveBuyerEmail(),
            subject: `Order Confirmation ${payload.po_number} – ${payload.product_name}`,
            body,
          }),
        );

        // Also create a po_confirmed event for the orchestrator to update the PO status
        actions.push({
          type: "event",
          payload: {
            type: "purchase_order_confirmed",
            target_role: "buyer",
            payload: JSON.stringify({
              po_number: payload.po_number,
              po_id: payload.po_id,
              supplier_name: payload.supplier_name,
              confirmed_delivery_date: confirmedDateStr,
              product_name: payload.product_name,
              quantity: payload.quantity,
            }),
          },
        });

        break;
      }

      case "disruption": {
        // Supplier communicates delay/issue to buyer
        const supplierAddress = this.resolveSupplierAddress(payload);
        const contactName = this.resolveContactName(payload);
        const buyerName = getBuyerName();
        const buyerLastName = buyerName.split(" ").slice(-1)[0];

        const roleContext = `You are ${contactName}, an employee at an ALDI SÜD supplier. You inform the buyer about supply disruptions professionally and in a solution-oriented manner.`;
        const situation = `There is a supply disruption of type "${payload.type ?? "unknown"}".\nAffected SKUs: ${(payload.affected_skus as string[])?.join(", ") ?? "not specified"}\nExpected duration: ${payload.duration ?? "unknown"} days`;
        const instruction = `Write a professional email to Mr. ${buyerLastName} from ALDI SÜD informing about the supply disruption. Be transparent about the problem, mention a new delivery date if possible, and offer solutions. Sign with your name and company.`;

        let body = await generateAgentResponse(
          roleContext,
          situation,
          instruction,
        );

        if (!body) {
          body = this.generateDisruptionBodyFallback(payload);
        }

        actions.push(
          this.createSupplierMessage({
            sender: supplierAddress,
            recipient: this.deriveBuyerEmail(),
            subject: `Supplier Notice: ${this.getDisruptionLabel(payload)}`,
            body,
          }),
        );
        break;
      }

      case "communication": {
        // Supplier responds to buyer communications
        const supplierAddress = this.resolveSupplierAddress(payload);
        const contactName = this.resolveContactName(payload);
        const buyerName = getBuyerName();
        const buyerLastName = buyerName.split(" ").slice(-1)[0];

        const roleContext = `You are ${contactName}, an employee at an ALDI SÜD supplier. You respond to inquiries from the buyer professionally and helpfully.`;
        const situation = `The buyer ${buyerName} wrote to you:\n${payload.body ?? payload.message ?? "No details available."}`;
        const instruction = `Write an appropriate reply email to Mr. ${buyerLastName}. Be helpful and professional. Sign with your name and company.`;

        let body = await generateAgentResponse(
          roleContext,
          situation,
          instruction,
        );

        if (!body) {
          body = `Dear Mr. ${buyerLastName},\n\nthank you for your message. We are processing your request and will respond as soon as possible.\n\nBest regards,\n${contactName}`;
        }

        actions.push(
          this.createSupplierMessage({
            sender: supplierAddress,
            recipient: this.deriveBuyerEmail(),
            subject: payload.subject ?? "Response to Your Inquiry",
            body,
          }),
        );
        break;
      }
    }

    return actions;
  }

  /**
   * Creates a message action that ALWAYS uses outlook channel and external sender.
   * This enforces the invariant that supplier messages never come from @aldi-sued.de.
   */
  private createSupplierMessage(params: {
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
  }): AgentAction {
    return {
      type: "message",
      payload: {
        channel: "outlook" as const, // ALWAYS outlook
        sender: params.sender,
        recipient: params.recipient,
        subject: params.subject,
        body: params.body,
        thread_id: params.thread_id ?? null,
      },
    };
  }

  /**
   * Derives the buyer's email address from the BUYER_NAME env var.
   */
  private deriveBuyerEmail(): string {
    const name = getBuyerName();
    return name.toLowerCase().split(" ").join(".") + "@aldi-sued.de";
  }

  /**
   * Resolves which supplier address to use based on event payload.
   */
  private resolveSupplierAddress(payload: Record<string, unknown>): string {
    const supplierId = payload.supplier_id as string | undefined;
    const supplierName =
      (payload.supplier_name as string | undefined)?.toLowerCase() ?? "";

    if (supplierId && SUPPLIER_ADDRESSES[supplierId]) {
      return SUPPLIER_ADDRESSES[supplierId];
    }

    for (const [key, address] of Object.entries(SUPPLIER_ADDRESSES)) {
      if (supplierName.includes(key)) {
        return address;
      }
    }

    return "kontakt@lieferant.de";
  }

  /**
   * Resolves which contact person name to use based on event payload.
   */
  private resolveContactName(payload: Record<string, unknown>): string {
    const supplierName =
      (payload.supplier_name as string | undefined)?.toLowerCase() ?? "";

    for (const [key, name] of Object.entries(SUPPLIER_CONTACTS)) {
      if (supplierName.includes(key)) {
        return name;
      }
    }

    return "Kundenservice";
  }

  private getDisruptionLabel(payload: Record<string, unknown>): string {
    const type = payload.type as string | undefined;
    const labels: Record<string, string> = {
      recall: "Recall Notice",
      supply_chain_disruption: "Delivery Delay",
      extreme_weather: "Weather-Related Supply Shortage",
      seasonal_peaks: "Capacity Bottleneck",
      packaging_change: "Packaging Change",
    };
    return labels[type ?? ""] ?? "Important Supplier Information";
  }

  private generateDisruptionBodyFallback(
    payload: Record<string, unknown>,
  ): string {
    const buyerName = getBuyerName();
    const buyerLastName = buyerName.split(" ").slice(-1)[0];
    const duration = payload.duration as number | undefined;
    const affectedSkus = payload.affected_skus as string[] | undefined;

    return `Dear Mr. ${buyerLastName},\n\nwe regret to inform you that there have been delays in our supply chain.\n\n${affectedSkus?.length ? `Affected item numbers: ${affectedSkus.join(", ")}\n` : ""}${duration ? `Expected duration: ${duration} days\n` : ""}\nWe are working intensively on a solution and will keep you updated.\n\nBest regards,\nYour Supplier Team`;
  }
}
