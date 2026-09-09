import Database from "better-sqlite3";

// ─── Interfaces ─────────────────────────────────────────────────────────────

/** A single escalation rule defining when a KPI triggers an escalation. */
export interface EscalationRule {
  kpi: "otd" | "osa" | "cost_deviation" | "mape";
  threshold: number;
  level: 1 | 2 | 3;
  direction: "below" | "above"; // OTD/OSA trigger when BELOW, costs/MAPE trigger when ABOVE
}

/** Result of an escalation evaluation when a threshold is breached. */
export interface EscalationResult {
  level: 1 | 2 | 3;
  rule: EscalationRule;
}

// ─── Default Rules ──────────────────────────────────────────────────────────

/**
 * Default escalation rules per the requirements:
 * - OTD < 90% → Level 1 (Operativ)
 * - cost_deviation > 5% → Level 2 (Taktisch)
 * - OSA < 95% → Level 2 (Taktisch)
 * - MAPE > 20% → Level 1 (Operativ)
 */
export const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  { kpi: "otd", threshold: 0.9, level: 1, direction: "below" },
  { kpi: "cost_deviation", threshold: 0.05, level: 2, direction: "above" },
  { kpi: "osa", threshold: 0.95, level: 2, direction: "below" },
  { kpi: "mape", threshold: 0.2, level: 1, direction: "above" },
];

// ─── Functions ──────────────────────────────────────────────────────────────

/**
 * Evaluates whether a KPI value breaches any escalation threshold.
 * Returns the highest-level escalation triggered, or null if within tolerance.
 */
export function evaluateEscalation(
  kpiName: string,
  kpiValue: number,
  rules: EscalationRule[] = DEFAULT_ESCALATION_RULES,
): EscalationResult | null {
  let result: EscalationResult | null = null;

  for (const rule of rules) {
    if (rule.kpi !== kpiName) continue;

    const breached =
      rule.direction === "below"
        ? kpiValue < rule.threshold
        : kpiValue > rule.threshold;

    if (breached) {
      // If multiple rules match, pick the highest level
      if (!result || rule.level > result.level) {
        result = { level: rule.level, rule };
      }
    }
  }

  return result;
}

/**
 * Selects the communication channel based on expected resolution time.
 * - Teams for urgent matters (< 24 hours)
 * - Outlook for formal communication (>= 24 hours)
 */
export function selectChannel(
  resolutionTimeHours: number,
): "teams" | "outlook" {
  return resolutionTimeHours < 24 ? "teams" : "outlook";
}

/**
 * Loads escalation thresholds from the demo_config table.
 * Falls back to DEFAULT_ESCALATION_RULES if no configuration is found.
 */
export function loadEscalationThresholds(
  db: Database.Database,
): EscalationRule[] {
  try {
    const row = db
      .prepare(`SELECT value FROM demo_config WHERE key = 'escalation_rules'`)
      .get() as { value: string } | undefined;

    if (row) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as EscalationRule[];
      }
    }
  } catch {
    // Ignore parse errors, use defaults
  }

  return DEFAULT_ESCALATION_RULES;
}

/**
 * Creates an escalation entry in the escalations table.
 */
export function createEscalationEntry(
  db: Database.Database,
  level: number,
  triggerKpi: string,
  triggerValue: number,
  threshold: number,
  channel: string,
): void {
  db.prepare(
    `INSERT INTO escalations (level, trigger_kpi, trigger_value, threshold, channel, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
  ).run(level, triggerKpi, triggerValue, threshold, channel);
}
