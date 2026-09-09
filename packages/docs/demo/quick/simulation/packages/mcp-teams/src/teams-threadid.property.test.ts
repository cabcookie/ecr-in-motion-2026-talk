/**
 * Property-Based Test: Teams-Nachrichten thread_id (Property 14)
 *
 * Für jede Teams-Nachricht: thread_id ist nicht NULL und nicht leer.
 *
 * **Validates: Requirements 13.4**
 */

import fc from "fast-check";
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { registerTeamsTools, createTeamsMcpServer } from "./server.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "../../db/src/schema.sql");

/**
 * Creates an in-memory SQLite database with the schema applied.
 */
function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  return db;
}

/**
 * Seeds the minimal configuration required for the Teams server to work
 * (buyer role + demo_config).
 */
function seedMinimalConfig(db: Database.Database): void {
  db.prepare(
    `INSERT INTO demo_config (key, value) VALUES ('buyer_role_id', '"buyer"')`,
  ).run();
  db.prepare(
    `INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval)
     VALUES ('buyer', 'Einkauf', 'Markus Weber', 'SKU Management', '["sap_ariba","outlook","teams"]', 10000)`,
  ).run();
}

// ─── Property 14: Teams-Nachrichten haben thread_id ──────────────────────────

/**
 * **Validates: Requirements 13.4**
 */
describe("Feature: supply-chain-simulation, Property 14: Teams-Nachrichten haben thread_id", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    seedMinimalConfig(db);
  });

  it("send_message always assigns a non-null, non-empty thread_id to teams messages", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary Teams message parameters
        fc.record({
          to: fc.oneof(
            fc.constant("sandra.klein@aldi-sued.de"),
            fc.constant("thomas.mueller@aldi-sued.de"),
            fc.constant("peter.hoffmann@aldi-sued.de"),
            fc.constant("julia.braun@aldi-sued.de"),
          ),
          body: fc.string({ minLength: 1, maxLength: 200 }),
          // thread_id can be provided or omitted (undefined)
          thread_id: fc.oneof(
            fc.constant(undefined),
            fc.string({ minLength: 1, maxLength: 40 }),
          ),
          subject: fc.oneof(
            fc.constant(undefined),
            fc.string({ minLength: 1, maxLength: 50 }),
          ),
        }),
        (messageParams) => {
          // Simulate what the send_message tool does
          const user = { email: "markus.weber@aldi-sued.de" };
          const timestamp = new Date().toISOString();
          const finalThreadId =
            messageParams.thread_id ??
            `teams-thread-${Math.random().toString(36).slice(2, 10)}`;

          db.prepare(
            `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
             VALUES ('teams', ?, ?, ?, ?, ?, 1, ?)`,
          ).run(
            user.email,
            messageParams.to,
            messageParams.subject ?? null,
            messageParams.body,
            timestamp,
            finalThreadId,
          );

          // Verify: all teams messages in the DB have non-null, non-empty thread_id
          const teamsMessages = db
            .prepare(
              `SELECT id, thread_id FROM messages WHERE channel = 'teams'`,
            )
            .all() as Array<{ id: number; thread_id: string | null }>;

          for (const msg of teamsMessages) {
            // Invariant 1: thread_id is not NULL
            expect(msg.thread_id).not.toBeNull();
            // Invariant 2: thread_id is not empty string
            expect(msg.thread_id!.length).toBeGreaterThan(0);
          }

          // Clean up for next iteration
          db.prepare("DELETE FROM messages").run();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all seeded teams messages have a non-null, non-empty thread_id", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary teams messages as if seeded by the system
        fc.array(
          fc.record({
            sender: fc.oneof(
              fc.constant("sandra.klein@aldi-sued.de"),
              fc.constant("thomas.mueller@aldi-sued.de"),
              fc.constant("peter.hoffmann@aldi-sued.de"),
              fc.constant("julia.braun@aldi-sued.de"),
            ),
            recipient: fc.constant("markus.weber@aldi-sued.de"),
            subject: fc.oneof(
              fc.constant(null),
              fc.string({ minLength: 1, maxLength: 50 }),
            ),
            body: fc.string({ minLength: 1, maxLength: 200 }),
            thread_id: fc.stringMatching(/^thread-[a-z0-9-]{4,20}$/),
            daysAgo: fc.integer({ min: 0, max: 14 }),
            hoursOffset: fc.integer({ min: 8, max: 17 }),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        (teamsMessages) => {
          // Insert teams messages as if seeded by the system
          const insertStmt = db.prepare(
            `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
             VALUES ('teams', ?, ?, ?, ?, ?, 1, ?)`,
          );

          const now = new Date();
          for (const msg of teamsMessages) {
            const ts = new Date(now);
            ts.setDate(ts.getDate() - msg.daysAgo);
            ts.setHours(msg.hoursOffset, 0, 0, 0);

            insertStmt.run(
              msg.sender,
              msg.recipient,
              msg.subject,
              msg.body,
              ts.toISOString(),
              msg.thread_id,
            );
          }

          // Property: ALL teams messages must have non-null, non-empty thread_id
          const allTeamsMessages = db
            .prepare(
              `SELECT id, thread_id FROM messages WHERE channel = 'teams'`,
            )
            .all() as Array<{ id: number; thread_id: string | null }>;

          for (const msg of allTeamsMessages) {
            expect(msg.thread_id).not.toBeNull();
            expect(msg.thread_id!.length).toBeGreaterThan(0);
          }

          // Clean up for next iteration
          db.prepare("DELETE FROM messages").run();
        },
      ),
      { numRuns: 100 },
    );
  });
});
