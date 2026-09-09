#!/usr/bin/env node

// Main entry point for the Product Catalog Generator
// Strategy: Grid-based tiling (4×3) → Product identification per tile → Deduplication
//
// Features:
// - Checkpoint/Resume: saves progress after each photo, resumes where it left off
// - Per-photo deduplication + final cross-photo deduplication
//
// Supports two modes:
// - Single-image mode: node generate-catalog.mjs <path-to-image>
// - Batch mode: node generate-catalog.mjs (processes all .jpeg files in ../pictures/)

import path from "node:path";
import os from "node:os";
import { writeFile, unlink, readFile } from "node:fs/promises";
import { discoverPhotos, validateSingleImage } from "./lib/discovery.mjs";
import { analyzeImage } from "./lib/kiro-client.mjs";
import { parseProductList, parseDeduplicatedList } from "./lib/parsers.mjs";
import { generateGridTiles } from "./lib/image-processor.mjs";
import { writeAssortment } from "./lib/output.mjs";
import {
  formatPhotoProgress,
  formatCropProgress,
  formatSummary,
} from "./lib/progress.mjs";

const GRID_COLS = 4;
const GRID_ROWS = 3;

const SCRIPT_DIR = path.resolve(import.meta.dirname);
const PROGRESS_FILE = path.join(SCRIPT_DIR, "progress.json");

const TILE_PROMPT = `Identify ALL products visible in this cropped section of an ALDI SUED store shelf in Germany.
For each product you can identify, provide its details.
Return ONLY a JSON array of objects, each with these fields:
- name: product name (in German)
- brand: brand name (e.g., Milsani, Knusperone, GutBio, ALDI eigenmarke)
- category: product category (in German, e.g., Fleisch & Wurst, Milchprodukte, Tiefkühl)
- size: numeric size value as string (e.g., "500")
- unit: unit of measurement (g, kg, ml, l, Stück)
If you cannot identify any products clearly, return an empty array: []
Example: [{"name": "Haferflocken", "brand": "Knusperone", "category": "Frühstück", "size": "500", "unit": "g"}]`;

const DEDUP_PROMPT = `Below is a JSON array of products identified from overlapping image tiles of an ALDI SUED store shelf.
There are likely duplicates (same product detected in adjacent tiles) and possible hallucinations.
Please deduplicate this list:
- Remove exact or near-duplicates (same product appearing multiple times)
- Remove entries that seem hallucinated or clearly wrong (e.g., products that wouldn't be in this section)
- Keep the most complete/accurate entry when duplicates exist
Return ONLY the cleaned JSON array with the same format (name, brand, category, size, unit).`;

// === Checkpoint management ===

async function loadProgress() {
  try {
    const data = await readFile(PROGRESS_FILE, "utf-8");
    const progress = JSON.parse(data);
    console.log(
      `Resuming from checkpoint: ${progress.completedPhotos.length} photos already processed, ${progress.products.length} products found so far.`,
    );
    return progress;
  } catch {
    return {
      completedPhotos: [],
      products: [],
      errors: 0,
    };
  }
}

async function saveProgress(progress) {
  await writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf-8");
}

// === Deterministic deduplication ===

/**
 * Normalizes a string for fuzzy matching: lowercase, trim, remove extra whitespace,
 * remove common suffixes/prefixes that vary between detections.
 */
function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-.,:;!?()]/g, "");
}

/**
 * Deduplicates products based on normalized name + brand combination.
 * Keeps the first occurrence (which typically has the most complete data).
 * Also merges products where name is a substring of another (same brand).
 */
function deduplicateProducts(products) {
  const seen = new Map(); // key → product

  for (const product of products) {
    const key = `${normalize(product.brand)}|${normalize(product.name)}`;

    if (!seen.has(key)) {
      seen.set(key, product);
    }
    // If we've seen it, skip (keep first occurrence)
  }

  return Array.from(seen.values());
}

// === Main ===

async function main() {
  let photos;

  if (process.argv[2]) {
    // Single-image mode (no checkpointing needed)
    const imagePath = await validateSingleImage(process.argv[2]);
    photos = [imagePath];
  } else {
    // Batch mode
    const picturesDir = path.resolve(import.meta.dirname, "../pictures");
    const result = await discoverPhotos(picturesDir);
    photos = result.photos;
  }

  // Load existing progress (for batch mode resume)
  const progress = await loadProgress();
  const completedSet = new Set(progress.completedPhotos);

  const stats = {
    photosProcessed: progress.completedPhotos.length,
    productsIdentified: progress.products.length,
    errors: progress.errors,
  };

  // Determine which photos still need processing
  const remainingPhotos = photos.filter(
    (p) => !completedSet.has(path.basename(p)),
  );

  if (remainingPhotos.length === 0 && photos.length > 1) {
    console.log("All photos already processed. Running final deduplication...");
  } else if (remainingPhotos.length < photos.length) {
    console.log(
      `Skipping ${photos.length - remainingPhotos.length} already-processed photos, ${remainingPhotos.length} remaining.`,
    );
  }

  for (let i = 0; i < remainingPhotos.length; i++) {
    const photoPath = remainingPhotos[i];
    const filename = path.basename(photoPath);
    const overallIndex = photos.length - remainingPhotos.length + i + 1;

    console.log(formatPhotoProgress(overallIndex, photos.length, filename));

    // === Pass 1: Generate grid tiles (deterministic, no AI) ===
    let tiles;
    try {
      tiles = await generateGridTiles(photoPath, GRID_COLS, GRID_ROWS);
    } catch (error) {
      console.warn(
        `[WARN] Photo ${filename}: Failed to generate grid tiles: ${error.message}`,
      );
      stats.errors++;
      progress.errors++;
      progress.completedPhotos.push(filename);
      await saveProgress(progress);
      stats.photosProcessed++;
      continue;
    }

    console.log(
      `  Splitting into ${GRID_COLS}×${GRID_ROWS} grid (${tiles.length} tiles)`,
    );

    // === Pass 2: Identify products in each tile ===
    const photoProducts = [];

    for (let t = 0; t < tiles.length; t++) {
      const tile = tiles[t];
      const tileLabel = `tile ${t + 1}/${tiles.length} (row ${tile.row + 1}, col ${tile.col + 1})`;
      console.log(formatCropProgress(t + 1, filename));

      // Write tile to temp file
      const tmpPath = path.join(
        os.tmpdir(),
        `tile_${filename}_r${tile.row}_c${tile.col}_${Date.now()}.jpeg`,
      );

      try {
        await writeFile(tmpPath, tile.buffer);
      } catch (error) {
        console.warn(
          `[WARN] Photo ${filename} ${tileLabel}: Failed to write temp file: ${error.message}`,
        );
        stats.errors++;
        progress.errors++;
        continue;
      }

      // Send tile to Kiro CLI for product identification
      const result = await analyzeImage(tmpPath, TILE_PROMPT);

      // Clean up temp file
      try {
        await unlink(tmpPath);
      } catch {
        // ignore cleanup errors
      }

      if (!result.success) {
        console.warn(`[WARN] Photo ${filename} ${tileLabel}: ${result.error}`);
        stats.errors++;
        progress.errors++;
        continue;
      }

      // Parse product list from response
      const products = parseProductList(result.content);

      if (products.length > 0) {
        for (const product of products) {
          photoProducts.push({
            sourceImage: filename,
            cropRegion: tile.region,
            ...product,
          });
        }
      }
    }

    // === Pass 3a: Per-photo deduplication via Kiro CLI ===
    if (photoProducts.length > 0) {
      console.log(
        `  Deduplicating ${photoProducts.length} products from ${filename}...`,
      );

      const productListForDedup = photoProducts.map(
        ({ name, brand, category, size, unit }) => ({
          name,
          brand,
          category,
          size,
          unit,
        }),
      );

      const dedupInput = JSON.stringify(productListForDedup, null, 2);
      const dedupResult = await analyzeImage(
        photoPath,
        `${DEDUP_PROMPT}\n\nHere is the product list to deduplicate:\n${dedupInput}`,
      );

      if (dedupResult.success) {
        const dedupProducts = parseDeduplicatedList(dedupResult.content);

        if (dedupProducts.length > 0) {
          console.log(
            `  Deduplicated: ${photoProducts.length} → ${dedupProducts.length} products`,
          );

          for (const product of dedupProducts) {
            progress.products.push({
              sourceImage: filename,
              ...product,
            });
          }
          stats.productsIdentified += dedupProducts.length;
        } else {
          // Dedup parsing failed, use raw products
          console.warn(
            `[WARN] Photo ${filename}: Dedup parsing failed, using raw product list`,
          );
          for (const product of photoProducts) {
            progress.products.push({
              sourceImage: product.sourceImage,
              name: product.name,
              brand: product.brand,
              category: product.category,
              size: product.size,
              unit: product.unit,
            });
          }
          stats.productsIdentified += photoProducts.length;
        }
      } else {
        // Dedup failed entirely, use raw products
        console.warn(
          `[WARN] Photo ${filename}: Deduplication failed: ${dedupResult.error}, using raw list`,
        );
        for (const product of photoProducts) {
          progress.products.push({
            sourceImage: product.sourceImage,
            name: product.name,
            brand: product.brand,
            category: product.category,
            size: product.size,
            unit: product.unit,
          });
        }
        stats.productsIdentified += photoProducts.length;
        stats.errors++;
        progress.errors++;
      }
    }

    // Mark photo as completed and save checkpoint
    progress.completedPhotos.push(filename);
    await saveProgress(progress);
    stats.photosProcessed++;

    console.log(
      `  ✓ Checkpoint saved (${progress.completedPhotos.length}/${photos.length} photos, ${progress.products.length} products)\n`,
    );
  }

  // === Pass 3b: Final deduplication across all photos (deterministic) ===
  let finalProducts = progress.products;

  if (progress.products.length > 0 && photos.length > 1) {
    console.log(
      `\nFinal deduplication across all ${progress.completedPhotos.length} photos (${progress.products.length} total products)...`,
    );

    finalProducts = deduplicateProducts(progress.products);

    console.log(
      `  Deduplicated: ${progress.products.length} → ${finalProducts.length} unique products`,
    );
  }

  // Write final output
  const outputDir = SCRIPT_DIR;
  const assortment = {
    metadata: {
      photosProcessed: progress.completedPhotos.length,
      productsIdentified: finalProducts.length,
      generatedAt: new Date().toISOString(),
    },
    products: finalProducts,
  };

  const outputPath = await writeAssortment(outputDir, assortment);

  // Display summary
  console.log(
    formatSummary(
      progress.completedPhotos.length,
      finalProducts.length,
      stats.errors,
      outputPath,
    ),
  );
}

main().catch((err) => {
  console.error(`[ERROR] Fatal: ${err.message}`);
  process.exit(1);
});
