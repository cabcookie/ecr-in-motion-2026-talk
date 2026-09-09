// Image cropping with sharp
// Implements: clampRegion, cropImage, generateGridTiles

import sharp from "sharp";

/**
 * Clamps a crop region to fit within image dimensions.
 * Ensures the resulting region has positive width and height and stays within bounds.
 *
 * @param {{ x: number, y: number, width: number, height: number }} region - The crop region to clamp
 * @param {{ width: number, height: number }} dimensions - The image dimensions
 * @returns {{ x: number, y: number, width: number, height: number }} The clamped region
 */
export function clampRegion(region, dimensions) {
  const { width: imageWidth, height: imageHeight } = dimensions;

  // Clamp x and y to be >= 0 and leave room for at least 1px
  let x = Math.max(0, Math.min(region.x, imageWidth - 1));
  let y = Math.max(0, Math.min(region.y, imageHeight - 1));

  // Clamp width so x + width <= imageWidth and width >= 1
  let width = Math.max(1, Math.min(region.width, imageWidth - x));

  // Clamp height so y + height <= imageHeight and height >= 1
  let height = Math.max(1, Math.min(region.height, imageHeight - y));

  const clamped = { x, y, width, height };

  // Log warning if clamping occurred
  if (
    clamped.x !== region.x ||
    clamped.y !== region.y ||
    clamped.width !== region.width ||
    clamped.height !== region.height
  ) {
    console.warn(
      `[WARN] Region clamped to image bounds: original (x:${region.x},y:${region.y},w:${region.width},h:${region.height}) → clamped (x:${clamped.x},y:${clamped.y},w:${clamped.width},h:${clamped.height})`,
    );
  }

  return clamped;
}

/**
 * Crops an image using the specified region, returns buffer.
 * Coordinates are clamped to the image dimensions before cropping.
 *
 * @param {string} imagePath - Path to the image file
 * @param {{ x: number, y: number, width: number, height: number }} region - Crop region
 * @returns {Promise<Buffer>} The cropped image as a buffer
 */
export async function cropImage(imagePath, region) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  const clamped = clampRegion(region, {
    width: metadata.width,
    height: metadata.height,
  });

  const buffer = await image
    .extract({
      left: clamped.x,
      top: clamped.y,
      width: clamped.width,
      height: clamped.height,
    })
    .toBuffer();

  return buffer;
}

/**
 * Generates grid tile buffers from an image.
 * Splits the image into a cols × rows grid and returns each tile as a JPEG buffer.
 *
 * @param {string} imagePath - Path to the source image
 * @param {number} cols - Number of columns (default: 4)
 * @param {number} rows - Number of rows (default: 3)
 * @returns {Promise<Array<{buffer: Buffer, col: number, row: number, region: {x: number, y: number, width: number, height: number}}>>}
 */
export async function generateGridTiles(imagePath, cols = 4, rows = 3) {
  const metadata = await sharp(imagePath).metadata();
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;

  const tileWidth = Math.floor(imgWidth / cols);
  const tileHeight = Math.floor(imgHeight / rows);

  const tiles = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileWidth;
      const y = row * tileHeight;
      // Last column/row may be slightly wider/taller to cover remaining pixels
      const w = col === cols - 1 ? imgWidth - x : tileWidth;
      const h = row === rows - 1 ? imgHeight - y : tileHeight;

      const buffer = await sharp(imagePath)
        .extract({ left: x, top: y, width: w, height: h })
        .jpeg()
        .toBuffer();

      tiles.push({
        buffer,
        col,
        row,
        region: { x, y, width: w, height: h },
      });
    }
  }

  return tiles;
}
