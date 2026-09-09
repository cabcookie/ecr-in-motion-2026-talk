import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  formatPhotoProgress,
  formatCropProgress,
  formatSummary,
} from "./progress.mjs";

/**
 * Feature: product-catalog-generator, Property 7: Progress formatters include all required information
 * Validates: Requirements 6.1, 6.2, 6.3
 */
describe("Property 7: Progress formatters include all required information", () => {
  it("formatPhotoProgress contains both index and total as strings", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => s.trim().length > 0),
        (index, total, filename) => {
          // Ensure index <= total
          const i = Math.min(index, total);
          const n = Math.max(index, total);

          const result = formatPhotoProgress(i, n, filename);

          expect(result).toContain(String(i));
          expect(result).toContain(String(n));
        },
      ),
      { numRuns: 100 },
    );
  });

  it("formatCropProgress contains both crop index and source filename", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => s.trim().length > 0),
        (cropIndex, sourceFilename) => {
          const result = formatCropProgress(cropIndex, sourceFilename);

          expect(result).toContain(String(cropIndex));
          expect(result).toContain(sourceFilename);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("formatSummary contains all four values: photos, products, errors, and path", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc
          .string({ minLength: 1, maxLength: 200 })
          .filter((s) => s.trim().length > 0),
        (photosProcessed, productsFound, errorsCount, outputPath) => {
          const result = formatSummary(
            photosProcessed,
            productsFound,
            errorsCount,
            outputPath,
          );

          expect(result).toContain(String(photosProcessed));
          expect(result).toContain(String(productsFound));
          expect(result).toContain(String(errorsCount));
          expect(result).toContain(outputPath);
        },
      ),
      { numRuns: 100 },
    );
  });
});
