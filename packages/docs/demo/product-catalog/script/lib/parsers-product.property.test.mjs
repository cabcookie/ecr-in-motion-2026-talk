import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { parseProductInfo } from "./parsers.mjs";

/**
 * Feature: product-catalog-generator, Property 5: Product response parsing produces complete Product_Objects
 * Validates: Requirements 4.2
 */
describe("Property 5: Product response parsing produces complete Product_Objects", () => {
  /**
   * Generator for safe non-empty strings that won't break JSON serialization.
   * Excludes: quotes, backslashes, and control characters.
   */
  const safeNonEmptyString = fc
    .stringMatching(/^[a-zA-Z0-9äöüÄÖÜß ,.\-_/()]+$/)
    .filter((s) => s.length >= 1 && s.trim().length >= 1);

  /**
   * Generator for optional surrounding text (prefix/suffix around JSON).
   */
  const surroundingText = fc.oneof(
    fc.constant(""),
    fc.constant("Here is the product:\n"),
    fc.constant("The identified product is:\n"),
    fc.constant("Product details:\n"),
  );

  const suffixText = fc.oneof(
    fc.constant(""),
    fc.constant("\nEnd"),
    fc.constant("\nDone."),
    fc.constant("\n"),
  );

  it("parses valid product JSON and returns matching ProductInfo with exactly 5 fields", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: safeNonEmptyString,
          brand: safeNonEmptyString,
          category: safeNonEmptyString,
          size: safeNonEmptyString,
          unit: safeNonEmptyString,
        }),
        surroundingText,
        suffixText,
        (product, prefix, suffix) => {
          // Serialize the product object to JSON and wrap with optional surrounding text
          const jsonStr = JSON.stringify(product);
          const response = prefix + jsonStr + suffix;

          // Parse the response
          const result = parseProductInfo(response);

          // Assert: result is not null
          expect(result).not.toBeNull();

          // Assert: each field matches the input value
          expect(result.name).toBe(product.name);
          expect(result.brand).toBe(product.brand);
          expect(result.category).toBe(product.category);
          expect(result.size).toBe(product.size);
          expect(result.unit).toBe(product.unit);

          // Assert: no extra fields are present (only the 5 expected fields)
          const keys = Object.keys(result);
          expect(keys).toHaveLength(5);
          expect(keys.sort()).toEqual([
            "brand",
            "category",
            "name",
            "size",
            "unit",
          ]);
        },
      ),
      { numRuns: 100 },
    );
  });
});
