/**
 * SAP MCP Server – ALDI SUED SAP S/4HANA (stdio Transport)
 *
 * This variant uses stdio transport for local integration with Amazon Quick.
 * Quick starts this process directly and communicates via stdin/stdout.
 *
 * Usage in Amazon Quick "Add MCP" dialog:
 *   Command: npx
 *   Arguments: tsx /path/to/quick/simulation/packages/mcp-sap/src/server-stdio.ts
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, seedDatabase } from "../../db/src/index.js";
import { createSapMcpServer } from "./server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  // Use a fixed DB path relative to this file (so it works regardless of cwd)
  const dbPath = resolve(__dirname, "../../../simulation.db");

  // Initialize database and seed data
  const db = getDb(dbPath);
  seedDatabase(db);

  // Create the MCP server with all tools registered
  const server = createSapMcpServer(db);

  // Connect via stdio transport (Quick manages the process lifecycle)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    db.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    db.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[MCP SAP stdio] Fatal error:", err);
  process.exit(1);
});
