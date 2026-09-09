import fc from "fast-check";
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeTimestamp, type SeedOffset } from "./anchor-date.js";
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
 * Property 2 (partial for Slice 1): Seed-Generierung erzeugt korrekte relative Zeiträume
 *
 * For every anchor date: All seed email timestamps lie in the interval
 * [anchorDate - 14 days, anchorDate + 1 day].
 *
 * Since seedDatabase uses new Date() internally, we test the property by:
 * 1. Verifying that computeTimestamp with all known seed offsets produces timestamps
 *    within the expected 14-day window for any arbitrary anchor date.
 * 2. Verifying the actual seeded database (using "now" as anchor) has all timestamps
 *    within the correct range.
 */
describe("Feature: supply-chain-simulation, Property 2 (Slice 1): Seed-Generierung erzeugt korrekte relative Zeiträume", () => {
  /**
   * The seed email offsets used in seed.ts range from -12 days to -1 day
   * with various hour/minute components within business hours.
   * This constant mirrors the offset ranges present in the SEED_EMAILS array.
   */
  const SEED_EMAIL_OFFSETS: SeedOffset[] = [
    { days: -12, hours: 9, minutes: 15 },
    { days: -11, hours: 8, minutes: 30 },
    { days: -10, hours: 10, minutes: 45 },
    { days: -9, hours: 14, minutes: 20 },
    { days: -8, hours: 11, minutes: 0 },
    { days: -7, hours: 9, minutes: 30 },
    { days: -7, hours: 15, minutes: 10 },
    { days: -6, hours: 8, minutes: 45 },
    { days: -5, hours: 9, minutes: 0 },
    { days: -4, hours: 11, minutes: 20 },
    { days: -3, hours: 16, minutes: 30 },
    { days: -2, hours: 14, minutes: 0 },
    { days: -2, hours: 10, minutes: 15 },
    { days: -1, hours: 8, minutes: 30 },
    { days: -1, hours: 15, minutes: 45 },
    { days: -1, hours: 8, minutes: 15 },
    { days: -1, hours: 10, minutes: 30 },
    { days: -1, hours: 8, minutes: 0 },
  ];

  it("for any anchor date, all seed email offsets produce timestamps within [anchor - 14d, anchor + 1d]", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (rawAnchorDate) => {
          // Normalize to midnight like seedDatabase does
          const anchorDate = new Date(
            rawAnchorDate.getFullYear(),
            rawAnchorDate.getMonth(),
            rawAnchorDate.getDate(),
            0,
            0,
            0,
            0,
          );

          const lowerBound = new Date(
            anchorDate.getTime() - 14 * 24 * 60 * 60 * 1000,
          );
          const upperBound = new Date(
            anchorDate.getTime() + 1 * 24 * 60 * 60 * 1000,
          );

          for (const offset of SEED_EMAIL_OFFSETS) {
            const timestamp = computeTimestamp(anchorDate, offset);
            const ts = new Date(timestamp);

            expect(ts.getTime()).toBeGreaterThanOrEqual(lowerBound.getTime());
            expect(ts.getTime()).toBeLessThanOrEqual(upperBound.getTime());
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("seeded database messages are all within [anchor - 14d, anchor + 1d] relative to the stored anchor_date", () => {
    fc.assert(
      fc.property(
        fc.constant(null), // We run seedDatabase which uses new Date() internally
        () => {
          const db = createTestDb();
          try {
            seedDatabase(db);

            const anchorRow = db
              .prepare(
                "SELECT value FROM demo_config WHERE key = 'anchor_date'",
              )
              .get() as { value: string };
            const anchorDateStr = JSON.parse(anchorRow.value);
            // Anchor is stored as YYYY-MM-DD, normalize to midnight
            const anchorDate = new Date(anchorDateStr + "T00:00:00.000Z");

            const lowerBound = new Date(
              anchorDate.getTime() - 14 * 24 * 60 * 60 * 1000,
            );
            const upperBound = new Date(
              anchorDate.getTime() + 1 * 24 * 60 * 60 * 1000,
            );

            const messages = db
              .prepare("SELECT timestamp FROM messages")
              .all() as { timestamp: string }[];

            expect(messages.length).toBeGreaterThanOrEqual(15);

            for (const msg of messages) {
              const ts = new Date(msg.timestamp);
              expect(ts.getTime()).toBeGreaterThanOrEqual(lowerBound.getTime());
              expect(ts.getTime()).toBeLessThanOrEqual(upperBound.getTime());
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
