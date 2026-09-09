/**
 * Teams MCP Server – ALDI SUED Microsoft Teams
 *
 * Provides Teams chat/channel access for Amazon Quick via Streamable HTTP Transport (JSON-RPC 2.0).
 * Port: 3002, Endpoint: /mcp
 *
 * Requirements: 9.1, 9.2, 9.3, 9.5, 9.8, 9.9
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

export const MCP_TEAMS_PORT = 3002;
export const MCP_TEAMS_NAME = "Teams";
export const MCP_TEAMS_VERSION = "1.0.0";

// ─── MCP Tool Registration ───────────────────────────────────────────────────

/**
 * Registers all Teams MCP tools on the server instance.
 */
export function registerTeamsTools(
  server: McpServer,
  db: Database.Database,
): void {
  // --- Tool: get_channels ---
  server.tool(
    "get_channels",
    "Lists all available Teams channels where the current user is a member. Channels are derived from existing conversation threads.",
    {
      limit: z
        .number()
        .optional()
        .default(50)
        .describe("Maximum number of channels (default: 50)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ limit }) => {
      const user = resolveCurrentUser(db);

      // Get unique thread_ids grouped as channels from teams messages
      // where the user is either sender or recipient
      const rows = db
        .prepare(
          `SELECT thread_id, 
                  MIN(timestamp) as created_at,
                  MAX(timestamp) as last_activity,
                  COUNT(*) as message_count,
                  subject
           FROM messages
           WHERE channel = 'teams'
             AND (sender = ? OR recipient = ?)
             AND thread_id IS NOT NULL
           GROUP BY thread_id
           ORDER BY last_activity DESC
           LIMIT ?`,
        )
        .all(user.email, user.email, limit) as Array<{
        thread_id: string;
        created_at: string;
        last_activity: string;
        message_count: number;
        subject: string | null;
      }>;

      const channels = rows.map((row) => ({
        id: row.thread_id,
        name: row.subject ?? row.thread_id,
        created_at: row.created_at,
        last_activity: row.last_activity,
        message_count: row.message_count,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(channels, null, 2),
          },
        ],
      };
    },
  );

  // --- Tool: get_messages ---
  server.tool(
    "get_messages",
    "Retrieves chat messages from Microsoft Teams. Can be filtered by channel (thread_id).",
    {
      thread_id: z.string().optional().describe("Filter by thread/channel ID"),
      limit: z
        .number()
        .optional()
        .default(30)
        .describe("Maximum number of messages (default: 30)"),
      since: z
        .string()
        .optional()
        .describe(
          "Messages since date (ISO 8601 format, e.g. 2025-07-01T00:00:00Z)",
        ),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ thread_id, limit, since }) => {
      const user = resolveCurrentUser(db);
      const conditions: string[] = [
        "channel = 'teams'",
        "(sender = ? OR recipient = ?)",
      ];
      const params: unknown[] = [user.email, user.email];

      if (thread_id) {
        conditions.push("thread_id = ?");
        params.push(thread_id);
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

      const messages = rows.map((row) => ({
        id: row.id,
        from: row.sender,
        to: row.recipient,
        channel_name: row.subject ?? row.thread_id,
        body: row.body,
        timestamp: row.timestamp,
        read: row.read_status === 1,
        thread_id: row.thread_id,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(messages, null, 2),
          },
        ],
      };
    },
  );

  // --- Tool: send_message ---
  server.tool(
    "send_message",
    "Sends a message in a Microsoft Teams channel on behalf of the logged-in user.",
    {
      to: z.string().describe("Recipient (email address or channel name)"),
      body: z.string().describe("Message text"),
      thread_id: z
        .string()
        .optional()
        .describe("Thread ID of the channel (creates a new thread if empty)"),
      subject: z
        .string()
        .optional()
        .describe("Channel name/subject (optional, for new threads)"),
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ to, body, thread_id, subject }) => {
      const user = resolveCurrentUser(db);
      const timestamp = new Date().toISOString();
      const finalThreadId =
        thread_id ?? `teams-thread-${randomUUID().slice(0, 8)}`;

      const result = db
        .prepare(
          `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
           VALUES ('teams', ?, ?, ?, ?, ?, 1, ?)`,
        )
        .run(user.email, to, subject ?? null, body, timestamp, finalThreadId);

      console.log(
        `[MCP Teams] 💬 Nachricht gesendet via Quick: ${user.email} → ${to} (Thread: ${subject ?? finalThreadId})`,
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
              timestamp,
              thread_id: finalThreadId,
              channel_name: subject ?? finalThreadId,
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
 * Creates and configures the Teams MCP server instance with all tools registered.
 * The server identifies itself as a chat & collaboration system so that Amazon Quick
 * can correctly recognize which backend system is being addressed.
 */
export function createTeamsMcpServer(db: Database.Database): McpServer {
  const server = new McpServer({
    name: MCP_TEAMS_NAME,
    version: MCP_TEAMS_VERSION,
  });

  registerTeamsTools(server, db);

  return server;
}

// ─── HTTP Server with OAuth + MCP ────────────────────────────────────────────

/**
 * Starts the Teams MCP Server with Streamable HTTP Transport.
 */
async function main(): Promise<void> {
  // Initialize database and seed data
  const db = getDb();
  seedDatabase(db);

  // OAuth config for shared module
  const oauthConfig = { port: MCP_TEAMS_PORT, serverName: "teams" };

  // Track active transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Create HTTP server
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? "/", `http://localhost:${MCP_TEAMS_PORT}`);

      // --- OAuth 2.1 Endpoints (shared logic) ---
      const handled = await handleOAuthRequest(req, res, url, oauthConfig);
      if (handled) return;

      // --- /mcp endpoint: Streamable HTTP Transport ---
      if (url.pathname === "/mcp") {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (req.method === "POST") {
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

          transports.set(newSessionId, transport);
          transport.onclose = () => {
            transports.delete(newSessionId);
          };

          const server = createTeamsMcpServer(db);
          await server.connect(transport);

          await transport.handleRequest(req, res);
          return;
        }

        if (req.method === "GET") {
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
            name: MCP_TEAMS_NAME,
            version: MCP_TEAMS_VERSION,
          }),
        );
        return;
      }

      // 404 for everything else
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    },
  );

  httpServer.listen(MCP_TEAMS_PORT, () => {
    console.log(`[MCP] ${MCP_TEAMS_NAME} v${MCP_TEAMS_VERSION} ready`);
    console.log(
      `[MCP] Streamable HTTP Transport listening on http://localhost:${MCP_TEAMS_PORT}/mcp`,
    );
    console.log(
      `[MCP] OAuth 2.1 metadata at http://localhost:${MCP_TEAMS_PORT}/.well-known/oauth-authorization-server`,
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

// Only run main() when this file is the entry point (not when imported for tests or stdio)
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("mcp-teams/src/server.ts") ||
    process.argv[1].endsWith("mcp-teams/src/server.js"));

if (isMainModule) {
  main().catch((err) => {
    console.error("[MCP] Fatal error:", err);
    process.exit(1);
  });
}
