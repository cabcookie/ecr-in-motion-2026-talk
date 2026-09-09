/**
 * Pre-Aged Mode – Generates all intermediate escalation steps retroactively.
 *
 * When activated, this module generates:
 * 1. Historical KPI decline (showing deterioration over time)
 * 2. Historical messages (internal ALDI emails + external supplier emails)
 * 3. Escalation entries matching the KPI thresholds
 * 4. Sets state to the point where the Buyer first notices the situation
 *
 * All timestamps are relative to the anchor_date and chronologically ordered
 * before the anchor_date. Messages are generated within business hours (08:00-18:00).
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import type Database from "better-sqlite3";
import { computeTimestamp, type SeedOffset } from "../../db/src/index.js";
import {
  DISRUPTION_SCENARIOS,
  type DisruptionScenario,
  type KpiType,
} from "./disruption.js";
import { DEFAULT_ESCALATION_RULES, type EscalationRule } from "./escalation.js";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ScenarioConfig {
  type: string;
  label: string;
  margin_impact_bps: number;
  duration_days: number;
  probability: number;
  risk_cluster: string | null;
  affected_skus: string[];
}

interface HistoricMessage {
  channel: "outlook" | "teams";
  sender: string;
  recipient: string;
  subject: string | null;
  body: string;
  offset: SeedOffset;
  read_status: number;
  thread_id: string | null;
}

interface HistoricKpiEntry {
  kpi_name: string;
  value: number;
  offset: SeedOffset;
}

interface HistoricEscalation {
  level: number;
  trigger_kpi: string;
  trigger_value: number;
  threshold: number;
  channel: string;
  offset: SeedOffset;
}

// ─── Internal Role Contacts ─────────────────────────────────────────────────

const INTERNAL_CONTACTS: Record<string, { name: string; email: string }> = {
  sc_coordinator: { name: "Sandra Klein", email: "sandra.klein@aldi-sued.de" },
  logistics: { name: "Thomas Müller", email: "thomas.mueller@aldi-sued.de" },
  assortment_planning: {
    name: "Peter Hoffmann",
    email: "peter.hoffmann@aldi-sued.de",
  },
  store_replenishment: {
    name: "Julia Braun",
    email: "julia.braun@aldi-sued.de",
  },
};

const SUPPLIER_CONTACTS: Record<string, { name: string; email: string }> = {
  geo_energy_transport: {
    name: "NewCoffee Trading GmbH",
    email: "kontakt@newcoffee-trading.com",
  },
  climate_agri_fresh: {
    name: "FreshFruit Import GmbH",
    email: "info@freshfruit-import.com",
  },
  default: { name: "External Supplier", email: "kontakt@lieferant.de" },
};

// ─── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Activates Pre-Aged mode for a given disruption scenario.
 * Generates all intermediate escalation steps retroactively so the Buyer
 * (Markus Weber) sees a fully developed situation on first login.
 *
 * @param scenarioId - The key of the disruption scenario (e.g. "scenario_recall")
 * @param db - The SQLite database instance
 */
export async function activatePreAgedMode(
  scenarioId: string,
  db: Database.Database,
): Promise<void> {
  const scenario = getScenarioConfig(scenarioId, db);
  const anchorDate = getAnchorDate(db);

  // 1. Historische KPI-Verschlechterung generieren
  await generateHistoricKpiDecline(db, scenario, anchorDate);

  // 2. Historische Nachrichten generieren (Intern + Lieferant)
  await generateHistoricMessages(db, scenario, anchorDate);

  // 3. Eskalationseinträge generieren
  await generateHistoricEscalations(db, scenario, anchorDate);

  // 4. Zustand auf "Buyer sieht es zum ersten Mal" setzen
  await setCurrentStateForBuyer(db, scenario, anchorDate);

  // Mark pre-aged mode as active in demo_config
  db.prepare(
    `INSERT OR REPLACE INTO demo_config (key, value) VALUES ('pre_aged_mode', 'true')`,
  ).run();
  db.prepare(
    `INSERT OR REPLACE INTO demo_config (key, value) VALUES ('pre_aged_scenario', ?)`,
  ).run(JSON.stringify(scenarioId));
}

// ─── Helper: Load Scenario Config ───────────────────────────────────────────

/**
 * Loads the scenario configuration from demo_config or falls back to
 * the hardcoded DISRUPTION_SCENARIOS list.
 */
export function getScenarioConfig(
  scenarioId: string,
  db: Database.Database,
): ScenarioConfig {
  // Try loading from demo_config
  const row = db
    .prepare(`SELECT value FROM demo_config WHERE key = ?`)
    .get(scenarioId) as { value: string } | undefined;

  if (row) {
    return JSON.parse(row.value) as ScenarioConfig;
  }

  // Fallback: find in hardcoded scenarios by matching the key pattern
  const scenarioType = scenarioId.replace("scenario_", "");
  const found = DISRUPTION_SCENARIOS.find(
    (s) => s.id === scenarioType || s.id === scenarioId,
  );

  if (found) {
    return {
      type: found.id,
      label: found.name,
      margin_impact_bps: found.marginImpactBps,
      duration_days: found.defaultDuration,
      probability: 0.1,
      risk_cluster: found.riskCluster,
      affected_skus: [],
    };
  }

  throw new Error(`Unknown scenario: ${scenarioId}`);
}

/**
 * Reads the anchor_date from demo_config and returns it as a Date object.
 */
export function getAnchorDate(db: Database.Database): Date {
  const row = db
    .prepare(`SELECT value FROM demo_config WHERE key = 'anchor_date'`)
    .get() as { value: string } | undefined;

  if (row) {
    const dateStr = JSON.parse(row.value);
    return new Date(dateStr + "T00:00:00.000Z");
  }

  // Fallback to today at midnight UTC
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
  );
}

// ─── 1. Historic KPI Decline ────────────────────────────────────────────────

/**
 * Generates progressive KPI deterioration over the scenario's duration.
 * The decline starts subtly and accelerates, simulating realistic detection patterns.
 *
 * Timeline: From (anchorDate - duration_days) to anchorDate
 * KPIs affected depend on the scenario type.
 */
export async function generateHistoricKpiDecline(
  db: Database.Database,
  scenario: ScenarioConfig,
  anchorDate: Date,
): Promise<void> {
  const entries = computeKpiDeclineEntries(scenario, anchorDate);

  const insertKpi = db.prepare(
    `INSERT INTO kpi_states (kpi_name, value, timestamp, role_id)
     VALUES (?, ?, ?, ?)`,
  );

  const insertMany = db.transaction(() => {
    for (const entry of entries) {
      const timestamp = computeTimestamp(anchorDate, entry.offset);
      insertKpi.run(entry.kpi_name, entry.value, timestamp, null);
    }
  });

  insertMany();
}

/**
 * Computes the KPI decline entries for a scenario.
 * Uses an exponential degradation curve: small changes first, larger changes later.
 */
export function computeKpiDeclineEntries(
  scenario: ScenarioConfig,
  anchorDate: Date,
): HistoricKpiEntry[] {
  const entries: HistoricKpiEntry[] = [];
  const disruptionScenario = resolveDisruptionScenario(scenario);

  if (!disruptionScenario) return entries;

  // Determine how many days of decline to generate (max 14 days lookback for realism)
  const declineDays = Math.min(scenario.duration_days, 14);

  // KPI baselines (normal values)
  const baselines: Record<KpiType, number> = {
    otd: 0.96,
    osa: 0.975,
    cost_deviation: 0.02,
    mape: 0.11,
  };

  // For each affected KPI, generate progressive decline
  for (const kpi of disruptionScenario.affectedKpis) {
    const baseline = baselines[kpi];
    const maxImpact = computeMaxImpactForKpi(kpi, scenario.margin_impact_bps);

    for (let day = -declineDays; day <= -1; day++) {
      // Progress from 0 to 1 over the decline period
      const progress = (day + declineDays) / declineDays;
      // Exponential curve: slow start, fast end
      const degradation = maxImpact * Math.pow(progress, 1.5);

      let value: number;
      if (kpi === "otd" || kpi === "osa") {
        value = baseline - degradation;
      } else {
        value = baseline + degradation;
      }
      value = Math.round(value * 10000) / 10000;

      entries.push({
        kpi_name: kpi,
        value,
        offset: { days: day, hours: 9, minutes: 0 },
      });
    }
  }

  return entries;
}

// ─── 2. Historic Messages ───────────────────────────────────────────────────

/**
 * Generates a realistic sequence of internal and external messages
 * that would have been exchanged during the escalation period.
 *
 * Message timeline:
 * - Day -(duration): Supplier first reports issue (external)
 * - Day -(duration-1): Logistics notices impact (internal)
 * - Day -(duration/2): SC Coordinator escalates (internal)
 * - Day -(duration/3): Further supplier update (external)
 * - Day -2: Coverage warning from replenishment (internal)
 * - Day -1: Final escalation to buyer (internal)
 *
 * All timestamps within business hours (08:00-18:00).
 */
export async function generateHistoricMessages(
  db: Database.Database,
  scenario: ScenarioConfig,
  anchorDate: Date,
): Promise<void> {
  const messages = computeHistoricMessages(scenario, anchorDate);

  const insertMsg = db.prepare(
    `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction(() => {
    for (const msg of messages) {
      const timestamp = computeTimestamp(anchorDate, msg.offset);
      insertMsg.run(
        msg.channel,
        msg.sender,
        msg.recipient,
        msg.subject,
        msg.body,
        timestamp,
        msg.read_status,
        msg.thread_id,
      );
    }
  });

  insertMany();
}

/**
 * Computes the historic messages for a scenario.
 * Returns a chronologically ordered sequence of internal and external emails.
 * All offsets are guaranteed to be strictly before the anchor date (negative).
 */
export function computeHistoricMessages(
  scenario: ScenarioConfig,
  _anchorDate: Date,
): HistoricMessage[] {
  const messages: HistoricMessage[] = [];
  const declineDays = Math.min(scenario.duration_days, 14);
  const threadId = `thread-preaged-${scenario.type}`;
  const buyerEmail = "markus.weber@aldi-sued.de";

  // Resolve supplier contact based on risk cluster
  const supplier =
    SUPPLIER_CONTACTS[scenario.risk_cluster ?? "default"] ??
    SUPPLIER_CONTACTS.default;

  // Ensure minimum spread: for very short scenarios, compress all messages
  // into the available window while keeping them strictly before anchor date.
  // All day offsets must be <= -1 to stay before anchor date.

  // ── Message 1: Initial supplier notification (external, oldest) ──
  // Always at the start of the decline window
  const msg1Day = -declineDays;
  messages.push({
    channel: "outlook",
    sender: supplier.email,
    recipient: buyerEmail,
    subject: `Supplier Notice: ${scenario.label}`,
    body: `Dear Mr. Weber,\n\nwe would like to inform you about a potential disruption in our supply chain.\n\nType of disruption: ${scenario.label}\nExpected duration: ${scenario.duration_days} days\n${scenario.affected_skus.length > 0 ? `Affected items: ${scenario.affected_skus.join(", ")}\n` : ""}\nWe will keep you updated on further developments.\n\nBest regards,\n${supplier.name}`,
    offset: { days: msg1Day, hours: 10, minutes: 15 },
    read_status: 1,
    thread_id: threadId,
  });

  // ── Message 2: Logistics notices KPI impact (internal, Teams) ──
  // One day after the initial report, but clamped to stay before anchor
  const msg2Day = Math.min(-declineDays + 1, -1);
  messages.push({
    channel: "teams",
    sender: INTERNAL_CONTACTS.logistics.email,
    recipient: buyerEmail,
    subject: null,
    body: `Hi Markus, quick heads-up: We're seeing initial supply chain impacts from "${scenario.label}". OTD values in that area are slightly weakening. Keeping an eye on it.`,
    offset: {
      days: msg2Day,
      hours: 11,
      minutes: 30,
    },
    read_status: 1,
    thread_id: `thread-preaged-teams-${scenario.type}`,
  });

  // ── Message 3: SC Coordinator internal assessment (internal, Outlook) ──
  // At roughly the midpoint, clamped to stay before anchor
  const midpoint = Math.min(
    Math.max(-Math.floor(declineDays / 2), -declineDays + 2),
    -1,
  );
  messages.push({
    channel: "outlook",
    sender: INTERNAL_CONTACTS.sc_coordinator.email,
    recipient: buyerEmail,
    subject: `SC Coordinator Update: ${scenario.label} – Situation Assessment`,
    body: `Hi Markus,\n\nI've analyzed the situation with ${supplier.name}. The disruption "${scenario.label}" is affecting ${scenario.affected_skus.length || "several"} items.\n\nCurrent assessment:\n- Margin impact: approx. ${scenario.margin_impact_bps} basis points\n- Expected duration: ${scenario.duration_days} days\n- Coverage days for some SKUs declining\n\nRecommendation: Please check alternative suppliers. If the situation doesn't improve within 48h, we should escalate.\n\nBest, Sandra`,
    offset: { days: midpoint, hours: 14, minutes: 45 },
    read_status: 1,
    thread_id: threadId,
  });

  // ── Message 4: Supplier follow-up update (external) ──
  // At roughly 2/3 through the period, clamped to stay before anchor
  const followUpDay = Math.min(
    Math.max(-Math.floor(declineDays / 3), -declineDays + 3),
    -1,
  );
  messages.push({
    channel: "outlook",
    sender: supplier.email,
    recipient: buyerEmail,
    subject: `Update: ${scenario.label} – Current Development`,
    body: `Dear Mr. Weber,\n\nwe would like to update you on the current status.\n\nUnfortunately the situation has not improved yet. We are working on solutions and expect an improvement in ${Math.ceil(scenario.duration_days / 2)} days.\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n${supplier.name}`,
    offset: { days: followUpDay, hours: 9, minutes: 30 },
    read_status: 1,
    thread_id: threadId,
  });

  // ── Message 5: Filialnachbestellung Coverage-Warning (internal) ──
  // Day -2, but clamped to be within the decline window
  const msg5Day = Math.max(-2, -declineDays);
  messages.push({
    channel: "outlook",
    sender: INTERNAL_CONTACTS.store_replenishment.email,
    recipient: buyerEmail,
    subject: `Coverage Days Warning: ${scenario.label}`,
    body: `Hi Markus,\n\nthe WMS reports coverage days below threshold (< 3 days) for several affected SKUs.\n\nAuto-replenishment alone cannot compensate for the gap. Please advise on next steps.\n\nBest, Julia`,
    offset: { days: msg5Day, hours: 8, minutes: 45 },
    read_status: 0,
    thread_id: threadId,
  });

  // ── Message 6: SC Coordinator escalation (internal, formal) ──
  messages.push({
    channel: "outlook",
    sender: INTERNAL_CONTACTS.sc_coordinator.email,
    recipient: buyerEmail,
    subject: `ESCALATION: ${scenario.label} – Thresholds Exceeded`,
    body: `Hi Markus,\n\nKPI thresholds have been exceeded and an escalation has been triggered.\n\nDetails:\n- Disruption: ${scenario.label}\n- Margin impact: ${scenario.margin_impact_bps} bps\n- Affected SKUs: ${scenario.affected_skus.length || "several"}\n- Urgency: High\n\nPlease review the situation in your systems (SAP, WMS) and initiate countermeasures.\n\nBest, Sandra`,
    offset: { days: -1, hours: 9, minutes: 15 },
    read_status: 0,
    thread_id: threadId,
  });

  // Sort messages chronologically by offset to ensure ordering
  messages.sort((a, b) => {
    const aMs =
      a.offset.days * 24 * 60 +
      (a.offset.hours ?? 0) * 60 +
      (a.offset.minutes ?? 0);
    const bMs =
      b.offset.days * 24 * 60 +
      (b.offset.hours ?? 0) * 60 +
      (b.offset.minutes ?? 0);
    return aMs - bMs;
  });

  return messages;
}

// ─── 3. Historic Escalations ────────────────────────────────────────────────

/**
 * Generates escalation entries that correspond to the KPI deterioration.
 * These represent escalations that would have been triggered as KPIs crossed thresholds.
 */
export async function generateHistoricEscalations(
  db: Database.Database,
  scenario: ScenarioConfig,
  anchorDate: Date,
): Promise<void> {
  const escalations = computeHistoricEscalations(scenario, anchorDate);

  const insertEsc = db.prepare(
    `INSERT INTO escalations (level, trigger_kpi, trigger_value, threshold, channel, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction(() => {
    for (const esc of escalations) {
      const timestamp = computeTimestamp(anchorDate, esc.offset);
      insertEsc.run(
        esc.level,
        esc.trigger_kpi,
        esc.trigger_value,
        esc.threshold,
        esc.channel,
        timestamp,
      );
    }
  });

  insertMany();
}

/**
 * Computes the escalation entries based on when KPIs would have crossed thresholds.
 */
export function computeHistoricEscalations(
  scenario: ScenarioConfig,
  _anchorDate: Date,
): HistoricEscalation[] {
  const escalations: HistoricEscalation[] = [];
  const disruptionScenario = resolveDisruptionScenario(scenario);

  if (!disruptionScenario) return escalations;

  const declineDays = Math.min(scenario.duration_days, 14);

  // For each affected KPI, determine when it would cross the escalation threshold
  for (const kpi of disruptionScenario.affectedKpis) {
    const rule = DEFAULT_ESCALATION_RULES.find((r) => r.kpi === kpi);
    if (!rule) continue;

    // Find the day when the threshold would be crossed
    const crossingDay = computeThresholdCrossingDay(
      kpi,
      scenario.margin_impact_bps,
      declineDays,
      rule,
    );

    if (crossingDay === null) continue;

    // Compute the trigger value at the crossing point
    const triggerValue = computeKpiValueAtDay(
      kpi,
      scenario.margin_impact_bps,
      declineDays,
      crossingDay,
    );

    // Determine channel based on expected resolution time
    // Short scenarios (< 3 days) use teams, longer use outlook
    const channel = scenario.duration_days < 3 ? "teams" : "outlook";

    escalations.push({
      level: rule.level,
      trigger_kpi: kpi,
      trigger_value: Math.round(triggerValue * 10000) / 10000,
      threshold: rule.threshold,
      channel,
      offset: { days: crossingDay, hours: 9, minutes: 30 },
    });
  }

  // Sort chronologically
  escalations.sort((a, b) => {
    const aDays = a.offset.days + (a.offset.hours ?? 0) / 24;
    const bDays = b.offset.days + (b.offset.hours ?? 0) / 24;
    return aDays - bDays;
  });

  return escalations;
}

// ─── 4. Set State for Buyer ─────────────────────────────────────────────────

/**
 * Sets the current simulation state so the Buyer sees the escalated situation
 * "for the first time". This includes:
 * - Marking older messages as read (the Buyer hasn't seen the latest escalation)
 * - Ensuring the latest messages (escalation notification) are unread
 * - Inserting the disruption event into the events queue
 */
export async function setCurrentStateForBuyer(
  db: Database.Database,
  scenario: ScenarioConfig,
  anchorDate: Date,
): Promise<void> {
  // Insert a disruption event as the active scenario
  const eventPayload = JSON.stringify({
    type: scenario.type,
    affected_skus: scenario.affected_skus,
    duration: scenario.duration_days,
    margin_impact: scenario.margin_impact_bps,
  });

  const eventTimestamp = computeTimestamp(anchorDate, {
    days: -Math.min(scenario.duration_days, 14),
    hours: 8,
    minutes: 0,
  });

  db.prepare(
    `INSERT INTO events (timestamp, type, source_role, target_role, payload, status, scenario_id)
     VALUES (?, 'disruption', 'system', NULL, ?, 'completed', ?)`,
  ).run(eventTimestamp, eventPayload, scenario.type);

  // Set current KPI values to the degraded state (latest point in decline)
  const disruptionScenario = resolveDisruptionScenario(scenario);
  if (disruptionScenario) {
    const baselines: Record<KpiType, number> = {
      otd: 0.96,
      osa: 0.975,
      cost_deviation: 0.02,
      mape: 0.11,
    };

    const insertKpi = db.prepare(
      `INSERT INTO kpi_states (kpi_name, value, timestamp, role_id)
       VALUES (?, ?, ?, ?)`,
    );

    const nowTimestamp = computeTimestamp(anchorDate, {
      days: 0,
      hours: 8,
      minutes: 0,
    });

    for (const kpi of disruptionScenario.affectedKpis) {
      const baseline = baselines[kpi];
      const maxImpact = computeMaxImpactForKpi(kpi, scenario.margin_impact_bps);

      let currentValue: number;
      if (kpi === "otd" || kpi === "osa") {
        currentValue = baseline - maxImpact;
      } else {
        currentValue = baseline + maxImpact;
      }
      currentValue = Math.round(currentValue * 10000) / 10000;

      insertKpi.run(kpi, currentValue, nowTimestamp, null);
    }
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Resolves the full DisruptionScenario definition from a ScenarioConfig.
 * Handles the naming mismatch between seed.ts types and disruption.ts IDs.
 */
function resolveDisruptionScenario(
  config: ScenarioConfig,
): DisruptionScenario | undefined {
  // Direct match by type or cleaned type
  const directMatch = DISRUPTION_SCENARIOS.find(
    (s) =>
      s.id === config.type || s.id === config.type.replace("scenario_", ""),
  );
  if (directMatch) return directMatch;

  // Mapping from seed.ts type names to disruption.ts ids
  const TYPE_TO_ID: Record<string, string> = {
    recall: "rueckruf",
    packaging_change: "verpackungsaenderung",
    seasonal_peaks: "saisonale_spitzen",
    it_outage: "it_ausfall",
    extreme_weather: "extremwetter",
    minimum_wage_increase: "mindestlohnerhoehung",
    supply_chain_disruption: "lieferketten_disruption",
    pandemic: "pandemie",
  };

  const mappedId = TYPE_TO_ID[config.type];
  if (mappedId) {
    return DISRUPTION_SCENARIOS.find((s) => s.id === mappedId);
  }

  // Try matching by margin impact as last resort
  return DISRUPTION_SCENARIOS.find(
    (s) => s.marginImpactBps === config.margin_impact_bps,
  );
}

/**
 * Computes the maximum KPI impact based on margin_impact_bps.
 * Uses the same BPS_TO_KPI_SCALE and MAX_KPI_IMPACT as disruption.ts.
 */
function computeMaxImpactForKpi(kpi: KpiType, marginImpactBps: number): number {
  const BPS_TO_KPI_SCALE = 0.001;
  const MAX_KPI_IMPACT: Record<KpiType, number> = {
    otd: 0.25,
    osa: 0.2,
    cost_deviation: 0.15,
    mape: 0.3,
  };

  const rawImpact = marginImpactBps * BPS_TO_KPI_SCALE;
  return Math.min(rawImpact, MAX_KPI_IMPACT[kpi]);
}

/**
 * Determines the day (relative to anchorDate) when a KPI first crosses
 * its escalation threshold during the decline period.
 *
 * Returns null if the KPI never crosses the threshold within the decline period.
 */
function computeThresholdCrossingDay(
  kpi: KpiType,
  marginImpactBps: number,
  declineDays: number,
  rule: EscalationRule,
): number | null {
  const baselines: Record<KpiType, number> = {
    otd: 0.96,
    osa: 0.975,
    cost_deviation: 0.02,
    mape: 0.11,
  };

  const baseline = baselines[kpi];
  const maxImpact = computeMaxImpactForKpi(kpi, marginImpactBps);

  // Simulate each day to find when threshold is crossed
  for (let day = -declineDays; day <= -1; day++) {
    const progress = (day + declineDays) / declineDays;
    const degradation = maxImpact * Math.pow(progress, 1.5);

    let value: number;
    if (kpi === "otd" || kpi === "osa") {
      value = baseline - degradation;
    } else {
      value = baseline + degradation;
    }

    const breached =
      rule.direction === "below"
        ? value < rule.threshold
        : value > rule.threshold;

    if (breached) {
      return day;
    }
  }

  return null;
}

/**
 * Computes the KPI value at a specific day in the decline curve.
 */
function computeKpiValueAtDay(
  kpi: KpiType,
  marginImpactBps: number,
  declineDays: number,
  day: number,
): number {
  const baselines: Record<KpiType, number> = {
    otd: 0.96,
    osa: 0.975,
    cost_deviation: 0.02,
    mape: 0.11,
  };

  const baseline = baselines[kpi];
  const maxImpact = computeMaxImpactForKpi(kpi, marginImpactBps);
  const progress = (day + declineDays) / declineDays;
  const degradation = maxImpact * Math.pow(progress, 1.5);

  if (kpi === "otd" || kpi === "osa") {
    return baseline - degradation;
  } else {
    return baseline + degradation;
  }
}
