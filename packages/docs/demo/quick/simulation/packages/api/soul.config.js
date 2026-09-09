/**
 * Soul-Framework Konfiguration für die ALDI SÜD Supply Chain Simulation.
 *
 * Dieses Modul definiert die Konfiguration für den Soul-kompatiblen REST API Server.
 * Der Server stellt automatische CRUD-Endpoints für alle SQLite-Tabellen bereit:
 *
 *   GET    /api/tables/{tableName}/rows  – Zeilen lesen (mit Filter & Pagination)
 *   POST   /api/tables/{tableName}/rows  – Zeile einfügen
 *   PUT    /api/tables/{tableName}/rows/:id – Zeile aktualisieren
 *   DELETE /api/tables/{tableName}/rows/:id – Zeile löschen
 *
 * Tabellen mit automatischem CRUD: messages, demo_config, roles
 */

const path = require("path");

module.exports = {
  // Pfad zur gemeinsamen SQLite-Datenbank (relativ zum Simulationsroot)
  database: path.resolve(__dirname, "../../simulation.db"),

  // REST API Port
  port: 8000,

  // CORS-Konfiguration: Frontend dev server erlauben
  cors: {
    origin: "http://localhost:5173",
  },

  // Verzeichnis mit API Extensions (Custom Endpoints)
  extensionsPath: path.resolve(__dirname, "extensions"),
};
