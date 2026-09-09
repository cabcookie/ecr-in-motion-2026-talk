// JSON output writer
// Implements: writeAssortment

import { writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Writes the Store_Assortment JSON to disk.
 *
 * @param {string} outputDir - Directory to write the output file
 * @param {object} assortment - StoreAssortment object with metadata and products
 * @returns {Promise<string>} The full output file path
 */
export async function writeAssortment(outputDir, assortment) {
  const outputPath = path.join(outputDir, "Store_Assortment.json");
  const json = JSON.stringify(assortment, null, 2);
  await writeFile(outputPath, json, { encoding: "utf-8" });
  return outputPath;
}
