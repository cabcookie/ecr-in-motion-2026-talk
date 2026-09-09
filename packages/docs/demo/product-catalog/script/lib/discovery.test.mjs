import { describe, it, expect } from "vitest";
import path from "node:path";
import { validateSingleImage, discoverPhotos } from "./discovery.mjs";

describe("validateSingleImage", () => {
  it("returns absolute path for a valid .jpeg file that exists", async () => {
    // Use a known existing JPEG file from the pictures directory
    const filePath = path.resolve(
      import.meta.dirname,
      "../../pictures/IMG_6600.jpeg",
    );
    const result = await validateSingleImage(filePath);
    expect(result).toBe(filePath);
    expect(path.isAbsolute(result)).toBe(true);
  });

  it("returns absolute path when given a relative path to an existing .jpeg file", async () => {
    const relativePath = "../../pictures/IMG_6600.jpeg";
    const cwd = import.meta.dirname;
    const expectedAbsolute = path.resolve(cwd, relativePath);

    // We need to call from the context where the relative path resolves correctly
    const result = await validateSingleImage(
      path.resolve(import.meta.dirname, relativePath),
    );
    expect(result).toBe(expectedAbsolute);
  });

  it("throws an error for a file with .png extension", async () => {
    await expect(validateSingleImage("/some/path/photo.png")).rejects.toThrow(
      "Invalid file extension",
    );
  });

  it("throws an error for a file with .jpg extension", async () => {
    await expect(validateSingleImage("/some/path/photo.jpg")).rejects.toThrow(
      "Invalid file extension",
    );
  });

  it("throws an error for a file with no extension", async () => {
    await expect(validateSingleImage("/some/path/photo")).rejects.toThrow(
      "Invalid file extension",
    );
  });

  it("throws an error for a non-existent .jpeg file", async () => {
    await expect(
      validateSingleImage("/non/existent/path/photo.jpeg"),
    ).rejects.toThrow("File not found");
  });

  it("accepts .JPEG extension (uppercase)", async () => {
    // This should pass the extension check but fail on file existence
    await expect(
      validateSingleImage("/non/existent/PHOTO.JPEG"),
    ).rejects.toThrow("File not found");
  });

  it("accepts mixed case .Jpeg extension", async () => {
    // Should pass extension check (case-insensitive) but fail on file existence
    await expect(
      validateSingleImage("/non/existent/photo.Jpeg"),
    ).rejects.toThrow("File not found");
  });
});
