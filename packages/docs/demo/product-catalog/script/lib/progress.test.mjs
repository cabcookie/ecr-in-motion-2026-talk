import { describe, it, expect } from "vitest";
import {
  formatPhotoProgress,
  formatCropProgress,
  formatSummary,
} from "./progress.mjs";

describe("formatPhotoProgress", () => {
  it("formats progress with index, total, and filename", () => {
    expect(formatPhotoProgress(5, 92, "IMG_6604.jpeg")).toBe(
      "Processing photo 5/92 (IMG_6604.jpeg)",
    );
  });

  it("handles first photo", () => {
    expect(formatPhotoProgress(1, 10, "IMG_6600.jpeg")).toBe(
      "Processing photo 1/10 (IMG_6600.jpeg)",
    );
  });

  it("handles last photo", () => {
    expect(formatPhotoProgress(92, 92, "IMG_6691.jpeg")).toBe(
      "Processing photo 92/92 (IMG_6691.jpeg)",
    );
  });
});

describe("formatCropProgress", () => {
  it("formats crop progress with index and source filename", () => {
    expect(formatCropProgress(3, "IMG_6604.jpeg")).toBe(
      "  Crop 3 from IMG_6604.jpeg",
    );
  });

  it("handles first crop", () => {
    expect(formatCropProgress(1, "IMG_6600.jpeg")).toBe(
      "  Crop 1 from IMG_6600.jpeg",
    );
  });
});

describe("formatSummary", () => {
  it("includes all four values in multi-line format", () => {
    const result = formatSummary(
      92,
      347,
      2,
      "/product-catalog/script/Store_Assortment.json",
    );

    expect(result).toContain("92");
    expect(result).toContain("347");
    expect(result).toContain("2");
    expect(result).toContain("/product-catalog/script/Store_Assortment.json");
  });

  it("is multi-line", () => {
    const result = formatSummary(10, 50, 0, "/output/Store_Assortment.json");
    expect(result).toContain("\n");
  });

  it("produces the expected format", () => {
    const result = formatSummary(
      92,
      347,
      2,
      "/product-catalog/script/Store_Assortment.json",
    );
    const expected = [
      "--- Summary ---",
      "Photos processed: 92",
      "Products found:   347",
      "Errors:           2",
      "Output:           /product-catalog/script/Store_Assortment.json",
    ].join("\n");
    expect(result).toBe(expected);
  });
});
