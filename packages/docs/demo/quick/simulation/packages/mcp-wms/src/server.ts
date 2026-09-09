/**
 * WMS MCP Server – ALDI SUED Manhattan WMS
 *
 * Provides warehouse management / inventory access for Amazon Quick via Streamable HTTP Transport (JSON-RPC 2.0).
 * Port: 3004, Endpoint: /mcp
 *
 * Requirements: 9.1, 9.2, 9.3, 9.7, 9.8, 9.9
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

export const MCP_WMS_PORT = 3004;
export const MCP_WMS_NAME = "WMS";
export const MCP_WMS_VERSION = "1.0.0";

// ─── MCP Tool Registration ───────────────────────────────────────────────────

/**
 * Registers all WMS MCP tools on the server instance.
 */
export function registerWmsTools(
  server: McpServer,
  db: Database.Database,
): void {
  // --- Tool: get_inventory_coverage ---
  server.tool(
    "get_inventory_coverage",
    "Queries inventory data and coverage days from Manhattan WMS. Shows SKU stock levels, warehouse locations, and warnings for low coverage.",
    {
      location: z
        .string()
        .optional()
        .describe(
          "Filter by warehouse location (e.g. 'VZ-Mülheim', 'VZ-Duisburg')",
        ),
      warning_only: z
        .boolean()
        .optional()
        .describe("Show only SKUs with coverage days < 3 (critical stock)"),
      sku: z.string().optional().describe("Filter by SKU number"),
      limit: z
        .number()
        .optional()
        .default(50)
        .describe("Maximum number of results (default: 50)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ location, warning_only, sku, limit }) => {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (location) {
        conditions.push("location = ?");
        params.push(location);
      }

      if (warning_only) {
        conditions.push("coverage_days < 3");
      }

      if (sku) {
        conditions.push("sku = ?");
        params.push(sku);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT id, sku, product_name, quantity, location, last_updated, coverage_days
                   FROM inventory
                   ${whereClause}
                   ORDER BY coverage_days ASC
                   LIMIT ?`;
      params.push(limit);

      const rows = db.prepare(sql).all(...params) as Array<{
        id: number;
        sku: string;
        product_name: string;
        quantity: number;
        location: string;
        last_updated: string;
        coverage_days: number;
      }>;

      const items = rows.map((row) => ({
        id: row.id,
        sku: row.sku,
        product_name: row.product_name,
        quantity: row.quantity,
        location: row.location,
        last_updated: row.last_updated,
        coverage_days: row.coverage_days,
        warning: row.coverage_days < 3,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(items, null, 2),
          },
        ],
      };
    },
  );

  // --- Tool: get_stock_movements ---
  server.tool(
    "get_stock_movements",
    "Queries stock movements (receipts, dispatches, corrections) from Manhattan WMS. Supports filtering by SKU and time period.",
    {
      sku: z.string().optional().describe("Filter by SKU number"),
      since: z
        .string()
        .optional()
        .describe(
          "Movements since date (ISO 8601 format, e.g. 2025-07-01T00:00:00Z)",
        ),
      until: z
        .string()
        .optional()
        .describe("Movements until date (ISO 8601 format)"),
      limit: z
        .number()
        .optional()
        .default(50)
        .describe("Maximum number of results (default: 50)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ sku, since, until, limit }) => {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (sku) {
        conditions.push("sku = ?");
        params.push(sku);
      }

      if (since) {
        conditions.push("last_updated >= ?");
        params.push(since);
      }

      if (until) {
        conditions.push("last_updated <= ?");
        params.push(until);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT id, sku, product_name, quantity, location, last_updated, coverage_days
                   FROM inventory
                   ${whereClause}
                   ORDER BY last_updated DESC
                   LIMIT ?`;
      params.push(limit);

      const rows = db.prepare(sql).all(...params) as Array<{
        id: number;
        sku: string;
        product_name: string;
        quantity: number;
        location: string;
        last_updated: string;
        coverage_days: number;
      }>;

      const movements = rows.map((row) => ({
        id: row.id,
        sku: row.sku,
        product_name: row.product_name,
        quantity: row.quantity,
        location: row.location,
        last_updated: row.last_updated,
        coverage_days: row.coverage_days,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(movements, null, 2),
          },
        ],
      };
    },
  );

  // --- Tool: get_user_identity ---
  server.tool(
    "get_user_identity",
    "Returns the identity, role, and responsibilities of the currently logged-in user in Manhattan WMS.",
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
 * The server identifies itself as a warehouse management system so that Amazon Quick
 * can correctly recognize which backend system is being addressed.
 */
export function createWmsMcpServer(db: Database.Database): McpServer {
  const server = new McpServer({
    name: MCP_WMS_NAME,
    version: MCP_WMS_VERSION,
  });

  registerWmsTools(server, db);

  return server;
}

// ─── HTTP Server with OAuth + MCP ────────────────────────────────────────────

/**
 * Starts the WMS MCP Server with Streamable HTTP Transport.
 */
async function main(): Promise<void> {
  // Initialize database and seed data
  const db = getDb();
  seedDatabase(db);

  // OAuth config for shared module
  const oauthConfig = { port: MCP_WMS_PORT, serverName: "wms" };

  // Track active transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Create HTTP server
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? "/", `http://localhost:${MCP_WMS_PORT}`);

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

          const server = createWmsMcpServer(db);
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
            name: MCP_WMS_NAME,
            version: MCP_WMS_VERSION,
          }),
        );
        return;
      }

      // 404 for everything else
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    },
  );

  httpServer.listen(MCP_WMS_PORT, () => {
    console.log(`[MCP] ${MCP_WMS_NAME} v${MCP_WMS_VERSION} ready`);
    console.log(
      `[MCP] Streamable HTTP Transport listening on http://localhost:${MCP_WMS_PORT}/mcp`,
    );
    console.log(
      `[MCP] OAuth 2.1 metadata at http://localhost:${MCP_WMS_PORT}/.well-known/oauth-authorization-server`,
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
  (process.argv[1].endsWith("mcp-wms/src/server.ts") ||
    process.argv[1].endsWith("mcp-wms/src/server.js"));

if (isMainModule) {
  main().catch((err) => {
    console.error("[MCP] Fatal error:", err);
    process.exit(1);
  });
}
