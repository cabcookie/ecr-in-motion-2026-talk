import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateSingleImage } from "./discovery.mjs";

/**
 * Feature: product-catalog-generator, Property 2: Invalid path validation rejects non-existent or non-JPEG paths
 * Validates: Requirements 1.4
 */
describe("Property 2: Invalid path validation rejects non-existent or non-JPEG paths", () => {
  it("non-JPEG extension paths always throw", async () => {
    // Generate file paths with extensions that are NOT .jpeg/.JPEG
    const nonJpegExtensions = fc.oneof(
      fc.constant(".jpg"),
      fc.constant(".png"),
      fc.constant(".txt"),
      fc.constant(".mp4"),
      fc.constant(".gif"),
      fc.constant(".bmp"),
      fc.constant(".webp"),
      fc.constant(".tiff"),
      fc.constant(".pdf"),
      fc.constant(""), // no extension
    );

    const fileBaseName = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s));

    const dirPath = fc.oneof(
      fc.constant("/tmp"),
      fc.constant("/some/path"),
      fc.constant("/home/user/photos"),
      fc.constant("./relative/dir"),
    );

    await fc.assert(
      fc.asyncProperty(
        dirPath,
        fileBaseName,
        nonJpegExtensions,
        async (dir, base, ext) => {
          const filePath = `${dir}/${base}${ext}`;
          await expect(validateSingleImage(filePath)).rejects.toThrow(
            "Invalid file extension",
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("non-existent .jpeg paths always throw", async () => {
    // Generate random .jpeg paths that definitely don't exist on disk
    const randomDirSegment = fc
      .string({ minLength: 5, maxLength: 20 })
      .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s));

    const randomFileName = fc
      .string({ minLength: 1, maxLength: 30 })
      .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s));

    await fc.assert(
      fc.asyncProperty(
        randomDirSegment,
        randomFileName,
        async (dirSeg, name) => {
          const filePath = `/tmp/nonexistent_${dirSeg}/${name}.jpeg`;
          await expect(validateSingleImage(filePath)).rejects.toThrow(
            "File not found",
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
