import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import {
  evaluateEscalation,
  selectChannel,
  loadEscalationThresholds,
  createEscalationEntry,
  DEFAULT_ESCALATION_RULES,
  EscalationRule,
} from "./escalation.js";

describe("Escalation Logic", () => {
  // ─── Default Rules ──────────────────────────────────────────────────────

  describe("DEFAULT_ESCALATION_RULES", () => {
    it("should contain 4 rules", () => {
      expect(DEFAULT_ESCALATION_RULES).toHaveLength(4);
    });

    it("should define OTD < 0.90 → Level 1 (below)", () => {
      const rule = DEFAULT_ESCALATION_RULES.find((r) => r.kpi === "otd");
      expect(rule).toEqual({
        kpi: "otd",
        threshold: 0.9,
        level: 1,
        direction: "below",
      });
    });

    it("should define cost_deviation > 0.05 → Level 2 (above)", () => {
      const rule = DEFAULT_ESCALATION_RULES.find(
        (r) => r.kpi === "cost_deviation",
      );
      expect(rule).toEqual({
        kpi: "cost_deviation",
        threshold: 0.05,
        level: 2,
        direction: "above",
      });
    });

    it("should define OSA < 0.95 → Level 2 (below)", () => {
      const rule = DEFAULT_ESCALATION_RULES.find((r) => r.kpi === "osa");
      expect(rule).toEqual({
        kpi: "osa",
        threshold: 0.95,
        level: 2,
        direction: "below",
      });
    });

    it("should define MAPE > 0.20 → Level 1 (above)", () => {
      const rule = DEFAULT_ESCALATION_RULES.find((r) => r.kpi === "mape");
      expect(rule).toEqual({
        kpi: "mape",
        threshold: 0.2,
        level: 1,
        direction: "above",
      });
    });
  });

  // ─── evaluateEscalation ─────────────────────────────────────────────────

  describe("evaluateEscalation", () => {
    it("should trigger Level 1 when OTD falls below 90%", () => {
      const result = evaluateEscalation("otd", 0.89);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(1);
      expect(result!.rule.kpi).toBe("otd");
    });

    it("should trigger Level 1 when OTD is exactly at threshold boundary", () => {
      // OTD < 0.90 triggers, so exactly 0.90 should NOT trigger
      const result = evaluateEscalation("otd", 0.9);
      expect(result).toBeNull();
    });

    it("should not trigger when OTD is above 90%", () => {
      const result = evaluateEscalation("otd", 0.95);
      expect(result).toBeNull();
    });

    it("should trigger Level 2 when cost_deviation exceeds 5%", () => {
      const result = evaluateEscalation("cost_deviation", 0.06);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(2);
      expect(result!.rule.kpi).toBe("cost_deviation");
    });

    it("should not trigger when cost_deviation is exactly at 5%", () => {
      // cost_deviation > 0.05 triggers, so exactly 0.05 should NOT trigger
      const result = evaluateEscalation("cost_deviation", 0.05);
      expect(result).toBeNull();
    });

    it("should not trigger when cost_deviation is below 5%", () => {
      const result = evaluateEscalation("cost_deviation", 0.03);
      expect(result).toBeNull();
    });

    it("should trigger Level 2 when OSA falls below 95%", () => {
      const result = evaluateEscalation("osa", 0.94);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(2);
      expect(result!.rule.kpi).toBe("osa");
    });

    it("should not trigger when OSA is at or above 95%", () => {
      expect(evaluateEscalation("osa", 0.95)).toBeNull();
      expect(evaluateEscalation("osa", 0.98)).toBeNull();
    });

    it("should trigger Level 1 when MAPE exceeds 20%", () => {
      const result = evaluateEscalation("mape", 0.21);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(1);
      expect(result!.rule.kpi).toBe("mape");
    });

    it("should not trigger when MAPE is at or below 20%", () => {
      expect(evaluateEscalation("mape", 0.2)).toBeNull();
      expect(evaluateEscalation("mape", 0.15)).toBeNull();
    });

    it("should return null for unknown KPI names", () => {
      const result = evaluateEscalation("unknown_kpi", 0.5);
      expect(result).toBeNull();
    });

    it("should pick the highest level when multiple rules match", () => {
      const customRules: EscalationRule[] = [
        { kpi: "otd", threshold: 0.9, level: 1, direction: "below" },
        { kpi: "otd", threshold: 0.8, level: 3, direction: "below" },
      ];
      // Value 0.75 breaches both rules
      const result = evaluateEscalation("otd", 0.75, customRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(3);
    });

    it("should accept custom rules", () => {
      const customRules: EscalationRule[] = [
        { kpi: "otd", threshold: 0.85, level: 3, direction: "below" },
      ];
      // 0.84 < 0.85, should trigger
      expect(evaluateEscalation("otd", 0.84, customRules)).not.toBeNull();
      // 0.86 > 0.85, should not trigger
      expect(evaluateEscalation("otd", 0.86, customRules)).toBeNull();
    });
  });

  // ─── selectChannel ──────────────────────────────────────────────────────

  describe("selectChannel", () => {
    it("should return 'teams' when resolution time is less than 24 hours", () => {
      expect(selectChannel(1)).toBe("teams");
      expect(selectChannel(12)).toBe("teams");
      expect(selectChannel(23)).toBe("teams");
      expect(selectChannel(23.9)).toBe("teams");
    });

    it("should return 'outlook' when resolution time is 24 hours or more", () => {
      expect(selectChannel(24)).toBe("outlook");
      expect(selectChannel(48)).toBe("outlook");
      expect(selectChannel(72)).toBe("outlook");
    });

    it("should return 'teams' for zero resolution time", () => {
      expect(selectChannel(0)).toBe("teams");
    });
  });

  // ─── Database-dependent tests ───────────────────────────────────────────

  describe("loadEscalationThresholds", () => {
    let db: Database.Database;

    beforeEach(() => {
      db = new Database(":memory:");
      db.exec(`
        CREATE TABLE demo_config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
    });

    afterEach(() => {
      db.close();
    });

    it("should return default rules when no config exists", () => {
      const rules = loadEscalationThresholds(db);
      expect(rules).toEqual(DEFAULT_ESCALATION_RULES);
    });

    it("should return default rules when config value is invalid JSON", () => {
      db.prepare(
        `INSERT INTO demo_config (key, value) VALUES ('escalation_rules', 'not-json')`,
      ).run();
      const rules = loadEscalationThresholds(db);
      expect(rules).toEqual(DEFAULT_ESCALATION_RULES);
    });

    it("should return default rules when config value is empty array", () => {
      db.prepare(
        `INSERT INTO demo_config (key, value) VALUES ('escalation_rules', '[]')`,
      ).run();
      const rules = loadEscalationThresholds(db);
      expect(rules).toEqual(DEFAULT_ESCALATION_RULES);
    });

    it("should load custom rules from demo_config", () => {
      const customRules: EscalationRule[] = [
        { kpi: "otd", threshold: 0.85, level: 2, direction: "below" },
        { kpi: "mape", threshold: 0.15, level: 3, direction: "above" },
      ];
      db.prepare(
        `INSERT INTO demo_config (key, value) VALUES ('escalation_rules', ?)`,
      ).run(JSON.stringify(customRules));

      const rules = loadEscalationThresholds(db);
      expect(rules).toEqual(customRules);
    });
  });

  describe("createEscalationEntry", () => {
    let db: Database.Database;

    beforeEach(() => {
      db = new Database(":memory:");
      db.exec(`
        CREATE TABLE escalations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 3),
          trigger_kpi TEXT NOT NULL,
          trigger_value REAL NOT NULL,
          threshold REAL NOT NULL,
          channel TEXT NOT NULL,
          created_at TEXT NOT NULL,
          resolved_at TEXT
        );
      `);
    });

    afterEach(() => {
      db.close();
    });

    it("should insert an escalation entry into the database", () => {
      createEscalationEntry(db, 1, "otd", 0.88, 0.9, "teams");

      const row = db
        .prepare(`SELECT * FROM escalations WHERE id = 1`)
        .get() as Record<string, unknown>;

      expect(row).toBeDefined();
      expect(row.level).toBe(1);
      expect(row.trigger_kpi).toBe("otd");
      expect(row.trigger_value).toBe(0.88);
      expect(row.threshold).toBe(0.9);
      expect(row.channel).toBe("teams");
      expect(row.created_at).toBeDefined();
      expect(row.resolved_at).toBeNull();
    });

    it("should insert multiple escalation entries", () => {
      createEscalationEntry(db, 1, "otd", 0.88, 0.9, "teams");
      createEscalationEntry(db, 2, "osa", 0.93, 0.95, "outlook");

      const rows = db.prepare(`SELECT * FROM escalations`).all();
      expect(rows).toHaveLength(2);
    });
  });
});
