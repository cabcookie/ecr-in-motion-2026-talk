/**
 * Factory-Funktion für die Express-App.
 *
 * Extrahiert die App-Erstellung aus start.js, damit sie in Tests
 * mit einer eigenen (temporären) Datenbank verwendet werden kann.
 *
 * @param {import('better-sqlite3').Database} db - SQLite-Datenbankinstanz
 * @param {object} [options] - Optionale Konfiguration
 * @param {string} [options.extensionsPath] - Pfad zum Extensions-Verzeichnis
 * @returns {import('express').Express} Express-App
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

function createApp(db, options = {}) {
  const app = express();

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // --- Helper ---

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

  // --- CRUD Endpoints ---

  app.get("/api/tables", (req, res) => {
    try {
      const tables = getTableNames();
      res.json({ tables });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

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

      const conditions = [];
      const params = {};

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

  const extensionsPath =
    options.extensionsPath || path.resolve(__dirname, "../extensions");

  if (fs.existsSync(extensionsPath)) {
    const extensionFiles = fs
      .readdirSync(extensionsPath)
      .filter((f) => f.endsWith(".js"));

    for (const file of extensionFiles) {
      const extPath = path.join(extensionsPath, file);
      try {
        const extensions = require(extPath);

        for (const [name, ext] of Object.entries(extensions)) {
          const method = ext.method.toLowerCase();
          if (typeof app[method] === "function") {
            app[method](ext.path, (req, res) => ext.handler(req, res, db));
          }
        }
      } catch (error) {
        // Silently skip failing extensions in test mode
      }
    }
  }

  return app;
}

module.exports = { createApp };
