// Progress reporting utilities
// Implements: formatPhotoProgress, formatCropProgress, formatSummary

/**
 * Formats first-pass progress message.
 * @param {number} index - Current photo number (1-based)
 * @param {number} total - Total number of photos
 * @param {string} filename - The photo filename
 * @returns {string} e.g. "Processing photo 5/92 (IMG_6604.jpeg)"
 */
export function formatPhotoProgress(index, total, filename) {
  return `Processing photo ${index}/${total} (${filename})`;
}

/**
 * Formats second-pass progress message.
 * @param {number} cropIndex - Current crop number (1-based)
 * @param {string} sourceFilename - The source photo filename
 * @returns {string} e.g. "  Crop 3 from IMG_6604.jpeg"
 */
export function formatCropProgress(cropIndex, sourceFilename) {
  return `  Crop ${cropIndex} from ${sourceFilename}`;
}

/**
 * Formats the final execution summary.
 * @param {number} photosProcessed - Total photos processed
 * @param {number} productsFound - Total products identified
 * @param {number} errorsCount - Total errors encountered
 * @param {string} outputPath - Path to the output JSON file
 * @returns {string} Multi-line summary string
 */
export function formatSummary(
  photosProcessed,
  productsFound,
  errorsCount,
  outputPath,
) {
  return [
    "--- Summary ---",
    `Photos processed: ${photosProcessed}`,
    `Products found:   ${productsFound}`,
    `Errors:           ${errorsCount}`,
    `Output:           ${outputPath}`,
  ].join("\n");
}
