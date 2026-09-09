// Photo discovery and validation module
// Implements: discoverPhotos, validateSingleImage

import { readdir, access } from "node:fs/promises";
import path from "node:path";

/**
 * Discovers JPEG files in the specified directory.
 * Returns an object with a sorted array of absolute paths.
 * Throws if no JPEG files are found.
 *
 * @param {string} picturesDir - Path to the directory to scan
 * @returns {Promise<{photos: string[]}>} Sorted absolute paths to .jpeg files
 */
export async function discoverPhotos(picturesDir) {
  const resolvedDir = path.resolve(picturesDir);
  const entries = await readdir(resolvedDir);

  const jpegFiles = entries
    .filter((entry) => path.extname(entry).toLowerCase() === ".jpeg")
    .sort()
    .map((entry) => path.join(resolvedDir, entry));

  if (jpegFiles.length === 0) {
    throw new Error(`No JPEG files found in directory: ${resolvedDir}`);
  }

  return { photos: jpegFiles };
}

/**
 * Validates a single file path for single-image mode.
 * Checks that the file has a .jpeg extension (case-insensitive) and exists on disk.
 * Returns the absolute path on success, throws with a descriptive error on failure.
 *
 * @param {string} filePath - Path to the image file to validate
 * @returns {Promise<string>} Absolute path to the validated file
 */
export async function validateSingleImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext !== ".jpeg") {
    throw new Error(
      `Invalid file extension "${path.extname(filePath)}": expected .jpeg or .JPEG — ${filePath}`,
    );
  }

  const absolutePath = path.resolve(filePath);

  try {
    await access(absolutePath);
  } catch {
    throw new Error(`File not found: ${absolutePath}`);
  }

  return absolutePath;
}
