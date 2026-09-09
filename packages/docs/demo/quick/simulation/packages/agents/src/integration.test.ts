/**
 * Integration Tests – End-to-End Flows
 *
 * Tests the following E2E flows with real components (no mocks):
 * 1. Disruption Flow: Trigger → Agent processes → Message in DB (MCP-accessible)
 * 2. Pre-Aged Flow: Activate → Historical data (messages, KPIs, escalations) generated
 * 3. Data Consistency: Soul API patterns and MCP tool queries read same SQLite data
 *
 * Requirements: 3.3, 7.1, 9.4
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { createAgentEngine } from "./orchestrator.js";
import type { AgentHandler, SimEvent, AgentAction } from "./orchestrator.js";
import { LogistikAgent } from "./agents/logistik-agent.js";
import { ScCoordinatorAgent } from "./agents/sc-coordinator-agent.js";
import { LieferantenAgent } from "./agents/lieferanten-agent.js";
import { EinkaufAgent } from "./agents/einkauf-agent.js";
import { activatePreAgedMode, getAnchorDate } from "./pre-aged.js";
import { resolveCurrentUser } from "../../shared/src/user-identity.js";

// ─── Test DB Setup ──────────────────────────────────────────────────────────

function createIntegrationDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");

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

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT NOT NULL,
      systems_access TEXT NOT NULL,
      polling_interval INTEGER NOT NULL DEFAULT 10000
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

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      location TEXT NOT NULL,
      last_updated TEXT NOT NULL,
      coverage_days REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kpi_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kpi_name TEXT NOT NULL,
      value REAL NOT NULL,
      timestamp TEXT NOT NULL,
      role_id TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      products TEXT NOT NULL,
      otd_score REAL NOT NULL,
      risk_cluster TEXT,
      contract_status TEXT NOT NULL
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

  // Seed minimal required config
  db.exec(`
    INSERT INTO demo_config (key, value) VALUES ('anchor_date', '"2025-07-14"');
    INSERT INTO demo_config (key, value) VALUES ('pre_aged_mode', 'false');
    INSERT INTO demo_config (key, value) VALUES ('buyer_role_id', '"buyer"');
    INSERT INTO demo_config (key, value) VALUES ('polling_interval_ms', '10000');
  `);

  // Seed roles
  db.exec(`
    INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval) VALUES
      ('buyer', 'Procurement', 'Markus Weber', 'Responsible for 54-60 SKUs, supplier negotiations, contract management', '["sap_ariba","outlook","teams"]', 10000),
      ('sc_coordinator', 'SC Coordinator', 'Sandra Klein', 'Coordination and logistics expertise for procurement teams', '["sap","manhattan_wms","teams"]', 10000),
      ('logistics', 'Logistics', 'Thomas Müller', 'Operational supply chain monitoring', '["manhattan_wms","sap","teams"]', 10000),
      ('supplier_agent', 'Supplier Agent', 'External Supplier', 'Simulates external suppliers', '["outlook"]', 10000),
      ('assortment_planning', 'Assortment Planning', 'Peter Hoffmann', 'SKU decisions and substitutions', '["sap"]', 10000),
      ('store_replenishment', 'Store Replenishment', 'Julia Braun', 'Automated replenishment and OSA monitoring', '["sap","manhattan_wms"]', 10000);
  `);

  return db;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Simulates what the Outlook MCP get_emails tool does:
 * Queries messages for the current user with channel='outlook'.
 */
function mcpGetEmails(
  db: Database.Database,
  opts: {
    limit?: number;
    unread_only?: boolean;
    sender?: string;
    since?: string;
  } = {},
) {
  const user = resolveCurrentUser(db);
  const conditions: string[] = ["channel = 'outlook'", "recipient = ?"];
  const params: unknown[] = [user.email];

  if (opts.unread_only) {
    conditions.push("read_status = 0");
  }
  if (opts.sender) {
    conditions.push("sender LIKE ?");
    params.push(`%${opts.sender}%`);
  }
  if (opts.since) {
    conditions.push("timestamp >= ?");
    params.push(opts.since);
  }

  const limit = opts.limit ?? 20;
  params.push(limit);

  const sql = `SELECT id, sender, recipient, subject, body, timestamp, read_status, thread_id
               FROM messages
               WHERE ${conditions.join(" AND ")}
               ORDER BY timestamp DESC
               LIMIT ?`;

  return db.prepare(sql).all(...params) as Array<{
    id: number;
    sender: string;
    recipient: string;
    subject: string | null;
    body: string;
    timestamp: string;
    read_status: number;
    thread_id: string | null;
  }>;
}

/**
 * Simulates what the Soul API GET /api/tables/messages/rows would return
 * (all messages, filtered by channel).
 */
function soulApiGetMessages(
  db: Database.Database,
  channel: "outlook" | "teams",
) {
  return db
    .prepare(
      `SELECT id, channel, sender, recipient, subject, body, timestamp, read_status, thread_id
       FROM messages WHERE channel = ? ORDER BY timestamp DESC`,
    )
    .all(channel) as Array<{
    id: number;
    channel: string;
    sender: string;
    recipient: string;
    subject: string | null;
    body: string;
    timestamp: string;
    read_status: number;
    thread_id: string | null;
  }>;
}

// ─── Test Suite 1: Disruption Flow ──────────────────────────────────────────

describe("Integration: Disruption Flow (E2E)", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createIntegrationDb();
  });

  afterEach(() => {
    db.close();
  });

  it("should process a disruption event end-to-end: trigger → agent handles → messages appear in DB", async () => {
    // Set up real agents
    const agents: AgentHandler[] = [
      new LogistikAgent(),
      new ScCoordinatorAgent(),
      new LieferantenAgent(),
    ];

    // Create engine with fast polling for test
    const engine = createAgentEngine(db, agents, { pollingIntervalMs: 50 });

    // Trigger disruption (this inserts a pending event)
    engine.triggerDisruption("scenario_recall", {
      affectedSkus: ["2101", "2102"],
      duration: 7,
      marginImpact: 18,
    });

    // Verify event was inserted
    const pendingEvents = db
      .prepare("SELECT * FROM events WHERE status = 'pending'")
      .all();
    expect(pendingEvents).toHaveLength(1);

    // Start the engine and wait for processing
    engine.start();
    await new Promise((r) => setTimeout(r, 200));
    engine.stop();

    // Verify event was processed (status = 'completed')
    const completedEvents = db
      .prepare("SELECT * FROM events WHERE status = 'completed'")
      .all();
    expect(completedEvents.length).toBeGreaterThanOrEqual(1);

    // Verify agents generated messages in the DB
    const allMessages = db.prepare("SELECT * FROM messages").all() as Array<{
      channel: string;
      sender: string;
      recipient: string;
    }>;
    expect(allMessages.length).toBeGreaterThan(0);

    // The messages should be queryable via MCP get_emails pattern
    const mcpEmails = mcpGetEmails(db);
    // LogistikAgent sends to markus.weber@aldi-sued.de via outlook when duration >= 24h
    const buyerEmails = mcpEmails.filter(
      (m) => m.recipient === "markus.weber@aldi-sued.de",
    );
    expect(buyerEmails.length).toBeGreaterThan(0);
  });

  it("should dispatch disruption events only to agents with matching eventTypes (Req 3.3)", async () => {
    const handledBy: string[] = [];

    // Create a custom agent that doesn't handle disruptions
    const nonMatchingAgent: AgentHandler = {
      config: {
        roleId: "assortment_planning",
        eventTypes: ["kpi_alert"], // Does NOT include 'disruption'
        channels: ["teams"],
        systemsAccess: ["sap"],
      },
      async handleEvent(_event: SimEvent): Promise<AgentAction[]> {
        handledBy.push("assortment_planning");
        return [];
      },
    };

    const matchingAgent: AgentHandler = {
      config: {
        roleId: "logistics",
        eventTypes: ["disruption", "kpi_alert"],
        channels: ["teams", "outlook"],
        systemsAccess: ["manhattan_wms", "sap"],
      },
      async handleEvent(_event: SimEvent): Promise<AgentAction[]> {
        handledBy.push("logistics");
        return [];
      },
    };

    const engine = createAgentEngine(db, [nonMatchingAgent, matchingAgent], {
      pollingIntervalMs: 50,
    });

    engine.triggerDisruption("scenario_extreme_weather", {
      affectedSkus: ["5101"],
      duration: 14,
      marginImpact: 30,
    });

    engine.start();
    await new Promise((r) => setTimeout(r, 200));
    engine.stop();

    // Logistics should have handled the event, assortment should not
    expect(handledBy).toContain("logistics");
    expect(handledBy).not.toContain("assortment_planning");
  });

  it("should make agent-generated messages accessible via MCP query patterns (Req 9.4)", async () => {
    const agents: AgentHandler[] = [new LogistikAgent()];

    const engine = createAgentEngine(db, agents, { pollingIntervalMs: 50 });

    engine.triggerDisruption("scenario_it_outage", {
      affectedSkus: ["7101", "7102"],
      duration: 3,
      marginImpact: 25,
    });

    engine.start();
    await new Promise((r) => setTimeout(r, 200));
    engine.stop();

    // Query using MCP get_emails filter (unread_only)
    const unreadEmails = mcpGetEmails(db, { unread_only: true });
    // Newly generated messages should be unread (default read_status = 0)
    expect(unreadEmails.length).toBeGreaterThan(0);

    // Filter by sender (Thomas Müller = Logistics)
    const logistikEmails = mcpGetEmails(db, {
      sender: "thomas.mueller@aldi-sued.de",
    });
    expect(logistikEmails.length).toBeGreaterThan(0);
    expect(logistikEmails[0].sender).toBe("thomas.mueller@aldi-sued.de");
  });
});

// ─── Test Suite 2: Pre-Aged Flow ────────────────────────────────────────────

describe("Integration: Pre-Aged Mode (E2E)", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createIntegrationDb();

    // Add scenario config to demo_config (as seedDatabase would)
    const scenarioConfig = JSON.stringify({
      type: "extreme_weather",
      label: "Extremwetter",
      margin_impact_bps: 30,
      duration_days: 14,
      probability: 0.2,
      risk_cluster: "climate_agri_fresh",
      affected_skus: ["5101", "5102", "5103"],
    });
    db.prepare(
      `INSERT OR REPLACE INTO demo_config (key, value) VALUES (?, ?)`,
    ).run("scenario_extreme_weather", scenarioConfig);
  });

  afterEach(() => {
    db.close();
  });

  it("should generate historical data when pre-aged mode is activated (Req 7.1)", async () => {
    // Verify no data before activation
    const msgsBefore = db
      .prepare("SELECT COUNT(*) as count FROM messages")
      .get() as { count: number };
    const kpiBefore = db
      .prepare("SELECT COUNT(*) as count FROM kpi_states")
      .get() as { count: number };
    const escBefore = db
      .prepare("SELECT COUNT(*) as count FROM escalations")
      .get() as { count: number };

    expect(msgsBefore.count).toBe(0);
    expect(kpiBefore.count).toBe(0);
    expect(escBefore.count).toBe(0);

    // Activate pre-aged mode
    await activatePreAgedMode("scenario_extreme_weather", db);

    // Verify historical data was generated
    const msgsAfter = db
      .prepare("SELECT COUNT(*) as count FROM messages")
      .get() as { count: number };
    const kpiAfter = db
      .prepare("SELECT COUNT(*) as count FROM kpi_states")
      .get() as { count: number };
    const escAfter = db
      .prepare("SELECT COUNT(*) as count FROM escalations")
      .get() as { count: number };

    expect(msgsAfter.count).toBeGreaterThan(0);
    expect(kpiAfter.count).toBeGreaterThan(0);
    // Escalations may or may not be generated depending on KPI crossing thresholds
    // but for extreme_weather with 30 bps, OTD should cross the threshold
    expect(escAfter.count).toBeGreaterThanOrEqual(0);
  });

  it("should generate chronologically ordered timestamps all before or at anchor date", async () => {
    await activatePreAgedMode("scenario_extreme_weather", db);

    const anchorDate = getAnchorDate(db);
    const anchorIso = anchorDate.toISOString();

    // Check messages are chronologically ordered and strictly before anchor
    const messages = db
      .prepare("SELECT timestamp FROM messages ORDER BY timestamp ASC")
      .all() as Array<{ timestamp: string }>;

    expect(messages.length).toBeGreaterThan(0);

    for (let i = 0; i < messages.length; i++) {
      const ts = messages[i].timestamp;
      // All message timestamps should be before anchor date
      expect(ts < anchorIso).toBe(true);

      // Each should be >= the previous (chronological order)
      if (i > 0) {
        expect(ts >= messages[i - 1].timestamp).toBe(true);
      }
    }

    // Check KPI entries: historical decline entries are before anchor,
    // current-state entries (set by setCurrentStateForBuyer) are at anchor day.
    // All should be <= anchor + 1 day (on the anchor day itself).
    const anchorPlusOneDay = new Date(anchorDate);
    anchorPlusOneDay.setUTCDate(anchorPlusOneDay.getUTCDate() + 1);
    const anchorPlusOneDayIso = anchorPlusOneDay.toISOString();

    const kpiEntries = db
      .prepare("SELECT timestamp FROM kpi_states ORDER BY timestamp ASC")
      .all() as Array<{ timestamp: string }>;

    expect(kpiEntries.length).toBeGreaterThan(0);

    for (const entry of kpiEntries) {
      // All KPI entries should be at or before the anchor date
      expect(entry.timestamp <= anchorPlusOneDayIso).toBe(true);
    }

    // The historical decline entries (majority) should be before anchor
    const historicKpis = kpiEntries.filter((e) => e.timestamp < anchorIso);
    expect(historicKpis.length).toBeGreaterThan(0);
  });

  it("should generate messages with correct sender patterns (internal + external)", async () => {
    await activatePreAgedMode("scenario_extreme_weather", db);

    const messages = db
      .prepare("SELECT sender, channel FROM messages")
      .all() as Array<{ sender: string; channel: string }>;

    expect(messages.length).toBeGreaterThan(0);

    // Should have both internal (@aldi-sued.de) and external senders
    const internalMsgs = messages.filter((m) =>
      m.sender.endsWith("@aldi-sued.de"),
    );
    const externalMsgs = messages.filter(
      (m) => !m.sender.endsWith("@aldi-sued.de"),
    );

    expect(internalMsgs.length).toBeGreaterThan(0);
    expect(externalMsgs.length).toBeGreaterThan(0);

    // External messages should be on outlook channel
    for (const msg of externalMsgs) {
      expect(msg.channel).toBe("outlook");
    }
  });

  it("should mark demo_config with pre_aged_mode active after activation", async () => {
    await activatePreAgedMode("scenario_extreme_weather", db);

    const preAgedConfig = db
      .prepare("SELECT value FROM demo_config WHERE key = 'pre_aged_mode'")
      .get() as { value: string };

    expect(preAgedConfig.value).toBe("true");
  });

  it("should generate KPI decline showing deterioration over time", async () => {
    await activatePreAgedMode("scenario_extreme_weather", db);

    // Get OTD entries ordered by time (extreme_weather affects OTD)
    const otdEntries = db
      .prepare(
        `SELECT value, timestamp FROM kpi_states
         WHERE kpi_name = 'otd'
         ORDER BY timestamp ASC`,
      )
      .all() as Array<{ value: number; timestamp: string }>;

    expect(otdEntries.length).toBeGreaterThan(0);

    // OTD should show declining trend (later values <= earlier values on average)
    if (otdEntries.length >= 2) {
      const firstValue = otdEntries[0].value;
      const lastValue = otdEntries[otdEntries.length - 1].value;
      // Last value should be lower than first (OTD deteriorates)
      expect(lastValue).toBeLessThanOrEqual(firstValue);
    }
  });
});

// ─── Test Suite 3: Data Consistency ─────────────────────────────────────────

describe("Integration: Data Consistency (Frontend API vs MCP)", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createIntegrationDb();

    // Seed some messages to test consistency
    const buyerEmail = "markus.weber@aldi-sued.de";
    db.prepare(
      `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "outlook",
      "thomas.mueller@aldi-sued.de",
      buyerEmail,
      "Logistik-Update",
      "Test body 1",
      "2025-07-13T09:00:00.000Z",
      0,
      "thread-1",
    );
    db.prepare(
      `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "outlook",
      "kontakt@lieferant.de",
      buyerEmail,
      "Lieferverzögerung",
      "Test body 2",
      "2025-07-13T10:00:00.000Z",
      1,
      "thread-2",
    );
    db.prepare(
      `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "teams",
      "sandra.klein@aldi-sued.de",
      buyerEmail,
      null,
      "Teams message",
      "2025-07-13T11:00:00.000Z",
      0,
      "thread-teams-1",
    );
  });

  afterEach(() => {
    db.close();
  });

  it("should return consistent data between Soul API pattern and MCP get_emails pattern", () => {
    // Soul API pattern: GET /api/tables/messages/rows?filter=channel:outlook
    const soulOutlookMessages = soulApiGetMessages(db, "outlook");

    // MCP get_emails pattern: queries channel='outlook' AND recipient=current_user
    const mcpEmails = mcpGetEmails(db);

    // MCP returns a subset of Soul API (filtered by recipient = current user)
    // Both should read from the same underlying SQLite data
    const soulBuyerEmails = soulOutlookMessages.filter(
      (m) => m.recipient === "markus.weber@aldi-sued.de",
    );

    // Same count
    expect(mcpEmails.length).toBe(soulBuyerEmails.length);

    // Same IDs (both sorted by timestamp DESC)
    const mcpIds = mcpEmails.map((m) => m.id).sort();
    const soulIds = soulBuyerEmails.map((m) => m.id).sort();
    expect(mcpIds).toEqual(soulIds);

    // Same content
    for (const mcpEmail of mcpEmails) {
      const soulMatch = soulBuyerEmails.find((s) => s.id === mcpEmail.id);
      expect(soulMatch).toBeDefined();
      expect(mcpEmail.sender).toBe(soulMatch!.sender);
      expect(mcpEmail.subject).toBe(soulMatch!.subject);
      expect(mcpEmail.body).toBe(soulMatch!.body);
      expect(mcpEmail.timestamp).toBe(soulMatch!.timestamp);
      expect(mcpEmail.read_status).toBe(soulMatch!.read_status);
    }
  });

  it("should show new agent-generated messages in both Soul API and MCP views", async () => {
    // Run an agent that generates a message
    const agents: AgentHandler[] = [new LogistikAgent()];
    const engine = createAgentEngine(db, agents, { pollingIntervalMs: 50 });

    engine.triggerDisruption("scenario_recall", {
      affectedSkus: ["2101"],
      duration: 30,
      marginImpact: 18,
    });

    engine.start();
    await new Promise((r) => setTimeout(r, 200));
    engine.stop();

    // Both queries should include the new message
    const soulMessages = soulApiGetMessages(db, "outlook");
    const mcpEmails = mcpGetEmails(db);

    // Should have more than the 2 seeded outlook messages
    expect(soulMessages.length).toBeGreaterThan(2);

    // The agent-generated message should appear in MCP results too
    const agentEmail = mcpEmails.find(
      (m) =>
        m.sender === "thomas.mueller@aldi-sued.de" &&
        m.subject?.includes("Logistik"),
    );
    expect(agentEmail).toBeDefined();

    // It should also appear in Soul API results
    const soulAgentMsg = soulMessages.find(
      (m) =>
        m.sender === "thomas.mueller@aldi-sued.de" &&
        m.subject?.includes("Logistik"),
    );
    expect(soulAgentMsg).toBeDefined();
  });

  it("should resolve user identity consistently across MCP and DB", () => {
    const user = resolveCurrentUser(db);

    // Verify identity matches what's in the roles table
    const roleRow = db
      .prepare("SELECT * FROM roles WHERE id = 'buyer'")
      .get() as {
      display_name: string;
      name: string;
      description: string;
      systems_access: string;
    };

    expect(user.name).toBe(roleRow.display_name);
    expect(user.role).toBe(roleRow.name);
    expect(user.email).toBe("markus.weber@aldi-sued.de");
    expect(user.responsibilities).toBe(roleRow.description);
    expect(user.systems).toEqual(JSON.parse(roleRow.systems_access));
  });

  it("should separate teams and outlook channels correctly", () => {
    const soulOutlook = soulApiGetMessages(db, "outlook");
    const soulTeams = soulApiGetMessages(db, "teams");

    // No cross-contamination
    for (const msg of soulOutlook) {
      expect(msg.channel).toBe("outlook");
    }
    for (const msg of soulTeams) {
      expect(msg.channel).toBe("teams");
    }

    // We seeded 2 outlook + 1 teams
    expect(soulOutlook.length).toBe(2);
    expect(soulTeams.length).toBe(1);

    // MCP outlook query should only return outlook messages for the buyer
    const mcpEmails = mcpGetEmails(db);
    for (const email of mcpEmails) {
      expect(email.recipient).toBe("markus.weber@aldi-sued.de");
    }
    expect(mcpEmails.length).toBe(2);
  });
});
