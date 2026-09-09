import { describe, it, expect } from "vitest";
import fc from "fast-check";
import path from "node:path";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { discoverPhotos } from "./discovery.mjs";

/**
 * Feature: product-catalog-generator, Property 1: File discovery returns only JPEG files in alphanumeric order
 * Validates: Requirements 1.2, 1.3
 */
describe("Property 1: File discovery returns only JPEG files in alphanumeric order", () => {
  it("returns only .jpeg files in sorted order from a directory with mixed extensions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc
              .stringMatching(/^[a-zA-Z0-9_-]+$/)
              .filter((s) => s.length >= 1 && s.length <= 20),
            ext: fc.oneof(
              fc.constant(".jpeg"),
              fc.constant(".jpg"),
              fc.constant(".png"),
              fc.constant(".txt"),
              fc.constant(".JPEG"),
              fc.constant(".gif"),
              fc.constant(".bmp"),
            ),
          }),
          { minLength: 1, maxLength: 30 },
        ),
        async (fileSpecs) => {
          // Deduplicate filenames (name+ext combinations)
          const seen = new Set();
          const uniqueSpecs = fileSpecs.filter((spec) => {
            const fullName = spec.name + spec.ext;
            if (seen.has(fullName.toLowerCase())) return false;
            seen.add(fullName.toLowerCase());
            return true;
          });

          // Only proceed if we have at least one .jpeg file (case-insensitive)
          const hasJpeg = uniqueSpecs.some(
            (s) => s.ext.toLowerCase() === ".jpeg",
          );
          if (!hasJpeg) return; // skip this run — no jpeg means error is expected

          // Create temp directory
          const tempDir = await mkdtemp(path.join(tmpdir(), "discovery-pbt-"));

          try {
            // Create files in the temp directory
            for (const spec of uniqueSpecs) {
              const filePath = path.join(tempDir, spec.name + spec.ext);
              await writeFile(filePath, "");
            }

            // Call discoverPhotos
            const result = await discoverPhotos(tempDir);

            // Assert 1: All returned paths have .jpeg extension (case-insensitive)
            for (const photo of result.photos) {
              expect(path.extname(photo).toLowerCase()).toBe(".jpeg");
            }

            // Assert 2: The returned array is sorted (each element ≤ next lexicographically)
            for (let i = 0; i < result.photos.length - 1; i++) {
              expect(result.photos[i] <= result.photos[i + 1]).toBe(true);
            }

            // Assert 3: All .jpeg files in the original set are included in the result
            const expectedJpegs = uniqueSpecs
              .filter((s) => s.ext.toLowerCase() === ".jpeg")
              .map((s) => path.join(tempDir, s.name + s.ext));

            for (const expected of expectedJpegs) {
              expect(result.photos).toContain(expected);
            }

            // Also verify no extra files are returned
            expect(result.photos.length).toBe(expectedJpegs.length);
          } finally {
            await rm(tempDir, { recursive: true, force: true });
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
