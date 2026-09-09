import { describe, it, expect } from "vitest";
import { parseCropRegions, parseProductInfo } from "./parsers.mjs";

describe("parseCropRegions", () => {
  describe("valid inputs", () => {
    it("parses a clean JSON array with one region", () => {
      const input = '[{"x": 10, "y": 20, "width": 150, "height": 300}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 10, y: 20, width: 150, height: 300 }]);
    });

    it("parses multiple regions", () => {
      const input =
        '[{"x": 0, "y": 0, "width": 100, "height": 200}, {"x": 110, "y": 0, "width": 100, "height": 200}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([
        { x: 0, y: 0, width: 100, height: 200 },
        { x: 110, y: 0, width: 100, height: 200 },
      ]);
    });

    it("extracts JSON array from surrounding text", () => {
      const input =
        'Here are the regions:\n[{"x": 10, "y": 20, "width": 150, "height": 300}]\nDone.';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 10, y: 20, width: 150, height: 300 }]);
    });

    it("handles zero coordinates", () => {
      const input = '[{"x": 0, "y": 0, "width": 0, "height": 0}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 0, y: 0, width: 0, height: 0 }]);
    });

    it("only returns x, y, width, height fields (strips extra properties)", () => {
      const input =
        '[{"x": 10, "y": 20, "width": 150, "height": 300, "label": "milk"}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 10, y: 20, width: 150, height: 300 }]);
    });
  });

  describe("invalid inputs", () => {
    it("returns empty array for non-string input", () => {
      expect(parseCropRegions(null)).toEqual([]);
      expect(parseCropRegions(undefined)).toEqual([]);
      expect(parseCropRegions(123)).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      expect(parseCropRegions("")).toEqual([]);
    });

    it("returns empty array for text without JSON array", () => {
      expect(
        parseCropRegions("I could not identify any regions in this image."),
      ).toEqual([]);
    });

    it("returns empty array for invalid JSON", () => {
      expect(parseCropRegions("[{invalid json}]")).toEqual([]);
    });

    it("returns empty array for JSON object instead of array", () => {
      expect(
        parseCropRegions('{"x": 10, "y": 20, "width": 150, "height": 300}'),
      ).toEqual([]);
    });

    it("returns empty array for unmatched bracket", () => {
      expect(parseCropRegions('[{"x": 10, "y": 20')).toEqual([]);
    });
  });

  describe("validation filtering", () => {
    it("filters out objects missing required fields", () => {
      const input =
        '[{"x": 10, "y": 20, "width": 150}, {"x": 1, "y": 2, "width": 3, "height": 4}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 1, y: 2, width: 3, height: 4 }]);
    });

    it("filters out objects with negative values", () => {
      const input =
        '[{"x": -1, "y": 20, "width": 150, "height": 300}, {"x": 10, "y": 20, "width": 150, "height": 300}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 10, y: 20, width: 150, height: 300 }]);
    });

    it("filters out objects with non-number fields", () => {
      const input =
        '[{"x": "10", "y": 20, "width": 150, "height": 300}, {"x": 5, "y": 5, "width": 50, "height": 50}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 5, y: 5, width: 50, height: 50 }]);
    });

    it("filters out null entries in the array", () => {
      const input = '[null, {"x": 10, "y": 20, "width": 150, "height": 300}]';
      const result = parseCropRegions(input);
      expect(result).toEqual([{ x: 10, y: 20, width: 150, height: 300 }]);
    });
  });
});

describe("parseProductInfo", () => {
  it("parses a clean JSON response with all fields", () => {
    const response =
      '{"name": "Haferflocken", "brand": "Knusperone", "category": "Frühstück", "size": "500", "unit": "g"}';
    const result = parseProductInfo(response);
    expect(result).toEqual({
      name: "Haferflocken",
      brand: "Knusperone",
      category: "Frühstück",
      size: "500",
      unit: "g",
    });
  });

  it("extracts JSON from surrounding text", () => {
    const response =
      'The product is:\n{"name": "Vollmilch", "brand": "Milsani", "category": "Milchprodukte", "size": "1000", "unit": "ml"}\n';
    const result = parseProductInfo(response);
    expect(result).toEqual({
      name: "Vollmilch",
      brand: "Milsani",
      category: "Milchprodukte",
      size: "1000",
      unit: "ml",
    });
  });

  it("returns null for response without JSON", () => {
    const response = "I cannot identify this product.";
    expect(parseProductInfo(response)).toBeNull();
  });

  it("returns null when required fields are missing", () => {
    const response = '{"name": "Chips", "brand": "Snack Fun"}';
    expect(parseProductInfo(response)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseProductInfo("")).toBeNull();
  });

  it("returns null for non-string input", () => {
    expect(parseProductInfo(null)).toBeNull();
    expect(parseProductInfo(undefined)).toBeNull();
    expect(parseProductInfo(123)).toBeNull();
  });

  it("returns null when a field is an empty string", () => {
    const response =
      '{"name": "Chips", "brand": "", "category": "Snacks", "size": "200", "unit": "g"}';
    expect(parseProductInfo(response)).toBeNull();
  });

  it("returns null when a field is whitespace only", () => {
    const response =
      '{"name": "Chips", "brand": "  ", "category": "Snacks", "size": "200", "unit": "g"}';
    expect(parseProductInfo(response)).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    const response = '{"name": "Chips", "brand": "Snack Fun"';
    expect(parseProductInfo(response)).toBeNull();
  });

  it("returns null when a field is not a string", () => {
    const response =
      '{"name": "Milch", "brand": "Milsani", "category": "Milchprodukte", "size": 500, "unit": "ml"}';
    expect(parseProductInfo(response)).toBeNull();
  });

  it("only returns the 5 expected fields (ignores extra fields)", () => {
    const response =
      '{"name": "Butter", "brand": "Milsani", "category": "Milchprodukte", "size": "250", "unit": "g", "price": "1.99"}';
    const result = parseProductInfo(response);
    expect(result).toEqual({
      name: "Butter",
      brand: "Milsani",
      category: "Milchprodukte",
      size: "250",
      unit: "g",
    });
    expect(result).not.toHaveProperty("price");
  });
});
