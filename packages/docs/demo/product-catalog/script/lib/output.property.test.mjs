import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import { writeAssortment } from "./output.mjs";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Feature: product-catalog-generator, Property 6: Output JSON round-trip preserves all products and correct metadata
 * Validates: Requirements 5.2, 5.4
 */
describe("Property 6: Output JSON round-trip preserves all products and correct metadata", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "output-prop-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // Generator for a single ProductObject
  const productObjectArb = fc.record({
    sourceImage: fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.replace(/[\x00-\x1f]/g, "a")),
    cropRegion: fc.record({
      x: fc.integer({ min: 0, max: 10000 }),
      y: fc.integer({ min: 0, max: 10000 }),
      width: fc.integer({ min: 1, max: 5000 }),
      height: fc.integer({ min: 1, max: 5000 }),
    }),
    name: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.replace(/[\x00-\x1f]/g, "a")),
    brand: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.replace(/[\x00-\x1f]/g, "a")),
    category: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.replace(/[\x00-\x1f]/g, "a")),
    size: fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.replace(/[\x00-\x1f]/g, "a")),
    unit: fc.constantFrom("g", "kg", "ml", "l", "Stück"),
  });

  it("round-trip preserves products array and metadata counts", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productObjectArb, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc
          .integer({ min: 0, max: 2000000000 })
          .map((epoch) => new Date(epoch * 1000).toISOString()),
        async (products, photosProcessed, productsIdentified, generatedAt) => {
          const assortment = {
            metadata: {
              photosProcessed,
              productsIdentified,
              generatedAt,
            },
            products,
          };

          // Write to disk
          const outputPath = await writeAssortment(tempDir, assortment);

          // Read back and parse
          const content = await readFile(outputPath, "utf-8");
          const parsed = JSON.parse(content);

          // Assert: products array matches exactly (deep equality)
          expect(parsed.products).toEqual(products);

          // Assert: metadata.photosProcessed matches
          expect(parsed.metadata.photosProcessed).toBe(photosProcessed);

          // Assert: metadata.productsIdentified matches
          expect(parsed.metadata.productsIdentified).toBe(productsIdentified);

          // Assert: metadata.generatedAt is a valid ISO 8601 string
          const timestamp = parsed.metadata.generatedAt;
          expect(typeof timestamp).toBe("string");
          const parsedDate = new Date(timestamp);
          expect(parsedDate.toISOString()).toBe(timestamp);
        },
      ),
      { numRuns: 100 },
    );
  });
});
