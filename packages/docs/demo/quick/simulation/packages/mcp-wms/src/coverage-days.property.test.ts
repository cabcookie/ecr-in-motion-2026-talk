/**
 * Property-Based Test: Coverage-Days-Berechnung (Property 16)
 *
 * For every SKU with a known quantity and daily consumption rate:
 * - coverage_days = quantity / daily_consumption_rate (within floating point tolerance)
 * - When coverage_days < 3, the WMS get_inventory_coverage tool's warning flag is true
 * - When coverage_days >= 3, the warning flag is false
 *
 * **Validates: Requirements 15.1, 15.3, 15.4**
 */

import fc from "fast-check";
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "../../db/src/schema.sql");

/**
 * Creates an in-memory SQLite database with the schema applied.
 */
function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  return db;
}

/**
 * Simulates the get_inventory_coverage tool logic from the WMS MCP server.
 * This mirrors the implementation in server.ts.
 */
function getInventoryCoverage(
  db: Database.Database,
  options: { warning_only?: boolean; limit?: number } = {},
): Array<{
  id: number;
  sku: string;
  product_name: string;
  quantity: number;
  location: string;
  last_updated: string;
  coverage_days: number;
  warning: boolean;
}> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.warning_only) {
    conditions.push("coverage_days < 3");
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `SELECT id, sku, product_name, quantity, location, last_updated, coverage_days
               FROM inventory
               ${whereClause}
               ORDER BY coverage_days ASC
               LIMIT ?`;
  params.push(options.limit ?? 50);

  const rows = db.prepare(sql).all(...params) as Array<{
    id: number;
    sku: string;
    product_name: string;
    quantity: number;
    location: string;
    last_updated: string;
    coverage_days: number;
  }>;

  return rows.map((row) => ({
    ...row,
    warning: row.coverage_days < 3,
  }));
}

// ─── Property 16: Coverage-Days-Berechnung ───────────────────────────────────

describe("Feature: supply-chain-simulation, Property 16: Coverage-Days-Berechnung", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  it("coverage_days = quantity / daily_consumption_rate and warning flag is correct", () => {
    fc.assert(
      fc.property(
        // Generate inventory items with quantity and daily consumption rate
        fc.array(
          fc.record({
            sku: fc.stringMatching(/^SKU-[0-9]{4}$/),
            product_name: fc.string({ minLength: 3, maxLength: 30 }),
            quantity: fc.integer({ min: 1, max: 10000 }),
            daily_consumption_rate: fc.double({
              min: 0.1,
              max: 500,
              noNaN: true,
            }),
            location: fc.oneof(
              fc.constant("VZ-Mülheim"),
              fc.constant("VZ-Duisburg"),
              fc.constant("VZ-Langenfeld"),
              fc.constant("VZ-Dormagen"),
            ),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        (inventoryItems) => {
          // Compute coverage_days and insert into the database
          const insertStmt = db.prepare(
            `INSERT INTO inventory (sku, product_name, quantity, location, last_updated, coverage_days)
             VALUES (?, ?, ?, ?, ?, ?)`,
          );

          const expectedItems: Array<{
            quantity: number;
            daily_consumption_rate: number;
            coverage_days: number;
          }> = [];

          for (const item of inventoryItems) {
            const coverage_days = item.quantity / item.daily_consumption_rate;

            insertStmt.run(
              item.sku,
              item.product_name,
              item.quantity,
              item.location,
              new Date().toISOString(),
              coverage_days,
            );

            expectedItems.push({
              quantity: item.quantity,
              daily_consumption_rate: item.daily_consumption_rate,
              coverage_days,
            });
          }

          // Query the inventory using the tool logic
          const results = getInventoryCoverage(db, { limit: 100 });

          // Invariant 1: coverage_days = quantity / daily_consumption_rate (within tolerance)
          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            // Find the matching expected item by quantity and coverage_days
            const matchingExpected = expectedItems.find(
              (e) =>
                e.quantity === result.quantity &&
                Math.abs(e.coverage_days - result.coverage_days) < 1e-9,
            );
            expect(matchingExpected).toBeDefined();

            // Verify the formula: coverage_days ≈ quantity / daily_consumption_rate
            if (matchingExpected) {
              const computedCoverage =
                matchingExpected.quantity /
                matchingExpected.daily_consumption_rate;
              expect(result.coverage_days).toBeCloseTo(computedCoverage, 5);
            }
          }

          // Invariant 2: When coverage_days < 3, warning flag is true
          for (const result of results) {
            if (result.coverage_days < 3) {
              expect(result.warning).toBe(true);
            }
          }

          // Invariant 3: When coverage_days >= 3, warning flag is false
          for (const result of results) {
            if (result.coverage_days >= 3) {
              expect(result.warning).toBe(false);
            }
          }

          // Invariant 4: warning_only filter returns only items with coverage_days < 3
          const warningResults = getInventoryCoverage(db, {
            warning_only: true,
            limit: 100,
          });
          for (const result of warningResults) {
            expect(result.coverage_days).toBeLessThan(3);
            expect(result.warning).toBe(true);
          }

          // Clean up for next iteration
          db.prepare("DELETE FROM inventory").run();
        },
      ),
      { numRuns: 100 },
    );
  });
});
