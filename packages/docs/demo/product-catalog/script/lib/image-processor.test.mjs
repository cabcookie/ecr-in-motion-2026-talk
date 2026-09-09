import { describe, it, expect, vi } from "vitest";
import { clampRegion } from "./image-processor.mjs";

describe("clampRegion", () => {
  it("returns the region unchanged when it fits within bounds", () => {
    const region = { x: 10, y: 20, width: 100, height: 200 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result).toEqual({ x: 10, y: 20, width: 100, height: 200 });
  });

  it("clamps negative x to 0", () => {
    const region = { x: -50, y: 10, width: 100, height: 100 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.x).toBe(0);
  });

  it("clamps negative y to 0", () => {
    const region = { x: 10, y: -30, width: 100, height: 100 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.y).toBe(0);
  });

  it("clamps x so there is room for at least 1px width", () => {
    const region = { x: 900, y: 10, width: 100, height: 100 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.x).toBe(799);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.x + result.width).toBeLessThanOrEqual(800);
  });

  it("clamps y so there is room for at least 1px height", () => {
    const region = { x: 10, y: 700, width: 100, height: 100 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.y).toBe(599);
    expect(result.height).toBeGreaterThanOrEqual(1);
    expect(result.y + result.height).toBeLessThanOrEqual(600);
  });

  it("clamps width so x + width <= imageWidth", () => {
    const region = { x: 750, y: 10, width: 200, height: 100 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.x + result.width).toBeLessThanOrEqual(800);
    expect(result.width).toBeGreaterThanOrEqual(1);
  });

  it("clamps height so y + height <= imageHeight", () => {
    const region = { x: 10, y: 550, width: 100, height: 200 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.y + result.height).toBeLessThanOrEqual(600);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("ensures width is at least 1 even when region.width is 0", () => {
    const region = { x: 10, y: 10, width: 0, height: 100 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.width).toBe(1);
  });

  it("ensures height is at least 1 even when region.height is 0", () => {
    const region = { x: 10, y: 10, width: 100, height: 0 };
    const dimensions = { width: 800, height: 600 };
    const result = clampRegion(region, dimensions);
    expect(result.height).toBe(1);
  });

  it("logs a warning when clamping occurs", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const region = { x: -10, y: -20, width: 1000, height: 800 };
    const dimensions = { width: 800, height: 600 };
    clampRegion(region, dimensions);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("[WARN]");
    expect(warnSpy.mock.calls[0][0]).toContain("clamped");
    warnSpy.mockRestore();
  });

  it("does not log a warning when no clamping is needed", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const region = { x: 10, y: 20, width: 100, height: 200 };
    const dimensions = { width: 800, height: 600 };
    clampRegion(region, dimensions);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("handles edge case with 1x1 image dimensions", () => {
    const region = { x: 5, y: 5, width: 100, height: 100 };
    const dimensions = { width: 1, height: 1 };
    const result = clampRegion(region, dimensions);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.x + result.width).toBeLessThanOrEqual(1);
    expect(result.y + result.height).toBeLessThanOrEqual(1);
  });
});
