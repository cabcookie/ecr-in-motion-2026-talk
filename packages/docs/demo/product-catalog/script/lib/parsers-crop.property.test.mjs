import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { parseCropRegions } from "./parsers.mjs";

/**
 * Feature: product-catalog-generator, Property 3: Crop region response parsing extracts valid coordinates
 * Validates: Requirements 2.2
 */
describe("Property 3: Crop region response parsing extracts valid coordinates", () => {
  it("parses valid crop region arrays and preserves length and values", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.nat({ max: 10000 }),
            y: fc.nat({ max: 10000 }),
            width: fc.nat({ max: 10000 }),
            height: fc.nat({ max: 10000 }),
          }),
          { minLength: 0, maxLength: 20 },
        ),
        (regions) => {
          const json = JSON.stringify(regions);
          const result = parseCropRegions(json);

          // Array length matches the number of objects in the input
          expect(result).toHaveLength(regions.length);

          // Each parsed element has all four coordinate fields as non-negative numbers
          for (let i = 0; i < result.length; i++) {
            expect(result[i].x).toBeGreaterThanOrEqual(0);
            expect(result[i].y).toBeGreaterThanOrEqual(0);
            expect(result[i].width).toBeGreaterThanOrEqual(0);
            expect(result[i].height).toBeGreaterThanOrEqual(0);

            // Each parsed element matches the corresponding input values
            expect(result[i].x).toBe(regions[i].x);
            expect(result[i].y).toBe(regions[i].y);
            expect(result[i].width).toBe(regions[i].width);
            expect(result[i].height).toBe(regions[i].height);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("parses valid crop regions with surrounding text prefix", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.nat({ max: 10000 }),
            y: fc.nat({ max: 10000 }),
            width: fc.nat({ max: 10000 }),
            height: fc.nat({ max: 10000 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => !s.includes("[") && !s.includes("]")),
        (regions, prefix) => {
          const json = prefix + "\n" + JSON.stringify(regions);
          const result = parseCropRegions(json);

          expect(result).toHaveLength(regions.length);

          for (let i = 0; i < result.length; i++) {
            expect(result[i].x).toBe(regions[i].x);
            expect(result[i].y).toBe(regions[i].y);
            expect(result[i].width).toBe(regions[i].width);
            expect(result[i].height).toBe(regions[i].height);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("parses valid crop regions with surrounding text suffix", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.nat({ max: 10000 }),
            y: fc.nat({ max: 10000 }),
            width: fc.nat({ max: 10000 }),
            height: fc.nat({ max: 10000 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => !s.includes("[") && !s.includes("]")),
        (regions, suffix) => {
          const json = JSON.stringify(regions) + "\n" + suffix;
          const result = parseCropRegions(json);

          expect(result).toHaveLength(regions.length);

          for (let i = 0; i < result.length; i++) {
            expect(result[i].x).toBeGreaterThanOrEqual(0);
            expect(result[i].y).toBeGreaterThanOrEqual(0);
            expect(result[i].width).toBeGreaterThanOrEqual(0);
            expect(result[i].height).toBeGreaterThanOrEqual(0);

            expect(result[i].x).toBe(regions[i].x);
            expect(result[i].y).toBe(regions[i].y);
            expect(result[i].width).toBe(regions[i].width);
            expect(result[i].height).toBe(regions[i].height);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all parsed elements have exactly four numeric non-negative fields", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.nat({ max: 50000 }),
            y: fc.nat({ max: 50000 }),
            width: fc.nat({ max: 50000 }),
            height: fc.nat({ max: 50000 }),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        (regions) => {
          const json = JSON.stringify(regions);
          const result = parseCropRegions(json);

          for (const region of result) {
            // Exactly 4 keys
            expect(Object.keys(region)).toHaveLength(4);
            expect(Object.keys(region).sort()).toEqual([
              "height",
              "width",
              "x",
              "y",
            ]);

            // All values are numbers
            expect(typeof region.x).toBe("number");
            expect(typeof region.y).toBe("number");
            expect(typeof region.width).toBe("number");
            expect(typeof region.height).toBe("number");

            // All values are non-negative
            expect(region.x).toBeGreaterThanOrEqual(0);
            expect(region.y).toBeGreaterThanOrEqual(0);
            expect(region.width).toBeGreaterThanOrEqual(0);
            expect(region.height).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
