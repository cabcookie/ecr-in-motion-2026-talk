import { describe, it, expect } from "vitest";
import {
  computeTimestamp,
  computeOffset,
  type SeedOffset,
} from "./anchor-date.js";

describe("anchor-date", () => {
  const anchor = new Date("2025-07-14T00:00:00.000Z");

  describe("computeTimestamp", () => {
    it("computes timestamp for positive day offset", () => {
      const offset: SeedOffset = { days: 3 };
      const result = computeTimestamp(anchor, offset);
      expect(result).toBe("2025-07-17T00:00:00.000Z");
    });

    it("computes timestamp for negative day offset (past)", () => {
      const offset: SeedOffset = { days: -2 };
      const result = computeTimestamp(anchor, offset);
      expect(result).toBe("2025-07-12T00:00:00.000Z");
    });

    it("computes timestamp with hours and minutes", () => {
      const offset: SeedOffset = { days: -1, hours: 9, minutes: 30 };
      const result = computeTimestamp(anchor, offset);
      expect(result).toBe("2025-07-13T09:30:00.000Z");
    });

    it("computes timestamp with only hours", () => {
      const offset: SeedOffset = { days: 0, hours: -4 };
      const result = computeTimestamp(anchor, offset);
      expect(result).toBe("2025-07-13T20:00:00.000Z");
    });

    it("computes timestamp with zero offset", () => {
      const offset: SeedOffset = { days: 0 };
      const result = computeTimestamp(anchor, offset);
      expect(result).toBe("2025-07-14T00:00:00.000Z");
    });
  });

  describe("computeOffset", () => {
    it("computes offset for a timestamp 3 days in the future", () => {
      const offset = computeOffset(anchor, "2025-07-17T00:00:00.000Z");
      expect(offset).toEqual({ days: 3 });
    });

    it("computes offset for a timestamp 2 days in the past", () => {
      const offset = computeOffset(anchor, "2025-07-12T00:00:00.000Z");
      expect(offset).toEqual({ days: -2 });
    });

    it("computes offset with hours and minutes", () => {
      const offset = computeOffset(anchor, "2025-07-13T09:30:00.000Z");
      expect(offset).toEqual({ days: -1, hours: 9, minutes: 30 });
    });

    it("computes offset for same timestamp as anchor", () => {
      const offset = computeOffset(anchor, "2025-07-14T00:00:00.000Z");
      expect(offset).toEqual({ days: 0 });
    });

    it("omits hours and minutes when they are zero", () => {
      const offset = computeOffset(anchor, "2025-07-16T00:00:00.000Z");
      expect(offset).toEqual({ days: 2 });
      expect(offset.hours).toBeUndefined();
      expect(offset.minutes).toBeUndefined();
    });
  });

  describe("round-trip", () => {
    it("computeOffset inverts computeTimestamp", () => {
      const original: SeedOffset = { days: -3, hours: 14, minutes: 45 };
      const timestamp = computeTimestamp(anchor, original);
      const recovered = computeOffset(anchor, timestamp);
      expect(recovered).toEqual(original);
    });

    it("computeTimestamp inverts computeOffset", () => {
      const originalTs = "2025-07-11T10:15:00.000Z";
      const offset = computeOffset(anchor, originalTs);
      const recoveredTs = computeTimestamp(anchor, offset);
      expect(recoveredTs).toBe(originalTs);
    });
  });
});
