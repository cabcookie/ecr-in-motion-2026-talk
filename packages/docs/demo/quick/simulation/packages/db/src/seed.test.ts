import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { seedDatabase } from "./seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "schema.sql");

function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  return db;
}

describe("seedDatabase", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  it("inserts demo_config entries", () => {
    seedDatabase(db);

    const rows = db.prepare("SELECT key, value FROM demo_config").all() as {
      key: string;
      value: string;
    }[];
    const keys = rows.map((r) => r.key);

    expect(keys).toContain("anchor_date");
    expect(keys).toContain("pre_aged_mode");
    expect(keys).toContain("buyer_role_id");
    expect(keys).toContain("polling_interval_ms");
  });

  it("inserts buyer role with correct systems_access", () => {
    seedDatabase(db);

    const role = db
      .prepare("SELECT * FROM roles WHERE id = ?")
      .get("buyer") as {
      id: string;
      name: string;
      display_name: string;
      systems_access: string;
    };

    expect(role).toBeDefined();
    expect(role.display_name).toBe("Markus Weber");
    expect(role.name).toBe("Procurement");
    expect(JSON.parse(role.systems_access)).toEqual([
      "sap_ariba",
      "outlook",
      "teams",
    ]);
  });

  it("inserts 15-20 seed emails", () => {
    seedDatabase(db);

    const count = db.prepare("SELECT COUNT(*) as cnt FROM messages").get() as {
      cnt: number;
    };

    expect(count.cnt).toBeGreaterThanOrEqual(15);
    expect(count.cnt).toBeLessThanOrEqual(20);
  });

  it("all seed emails use outlook channel", () => {
    seedDatabase(db);

    const nonOutlook = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM messages WHERE channel != 'outlook'",
      )
      .get() as { cnt: number };

    expect(nonOutlook.cnt).toBe(0);
  });

  it("includes both internal and external senders", () => {
    seedDatabase(db);

    const internal = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM messages WHERE sender LIKE '%@aldi-sued.de'",
      )
      .get() as { cnt: number };

    const external = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM messages WHERE sender NOT LIKE '%@aldi-sued.de'",
      )
      .get() as { cnt: number };

    expect(internal.cnt).toBeGreaterThan(0);
    expect(external.cnt).toBeGreaterThan(0);
  });

  it("all timestamps are within business hours (08:00-18:00)", () => {
    seedDatabase(db);

    const messages = db.prepare("SELECT timestamp FROM messages").all() as {
      timestamp: string;
    }[];

    for (const msg of messages) {
      const hour = new Date(msg.timestamp).getHours();
      expect(hour).toBeGreaterThanOrEqual(8);
      expect(hour).toBeLessThan(18);
    }
  });

  it("all timestamps are relative to anchor_date (within 14 days before)", () => {
    seedDatabase(db);

    const anchorRow = db
      .prepare("SELECT value FROM demo_config WHERE key = 'anchor_date'")
      .get() as { value: string };
    const anchorDateStr = JSON.parse(anchorRow.value);
    const anchorDate = new Date(anchorDateStr + "T23:59:59.999Z");

    const fourteenDaysAgo = new Date(anchorDate.getTime());
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const messages = db.prepare("SELECT timestamp FROM messages").all() as {
      timestamp: string;
    }[];

    for (const msg of messages) {
      const ts = new Date(msg.timestamp);
      expect(ts.getTime()).toBeLessThanOrEqual(anchorDate.getTime());
      expect(ts.getTime()).toBeGreaterThanOrEqual(fourteenDaysAgo.getTime());
    }
  });

  it("is idempotent (can be called on fresh db without errors)", () => {
    expect(() => seedDatabase(db)).not.toThrow();
  });
});
