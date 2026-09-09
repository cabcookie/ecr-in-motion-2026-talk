/**
 * Integrations-Tests: Simulation API Extensions
 *
 * Testet die Custom Endpoints aus extensions/simulation.js:
 *   GET  /api/simulation/status            – Basis-Statusabfrage
 *   POST /api/simulation/trigger-disruption – Disruption-Event auslösen
 *   POST /api/simulation/reset             – Seed-Daten neu laden
 *
 * Validiert: Anforderungen 10.2, 10.5
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import type { Express } from "express";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createApp } = require("../src/create-app.js");

describe("Simulation Extension Endpoints", () => {
  let db: InstanceType<typeof Database>;
  let app: Express;

  beforeAll(() => {
    db = new Database(":memory:");
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Apply schema
    db.exec(`
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

      CREATE TABLE IF NOT EXISTS demo_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT NOT NULL,
        systems_access TEXT NOT NULL,
        polling_interval INTEGER NOT NULL DEFAULT 10000
      );

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
    `);

    // Seed minimal test data
    db.exec(`
      INSERT INTO demo_config (key, value) VALUES ('anchor_date', '"2025-07-14"');
      INSERT INTO demo_config (key, value) VALUES ('pre_aged_mode', 'false');
      INSERT INTO demo_config (key, value) VALUES ('buyer_role_id', '"buyer"');
      INSERT INTO demo_config (key, value) VALUES ('polling_interval_ms', '10000');

      INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval)
      VALUES ('buyer', 'Einkauf', 'Markus Weber', 'Verantwortlich für 54-60 SKUs', '["sap_ariba","outlook","teams"]', 10000);

      INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
      VALUES ('outlook', 'test@example.de', 'markus.weber@aldi-sued.de', 'Test', 'Testinhalt', '2025-07-13T10:00:00Z', 0, 'thread-1');
    `);

    app = createApp(db);
  });

  afterAll(() => {
    db.close();
  });

  describe("GET /api/simulation/status", () => {
    it("gibt Status-Informationen zurück", async () => {
      const res = await request(app).get("/api/simulation/status");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("running");
      expect(res.body.tables).toContain("messages");
      expect(res.body.tables).toContain("demo_config");
      expect(res.body.tables).toContain("roles");
    });

    it("enthält Tabellen-Zählungen", async () => {
      const res = await request(app).get("/api/simulation/status");

      expect(res.body.counts).toBeDefined();
      expect(res.body.counts.messages).toBeGreaterThanOrEqual(1);
      expect(res.body.counts.demo_config).toBeGreaterThanOrEqual(1);
      expect(res.body.counts.roles).toBeGreaterThanOrEqual(1);
    });

    it("enthält Konfigurationswerte", async () => {
      const res = await request(app).get("/api/simulation/status");

      expect(res.body.config).toBeDefined();
      expect(res.body.config.anchor_date).toBe('"2025-07-14"');
      expect(res.body.config.pre_aged_mode).toBe("false");
    });
  });

  describe("POST /api/simulation/trigger-disruption", () => {
    it("akzeptiert scenarioId und erstellt Disruption-Event", async () => {
      const res = await request(app)
        .post("/api/simulation/trigger-disruption")
        .send({ scenarioId: "extremwetter" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.scenarioId).toBe("extremwetter");
      expect(res.body.message).toBe("Disruption event created");
      expect(res.body.eventId).toBeDefined();
      expect(res.body.payload).toBeDefined();
      expect(res.body.payload.type).toBe("extremwetter");
      expect(res.body.payload.affected_skus).toEqual([]);
      expect(res.body.payload.duration).toBe(7);
      expect(res.body.payload.margin_impact).toBe(30);
    });

    it("akzeptiert optionale params (affectedSkus, duration)", async () => {
      const res = await request(app)
        .post("/api/simulation/trigger-disruption")
        .send({
          scenarioId: "rueckruf",
          params: { affectedSkus: ["SKU-001", "SKU-002"], duration: 5 },
        })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payload.affected_skus).toEqual(["SKU-001", "SKU-002"]);
      expect(res.body.payload.duration).toBe(5);
    });

    it("gibt 400 zurück wenn scenarioId fehlt", async () => {
      const res = await request(app)
        .post("/api/simulation/trigger-disruption")
        .send({})
        .set("Content-Type", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("scenarioId");
    });

    it("gibt 400 zurück bei unbekanntem Szenario", async () => {
      const res = await request(app)
        .post("/api/simulation/trigger-disruption")
        .send({ scenarioId: "unbekannt-xyz" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Unknown scenario");
    });
  });

  describe("POST /api/simulation/reset", () => {
    it("lädt Seed-Daten neu und gibt Erfolg zurück", async () => {
      const res = await request(app)
        .post("/api/simulation/reset")
        .send()
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Seed data reloaded");
    });

    it("stellt 18 Seed-E-Mails nach Reset her", async () => {
      // Reset
      await request(app).post("/api/simulation/reset").send();

      // Verify messages were reloaded
      const res = await request(app).get("/api/tables/messages/rows");
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(18);

      // All should be outlook channel
      for (const msg of res.body.data) {
        expect(msg.channel).toBe("outlook");
      }
    });

    it("stellt demo_config nach Reset her", async () => {
      await request(app).post("/api/simulation/reset").send();

      const res = await request(app).get("/api/tables/demo_config/rows");
      expect(res.status).toBe(200);

      const keys = res.body.data.map((r: { key: string }) => r.key);
      expect(keys).toContain("anchor_date");
      expect(keys).toContain("pre_aged_mode");
      expect(keys).toContain("buyer_role_id");
      expect(keys).toContain("polling_interval_ms");
    });

    it("stellt Buyer-Rolle nach Reset her", async () => {
      await request(app).post("/api/simulation/reset").send();

      const res = await request(app).get("/api/tables/roles/rows");
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].id).toBe("buyer");
      expect(res.body.data[0].display_name).toBe("Markus Weber");
    });
  });

  describe("POST /api/simulation/activate-pre-aged", () => {
    it("aktiviert Pre-Aged-Modus für gültiges Szenario", async () => {
      const res = await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({ scenarioId: "extremwetter" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Pre-aged mode activated");
      expect(res.body.scenarioId).toBe("extremwetter");
    });

    it("setzt pre_aged_mode in demo_config auf true", async () => {
      await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({ scenarioId: "rueckruf" })
        .set("Content-Type", "application/json");

      const configRow = db
        .prepare("SELECT value FROM demo_config WHERE key = 'pre_aged_mode'")
        .get() as { value: string } | undefined;
      expect(configRow).toBeDefined();
      expect(configRow!.value).toBe("true");
    });

    it("generiert historische KPI-Daten", async () => {
      // Clear KPI states first
      db.exec("DELETE FROM kpi_states");

      await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({ scenarioId: "extremwetter" })
        .set("Content-Type", "application/json");

      const kpiRows = db
        .prepare("SELECT COUNT(*) as count FROM kpi_states")
        .get() as { count: number };
      expect(kpiRows.count).toBeGreaterThan(0);
    });

    it("generiert historische Nachrichten", async () => {
      // Count messages before
      const beforeCount = (
        db.prepare("SELECT COUNT(*) as count FROM messages").get() as {
          count: number;
        }
      ).count;

      await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({ scenarioId: "it_ausfall" })
        .set("Content-Type", "application/json");

      const afterCount = (
        db.prepare("SELECT COUNT(*) as count FROM messages").get() as {
          count: number;
        }
      ).count;
      // Pre-aged generates 6 messages
      expect(afterCount).toBeGreaterThan(beforeCount);
    });

    it("generiert Eskalationseinträge", async () => {
      db.exec("DELETE FROM escalations");

      await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({ scenarioId: "lieferketten_disruption" })
        .set("Content-Type", "application/json");

      const escRows = db
        .prepare("SELECT COUNT(*) as count FROM escalations")
        .get() as { count: number };
      expect(escRows.count).toBeGreaterThan(0);
    });

    it("gibt 400 zurück wenn scenarioId fehlt", async () => {
      const res = await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({})
        .set("Content-Type", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("scenarioId");
    });

    it("gibt 500 zurück bei unbekanntem Szenario", async () => {
      const res = await request(app)
        .post("/api/simulation/activate-pre-aged")
        .send({ scenarioId: "nicht-existent-xyz" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/simulation/kpi-history/:kpiName", () => {
    it("gibt KPI-Verlauf für gültigen KPI-Namen zurück", async () => {
      // First insert some KPI data
      const anchorDate = new Date();
      const ts = new Date(
        anchorDate.getTime() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString();
      db.prepare(
        "INSERT INTO kpi_states (kpi_name, value, timestamp, role_id) VALUES (?, ?, ?, ?)",
      ).run("otd", 0.95, ts, null);

      const res = await request(app).get("/api/simulation/kpi-history/otd");

      expect(res.status).toBe(200);
      expect(res.body.kpiName).toBe("otd");
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it("gibt leeres Array zurück wenn keine Daten vorhanden", async () => {
      // Clear kpi_states and query a KPI with no data
      db.exec("DELETE FROM kpi_states");

      const res = await request(app).get("/api/simulation/kpi-history/mape");

      expect(res.status).toBe(200);
      expect(res.body.kpiName).toBe("mape");
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it("gibt nur Daten der letzten 30 Tage zurück", async () => {
      db.exec("DELETE FROM kpi_states");

      // Insert one entry within 30 days
      const recentTs = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString();
      db.prepare(
        "INSERT INTO kpi_states (kpi_name, value, timestamp, role_id) VALUES (?, ?, ?, ?)",
      ).run("osa", 0.97, recentTs, null);

      // Insert one entry older than 30 days
      const oldTs = new Date(
        Date.now() - 45 * 24 * 60 * 60 * 1000,
      ).toISOString();
      db.prepare(
        "INSERT INTO kpi_states (kpi_name, value, timestamp, role_id) VALUES (?, ?, ?, ?)",
      ).run("osa", 0.98, oldTs, null);

      const res = await request(app).get("/api/simulation/kpi-history/osa");

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].value).toBe(0.97);
    });

    it("gibt 400 zurück bei ungültigem KPI-Namen", async () => {
      const res = await request(app).get(
        "/api/simulation/kpi-history/invalid_kpi",
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Invalid KPI name");
    });

    it("unterstützt alle 4 KPI-Typen", async () => {
      const kpis = ["otd", "osa", "cost_deviation", "mape"];
      for (const kpi of kpis) {
        const res = await request(app).get(
          `/api/simulation/kpi-history/${kpi}`,
        );
        expect(res.status).toBe(200);
        expect(res.body.kpiName).toBe(kpi);
      }
    });
  });
});
