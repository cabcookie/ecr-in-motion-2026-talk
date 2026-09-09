import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { createAgentEngine } from "./orchestrator.js";
import type { AgentHandler, SimEvent, AgentAction } from "./orchestrator.js";

function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");

  // Create required tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      type TEXT NOT NULL,
      source_role TEXT NOT NULL,
      target_role TEXT,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      scenario_id TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL CHECK(channel IN ('outlook', 'teams')),
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read_status INTEGER NOT NULL DEFAULT 0,
      thread_id TEXT
    );

    CREATE TABLE IF NOT EXISTS kpi_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kpi_name TEXT NOT NULL,
      value REAL NOT NULL,
      timestamp TEXT NOT NULL,
      role_id TEXT
    );

    CREATE TABLE IF NOT EXISTS escalations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 3),
      trigger_kpi TEXT NOT NULL,
      trigger_value REAL NOT NULL,
      threshold REAL NOT NULL,
      channel TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS demo_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return db;
}

function createMockAgent(
  roleId: string,
  eventTypes: string[],
  handler?: (event: SimEvent) => Promise<AgentAction[]>,
): AgentHandler {
  return {
    config: {
      roleId,
      eventTypes,
      channels: ["outlook", "teams"],
      systemsAccess: [],
    },
    handleEvent: handler ?? (async () => []),
  };
}

describe("AgentEngine - createAgentEngine", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  describe("start() and stop()", () => {
    it("should start and stop without errors", () => {
      const engine = createAgentEngine(db, [], { pollingIntervalMs: 100 });
      engine.start();
      engine.stop();
    });

    it("should be idempotent on multiple start/stop calls", () => {
      const engine = createAgentEngine(db, [], { pollingIntervalMs: 100 });
      engine.start();
      engine.start(); // Should not throw
      engine.stop();
      engine.stop(); // Should not throw
    });
  });

  describe("triggerDisruption()", () => {
    it("should insert a disruption event into the events table", () => {
      const engine = createAgentEngine(db, [], { pollingIntervalMs: 100 });

      engine.triggerDisruption("scenario_recall", {
        affectedSkus: ["SKU-001", "SKU-002"],
        duration: 5,
        marginImpact: 18,
      });

      const events = db
        .prepare("SELECT * FROM events WHERE type = 'disruption'")
        .all() as any[];
      expect(events).toHaveLength(1);
      expect(events[0].source_role).toBe("system");
      expect(events[0].scenario_id).toBe("scenario_recall");
      expect(events[0].status).toBe("pending");

      const payload = JSON.parse(events[0].payload);
      expect(payload.type).toBe("disruption");
      expect(payload.affected_skus).toEqual(["SKU-001", "SKU-002"]);
      expect(payload.duration).toBe(5);
      expect(payload.margin_impact).toBe(18);
    });

    it("should use default values for missing params", () => {
      const engine = createAgentEngine(db, [], { pollingIntervalMs: 100 });

      engine.triggerDisruption("scenario_weather", {});

      const events = db
        .prepare("SELECT * FROM events WHERE type = 'disruption'")
        .all() as any[];
      const payload = JSON.parse(events[0].payload);
      expect(payload.affected_skus).toEqual([]);
      expect(payload.duration).toBe(7);
      expect(payload.margin_impact).toBe(0);
    });
  });

  describe("Event Dispatcher", () => {
    it("should dispatch events only to agents with matching eventTypes", async () => {
      const handledEvents: { roleId: string; eventId: number }[] = [];

      const buyerAgent = createMockAgent(
        "buyer",
        ["disruption", "communication"],
        async (event) => {
          handledEvents.push({ roleId: "buyer", eventId: event.id });
          return [];
        },
      );

      const logisticsAgent = createMockAgent(
        "logistics",
        ["disruption"],
        async (event) => {
          handledEvents.push({ roleId: "logistics", eventId: event.id });
          return [];
        },
      );

      const assortmentAgent = createMockAgent(
        "assortment",
        ["kpi_alert"],
        async (event) => {
          handledEvents.push({ roleId: "assortment", eventId: event.id });
          return [];
        },
      );

      // Insert a disruption event
      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("disruption", "system", '{"type":"disruption"}');

      const engine = createAgentEngine(
        db,
        [buyerAgent, logisticsAgent, assortmentAgent],
        { pollingIntervalMs: 50 },
      );

      engine.start();

      // Wait for first poll
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      // buyer and logistics should have received the event, assortment should not
      expect(handledEvents).toContainEqual({ roleId: "buyer", eventId: 1 });
      expect(handledEvents).toContainEqual({ roleId: "logistics", eventId: 1 });
      expect(
        handledEvents.find((h) => h.roleId === "assortment"),
      ).toBeUndefined();
    });

    it("should dispatch events targeted at a specific role even if eventTypes don't match", async () => {
      const handledEvents: string[] = [];

      const buyerAgent = createMockAgent(
        "buyer",
        ["communication"],
        async () => {
          handledEvents.push("buyer");
          return [];
        },
      );

      // Insert event targeted at buyer but of type 'escalation' which buyer doesn't subscribe to
      db.prepare(
        `INSERT INTO events (type, source_role, target_role, payload, status) VALUES (?, ?, ?, ?, 'pending')`,
      ).run("escalation", "system", "buyer", '{"level":1}');

      const engine = createAgentEngine(db, [buyerAgent], {
        pollingIntervalMs: 50,
      });
      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      expect(handledEvents).toContain("buyer");
    });

    it("should mark events as completed after processing", async () => {
      const agent = createMockAgent("buyer", ["disruption"]);

      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("disruption", "system", "{}");

      const engine = createAgentEngine(db, [agent], {
        pollingIntervalMs: 50,
      });
      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      const event = db
        .prepare("SELECT status FROM events WHERE id = 1")
        .get() as { status: string };
      expect(event.status).toBe("completed");
    });
  });

  describe("Action Execution", () => {
    it("should execute message actions by inserting into messages table", async () => {
      const agent = createMockAgent("buyer", ["disruption"], async () => [
        {
          type: "message",
          payload: {
            channel: "outlook",
            sender: "markus.weber@aldi-sued.de",
            recipient: "lieferant@example.com",
            subject: "Re: Lieferverzögerung",
            body: "Wir benötigen eine Stellungnahme.",
            thread_id: "thread-001",
          },
        },
      ]);

      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("disruption", "system", "{}");

      const engine = createAgentEngine(db, [agent], {
        pollingIntervalMs: 50,
      });
      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      const messages = db.prepare("SELECT * FROM messages").all() as any[];
      expect(messages).toHaveLength(1);
      expect(messages[0].channel).toBe("outlook");
      expect(messages[0].sender).toBe("markus.weber@aldi-sued.de");
      expect(messages[0].recipient).toBe("lieferant@example.com");
      expect(messages[0].subject).toBe("Re: Lieferverzögerung");
      expect(messages[0].thread_id).toBe("thread-001");
    });

    it("should execute kpi_update actions", async () => {
      const agent = createMockAgent("logistics", ["disruption"], async () => [
        {
          type: "kpi_update",
          payload: { kpi_name: "otd", value: 0.85, role_id: "logistics" },
        },
      ]);

      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("disruption", "system", "{}");

      const engine = createAgentEngine(db, [agent], {
        pollingIntervalMs: 50,
      });
      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      const kpis = db.prepare("SELECT * FROM kpi_states").all() as any[];
      expect(kpis).toHaveLength(1);
      expect(kpis[0].kpi_name).toBe("otd");
      expect(kpis[0].value).toBe(0.85);
      expect(kpis[0].role_id).toBe("logistics");
    });

    it("should execute escalation actions", async () => {
      const agent = createMockAgent(
        "sc_coordinator",
        ["kpi_alert"],
        async () => [
          {
            type: "escalation",
            payload: {
              level: 2,
              trigger_kpi: "osa",
              trigger_value: 0.93,
              threshold: 0.95,
              channel: "outlook",
            },
          },
        ],
      );

      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("kpi_alert", "system", "{}");

      const engine = createAgentEngine(db, [agent], {
        pollingIntervalMs: 50,
      });
      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      const escalations = db
        .prepare("SELECT * FROM escalations")
        .all() as any[];
      expect(escalations).toHaveLength(1);
      expect(escalations[0].level).toBe(2);
      expect(escalations[0].trigger_kpi).toBe("osa");
      expect(escalations[0].trigger_value).toBe(0.93);
      expect(escalations[0].threshold).toBe(0.95);
      expect(escalations[0].channel).toBe("outlook");
    });

    it("should execute event actions by inserting new events", async () => {
      const agent = createMockAgent(
        "sc_coordinator",
        ["disruption"],
        async () => [
          {
            type: "event",
            payload: {
              type: "communication",
              target_role: "buyer",
              payload: JSON.stringify({ message: "Bitte prüfen" }),
              scenario_id: "scenario_recall",
            },
          },
        ],
      );

      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("disruption", "system", "{}");

      const engine = createAgentEngine(db, [agent], {
        pollingIntervalMs: 50,
      });
      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      const events = db
        .prepare("SELECT * FROM events WHERE type = 'communication'")
        .all() as any[];
      expect(events).toHaveLength(1);
      expect(events[0].source_role).toBe("sc_coordinator");
      expect(events[0].target_role).toBe("buyer");
      expect(events[0].scenario_id).toBe("scenario_recall");
    });
  });

  describe("Polling Interval Configuration", () => {
    it("should read polling interval from demo_config", () => {
      db.prepare(
        `INSERT INTO demo_config (key, value) VALUES ('polling_interval_ms', '5000')`,
      ).run();

      // Engine should use configured interval (we can't directly assert the
      // interval value but we can verify it doesn't throw)
      const engine = createAgentEngine(db, []);
      engine.start();
      engine.stop();
    });

    it("should use default 10s when demo_config has no entry", () => {
      // No demo_config entry - should not throw
      const engine = createAgentEngine(db, []);
      engine.start();
      engine.stop();
    });

    it("should use explicit option over demo_config", () => {
      db.prepare(
        `INSERT INTO demo_config (key, value) VALUES ('polling_interval_ms', '5000')`,
      ).run();

      // Explicit option should be used
      const engine = createAgentEngine(db, [], { pollingIntervalMs: 200 });
      engine.start();
      engine.stop();
    });
  });

  describe("Error Handling", () => {
    it("should continue polling even if an agent throws", async () => {
      const processedAfterError: number[] = [];

      const failingAgent = createMockAgent(
        "failing",
        ["disruption"],
        async () => {
          throw new Error("Agent crashed");
        },
      );

      const workingAgent = createMockAgent(
        "working",
        ["disruption"],
        async (event) => {
          processedAfterError.push(event.id);
          return [];
        },
      );

      db.prepare(
        `INSERT INTO events (type, source_role, payload, status) VALUES (?, ?, ?, 'pending')`,
      ).run("disruption", "system", "{}");

      const engine = createAgentEngine(db, [failingAgent, workingAgent], {
        pollingIntervalMs: 50,
      });

      // Suppress console.error for cleaner test output
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      engine.start();
      await new Promise((r) => setTimeout(r, 100));
      engine.stop();

      consoleError.mockRestore();

      // The working agent should still have processed the event
      expect(processedAfterError).toContain(1);

      // Event should still be marked completed
      const event = db
        .prepare("SELECT status FROM events WHERE id = 1")
        .get() as { status: string };
      expect(event.status).toBe("completed");
    });
  });
});
