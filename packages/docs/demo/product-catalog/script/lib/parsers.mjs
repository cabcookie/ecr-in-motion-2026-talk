// Response parsing (regions + products)
// Implements: parseCropRegions, parseProductInfo

/**
 * Parses Kiro CLI's first-pass response into crop regions.
 * Extracts a JSON array of {x, y, width, height} objects from the response text.
 * The response may contain surrounding text before/after the JSON array.
 * Returns an empty array if parsing fails.
 *
 * @param {string} response - Raw text output from Kiro CLI
 * @returns {Array<{x: number, y: number, width: number, height: number}>}
 */
export function parseCropRegions(response) {
  if (typeof response !== "string" || response.trim() === "") {
    return [];
  }

  try {
    const jsonString = extractJsonArray(response);
    if (!jsonString) {
      return [];
    }

    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidCropRegion).map(({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
    }));
  } catch {
    return [];
  }
}

/**
 * Extracts the first JSON array substring from a response string.
 * Finds the outermost matching `[` and `]` pair.
 *
 * @param {string} text - Text that may contain a JSON array
 * @returns {string|null} The extracted JSON array string, or null if not found
 */
function extractJsonArray(text) {
  const startIndex = text.indexOf("[");
  if (startIndex === -1) {
    return null;
  }

  let depth = 0;
  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === "[") {
      depth++;
    } else if (text[i] === "]") {
      depth--;
      if (depth === 0) {
        return text.substring(startIndex, i + 1);
      }
    }
  }

  return null;
}

/**
 * Validates that an object has x, y, width, height as non-negative finite numbers.
 *
 * @param {any} obj - Object to validate
 * @returns {boolean}
 */
function isValidCropRegion(obj) {
  if (obj === null || typeof obj !== "object") {
    return false;
  }

  const { x, y, width, height } = obj;

  return (
    typeof x === "number" &&
    typeof y === "number" &&
    typeof width === "number" &&
    typeof height === "number" &&
    isFinite(x) &&
    isFinite(y) &&
    isFinite(width) &&
    isFinite(height) &&
    x >= 0 &&
    y >= 0 &&
    width >= 0 &&
    height >= 0
  );
}

/**
 * Parses Kiro CLI's second-pass response into product info.
 * Extracts a JSON object from the response text and validates all required fields.
 * Returns null if parsing fails or any field is missing/empty.
 *
 * @param {string} response - Raw text output from Kiro CLI
 * @returns {{name: string, brand: string, category: string, size: string, unit: string} | null}
 */
export function parseProductInfo(response) {
  if (typeof response !== "string" || response.trim() === "") {
    return null;
  }

  try {
    // Find the first JSON object in the response by locating { and its matching }
    const startIndex = response.indexOf("{");
    if (startIndex === -1) {
      return null;
    }

    // Find the matching closing brace
    let braceCount = 0;
    let endIndex = -1;
    for (let i = startIndex; i < response.length; i++) {
      if (response[i] === "{") {
        braceCount++;
      } else if (response[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex === -1) {
      return null;
    }

    const jsonStr = response.slice(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);

    // Validate all required fields are present and are non-empty strings
    const requiredFields = ["name", "brand", "category", "size", "unit"];
    for (const field of requiredFields) {
      if (typeof parsed[field] !== "string" || parsed[field].trim() === "") {
        return null;
      }
    }

    return {
      name: parsed.name,
      brand: parsed.brand,
      category: parsed.category,
      size: parsed.size,
      unit: parsed.unit,
    };
  } catch {
    return null;
  }
}

/**
 * Parses a response containing a JSON array of product objects.
 * Used for tile-based analysis where multiple products are returned per tile.
 * Returns an array of valid ProductInfo objects, filtering out invalid entries.
 *
 * @param {string} response - Raw text output from Kiro CLI
 * @returns {Array<{name: string, brand: string, category: string, size: string, unit: string}>}
 */
export function parseProductList(response) {
  if (typeof response !== "string" || response.trim() === "") {
    return [];
  }

  try {
    const jsonString = extractJsonArray(response);
    if (!jsonString) {
      // Fallback: try parsing a single object
      const single = parseProductInfo(response);
      return single ? [single] : [];
    }

    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const requiredFields = ["name", "brand", "category", "size", "unit"];

    return parsed
      .filter((obj) => {
        if (obj === null || typeof obj !== "object") return false;
        return requiredFields.every(
          (field) => typeof obj[field] === "string" && obj[field].trim() !== "",
        );
      })
      .map(({ name, brand, category, size, unit }) => ({
        name,
        brand,
        category,
        size,
        unit,
      }));
  } catch {
    return [];
  }
}

/**
 * Parses a deduplicated product list response from the cleanup pass.
 * Expects a JSON array of product objects after deduplication.
 *
 * @param {string} response - Raw text output from Kiro CLI
 * @returns {Array<{name: string, brand: string, category: string, size: string, unit: string}>}
 */
export function parseDeduplicatedList(response) {
  return parseProductList(response);
}
