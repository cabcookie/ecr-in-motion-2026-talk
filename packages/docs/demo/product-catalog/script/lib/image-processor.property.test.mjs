import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { clampRegion } from "./image-processor.mjs";

/**
 * Feature: product-catalog-generator, Property 4: Coordinate clamping keeps regions within image bounds
 * Validates: Requirements 3.3
 */
describe("Property 4: Coordinate clamping keeps regions within image bounds", () => {
  it("clamped region stays within image bounds and has positive dimensions", () => {
    // Suppress console.warn during the test
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      fc.assert(
        fc.property(
          // Random image dimensions (w, h) where w > 0 and h > 0
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: 1, max: 10000 }),
          // Random crop regions with arbitrary x, y, width, height (can be negative, zero, or very large)
          fc.integer({ min: -1000, max: 20000 }),
          fc.integer({ min: -1000, max: 20000 }),
          fc.integer({ min: -1000, max: 20000 }),
          fc.integer({ min: -1000, max: 20000 }),
          (imageWidth, imageHeight, x, y, width, height) => {
            const region = { x, y, width, height };
            const dimensions = { width: imageWidth, height: imageHeight };

            const clamped = clampRegion(region, dimensions);

            // Assert: clamped.x >= 0
            expect(clamped.x).toBeGreaterThanOrEqual(0);

            // Assert: clamped.y >= 0
            expect(clamped.y).toBeGreaterThanOrEqual(0);

            // Assert: clamped.x + clamped.width <= w
            expect(clamped.x + clamped.width).toBeLessThanOrEqual(imageWidth);

            // Assert: clamped.y + clamped.height <= h
            expect(clamped.y + clamped.height).toBeLessThanOrEqual(imageHeight);

            // Assert: clamped.width > 0
            expect(clamped.width).toBeGreaterThan(0);

            // Assert: clamped.height > 0
            expect(clamped.height).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});
