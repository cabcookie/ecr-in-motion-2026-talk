/**
 * Development entry point for the Agent Engine.
 *
 * Starts all 6 role agents with the polling loop, using the shared SQLite database.
 * Handles graceful shutdown on SIGINT/SIGTERM.
 */

import { getDb } from "@simulation/db";
import { createAgentEngine } from "./orchestrator.js";
import {
  SortimentsplanungAgent,
  ScCoordinatorAgent,
  LogistikAgent,
  FilialnachbestellungAgent,
  LieferantenAgent,
} from "./agents/index.js";

const DB_PATH = process.env.SIMULATION_DB_PATH || "../../simulation.db";

function main() {
  const db = getDb(DB_PATH);

  // Instantiate all role agents (excluding buyer – that's the Quick user)
  const agents = [
    new SortimentsplanungAgent(),
    // EinkaufAgent is excluded: Markus Weber is the human user in Amazon Quick
    new ScCoordinatorAgent(),
    new LogistikAgent(),
    new FilialnachbestellungAgent(),
    new LieferantenAgent(),
  ];

  const engine = createAgentEngine(db, agents);
  engine.start();

  console.log("[AgentEngine] Dev mode – polling for events...");

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n[AgentEngine] Shutting down...");
    engine.stop();
    db.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
