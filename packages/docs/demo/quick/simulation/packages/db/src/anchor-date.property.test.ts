import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { computeTimestamp, computeOffset } from "./anchor-date.js";

/**
 * **Validates: Requirements 2.5**
 */
describe("Feature: supply-chain-simulation, Property 1: Anchor-Date Timestamp-Berechnung (Round-Trip)", () => {
  it("Round-trip: computeOffset(anchorDate, computeTimestamp(anchorDate, offset)) === offset", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        fc.record({
          days: fc.integer({ min: -365, max: 0 }),
          hours: fc.integer({ min: 0, max: 23 }),
          minutes: fc.integer({ min: 0, max: 59 }),
        }),
        (anchorDate, offset) => {
          const timestamp = computeTimestamp(anchorDate, offset);
          const recoveredOffset = computeOffset(anchorDate, timestamp);

          expect(recoveredOffset.days).toBe(offset.days);
          // computeOffset omits hours/minutes when they are 0
          expect(recoveredOffset.hours ?? 0).toBe(offset.hours);
          expect(recoveredOffset.minutes ?? 0).toBe(offset.minutes);
        },
      ),
      { numRuns: 200 },
    );
  });
});
