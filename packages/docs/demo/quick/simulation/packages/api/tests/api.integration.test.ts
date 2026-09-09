/**
 * Integrations-Tests: Soul API + SQLite
 *
 * Testet die CRUD-Endpoints der Soul-kompatiblen REST API
 * mit einer temporären In-Memory SQLite-Datenbank.
 *
 * Validiert: Anforderungen 10.3, 10.4, 10.5
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import type { Express } from "express";

// Import the app factory (CommonJS module)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createApp } = require("../src/create-app.js");

describe("Soul API Integration Tests", () => {
  let db: InstanceType<typeof Database>;
  let app: Express;

  beforeAll(() => {
    // Create in-memory SQLite database with the schema
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
    `);

    // Seed test data
    db.exec(`
      INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
      VALUES
        ('outlook', 'lieferant@example.de', 'markus.weber@aldi-sued.de', 'Lieferverzögerung Charge 4711', 'Sehr geehrter Herr Weber, die Lieferung verzögert sich um 3 Tage.', '2025-07-10T09:30:00Z', 0, 'thread-001'),
        ('outlook', 'anna.schmidt@aldi-sued.de', 'markus.weber@aldi-sued.de', 'Statusbericht KW28', 'Anbei der wöchentliche Statusbericht.', '2025-07-11T14:00:00Z', 1, 'thread-002'),
        ('teams', 'peter.mueller@aldi-sued.de', 'markus.weber@aldi-sued.de', NULL, 'Kurze Info: OTD für Lieferant X ist unter 90% gefallen.', '2025-07-12T08:15:00Z', 0, 'thread-003'),
        ('outlook', 'kontakt@fresh-foods.de', 'markus.weber@aldi-sued.de', 'Preisanpassung Q3', 'Wir müssen die Preise für Q3 anpassen.', '2025-07-12T10:00:00Z', 0, 'thread-004'),
        ('outlook', 'markus.weber@aldi-sued.de', 'lieferant@example.de', 'RE: Lieferverzögerung Charge 4711', 'Vielen Dank für die Information.', '2025-07-10T11:00:00Z', 1, 'thread-001');

      INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval)
      VALUES ('buyer', 'Einkauf', 'Markus Weber', 'Verantwortlich für 54-60 SKUs', '["sap_ariba","outlook","teams"]', 10000);

      INSERT INTO demo_config (key, value)
      VALUES ('anchor_date', '"2025-07-14"'), ('pre_aged_mode', 'false');
    `);

    // Create Express app with the test database
    app = createApp(db);
  });

  afterAll(() => {
    db.close();
  });

  describe("GET /api/tables/messages/rows", () => {
    it("liefert korrekte Daten mit erwarteter Response-Struktur", async () => {
      const res = await request(app).get("/api/tables/messages/rows");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("next");

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBe(5);
      expect(res.body.data).toHaveLength(5);

      // Verify structure of a single message
      const msg = res.body.data[0];
      expect(msg).toHaveProperty("id");
      expect(msg).toHaveProperty("channel");
      expect(msg).toHaveProperty("sender");
      expect(msg).toHaveProperty("recipient");
      expect(msg).toHaveProperty("body");
      expect(msg).toHaveProperty("timestamp");
      expect(msg).toHaveProperty("read_status");
    });

    it("unterstützt Pagination mit _limit und _offset", async () => {
      const res = await request(app)
        .get("/api/tables/messages/rows")
        .query({ _limit: 2, _offset: 0 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(5);
      expect(res.body.next).toEqual({ _offset: 2, _limit: 2 });
    });

    it("filtert nach channel=outlook", async () => {
      const res = await request(app)
        .get("/api/tables/messages/rows")
        .query({ filter: "channel:outlook" });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const msg of res.body.data) {
        expect(msg.channel).toBe("outlook");
      }
      // We have 4 outlook messages in seed data
      expect(res.body.total).toBe(4);
    });

    it("gibt 404 für nicht-existierende Tabelle zurück", async () => {
      const res = await request(app).get("/api/tables/nonexistent/rows");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/tables/messages/rows", () => {
    it("erstellt neuen Eintrag und gibt 201 zurück", async () => {
      const newMessage = {
        channel: "outlook",
        sender: "test@example.de",
        recipient: "markus.weber@aldi-sued.de",
        subject: "Test-Nachricht",
        body: "Dies ist eine Test-Nachricht für den Integrationstest.",
        timestamp: "2025-07-13T10:00:00Z",
        read_status: 0,
        thread_id: "thread-test-001",
      };

      const postRes = await request(app)
        .post("/api/tables/messages/rows")
        .send(newMessage)
        .set("Content-Type", "application/json");

      expect(postRes.status).toBe(201);
      expect(postRes.body).toHaveProperty("message", "Row inserted");
      expect(postRes.body).toHaveProperty("data");
      expect(postRes.body.data).toHaveProperty("id");
      expect(postRes.body.data.sender).toBe("test@example.de");
      expect(postRes.body.data.subject).toBe("Test-Nachricht");

      // Verify the message appears in subsequent GET
      const getRes = await request(app)
        .get("/api/tables/messages/rows")
        .query({ filter: "thread_id:thread-test-001" });

      expect(getRes.status).toBe(200);
      expect(getRes.body.data).toHaveLength(1);
      expect(getRes.body.data[0].body).toBe(
        "Dies ist eine Test-Nachricht für den Integrationstest.",
      );
    });

    it("gibt 404 für nicht-existierende Tabelle zurück", async () => {
      const res = await request(app)
        .post("/api/tables/nonexistent/rows")
        .send({ name: "test" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/tables/messages/rows/:id", () => {
    it("aktualisiert read_status korrekt", async () => {
      // Message with id=1 has read_status=0 (seeded data)
      const putRes = await request(app)
        .put("/api/tables/messages/rows/1")
        .send({ read_status: 1 })
        .set("Content-Type", "application/json");

      expect(putRes.status).toBe(200);
      expect(putRes.body).toHaveProperty("message", "Row updated");
      expect(putRes.body.data.read_status).toBe(1);

      // Verify the update was persisted
      const getRes = await request(app)
        .get("/api/tables/messages/rows")
        .query({ _limit: 1 });

      const updatedMsg = getRes.body.data.find(
        (m: { id: number }) => m.id === 1,
      );
      expect(updatedMsg.read_status).toBe(1);
    });

    it("gibt 404 für nicht-existierende Zeile zurück", async () => {
      const res = await request(app)
        .put("/api/tables/messages/rows/9999")
        .send({ read_status: 1 })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("not found");
    });
  });

  describe("GET mit Filter-Parameter", () => {
    it("filtert Nachrichten nach channel=outlook korrekt", async () => {
      const res = await request(app)
        .get("/api/tables/messages/rows")
        .query({ filter: "channel:outlook" });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const msg of res.body.data) {
        expect(msg.channel).toBe("outlook");
      }
    });

    it("filtert Nachrichten nach sender", async () => {
      const res = await request(app)
        .get("/api/tables/messages/rows")
        .query({ filter: "sender:anna.schmidt@aldi-sued.de" });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].subject).toBe("Statusbericht KW28");
    });
  });
});
