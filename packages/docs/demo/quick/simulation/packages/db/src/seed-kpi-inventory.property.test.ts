import fc from "fast-check";
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { seedDatabase } from "./seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "schema.sql");

function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  return db;
}

/**
 * **Validates: Requirements 2.2, 2.3**
 *
 * Property 2: Seed-Generierung erzeugt korrekte relative Zeiträume
 *
 * - KPI-Seed = 30 Datenpunkte pro KPI im Intervall [anchor - 30d, anchor] (4 KPIs × 30 = 120 total)
 * - Inventar-Seed = Bewegungen im Intervall [anchor - 14d, anchor]
 */
describe("Property 2 (vollständig): Seed-Generierung erzeugt korrekte relative Zeiträume für KPI und Inventar", () => {
  it("KPI-History: exactly 120 entries, all timestamps within [anchor - 30d, anchor]", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (rawAnchorDate) => {
          // Patch Date so seedDatabase uses our chosen anchor
          const anchorDate = new Date(
            rawAnchorDate.getFullYear(),
            rawAnchorDate.getMonth(),
            rawAnchorDate.getDate(),
            0,
            0,
            0,
            0,
          );

          const db = createTestDb();
          try {
            // Override Date constructor temporarily to control anchor date
            const OriginalDate = globalThis.Date;
            const FakeDate = function (...args: unknown[]) {
              if (args.length === 0) {
                return new OriginalDate(anchorDate.getTime());
              }
              // @ts-expect-error - spreading constructor args
              return new OriginalDate(...args);
            } as unknown as DateConstructor;
            FakeDate.now = () => anchorDate.getTime();
            FakeDate.parse = OriginalDate.parse;
            FakeDate.UTC = OriginalDate.UTC;
            FakeDate.prototype = OriginalDate.prototype;

            globalThis.Date = FakeDate;
            try {
              seedDatabase(db);
            } finally {
              globalThis.Date = OriginalDate;
            }

            // Verify KPI entries
            const kpiEntries = db
              .prepare("SELECT kpi_name, timestamp FROM kpi_states")
              .all() as { kpi_name: string; timestamp: string }[];

            // Exactly 120 entries (4 KPIs × 30 days)
            expect(kpiEntries.length).toBe(120);

            // Verify all 4 KPIs have exactly 30 entries
            const kpiCounts = new Map<string, number>();
            for (const entry of kpiEntries) {
              kpiCounts.set(
                entry.kpi_name,
                (kpiCounts.get(entry.kpi_name) ?? 0) + 1,
              );
            }
            expect(kpiCounts.get("otd")).toBe(30);
            expect(kpiCounts.get("osa")).toBe(30);
            expect(kpiCounts.get("cost_deviation")).toBe(30);
            expect(kpiCounts.get("mape")).toBe(30);

            // All timestamps within [anchor - 30d, anchor]
            const lowerBound = anchorDate.getTime() - 30 * 24 * 60 * 60 * 1000;
            const upperBound = anchorDate.getTime();

            for (const entry of kpiEntries) {
              const ts = new Date(entry.timestamp).getTime();
              expect(ts).toBeGreaterThanOrEqual(lowerBound);
              expect(ts).toBeLessThanOrEqual(upperBound);
            }
          } finally {
            db.close();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Inventory movements: all timestamps (excluding current-state) within [anchor - 14d, anchor]", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (rawAnchorDate) => {
          const anchorDate = new Date(
            rawAnchorDate.getFullYear(),
            rawAnchorDate.getMonth(),
            rawAnchorDate.getDate(),
            0,
            0,
            0,
            0,
          );

          const db = createTestDb();
          try {
            // Override Date constructor to control anchor date
            const OriginalDate = globalThis.Date;
            const FakeDate = function (...args: unknown[]) {
              if (args.length === 0) {
                return new OriginalDate(anchorDate.getTime());
              }
              // @ts-expect-error - spreading constructor args
              return new OriginalDate(...args);
            } as unknown as DateConstructor;
            FakeDate.now = () => anchorDate.getTime();
            FakeDate.parse = OriginalDate.parse;
            FakeDate.UTC = OriginalDate.UTC;
            FakeDate.prototype = OriginalDate.prototype;

            globalThis.Date = FakeDate;
            try {
              seedDatabase(db);
            } finally {
              globalThis.Date = OriginalDate;
            }

            // Get all inventory entries
            const inventoryEntries = db
              .prepare("SELECT sku, last_updated FROM inventory")
              .all() as { sku: string; last_updated: string }[];

            // There should be more than just the 54 current-state entries
            expect(inventoryEntries.length).toBeGreaterThan(54);

            // Current-state entries are at day 0 offset (anchor + 6h)
            // Movement entries are at negative day offsets (day -14 to -1)
            const currentStateTimestamp =
              anchorDate.getTime() + 6 * 60 * 60 * 1000;

            // Filter to only movement entries (exclude current-state entries)
            const movementEntries = inventoryEntries.filter((entry) => {
              const ts = new Date(entry.last_updated).getTime();
              // Current-state entries are at exactly anchor + 6h
              return Math.abs(ts - currentStateTimestamp) > 60 * 1000; // 1 min tolerance
            });

            expect(movementEntries.length).toBeGreaterThan(0);

            // All movement timestamps within [anchor - 14d, anchor]
            const lowerBound = anchorDate.getTime() - 14 * 24 * 60 * 60 * 1000;
            const upperBound = anchorDate.getTime();

            for (const entry of movementEntries) {
              const ts = new Date(entry.last_updated).getTime();
              expect(ts).toBeGreaterThanOrEqual(lowerBound);
              expect(ts).toBeLessThanOrEqual(upperBound);
            }
          } finally {
            db.close();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
