import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "schema.sql");

/**
 * Initializes the database schema by executing schema.sql.
 * Uses IF NOT EXISTS so it's safe to call multiple times.
 */
function initSchema(db: Database.Database): void {
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
}

/**
 * Factory function to create or open a SQLite database.
 * Applies the schema on every call (idempotent via IF NOT EXISTS).
 */
export function getDb(dbPath: string = "./simulation.db"): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}
