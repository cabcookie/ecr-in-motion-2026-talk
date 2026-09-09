/**
 * Unit tests for the Pre-Aged Mode implementation.
 *
 * Tests the core functionality:
 * 1. Historic KPI decline generation
 * 2. Historic messages generation (internal + external)
 * 3. Escalation entries generation
 * 4. Setting state for buyer's first view
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  activatePreAgedMode,
  getScenarioConfig,
  getAnchorDate,
  computeKpiDeclineEntries,
  computeHistoricMessages,
  computeHistoricEscalations,
} from "./pre-aged.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "../../db/src/schema.sql");

function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  return db;
}

function seedTestConfig(db: Database.Database): void {
  const insertConfig = db.prepare(
    "INSERT OR REPLACE INTO demo_config (key, value) VALUES (?, ?)",
  );
  insertConfig.run("anchor_date", JSON.stringify("2025-07-14"));
  insertConfig.run("pre_aged_mode", "false");
  insertConfig.run("buyer_role_id", JSON.stringify("buyer"));
  insertConfig.run("polling_interval_ms", "10000");

  // Insert a disruption scenario
  insertConfig.run(
    "scenario_supply_chain_disruption",
    JSON.stringify({
      type: "supply_chain_disruption",
      label: "Supply Chain Disruption",
      margin_impact_bps: 50,
      duration_days: 30,
      probability: 0.15,
      risk_cluster: "geo_energy_transport",
      affected_skus: ["3101", "3102", "3103", "5101", "5107"],
    }),
  );

  insertConfig.run(
    "scenario_it_outage",
    JSON.stringify({
      type: "it_outage",
      label: "IT-Ausfall",
      margin_impact_bps: 25,
      duration_days: 3,
      probability: 0.1,
      risk_cluster: null,
      affected_skus: ["7101", "7102", "7103", "7104"],
    }),
  );

  // Insert buyer role
  db.prepare(
    `INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval)
     VALUES ('buyer', 'Procurement', 'Markus Weber', 'Responsible for 54-60 SKUs', '["sap_ariba","outlook","teams"]', 10000)`,
  ).run();
}

describe("Pre-Aged Mode", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    seedTestConfig(db);
  });

  afterEach(() => {
    db.close();
  });

  describe("getScenarioConfig", () => {
    it("loads scenario from demo_config", () => {
      const config = getScenarioConfig("scenario_supply_chain_disruption", db);
      expect(config.type).toBe("supply_chain_disruption");
      expect(config.label).toBe("Supply Chain Disruption");
      expect(config.margin_impact_bps).toBe(50);
      expect(config.duration_days).toBe(30);
      expect(config.risk_cluster).toBe("geo_energy_transport");
      expect(config.affected_skus).toEqual([
        "3101",
        "3102",
        "3103",
        "5101",
        "5107",
      ]);
    });

    it("throws for unknown scenario", () => {
      expect(() => getScenarioConfig("scenario_unknown", db)).toThrow(
        "Unknown scenario",
      );
    });
  });

  describe("getAnchorDate", () => {
    it("reads anchor date from demo_config", () => {
      const anchorDate = getAnchorDate(db);
      expect(anchorDate.toISOString()).toBe("2025-07-14T00:00:00.000Z");
    });

    it("falls back to today if not configured", () => {
      db.prepare("DELETE FROM demo_config WHERE key = 'anchor_date'").run();
      const anchorDate = getAnchorDate(db);
      const today = new Date();
      expect(anchorDate.getFullYear()).toBe(today.getFullYear());
      expect(anchorDate.getMonth()).toBe(today.getMonth());
      expect(anchorDate.getDate()).toBe(today.getDate());
    });
  });

  describe("computeKpiDeclineEntries", () => {
    it("generates KPI entries for affected KPIs", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const entries = computeKpiDeclineEntries(scenario, anchorDate);

      expect(entries.length).toBeGreaterThan(0);

      // Lieferketten-Disruption affects otd, osa, cost_deviation, mape
      const kpiNames = [...new Set(entries.map((e) => e.kpi_name))];
      expect(kpiNames).toContain("otd");
      expect(kpiNames).toContain("osa");
      expect(kpiNames).toContain("cost_deviation");
      expect(kpiNames).toContain("mape");
    });

    it("generates declining values over time", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const entries = computeKpiDeclineEntries(scenario, anchorDate);

      // For OTD (should decrease), first value should be higher than last
      const otdEntries = entries.filter((e) => e.kpi_name === "otd");
      expect(otdEntries[0].value).toBeGreaterThan(
        otdEntries[otdEntries.length - 1].value,
      );
    });

    it("limits decline period to max 14 days", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const entries = computeKpiDeclineEntries(scenario, anchorDate);

      // All offsets should be between -14 and -1
      for (const entry of entries) {
        expect(entry.offset.days).toBeGreaterThanOrEqual(-14);
        expect(entry.offset.days).toBeLessThanOrEqual(-1);
      }
    });

    it("all timestamps are within business hours", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const entries = computeKpiDeclineEntries(scenario, anchorDate);

      for (const entry of entries) {
        const hour = entry.offset.hours ?? 0;
        expect(hour).toBeGreaterThanOrEqual(8);
        expect(hour).toBeLessThan(18);
      }
    });
  });

  describe("computeHistoricMessages", () => {
    it("generates a mix of internal and external messages", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const messages = computeHistoricMessages(scenario, anchorDate);

      expect(messages.length).toBeGreaterThanOrEqual(4);

      // Should have external messages (not @aldi-sued.de)
      const external = messages.filter(
        (m) => !m.sender.endsWith("@aldi-sued.de"),
      );
      expect(external.length).toBeGreaterThanOrEqual(1);

      // Should have internal messages (@aldi-sued.de)
      const internal = messages.filter((m) =>
        m.sender.endsWith("@aldi-sued.de"),
      );
      expect(internal.length).toBeGreaterThanOrEqual(1);
    });

    it("all messages are chronologically ordered before anchor date", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const messages = computeHistoricMessages(scenario, anchorDate);

      // All offsets should be negative (before anchor date)
      for (const msg of messages) {
        expect(msg.offset.days).toBeLessThanOrEqual(-1);
      }

      // Should be chronologically ordered (earliest first)
      for (let i = 1; i < messages.length; i++) {
        const prevTime =
          messages[i - 1].offset.days * 24 * 60 +
          (messages[i - 1].offset.hours ?? 0) * 60 +
          (messages[i - 1].offset.minutes ?? 0);
        const currTime =
          messages[i].offset.days * 24 * 60 +
          (messages[i].offset.hours ?? 0) * 60 +
          (messages[i].offset.minutes ?? 0);
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it("all message timestamps are within business hours (08:00-18:00)", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const messages = computeHistoricMessages(scenario, anchorDate);

      for (const msg of messages) {
        const hour = msg.offset.hours ?? 0;
        expect(hour).toBeGreaterThanOrEqual(8);
        expect(hour).toBeLessThan(18);
      }
    });

    it("external messages use non-ALDI email address", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const messages = computeHistoricMessages(scenario, anchorDate);

      const externalMessages = messages.filter(
        (m) => !m.sender.endsWith("@aldi-sued.de"),
      );
      for (const msg of externalMessages) {
        expect(msg.channel).toBe("outlook");
        expect(msg.sender).not.toContain("@aldi-sued.de");
      }
    });

    it("internal messages use vorname.nachname@aldi-sued.de format", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const messages = computeHistoricMessages(scenario, anchorDate);

      const internalMessages = messages.filter((m) =>
        m.sender.endsWith("@aldi-sued.de"),
      );
      for (const msg of internalMessages) {
        expect(msg.sender).toMatch(/^[a-z]+\.[a-z]+@aldi-sued\.de$/);
      }
    });
  });

  describe("computeHistoricEscalations", () => {
    it("generates escalation entries for scenarios with threshold breaches", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const escalations = computeHistoricEscalations(scenario, anchorDate);

      expect(escalations.length).toBeGreaterThan(0);

      // Each escalation should have valid fields
      for (const esc of escalations) {
        expect(esc.level).toBeGreaterThanOrEqual(1);
        expect(esc.level).toBeLessThanOrEqual(3);
        expect(esc.trigger_kpi).toBeTruthy();
        expect(typeof esc.trigger_value).toBe("number");
        expect(typeof esc.threshold).toBe("number");
        expect(["teams", "outlook"]).toContain(esc.channel);
      }
    });

    it("escalation timestamps are before anchor date", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const escalations = computeHistoricEscalations(scenario, anchorDate);

      for (const esc of escalations) {
        expect(esc.offset.days).toBeLessThan(0);
      }
    });

    it("escalations are chronologically ordered", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const escalations = computeHistoricEscalations(scenario, anchorDate);

      for (let i = 1; i < escalations.length; i++) {
        const prevTime =
          escalations[i - 1].offset.days * 24 * 60 +
          (escalations[i - 1].offset.hours ?? 0) * 60 +
          (escalations[i - 1].offset.minutes ?? 0);
        const currTime =
          escalations[i].offset.days * 24 * 60 +
          (escalations[i].offset.hours ?? 0) * 60 +
          (escalations[i].offset.minutes ?? 0);
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it("uses teams channel for short scenarios", () => {
      const scenario = getScenarioConfig("scenario_it_outage", db);
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const escalations = computeHistoricEscalations(scenario, anchorDate);

      // IT outage has duration_days=3, so channel should be "teams"
      for (const esc of escalations) {
        expect(esc.channel).toBe("teams");
      }
    });

    it("uses outlook channel for longer scenarios", () => {
      const scenario = getScenarioConfig(
        "scenario_supply_chain_disruption",
        db,
      );
      const anchorDate = new Date("2025-07-14T00:00:00.000Z");
      const escalations = computeHistoricEscalations(scenario, anchorDate);

      // Supply chain disruption has duration_days=30, so channel should be "outlook"
      for (const esc of escalations) {
        expect(esc.channel).toBe("outlook");
      }
    });
  });

  describe("activatePreAgedMode (integration)", () => {
    it("generates all data types and updates demo_config", async () => {
      await activatePreAgedMode("scenario_supply_chain_disruption", db);

      // Check pre_aged_mode is set to true
      const preAgedRow = db
        .prepare("SELECT value FROM demo_config WHERE key = 'pre_aged_mode'")
        .get() as { value: string };
      expect(preAgedRow.value).toBe("true");

      // Check scenario is recorded
      const scenarioRow = db
        .prepare(
          "SELECT value FROM demo_config WHERE key = 'pre_aged_scenario'",
        )
        .get() as { value: string };
      expect(JSON.parse(scenarioRow.value)).toBe(
        "scenario_supply_chain_disruption",
      );

      // Check KPI entries were generated
      const kpiCount = db
        .prepare("SELECT COUNT(*) as cnt FROM kpi_states")
        .get() as { cnt: number };
      expect(kpiCount.cnt).toBeGreaterThan(0);

      // Check messages were generated
      const msgCount = db
        .prepare("SELECT COUNT(*) as cnt FROM messages")
        .get() as { cnt: number };
      expect(msgCount.cnt).toBeGreaterThan(0);

      // Check escalations were generated
      const escCount = db
        .prepare("SELECT COUNT(*) as cnt FROM escalations")
        .get() as { cnt: number };
      expect(escCount.cnt).toBeGreaterThan(0);

      // Check disruption event was created
      const eventCount = db
        .prepare("SELECT COUNT(*) as cnt FROM events WHERE type = 'disruption'")
        .get() as { cnt: number };
      expect(eventCount.cnt).toBe(1);
    });

    it("generates timestamps before the anchor date", async () => {
      await activatePreAgedMode("scenario_supply_chain_disruption", db);

      const anchorDate = new Date("2025-07-14T00:00:00.000Z");

      // All messages should have timestamps before anchor date
      const messages = db.prepare("SELECT timestamp FROM messages").all() as {
        timestamp: string;
      }[];
      for (const msg of messages) {
        expect(new Date(msg.timestamp).getTime()).toBeLessThanOrEqual(
          anchorDate.getTime(),
        );
      }

      // All escalations should have timestamps before anchor date
      const escalations = db
        .prepare("SELECT created_at FROM escalations")
        .all() as { created_at: string }[];
      for (const esc of escalations) {
        expect(new Date(esc.created_at).getTime()).toBeLessThanOrEqual(
          anchorDate.getTime(),
        );
      }
    });
  });
});
