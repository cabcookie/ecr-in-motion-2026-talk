#!/usr/bin/env node

/**
 * Soul-kompatible REST API für die ALDI SÜD Supply Chain Simulation.
 *
 * Repliziert die Soul-Framework API-Oberfläche mit Express + better-sqlite3.
 * Bietet automatische CRUD-Endpoints für alle SQLite-Tabellen:
 *
 *   GET    /api/tables                        – Alle Tabellen auflisten
 *   GET    /api/tables/{tableName}/rows       – Zeilen lesen (Filter & Pagination)
 *   POST   /api/tables/{tableName}/rows       – Zeile einfügen
 *   PUT    /api/tables/{tableName}/rows/:id   – Zeile aktualisieren
 *   DELETE /api/tables/{tableName}/rows/:id   – Zeile löschen
 *
 * Zusätzlich werden Extensions aus dem extensions/-Verzeichnis geladen.
 */

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const config = require("./soul.config");

// --- Prüfungen ---

if (!fs.existsSync(config.database)) {
  console.error(
    `[soul-api] Fehler: Datenbank nicht gefunden: ${config.database}`,
  );
  console.error(
    "[soul-api] Bitte zuerst die Datenbank initialisieren (packages/db).",
  );
  process.exit(1);
}

// --- Datenbank ---

const db = new Database(config.database, { verbose: undefined });
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// --- Express App ---

const app = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

// --- Helper: Tabellennamen aus SQLite holen ---

function getTableNames() {
  const rows = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all();
  return rows.map((r) => r.name);
}

function tableExists(tableName) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(tableName);
  return !!row;
}

function getPrimaryKeyColumn(tableName) {
  const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
  const pkCol = columns.find((c) => c.pk === 1);
  return pkCol ? pkCol.name : "id";
}

// --- Soul-kompatible CRUD-Endpoints ---

/**
 * GET /api/tables – Alle Tabellen auflisten
 */
app.get("/api/tables", (req, res) => {
  try {
    const tables = getTableNames();
    res.json({ tables });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tables/:tableName/rows – Zeilen lesen
 *
 * Query-Parameter:
 *   _limit  – Maximale Anzahl (default: 50)
 *   _offset – Offset für Pagination (default: 0)
 *   _sort   – Spaltenname für Sortierung
 *   _order  – ASC oder DESC (default: ASC)
 *   _search – Volltextsuche über alle Text-Spalten
 *   filter  – Format: "column:value" (exakter Match)
 *   Alle anderen Query-Parameter werden als Spaltenfilter interpretiert
 */
app.get("/api/tables/:tableName/rows", (req, res) => {
  const { tableName } = req.params;

  if (!tableExists(tableName)) {
    return res.status(404).json({ error: `Table '${tableName}' not found` });
  }

  try {
    const limit = Math.min(parseInt(req.query._limit) || 50, 1000);
    const offset = parseInt(req.query._offset) || 0;
    const sort = req.query._sort;
    const order = req.query._order === "DESC" ? "DESC" : "ASC";

    // Filter-Bedingungen aufbauen
    const conditions = [];
    const params = {};

    // filter=column:value Format (Soul-kompatibel)
    if (req.query.filter) {
      const filters = Array.isArray(req.query.filter)
        ? req.query.filter
        : [req.query.filter];
      filters.forEach((f, i) => {
        const [col, val] = f.split(":");
        if (col && val !== undefined) {
          conditions.push(`"${col}" = @filter${i}`);
          params[`filter${i}`] = val;
        }
      });
    }

    // Direkte Spaltenfilter (key=value in query)
    const reserved = [
      "_limit",
      "_offset",
      "_sort",
      "_order",
      "_search",
      "filter",
    ];
    for (const [key, value] of Object.entries(req.query)) {
      if (!reserved.includes(key)) {
        conditions.push(`"${key}" = @col_${key}`);
        params[`col_${key}`] = value;
      }
    }

    let sql = `SELECT * FROM "${tableName}"`;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    if (sort) {
      sql += ` ORDER BY "${sort}" ${order}`;
    }
    sql += ` LIMIT @limit OFFSET @offset`;
    params.limit = limit;
    params.offset = offset;

    const rows = db.prepare(sql).all(params);

    // Count für Pagination
    let countSql = `SELECT COUNT(*) as total FROM "${tableName}"`;
    if (conditions.length > 0) {
      countSql += ` WHERE ${conditions.join(" AND ")}`;
    }
    const countParams = { ...params };
    delete countParams.limit;
    delete countParams.offset;
    const { total } = db.prepare(countSql).get(countParams);

    res.json({
      data: rows,
      total,
      next:
        offset + limit < total
          ? { _offset: offset + limit, _limit: limit }
          : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tables/:tableName/rows – Zeile einfügen
 */
app.post("/api/tables/:tableName/rows", (req, res) => {
  const { tableName } = req.params;

  if (!tableExists(tableName)) {
    return res.status(404).json({ error: `Table '${tableName}' not found` });
  }

  try {
    const data = req.body;
    const columns = Object.keys(data);
    const placeholders = columns.map((c) => `@${c}`);

    const sql = `INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders.join(", ")})`;
    const result = db.prepare(sql).run(data);

    res.status(201).json({
      message: "Row inserted",
      data: { id: result.lastInsertRowid, ...data },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/tables/:tableName/rows/:id – Zeile aktualisieren
 */
app.put("/api/tables/:tableName/rows/:id", (req, res) => {
  const { tableName, id } = req.params;

  if (!tableExists(tableName)) {
    return res.status(404).json({ error: `Table '${tableName}' not found` });
  }

  try {
    const data = req.body;
    const columns = Object.keys(data);
    const setClause = columns.map((c) => `"${c}" = @${c}`).join(", ");
    const pkColumn = getPrimaryKeyColumn(tableName);

    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE "${pkColumn}" = @_row_id`;
    const params = { ...data, _row_id: id };
    const result = db.prepare(sql).run(params);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: `Row with ${pkColumn} '${id}' not found` });
    }

    res.json({ message: "Row updated", data: { [pkColumn]: id, ...data } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/tables/:tableName/rows/:id – Zeile löschen
 */
app.delete("/api/tables/:tableName/rows/:id", (req, res) => {
  const { tableName, id } = req.params;

  if (!tableExists(tableName)) {
    return res.status(404).json({ error: `Table '${tableName}' not found` });
  }

  try {
    const pkColumn = getPrimaryKeyColumn(tableName);
    const sql = `DELETE FROM "${tableName}" WHERE "${pkColumn}" = @id`;
    const result = db.prepare(sql).run({ id });

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: `Row with ${pkColumn} '${id}' not found` });
    }

    res.json({ message: "Row deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Extensions laden ---

if (fs.existsSync(config.extensionsPath)) {
  const extensionFiles = fs
    .readdirSync(config.extensionsPath)
    .filter((f) => f.endsWith(".js"));

  for (const file of extensionFiles) {
    const extPath = path.join(config.extensionsPath, file);
    try {
      const extensions = require(extPath);

      for (const [name, ext] of Object.entries(extensions)) {
        const method = ext.method.toLowerCase();
        if (typeof app[method] === "function") {
          app[method](ext.path, (req, res) => ext.handler(req, res, db));
          console.log(
            `[soul-api]   Extension: ${ext.method} ${ext.path} (${name})`,
          );
        }
      }
    } catch (error) {
      console.error(
        `[soul-api] Fehler beim Laden der Extension ${file}: ${error.message}`,
      );
    }
  }
}

// --- Server starten ---

const server = app.listen(config.port, () => {
  console.log(`[soul-api] Soul-kompatible REST API gestartet`);
  console.log(`[soul-api]   URL:       http://localhost:${config.port}`);
  console.log(`[soul-api]   Datenbank: ${config.database}`);
  console.log(`[soul-api]   CORS:      ${config.cors.origin}`);
  console.log(`[soul-api]   Tabellen:  ${getTableNames().join(", ")}`);
});

// --- Graceful Shutdown ---

process.on("SIGINT", () => {
  console.log("\n[soul-api] Shutting down...");
  server.close();
  db.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.close();
  db.close();
  process.exit(0);
});
