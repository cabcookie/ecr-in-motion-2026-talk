/**
 * Abstract base class for role-based agents in the ALDI SÜD Supply Chain Simulation.
 *
 * Implements the AgentHandler interface from the orchestrator and provides:
 * - Channel selection logic (Teams < 24h, Outlook >= 24h)
 * - Message generation with correct sender addresses
 * - Business-hours timestamp generation (08:00-18:00)
 * - Abstract handleEvent for subclass implementation
 */

import type {
  AgentConfig,
  AgentHandler,
  AgentAction,
  SimEvent,
} from "./orchestrator.js";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface MessageParams {
  recipient: string;
  subject?: string;
  body: string;
  thread_id?: string;
  /** Expected resolution time in hours – drives channel selection */
  resolutionTimeHours?: number;
}

// ─── Abstract Base Class ────────────────────────────────────────────────────

export abstract class RoleAgent implements AgentHandler {
  public readonly config: AgentConfig;
  protected readonly senderAddress: string;

  constructor(config: AgentConfig, senderAddress: string) {
    this.config = config;
    this.senderAddress = senderAddress;
  }

  /**
   * Process a simulation event and return resulting actions.
   * Subclasses MUST implement this method.
   */
  abstract handleEvent(event: SimEvent): Promise<AgentAction[]>;

  /**
   * Standalone poll method – for use outside the orchestrator.
   * The orchestrator calls handleEvent directly; this is for agents
   * that need to run autonomously.
   */
  async poll(): Promise<void> {
    // Default no-op; subclasses can override if needed for standalone usage
  }

  // ─── Helper Methods ─────────────────────────────────────────────────────

  /**
   * Selects the communication channel based on expected resolution time.
   * - < 24h → teams (real-time escalation)
   * - >= 24h → outlook (formal communication)
   */
  protected selectChannel(resolutionTimeHours: number): "teams" | "outlook" {
    return resolutionTimeHours < 24 ? "teams" : "outlook";
  }

  /**
   * Generates a message action with proper sender address and channel selection.
   */
  protected createMessageAction(params: MessageParams): AgentAction {
    const channel =
      params.resolutionTimeHours !== undefined
        ? this.selectChannel(params.resolutionTimeHours)
        : this.getDefaultChannel();

    return {
      type: "message",
      payload: {
        channel,
        sender: this.senderAddress,
        recipient: params.recipient,
        subject: params.subject ?? null,
        body: params.body,
        thread_id: params.thread_id ?? null,
      },
    };
  }

  /**
   * Generates a timestamp within business hours (08:00–18:00).
   * If the current time is outside business hours, clamps to the range.
   */
  protected generateBusinessHoursTimestamp(baseDate?: Date): string {
    const date = baseDate ? new Date(baseDate) : new Date();
    const hours = date.getHours();

    if (hours < 8) {
      date.setHours(8, 0, 0, 0);
    } else if (hours >= 18) {
      date.setHours(17, 59, 0, 0);
    }

    return date.toISOString();
  }

  /**
   * Returns the default channel for this agent.
   * Internal agents default to teams; can be overridden.
   */
  protected getDefaultChannel(): "teams" | "outlook" {
    if (this.config.channels.length === 1) {
      return this.config.channels[0];
    }
    return "teams";
  }
}
