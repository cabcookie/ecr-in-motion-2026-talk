/**
 * SAP MCP Server – ALDI SUED SAP S/4HANA
 *
 * Provides ERP/supply chain access for Amazon Quick via Streamable HTTP Transport (JSON-RPC 2.0).
 * Port: 3003, Endpoint: /mcp
 *
 * Tools: get_supply_chain_status, get_supplier_performance, get_escalation_history,
 *        trigger_disruption_event, get_user_identity, create_purchase_order, get_purchase_orders
 *
 * IMPORTANT: Bestellungen (Purchase Orders) werden ausschließlich über create_purchase_order
 * im SAP angelegt – NICHT per E-Mail. Dies gewährleistet Nachvollziehbarkeit und korrekte
 * Prozessabbildung im ERP-System.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.6, 9.8, 9.9
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

export const MCP_SAP_PORT = 3003;
export const MCP_SAP_NAME = "SAP";
export const MCP_SAP_VERSION = "1.0.0";

// ─── MCP Tool Registration ───────────────────────────────────────────────────

/**
 * Registers all SAP MCP tools on the server instance.
 */
export function registerSapTools(
  server: McpServer,
  db: Database.Database,
): void {
  // --- Tool: get_supply_chain_status ---
  server.tool(
    "get_supply_chain_status",
    "Retrieves the current supply chain status with KPI values (OTD, OSA, cost deviation, MAPE) from SAP S/4HANA.",
    {
      kpi_name: z
        .string()
        .optional()
        .describe(
          "Optional filter for a specific KPI (otd, osa, cost_deviation, mape)",
        ),
      days: z
        .number()
        .optional()
        .default(7)
        .describe("Number of past days for the history (default: 7)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ kpi_name, days }) => {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (kpi_name) {
        conditions.push("kpi_name = ?");
        params.push(kpi_name);
      }

      // Get records from the last N days
      conditions.push("timestamp >= datetime('now', ?)");
      params.push(`-${days} days`);

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT id, kpi_name, value, timestamp, role_id
                   FROM kpi_states
                   ${whereClause}
                   ORDER BY timestamp DESC`;

      const rows = db.prepare(sql).all(...params) as Array<{
        id: number;
        kpi_name: string;
        value: number;
        timestamp: string;
        role_id: string | null;
      }>;

      // Also get the latest value per KPI for a summary
      const latestSql = `SELECT kpi_name, value, timestamp
                         FROM kpi_states
                         WHERE id IN (
                           SELECT MAX(id) FROM kpi_states GROUP BY kpi_name
                         )`;
      const latestRows = db.prepare(latestSql).all() as Array<{
        kpi_name: string;
        value: number;
        timestamp: string;
      }>;

      const summary: Record<string, { value: number; timestamp: string }> = {};
      for (const row of latestRows) {
        summary[row.kpi_name] = { value: row.value, timestamp: row.timestamp };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                summary,
                history: rows,
                period_days: days,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Tool: get_supplier_performance ---
  server.tool(
    "get_supplier_performance",
    "Retrieves supplier performance data from SAP, including OTD scores, risk clusters, and contract status.",
    {
      supplier_name: z
        .string()
        .optional()
        .describe("Filter by supplier name (substring search)"),
      risk_cluster: z
        .string()
        .optional()
        .describe(
          "Filter by risk cluster (geo_energy_transport or climate_agri_fresh)",
        ),
      min_otd_score: z
        .number()
        .optional()
        .describe("Minimum OTD score filter (0.0 to 1.0)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ supplier_name, risk_cluster, min_otd_score }) => {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (supplier_name) {
        conditions.push("name LIKE ?");
        params.push(`%${supplier_name}%`);
      }

      if (risk_cluster) {
        conditions.push("risk_cluster = ?");
        params.push(risk_cluster);
      }

      if (min_otd_score !== undefined) {
        conditions.push("otd_score >= ?");
        params.push(min_otd_score);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT id, name, region, products, otd_score, risk_cluster, contract_status
                   FROM suppliers
                   ${whereClause}
                   ORDER BY otd_score DESC`;

      const rows = db.prepare(sql).all(...params) as Array<{
        id: number;
        name: string;
        region: string;
        products: string;
        otd_score: number;
        risk_cluster: string | null;
        contract_status: string;
      }>;

      const suppliers = rows.map((row) => ({
        id: row.id,
        name: row.name,
        region: row.region,
        products: JSON.parse(row.products),
        otd_score: row.otd_score,
        otd_percentage: `${(row.otd_score * 100).toFixed(1)}%`,
        risk_cluster: row.risk_cluster,
        contract_status: row.contract_status,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                total_suppliers: suppliers.length,
                suppliers,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Tool: get_escalation_history ---
  server.tool(
    "get_escalation_history",
    "Retrieves the escalation history from SAP, including level, triggering KPI, and status.",
    {
      level: z
        .number()
        .optional()
        .describe("Filter by escalation level (1, 2, or 3)"),
      open_only: z
        .boolean()
        .optional()
        .default(false)
        .describe("Show only open (unresolved) escalations"),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("Maximum number of results (default: 20)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ level, open_only, limit }) => {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (level !== undefined) {
        conditions.push("level = ?");
        params.push(level);
      }

      if (open_only) {
        conditions.push("resolved_at IS NULL");
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT id, level, trigger_kpi, trigger_value, threshold, channel, created_at, resolved_at
                   FROM escalations
                   ${whereClause}
                   ORDER BY created_at DESC
                   LIMIT ?`;
      params.push(limit);

      const rows = db.prepare(sql).all(...params) as Array<{
        id: number;
        level: number;
        trigger_kpi: string;
        trigger_value: number;
        threshold: number;
        channel: string;
        created_at: string;
        resolved_at: string | null;
      }>;

      const escalations = rows.map((row) => ({
        id: row.id,
        level: row.level,
        level_name:
          row.level === 1
            ? "Operational"
            : row.level === 2
              ? "Tactical"
              : "Strategic",
        trigger_kpi: row.trigger_kpi,
        trigger_value: row.trigger_value,
        threshold: row.threshold,
        channel: row.channel,
        created_at: row.created_at,
        resolved_at: row.resolved_at,
        status: row.resolved_at ? "resolved" : "open",
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                total_escalations: escalations.length,
                open_count: escalations.filter((e) => e.status === "open")
                  .length,
                escalations,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Tool: trigger_disruption_event ---
  server.tool(
    "trigger_disruption_event",
    "Triggers a disruption scenario in the supply chain. Creates an event in the event queue with the scenario details.",
    {
      scenario_type: z
        .string()
        .describe(
          "Type of disruption scenario (e.g. recall, packaging_change, seasonal_peak, it_outage, extreme_weather, minimum_wage, supply_chain_disruption, pandemic)",
        ),
      affected_skus: z
        .array(z.string())
        .optional()
        .describe("List of affected SKU numbers (optional, default: all)"),
      duration_days: z
        .number()
        .optional()
        .default(14)
        .describe("Expected duration of the disruption in days (default: 14)"),
      description: z
        .string()
        .optional()
        .describe("Optional description of the scenario"),
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({ scenario_type, affected_skus, duration_days, description }) => {
      const user = resolveCurrentUser(db);
      const timestamp = new Date().toISOString();

      // Look up margin impact from demo_config if available
      const configKey = `scenario_${scenario_type}`;
      const configRow = db
        .prepare("SELECT value FROM demo_config WHERE key = ?")
        .get(configKey) as { value: string } | undefined;

      let marginImpact = 0;
      if (configRow) {
        try {
          const config = JSON.parse(configRow.value);
          marginImpact = config.margin_impact_bps ?? 0;
        } catch {
          // ignore parse error
        }
      }

      // If no affected_skus specified, get all buyer SKUs from inventory
      let skus = affected_skus;
      if (!skus || skus.length === 0) {
        const inventoryRows = db
          .prepare("SELECT DISTINCT sku FROM inventory LIMIT 10")
          .all() as Array<{ sku: string }>;
        skus = inventoryRows.map((r) => r.sku);
      }

      const payload = JSON.stringify({
        type: scenario_type,
        affected_skus: skus,
        duration: duration_days,
        margin_impact: marginImpact,
        description: description ?? `Disruption: ${scenario_type}`,
        triggered_by: user.email,
      });

      const result = db
        .prepare(
          `INSERT INTO events (timestamp, type, source_role, target_role, payload, status, scenario_id)
           VALUES (?, 'disruption', ?, NULL, ?, 'pending', ?)`,
        )
        .run(timestamp, "buyer", payload, scenario_type);

      console.log(
        `[MCP SAP] 🔥 Disruption via Quick: "${scenario_type}", Event #${result.lastInsertRowid}, SKUs: ${skus?.length ?? 0}, Dauer: ${duration_days}d`,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                event_id: result.lastInsertRowid,
                scenario_type,
                affected_skus: skus,
                duration_days,
                margin_impact_bps: marginImpact,
                timestamp,
                status: "pending",
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Tool: get_user_identity ---
  server.tool(
    "get_user_identity",
    "Returns the identity, role, and responsibilities of the currently logged-in SAP user.",
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

  // --- Tool: create_purchase_order ---
  server.tool(
    "create_purchase_order",
    "Creates a new purchase order in the SAP S/4HANA system. Use this tool to order goods from suppliers – NOT via email. The order is created in SAP and the supplier is automatically notified.",
    {
      supplier_name: z
        .string()
        .describe("Supplier name (must match a known supplier in the system)"),
      sku: z.string().describe("SKU number of the item to order"),
      product_name: z.string().describe("Product name"),
      quantity: z
        .number()
        .int()
        .positive()
        .describe("Order quantity in sales units"),
      unit_price: z
        .number()
        .positive()
        .optional()
        .describe(
          "Unit price in EUR (optional, determined from framework contract)",
        ),
      requested_delivery_date: z
        .string()
        .describe("Requested delivery date in YYYY-MM-DD format"),
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    async ({
      supplier_name,
      sku,
      product_name,
      quantity,
      unit_price,
      requested_delivery_date,
    }) => {
      // Verify supplier exists
      const supplier = db
        .prepare("SELECT id, name FROM suppliers WHERE name LIKE ?")
        .get(`%${supplier_name}%`) as { id: number; name: string } | undefined;

      if (!supplier) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error: `Supplier "${supplier_name}" not found in the system. Please check the name.`,
              }),
            },
          ],
        };
      }

      // Generate PO number
      const year = new Date().getFullYear();
      const countRow = db
        .prepare(
          "SELECT COUNT(*) as cnt FROM purchase_orders WHERE po_number LIKE ?",
        )
        .get(`PO-${year}-%`) as { cnt: number };
      const poNumber = `PO-${year}-${String(countRow.cnt + 1).padStart(4, "0")}`;

      // Insert the purchase order
      const result = db
        .prepare(
          `INSERT INTO purchase_orders (po_number, supplier_name, sku, product_name, quantity, unit_price, requested_delivery_date, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))`,
        )
        .run(
          poNumber,
          supplier.name,
          sku,
          product_name,
          quantity,
          unit_price ?? null,
          requested_delivery_date,
        );

      // Create an event so the agent engine can notify the supplier agent
      db.prepare(
        `INSERT INTO events (type, source_role, target_role, payload, status, scenario_id)
         VALUES ('purchase_order_created', 'buyer', 'supplier_agent', ?, 'pending', NULL)`,
      ).run(
        JSON.stringify({
          po_id: result.lastInsertRowid,
          po_number: poNumber,
          supplier_name: supplier.name,
          sku,
          product_name,
          quantity,
          unit_price: unit_price ?? null,
          requested_delivery_date,
        }),
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                po_number: poNumber,
                po_id: result.lastInsertRowid,
                supplier: supplier.name,
                sku,
                product_name,
                quantity,
                requested_delivery_date,
                status: "open",
                message: `Purchase order ${poNumber} successfully created in SAP. The supplier will be automatically notified.`,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Tool: get_purchase_orders ---
  server.tool(
    "get_purchase_orders",
    "Retrieves current purchase orders from SAP S/4HANA. Shows status, delivery dates, and supplier confirmations.",
    {
      status: z
        .string()
        .optional()
        .describe(
          "Filter by status: open, confirmed, shipped, delivered, cancelled",
        ),
      supplier_name: z
        .string()
        .optional()
        .describe("Filter by supplier name (substring search)"),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("Maximum number of results (default: 20)"),
    },
    { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    async ({ status, supplier_name, limit }) => {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (status) {
        conditions.push("status = ?");
        params.push(status);
      }

      if (supplier_name) {
        conditions.push("supplier_name LIKE ?");
        params.push(`%${supplier_name}%`);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT id, po_number, supplier_name, sku, product_name, quantity, unit_price, requested_delivery_date, confirmed_delivery_date, status, created_at, updated_at
                   FROM purchase_orders
                   ${whereClause}
                   ORDER BY created_at DESC
                   LIMIT ?`;
      params.push(limit);

      const rows = db.prepare(sql).all(...params) as Array<{
        id: number;
        po_number: string;
        supplier_name: string;
        sku: string;
        product_name: string;
        quantity: number;
        unit_price: number | null;
        requested_delivery_date: string;
        confirmed_delivery_date: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                total_orders: rows.length,
                orders: rows.map((row) => ({
                  ...row,
                  status_label:
                    row.status === "open"
                      ? "Open"
                      : row.status === "confirmed"
                        ? "Confirmed"
                        : row.status === "shipped"
                          ? "Shipped"
                          : row.status === "delivered"
                            ? "Delivered"
                            : "Cancelled",
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}

// ─── Server Factory ──────────────────────────────────────────────────────────

/**
 * Creates and configures the MCP server instance with all tools registered.
 * The server identifies itself as an ERP system so that Amazon Quick
 * can correctly recognize which backend system is being addressed.
 */
export function createSapMcpServer(db: Database.Database): McpServer {
  const server = new McpServer({
    name: MCP_SAP_NAME,
    version: MCP_SAP_VERSION,
  });

  registerSapTools(server, db);

  return server;
}

// ─── HTTP Server with OAuth + MCP ────────────────────────────────────────────

/**
 * Starts the SAP MCP Server with Streamable HTTP Transport.
 */
async function main(): Promise<void> {
  // Initialize database and seed data
  const db = getDb();
  seedDatabase(db);

  // OAuth config for shared module
  const oauthConfig = { port: MCP_SAP_PORT, serverName: "sap" };

  // Track active transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Create HTTP server
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? "/", `http://localhost:${MCP_SAP_PORT}`);

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

          const newSessionId = randomUUID();
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => newSessionId,
          });

          transports.set(newSessionId, transport);
          transport.onclose = () => {
            transports.delete(newSessionId);
          };

          const server = createSapMcpServer(db);
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
            name: MCP_SAP_NAME,
            version: MCP_SAP_VERSION,
          }),
        );
        return;
      }

      // 404 for everything else
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    },
  );

  httpServer.listen(MCP_SAP_PORT, () => {
    console.log(`[MCP] ${MCP_SAP_NAME} v${MCP_SAP_VERSION} ready`);
    console.log(
      `[MCP] Streamable HTTP Transport listening on http://localhost:${MCP_SAP_PORT}/mcp`,
    );
    console.log(
      `[MCP] OAuth 2.1 metadata at http://localhost:${MCP_SAP_PORT}/.well-known/oauth-authorization-server`,
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

// Only run main() when this file is the entry point
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("server.ts") ||
    process.argv[1].endsWith("server.js"));

if (isMainModule) {
  main().catch((err) => {
    console.error("[MCP] Fatal error:", err);
    process.exit(1);
  });
}
