/**
 * REST API package – Soul Framework integration
 *
 * Soul stellt automatisch CRUD-Endpoints für alle SQLite-Tabellen bereit:
 *   GET    /api/tables/{tableName}/rows  – Zeilen lesen (mit Filter & Pagination)
 *   POST   /api/tables/{tableName}/rows  – Zeile einfügen
 *   PUT    /api/tables/{tableName}/rows/:id – Zeile aktualisieren
 *   DELETE /api/tables/{tableName}/rows/:id – Zeile löschen
 *
 * Tabellen (automatisch via CRUD verfügbar):
 *   - messages
 *   - demo_config
 *   - roles
 *
 * Konfiguration: soul.config.js
 * Start: node start.js (oder npm run dev)
 */

export const API_PORT = 8000;
export const API_BASE_URL = "http://localhost:8000/api";
export const CORS_ORIGIN = "http://localhost:5173";

/** Soul-generierte Table-Endpoints */
export const TABLES = ["messages", "demo_config", "roles"] as const;
export type TableName = (typeof TABLES)[number];

/** Helper: URL für Table-Rows */
export function getTableRowsUrl(table: TableName): string {
  return `${API_BASE_URL}/tables/${table}/rows`;
}
