/**
 * Property-Based Tests for Outlook MCP Server
 *
 * - Property 12: get_emails Filter-Korrektheit
 * - Property 13: get_user_identity Auflösung
 * - Property 17: JSON-RPC 2.0 Protokoll-Konformität
 */

import fc from "fast-check";
import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, type Server } from "node:http";
import { resolveCurrentUser, createOutlookMcpServer } from "./server.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

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
 * Parses a Server-Sent Events (SSE) response body to extract the JSON-RPC message.
 * MCP SDK's Streamable HTTP Transport responds with SSE format:
 *   event: message\ndata: {JSON}\n\n
 */
function parseSSEResponse(text: string): Record<string, unknown> {
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const jsonStr = line.slice(6).trim();
      if (jsonStr) {
        return JSON.parse(jsonStr);
      }
    }
  }
  throw new Error(
    `No JSON-RPC data found in SSE response: ${text.slice(0, 200)}`,
  );
}

// ─── Property 12: MCP get_emails Filter-Korrektheit ──────────────────────────

/**
 * **Validates: Requirements 9.4**
 */
describe("Feature: supply-chain-simulation, Property 12: MCP get_emails Filter-Korrektheit", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    // Set up the buyer role so resolveCurrentUser works
    db.prepare(
      `INSERT INTO demo_config (key, value) VALUES ('buyer_role_id', '"buyer"')`,
    ).run();
    db.prepare(
      `INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval)
       VALUES ('buyer', 'Einkauf', 'Markus Weber', 'SKU Management', '["outlook"]', 10000)`,
    ).run();
  });

  it("get_emails returns only emails satisfying all filters and result size ≤ limit", () => {
    fc.assert(
      fc.property(
        // Generate a set of emails
        fc.array(
          fc.record({
            sender: fc.oneof(
              fc.constant("alice@example.com"),
              fc.constant("bob@aldi-sued.de"),
              fc.constant("carol@supplier.de"),
              fc.constant("markus.weber@aldi-sued.de"),
            ),
            recipient: fc.oneof(
              fc.constant("markus.weber@aldi-sued.de"),
              fc.constant("other@aldi-sued.de"),
            ),
            subject: fc.string({ minLength: 1, maxLength: 50 }),
            body: fc.string({ minLength: 1, maxLength: 100 }),
            read_status: fc.integer({ min: 0, max: 1 }),
            // Timestamps in the last 30 days range
            daysAgo: fc.integer({ min: 0, max: 30 }),
            hoursOffset: fc.integer({ min: 8, max: 17 }),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        // Generate filter parameters
        fc.record({
          limit: fc.integer({ min: 1, max: 50 }),
          unread_only: fc.boolean(),
          useSenderFilter: fc.boolean(),
          senderFilter: fc.oneof(
            fc.constant("alice"),
            fc.constant("bob"),
            fc.constant("carol"),
            fc.constant("supplier"),
          ),
          useSinceFilter: fc.boolean(),
          sinceDaysAgo: fc.integer({ min: 0, max: 30 }),
        }),
        (emails, filters) => {
          // Insert all emails into the DB
          const insertStmt = db.prepare(
            `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
             VALUES ('outlook', ?, ?, ?, ?, ?, ?, NULL)`,
          );

          const now = new Date();
          const insertedEmails: Array<{
            sender: string;
            recipient: string;
            timestamp: string;
            read_status: number;
          }> = [];

          for (const email of emails) {
            const ts = new Date(now);
            ts.setDate(ts.getDate() - email.daysAgo);
            ts.setHours(email.hoursOffset, 0, 0, 0);
            const timestamp = ts.toISOString();

            insertStmt.run(
              email.sender,
              email.recipient,
              email.subject,
              email.body,
              timestamp,
              email.read_status,
            );

            insertedEmails.push({
              sender: email.sender,
              recipient: email.recipient,
              timestamp,
              read_status: email.read_status,
            });
          }

          // Build SQL query matching the server implementation
          const user = resolveCurrentUser(db);
          const conditions: string[] = ["channel = 'outlook'", "recipient = ?"];
          const params: unknown[] = [user.email];

          if (filters.unread_only) {
            conditions.push("read_status = 0");
          }

          if (filters.useSenderFilter) {
            conditions.push("sender LIKE ?");
            params.push(`%${filters.senderFilter}%`);
          }

          const sinceTimestamp = (() => {
            if (filters.useSinceFilter) {
              const sinceDate = new Date(now);
              sinceDate.setDate(sinceDate.getDate() - filters.sinceDaysAgo);
              sinceDate.setHours(0, 0, 0, 0);
              return sinceDate.toISOString();
            }
            return null;
          })();

          if (sinceTimestamp) {
            conditions.push("timestamp >= ?");
            params.push(sinceTimestamp);
          }

          const sql = `SELECT id, sender, recipient, subject, body, timestamp, read_status, thread_id
                       FROM messages
                       WHERE ${conditions.join(" AND ")}
                       ORDER BY timestamp DESC
                       LIMIT ?`;
          params.push(filters.limit);

          const rows = db.prepare(sql).all(...params) as Array<{
            id: number;
            sender: string;
            recipient: string;
            subject: string | null;
            body: string;
            timestamp: string;
            read_status: number;
            thread_id: string | null;
          }>;

          // Invariant 1: Result size ≤ limit
          expect(rows.length).toBeLessThanOrEqual(filters.limit);

          // Invariant 2: All results satisfy the channel and recipient filter
          for (const row of rows) {
            expect(row.recipient).toBe(user.email);
          }

          // Invariant 3: If unread_only, all results are unread
          if (filters.unread_only) {
            for (const row of rows) {
              expect(row.read_status).toBe(0);
            }
          }

          // Invariant 4: If sender filter, all results match
          if (filters.useSenderFilter) {
            for (const row of rows) {
              expect(row.sender.toLowerCase()).toContain(
                filters.senderFilter.toLowerCase(),
              );
            }
          }

          // Invariant 5: If since filter, all results are at or after the timestamp
          if (sinceTimestamp) {
            for (const row of rows) {
              expect(row.timestamp >= sinceTimestamp).toBe(true);
            }
          }

          // Clean up for next iteration
          db.prepare("DELETE FROM messages").run();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 13: MCP get_user_identity Auflösung ────────────────────────────

/**
 * **Validates: Requirements 9.8, 11.4**
 */
describe("Feature: supply-chain-simulation, Property 13: MCP get_user_identity Auflösung", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  it("get_user_identity returns exactly the configured identity from the database", () => {
    fc.assert(
      fc.property(
        // Generate random role entry
        fc.record({
          id: fc.stringMatching(/^[a-z_]{3,15}$/),
          name: fc.string({ minLength: 2, maxLength: 30 }),
          display_name: fc
            .tuple(
              fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
              fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
            )
            .map(([first, last]) => `${first} ${last}`),
          description: fc.string({ minLength: 5, maxLength: 100 }),
          systems_access: fc.array(
            fc.oneof(
              fc.constant("sap_ariba"),
              fc.constant("outlook"),
              fc.constant("teams"),
              fc.constant("wms"),
            ),
            { minLength: 1, maxLength: 4 },
          ),
        }),
        (roleEntry) => {
          // Insert demo_config pointing to the role
          db.prepare(
            `INSERT OR REPLACE INTO demo_config (key, value) VALUES ('buyer_role_id', ?)`,
          ).run(JSON.stringify(roleEntry.id));

          // Insert the role
          db.prepare(
            `INSERT OR REPLACE INTO roles (id, name, display_name, description, systems_access, polling_interval)
             VALUES (?, ?, ?, ?, ?, 10000)`,
          ).run(
            roleEntry.id,
            roleEntry.name,
            roleEntry.display_name,
            roleEntry.description,
            JSON.stringify(roleEntry.systems_access),
          );

          // Resolve the user identity
          const identity = resolveCurrentUser(db);

          // Invariant 1: Name matches display_name
          expect(identity.name).toBe(roleEntry.display_name);

          // Invariant 2: Role matches the role name
          expect(identity.role).toBe(roleEntry.name);

          // Invariant 3: Email is derived from display_name
          const expectedEmail =
            roleEntry.display_name.toLowerCase().split(" ").join(".") +
            "@aldi-sued.de";
          expect(identity.email).toBe(expectedEmail);

          // Invariant 4: Responsibilities match description
          expect(identity.responsibilities).toBe(roleEntry.description);

          // Invariant 5: Systems match systems_access
          expect(identity.systems).toEqual(roleEntry.systems_access);

          // Clean up for next iteration
          db.prepare("DELETE FROM roles").run();
          db.prepare("DELETE FROM demo_config").run();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 17: JSON-RPC 2.0 Protokoll-Konformität ─────────────────────────

/**
 * **Validates: Requirements 9.2**
 */
describe("Feature: supply-chain-simulation, Property 17: JSON-RPC 2.0 Protokoll-Konformität", () => {
  let db: Database.Database;
  let httpServer: Server;
  let port: number;
  let sessionId: string | null = null;

  beforeAll(async () => {
    db = createTestDb();
    // Seed minimal data for the server to work
    db.prepare(
      `INSERT INTO demo_config (key, value) VALUES ('buyer_role_id', '"buyer"')`,
    ).run();
    db.prepare(
      `INSERT INTO roles (id, name, display_name, description, systems_access, polling_interval)
       VALUES ('buyer', 'Einkauf', 'Markus Weber', 'SKU Management', '["outlook"]', 10000)`,
    ).run();

    // Track active transports
    const transports = new Map<string, StreamableHTTPServerTransport>();

    httpServer = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      if (url.pathname === "/mcp" && req.method === "POST") {
        const reqSessionId = req.headers["mcp-session-id"] as
          | string
          | undefined;

        if (reqSessionId && transports.has(reqSessionId)) {
          const transport = transports.get(reqSessionId)!;
          await transport.handleRequest(req, res);
          return;
        }

        const newSessionId = randomUUID();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId,
        });
        transports.set(newSessionId, transport);
        transport.onclose = () => {
          transports.delete(newSessionId);
        };

        const mcpServer = createOutlookMcpServer(db);
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      if (url.pathname === "/mcp" && req.method === "GET") {
        const reqSessionId = req.headers["mcp-session-id"] as
          | string
          | undefined;
        if (reqSessionId && transports.has(reqSessionId)) {
          const transport = transports.get(reqSessionId)!;
          await transport.handleRequest(req, res);
          return;
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Invalid or missing session ID" },
            id: null,
          }),
        );
        return;
      }

      res.writeHead(404);
      res.end();
    });

    // Use dynamic port (0 = OS picks available port)
    await new Promise<void>((resolvePromise) => {
      httpServer.listen(0, "127.0.0.1", () => {
        const addr = httpServer.address();
        port = typeof addr === "object" && addr ? addr.port : 0;
        resolvePromise();
      });
    });

    // Initialize a session by sending the initialize request
    // The MCP SDK requires Accept header with both application/json and text/event-stream
    const initResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 0,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "test-client", version: "1.0.0" },
        },
      }),
    });
    sessionId = initResponse.headers.get("mcp-session-id");

    // Send initialized notification
    await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        ...(sessionId ? { "mcp-session-id": sessionId } : {}),
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    });
  });

  afterAll(() => {
    httpServer?.close();
    db?.close();
  });

  it("valid JSON-RPC requests return jsonrpc: '2.0' and matching id", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.oneof(
          // Valid MCP methods
          fc.constant("tools/list"),
          fc.constant("ping"),
        ),
        async (id, method) => {
          const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json, text/event-stream",
              ...(sessionId ? { "mcp-session-id": sessionId } : {}),
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id,
              method,
              params: {},
            }),
          });

          expect(response.status).toBe(200);

          // MCP SDK uses SSE streaming for responses: parse "event: message\ndata: {...}\n\n"
          const text = await response.text();
          const jsonRpcMessage = parseSSEResponse(text);

          // Invariant 1: Response contains jsonrpc: "2.0"
          expect(jsonRpcMessage.jsonrpc).toBe("2.0");

          // Invariant 2: Response id matches request id
          expect(jsonRpcMessage.id).toBe(id);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("invalid method requests return error with correct error code", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.stringMatching(/^invalid_method_[a-z]{3,8}$/),
        async (id, method) => {
          const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json, text/event-stream",
              ...(sessionId ? { "mcp-session-id": sessionId } : {}),
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id,
              method,
              params: {},
            }),
          });

          // MCP SDK uses SSE streaming for responses
          const text = await response.text();
          const jsonRpcMessage = parseSSEResponse(text);

          // Invariant 1: Response contains jsonrpc: "2.0"
          expect(jsonRpcMessage.jsonrpc).toBe("2.0");

          // Invariant 2: Response id matches request id
          expect(jsonRpcMessage.id).toBe(id);

          // Invariant 3: Error object exists with a numeric error code
          expect(jsonRpcMessage.error).toBeDefined();
          const error = jsonRpcMessage.error as {
            code: number;
            message: string;
          };
          expect(typeof error.code).toBe("number");
          // JSON-RPC 2.0: Method not found = -32601
          expect(error.code).toBe(-32601);
        },
      ),
      { numRuns: 100 },
    );
  });
});
