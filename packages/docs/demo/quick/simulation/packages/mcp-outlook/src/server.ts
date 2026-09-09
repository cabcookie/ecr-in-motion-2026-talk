/**
 * Outlook MCP Server – ALDI SUED Microsoft Outlook
 *
 * Provides email access for Amazon Quick via Streamable HTTP Transport (JSON-RPC 2.0).
 * Port: 3001, Endpoint: /mcp
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.8, 9.9, 11.1, 11.2, 11.3, 11.4
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { z } from "zod";
import { getDb, seedDatabase } from "../../db/src/index.js";
import {
  handleOAuthRequest,
  resolveCurrentUser,
} from "../../shared/src/index.js";
import type Database from "better-sqlite3";

export const MCP_OUTLOOK_PORT = 3001;
export const MCP_OUTLOOK_NAME = "Outlook";
export const MCP_OUTLOOK_VERSION = "1.0.0";

// Re-export resolveCurrentUser for backwards compatibility (used by tests)
export { resolveCurrentUser } from "../../shared/src/index.js";

// ─── MCP Tool Registration ───────────────────────────────────────────────────

/**
 * Registers all Outlook MCP tools on the server instance.
 */
export function registerOutlookTools(
  server: McpServer,
  db: Database.Database,
): void {
  // --- Tool: get_emails ---
  server.tool(
    "get_emails",
    "Retrieves emails from the logged-in user's Outlook inbox. Reads email messages from the ALDI SUED Microsoft Outlook system.",
    {
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("Maximum number of emails (default: 20)"),
      unread_only: z.boolean().optional().describe("Show only unread emails"),
      sender: z
        .string()
        .optional()
        .describe("Filter by sender (email address or partial match)"),
      since: z
        .string()
        .optional()
        .describe(
          "Emails since date (ISO 8601 format, e.g. 2025-07-01T00:00:00Z)",
        ),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ limit, unread_only, sender, since }) => {
      const user = resolveCurrentUser(db);
      const conditions: string[] = ["channel = 'outlook'", "recipient = ?"];
      const params: unknown[] = [user.email];

      if (unread_only) {
        conditions.push("read_status = 0");
      }

      if (sender) {
        conditions.push("sender LIKE ?");
        params.push(`%${sender}%`);
      }

      if (since) {
        conditions.push("timestamp >= ?");
        params.push(since);
      }

      const sql = `SELECT id, sender, recipient, subject, body, timestamp, read_status, thread_id
                   FROM messages
                   WHERE ${conditions.join(" AND ")}
                   ORDER BY timestamp DESC
                   LIMIT ?`;
      params.push(limit);

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

      const emails = rows.map((row) => ({
        id: row.id,
        from: row.sender,
        to: row.recipient,
        subject: row.subject ?? "(no subject)",
        body: row.body,
        timestamp: row.timestamp,
        read: row.read_status === 1,
        thread_id: row.thread_id,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(emails, null, 2),
          },
        ],
      };
    },
  );

  // --- Tool: get_unread_count ---
  server.tool(
    "get_unread_count",
    "Returns the unread email count in the Outlook mailbox.",
    {},
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async () => {
      const user = resolveCurrentUser(db);
      const row = db
        .prepare(
          "SELECT COUNT(*) as count FROM messages WHERE channel='outlook' AND read_status=0 AND recipient=?",
        )
        .get(user.email) as { count: number };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ unread_count: row.count }),
          },
        ],
      };
    },
  );

  // --- Tool: send_email ---
  server.tool(
    "send_email",
    "Sends an email via Microsoft Outlook on behalf of the logged-in user.",
    {
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body text"),
      thread_id: z
        .string()
        .optional()
        .describe("Thread ID for replies to existing conversations"),
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ to, subject, body, thread_id }) => {
      const user = resolveCurrentUser(db);
      const timestamp = new Date().toISOString();
      const finalThreadId = thread_id ?? `thread-${randomUUID().slice(0, 8)}`;

      const result = db
        .prepare(
          `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
           VALUES ('outlook', ?, ?, ?, ?, ?, 1, ?)`,
        )
        .run(user.email, to, subject, body, timestamp, finalThreadId);

      console.log(
        `[MCP Outlook] 📧 Email gesendet via Quick: ${user.email} → ${to} "${subject}"`,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message_id: result.lastInsertRowid,
              from: user.email,
              to,
              subject,
              timestamp,
              thread_id: finalThreadId,
            }),
          },
        ],
      };
    },
  );

  // --- Tool: get_user_identity ---
  server.tool(
    "get_user_identity",
    "Returns the identity, role, and responsibilities of the currently logged-in user.",
    {},
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async () => {
      const user = resolveCurrentUser(db);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              name: user.name,
              role: user.role,
              email: user.email,
              responsibilities: user.responsibilities,
              systems: user.systems,
            }),
          },
        ],
      };
    },
  );
}

// ─── Server Factory ──────────────────────────────────────────────────────────

/**
 * Creates and configures the MCP server instance with all tools registered.
 * The server identifies itself as an email system so that Amazon Quick
 * can correctly recognize which backend system is being addressed.
 */
export function createOutlookMcpServer(db: Database.Database): McpServer {
  const server = new McpServer({
    name: MCP_OUTLOOK_NAME,
    version: MCP_OUTLOOK_VERSION,
  });

  registerOutlookTools(server, db);

  return server;
}

// ─── HTTP Server with OAuth + MCP ────────────────────────────────────────────

/**
 * Starts the Outlook MCP Server with Streamable HTTP Transport.
 */
async function main(): Promise<void> {
  // Initialize database and seed data
  const db = getDb();
  seedDatabase(db);

  // OAuth config for shared module
  const oauthConfig = { port: MCP_OUTLOOK_PORT, serverName: "outlook" };

  // Track active transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Create HTTP server
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(
        req.url ?? "/",
        `http://localhost:${MCP_OUTLOOK_PORT}`,
      );

      // --- OAuth 2.1 Endpoints (shared logic) ---
      const handled = await handleOAuthRequest(req, res, url, oauthConfig);
      if (handled) return;

      // --- /mcp endpoint: Streamable HTTP Transport ---
      if (url.pathname === "/mcp") {
        // Check for existing session
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (req.method === "POST") {
          // If we have an existing session, reuse the transport
          if (sessionId && transports.has(sessionId)) {
            const transport = transports.get(sessionId)!;
            await transport.handleRequest(req, res);
            return;
          }

          // New session: create transport, connect a new MCP server instance
          const newSessionId = randomUUID();
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => newSessionId,
          });

          // Store the transport BEFORE handling the request so that
          // subsequent requests (e.g. notifications/initialized) can find it
          transports.set(newSessionId, transport);
          transport.onclose = () => {
            transports.delete(newSessionId);
          };

          const server = createOutlookMcpServer(db);
          await server.connect(transport);

          // Handle the initialization request
          await transport.handleRequest(req, res);
          return;
        }

        if (req.method === "GET") {
          // SSE endpoint for server-initiated messages (requires existing session)
          if (sessionId && transports.has(sessionId)) {
            const transport = transports.get(sessionId)!;
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

        if (req.method === "DELETE") {
          // Session termination
          if (sessionId && transports.has(sessionId)) {
            const transport = transports.get(sessionId)!;
            await transport.handleRequest(req, res);
            return;
          }
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: { code: -32000, message: "Session not found" },
              id: null,
            }),
          );
          return;
        }

        // Method not allowed
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      // --- /health endpoint ---
      if (url.pathname === "/health" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "ok",
            name: MCP_OUTLOOK_NAME,
            version: MCP_OUTLOOK_VERSION,
          }),
        );
        return;
      }

      // 404 for everything else
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    },
  );

  httpServer.listen(MCP_OUTLOOK_PORT, () => {
    console.log(`[MCP] ${MCP_OUTLOOK_NAME} v${MCP_OUTLOOK_VERSION} ready`);
    console.log(
      `[MCP] Streamable HTTP Transport listening on http://localhost:${MCP_OUTLOOK_PORT}/mcp`,
    );
    console.log(
      `[MCP] OAuth 2.1 metadata at http://localhost:${MCP_OUTLOOK_PORT}/.well-known/oauth-authorization-server`,
    );
    console.log(`[MCP] Database initialized and seeded`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[MCP] Shutting down...");
    for (const transport of transports.values()) {
      await transport.close();
    }
    httpServer.close();
    db.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Only run main() when this file is the entry point (not when imported by server-stdio.ts)
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("mcp-outlook/src/server.ts") ||
    process.argv[1].endsWith("mcp-outlook/src/server.js"));

if (isMainModule) {
  main().catch((err) => {
    console.error("[MCP] Fatal error:", err);
    process.exit(1);
  });
}
