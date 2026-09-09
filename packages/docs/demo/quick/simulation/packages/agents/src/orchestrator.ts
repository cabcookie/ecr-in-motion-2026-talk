import Database from "better-sqlite3";

// ─── Interfaces ─────────────────────────────────────────────────────────────

/** Configuration for a single role agent. */
export interface AgentConfig {
  roleId: string;
  eventTypes: string[];
  channels: ("outlook" | "teams")[];
  systemsAccess: string[];
}

/** A simulation event from the events table. */
export interface SimEvent {
  id: number;
  timestamp: string;
  type: string;
  source_role: string;
  target_role: string | null;
  payload: string;
  status: string;
  scenario_id: string | null;
}

/** Parameters for triggering a disruption scenario. */
export interface DisruptionParams {
  affectedSkus?: string[];
  duration?: number;
  marginImpact?: number;
}

/** Actions an agent can produce in response to an event. */
export interface AgentAction {
  type: "message" | "event" | "kpi_update" | "escalation" | "po_update";
  payload: Record<string, unknown>;
}

/** Handler interface that agents implement to process events. */
export interface AgentHandler {
  config: AgentConfig;
  handleEvent(event: SimEvent): Promise<AgentAction[]>;
}

/** The public interface for the Agent Engine. */
export interface AgentEngine {
  start(): void;
  stop(): void;
  triggerDisruption(scenarioId: string, params: DisruptionParams): void;
}

// ─── Implementation ─────────────────────────────────────────────────────────

const DEFAULT_POLLING_INTERVAL_MS = 30_000;

/**
 * Creates an AgentEngine orchestrator that polls the SQLite events table
 * for pending events and dispatches them to registered agents based on
 * their configured eventTypes.
 */
export function createAgentEngine(
  db: Database.Database,
  agents: AgentHandler[],
  options?: { pollingIntervalMs?: number },
): AgentEngine {
  let timer: ReturnType<typeof setInterval> | null = null;
  let running = false;

  const pollingIntervalMs =
    options?.pollingIntervalMs ?? getConfiguredInterval(db);

  // ── DB Statements ──────────────────────────────────────────────────────

  const selectPendingEvents = db.prepare<[]>(
    `SELECT id, timestamp, type, source_role, target_role, payload, status, scenario_id
     FROM events
     WHERE status = 'pending'
     ORDER BY timestamp ASC`,
  );

  const markEventProcessing = db.prepare<[number]>(
    `UPDATE events SET status = 'processing' WHERE id = ?`,
  );

  const markEventCompleted = db.prepare<[number]>(
    `UPDATE events SET status = 'completed' WHERE id = ?`,
  );

  const insertEvent = db.prepare<
    [string, string, string | null, string, string | null]
  >(
    `INSERT INTO events (type, source_role, target_role, payload, scenario_id)
     VALUES (?, ?, ?, ?, ?)`,
  );

  // ── Core Logic ─────────────────────────────────────────────────────────

  /**
   * Determines which agents should receive a given event based on their
   * configured eventTypes. An agent receives an event if:
   * - Its eventTypes array includes the event type, OR
   * - The event explicitly targets the agent's roleId
   */
  function dispatchEvent(event: SimEvent): AgentHandler[] {
    return agents.filter((agent) => {
      const matchesType = agent.config.eventTypes.includes(event.type);
      const isTargeted = event.target_role === agent.config.roleId;
      return matchesType || isTargeted;
    });
  }

  /**
   * Single poll cycle: fetch pending events, dispatch to relevant agents,
   * and execute resulting actions.
   */
  async function poll(): Promise<void> {
    const pendingEvents = selectPendingEvents.all() as SimEvent[];

    for (const event of pendingEvents) {
      const parsed = JSON.parse(event.payload || "{}");
      console.log(
        `[AgentEngine] 📥 Event #${event.id} "${event.type}" (scenario: ${event.scenario_id ?? "–"}) von ${event.source_role}`,
      );
      markEventProcessing.run(event.id);

      const targetAgents = dispatchEvent(event);

      for (const agent of targetAgents) {
        try {
          console.log(
            `[AgentEngine]   → Agent "${agent.config.roleId}" verarbeitet...`,
          );
          const actions = await agent.handleEvent(event);
          if (actions.length > 0) {
            console.log(
              `[AgentEngine]   ✓ ${actions.length} Aktion(en) von "${agent.config.roleId}"`,
            );
          }
          await executeActions(actions, agent.config.roleId);
        } catch (err) {
          console.error(
            `[AgentEngine] ✗ Fehler in Agent "${agent.config.roleId}" bei Event ${event.id}:`,
            err,
          );
        }
      }

      markEventCompleted.run(event.id);
      console.log(`[AgentEngine] ✓ Event #${event.id} abgeschlossen`);
    }
  }

  /**
   * Executes the actions produced by an agent (write messages, create events,
   * update KPIs, create escalations).
   */
  async function executeActions(
    actions: AgentAction[],
    sourceRole: string,
  ): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case "message": {
          const { channel, sender, recipient, subject, body, thread_id } =
            action.payload as {
              channel: string;
              sender: string;
              recipient: string;
              subject?: string;
              body: string;
              thread_id?: string;
            };
          db.prepare(
            `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, thread_id)
             VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
          ).run(
            channel,
            sender,
            recipient,
            subject ?? null,
            body,
            thread_id ?? null,
          );
          console.log(
            `[AgentEngine]     📧 ${channel.toUpperCase()}: ${sender} → ${recipient} "${subject ?? "(kein Betreff)"}"`,
          );
          break;
        }
        case "event": {
          const { type, target_role, payload, scenario_id } =
            action.payload as {
              type: string;
              target_role?: string;
              payload: string;
              scenario_id?: string;
            };
          insertEvent.run(
            type,
            sourceRole,
            target_role ?? null,
            payload,
            scenario_id ?? null,
          );
          console.log(
            `[AgentEngine]     📋 Neues Event: "${type}" → ${target_role ?? "alle"}`,
          );
          break;
        }
        case "kpi_update": {
          const { kpi_name, value, role_id } = action.payload as {
            kpi_name: string;
            value: number;
            role_id?: string;
          };
          db.prepare(
            `INSERT INTO kpi_states (kpi_name, value, timestamp, role_id)
             VALUES (?, ?, datetime('now'), ?)`,
          ).run(kpi_name, value, role_id ?? null);
          console.log(`[AgentEngine]     📉 KPI "${kpi_name}" = ${value}`);
          break;
        }
        case "escalation": {
          const { level, trigger_kpi, trigger_value, threshold, channel } =
            action.payload as {
              level: number;
              trigger_kpi: string;
              trigger_value: number;
              threshold: number;
              channel: string;
            };
          db.prepare(
            `INSERT INTO escalations (level, trigger_kpi, trigger_value, threshold, channel, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
          ).run(level, trigger_kpi, trigger_value, threshold, channel);
          console.log(
            `[AgentEngine]     🚨 Eskalation Level ${level}: ${trigger_kpi} (${trigger_value} vs. Schwelle ${threshold}) via ${channel}`,
          );
          break;
        }
        case "po_update": {
          const { po_number, status, confirmed_delivery_date } =
            action.payload as {
              po_number: string;
              status: string;
              confirmed_delivery_date?: string;
            };
          if (confirmed_delivery_date) {
            db.prepare(
              `UPDATE purchase_orders SET status = ?, confirmed_delivery_date = ?, updated_at = datetime('now') WHERE po_number = ?`,
            ).run(status, confirmed_delivery_date, po_number);
          } else {
            db.prepare(
              `UPDATE purchase_orders SET status = ?, updated_at = datetime('now') WHERE po_number = ?`,
            ).run(status, po_number);
          }
          console.log(
            `[AgentEngine]     📦 PO ${po_number} → Status: "${status}"${confirmed_delivery_date ? ` (Liefertermin: ${confirmed_delivery_date})` : ""}`,
          );
          break;
        }
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    start() {
      if (running) return;
      running = true;
      console.log(
        `[AgentEngine] Starting polling loop (interval: ${pollingIntervalMs}ms, agents: ${agents.length})`,
      );
      // Run first poll immediately, then on interval
      poll().catch((err) =>
        console.error("[AgentEngine] Error in initial poll:", err),
      );
      timer = setInterval(() => {
        poll().catch((err) =>
          console.error("[AgentEngine] Error in poll cycle:", err),
        );
      }, pollingIntervalMs);
    },

    stop() {
      if (!running) return;
      running = false;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      console.log("[AgentEngine] Stopped.");
    },

    triggerDisruption(scenarioId: string, params: DisruptionParams) {
      const payload = JSON.stringify({
        type: "disruption",
        affected_skus: params.affectedSkus ?? [],
        duration: params.duration ?? 7,
        margin_impact: params.marginImpact ?? 0,
      });

      insertEvent.run("disruption", "system", null, payload, scenarioId);

      console.log(
        `[AgentEngine] Disruption triggered: scenario="${scenarioId}"`,
      );
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads the polling interval from demo_config if available,
 * falling back to the default 10s.
 */
function getConfiguredInterval(db: Database.Database): number {
  try {
    const row = db
      .prepare(
        `SELECT value FROM demo_config WHERE key = 'polling_interval_ms'`,
      )
      .get() as { value: string } | undefined;
    if (row) {
      const parsed = JSON.parse(row.value);
      if (typeof parsed === "number" && parsed > 0) return parsed;
      // If stored as string number (e.g. "10000")
      const num = Number(parsed);
      if (!isNaN(num) && num > 0) return num;
    }
  } catch {
    // Ignore parse errors, use default
  }
  return DEFAULT_POLLING_INTERVAL_MS;
}
