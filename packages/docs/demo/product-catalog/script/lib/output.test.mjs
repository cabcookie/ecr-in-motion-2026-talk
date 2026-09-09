import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeAssortment } from "./output.mjs";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

describe("writeAssortment", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "output-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("writes Store_Assortment.json with correct content", async () => {
    const assortment = {
      metadata: {
        photosProcessed: 5,
        productsIdentified: 12,
        generatedAt: "2025-01-15T14:30:00.000Z",
      },
      products: [
        {
          sourceImage: "IMG_6600.jpeg",
          cropRegion: { x: 0, y: 100, width: 300, height: 400 },
          name: "Vollmilch 3,5%",
          brand: "Milsani",
          category: "Milchprodukte",
          size: "1000",
          unit: "ml",
        },
      ],
    };

    const outputPath = await writeAssortment(tempDir, assortment);

    expect(outputPath).toBe(path.join(tempDir, "Store_Assortment.json"));

    const content = await readFile(outputPath, "utf-8");
    const parsed = JSON.parse(content);

    expect(parsed.metadata.photosProcessed).toBe(5);
    expect(parsed.metadata.productsIdentified).toBe(12);
    expect(parsed.metadata.generatedAt).toBe("2025-01-15T14:30:00.000Z");
    expect(parsed.products).toHaveLength(1);
    expect(parsed.products[0].name).toBe("Vollmilch 3,5%");
  });

  it("uses 2-space indentation", async () => {
    const assortment = {
      metadata: {
        photosProcessed: 1,
        productsIdentified: 1,
        generatedAt: "2025-01-15T14:30:00.000Z",
      },
      products: [
        {
          sourceImage: "IMG_6600.jpeg",
          cropRegion: { x: 0, y: 0, width: 100, height: 100 },
          name: "Test",
          brand: "TestBrand",
          category: "TestCat",
          size: "100",
          unit: "g",
        },
      ],
    };

    const outputPath = await writeAssortment(tempDir, assortment);
    const content = await readFile(outputPath, "utf-8");

    // 2-space indentation means lines should start with "  " for first level
    expect(content).toContain('  "metadata"');
    expect(content).toContain('  "products"');
  });

  it("uses UTF-8 encoding", async () => {
    const assortment = {
      metadata: {
        photosProcessed: 1,
        productsIdentified: 1,
        generatedAt: "2025-01-15T14:30:00.000Z",
      },
      products: [
        {
          sourceImage: "IMG_6600.jpeg",
          cropRegion: { x: 0, y: 0, width: 100, height: 100 },
          name: "Schoko Müsli",
          brand: "Knusperone",
          category: "Frühstück",
          size: "750",
          unit: "g",
        },
      ],
    };

    const outputPath = await writeAssortment(tempDir, assortment);
    const content = await readFile(outputPath, "utf-8");

    expect(content).toContain("Müsli");
    expect(content).toContain("Frühstück");
  });

  it("returns the output file path", async () => {
    const assortment = {
      metadata: {
        photosProcessed: 0,
        productsIdentified: 0,
        generatedAt: "2025-01-15T14:30:00.000Z",
      },
      products: [],
    };

    const outputPath = await writeAssortment(tempDir, assortment);
    expect(outputPath).toBe(path.join(tempDir, "Store_Assortment.json"));
  });

  it("lets write errors propagate", async () => {
    const assortment = {
      metadata: {
        photosProcessed: 0,
        productsIdentified: 0,
        generatedAt: "2025-01-15T14:30:00.000Z",
      },
      products: [],
    };

    await expect(
      writeAssortment("/nonexistent/directory/path", assortment),
    ).rejects.toThrow();
  });
});
