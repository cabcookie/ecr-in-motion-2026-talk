import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeImage } from "./kiro-client.mjs";

// Mock child_process.exec
vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

import { exec } from "node:child_process";

describe("kiro-client: analyzeImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success with trimmed content on successful CLI output", async () => {
    exec.mockImplementation((cmd, opts, callback) => {
      callback(null, '  [{"x":10,"y":20,"width":100,"height":200}]  ', "");
    });

    const result = await analyzeImage("/path/to/image.jpeg", "test prompt");

    expect(result).toEqual({
      success: true,
      content: '[{"x":10,"y":20,"width":100,"height":200}]',
    });
  });

  it("constructs the correct command with image path in prompt", async () => {
    exec.mockImplementation((cmd, opts, callback) => {
      callback(null, "output", "");
    });

    await analyzeImage("/photos/IMG_6600.jpeg", "Analyze this image");

    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining(
        "kiro-cli chat --no-interactive --trust-all-tools",
      ),
      expect.objectContaining({ timeout: 120_000 }),
      expect.any(Function),
    );
    // Verify the image path and prompt are embedded
    const calledCommand = exec.mock.calls[0][0];
    expect(calledCommand).toContain("/photos/IMG_6600.jpeg");
    expect(calledCommand).toContain("Analyze this image");
  });

  it("returns error when CLI times out", async () => {
    exec.mockImplementation((cmd, opts, callback) => {
      const error = new Error("Command timed out");
      error.killed = true;
      callback(error, "", "");
    });

    const result = await analyzeImage("/path/to/image.jpeg", "prompt");

    expect(result).toEqual({
      success: false,
      content: "",
      error: "Kiro CLI timed out after 120 seconds",
    });
  });

  it("returns error when CLI fails with a non-timeout error", async () => {
    exec.mockImplementation((cmd, opts, callback) => {
      const error = new Error("Command not found: kiro");
      error.killed = false;
      callback(error, "", "");
    });

    const result = await analyzeImage("/path/to/image.jpeg", "prompt");

    expect(result).toEqual({
      success: false,
      content: "",
      error: "Command not found: kiro",
    });
  });

  it("returns error when CLI returns empty output", async () => {
    exec.mockImplementation((cmd, opts, callback) => {
      callback(null, "", "");
    });

    const result = await analyzeImage("/path/to/image.jpeg", "prompt");

    expect(result).toEqual({
      success: false,
      content: "",
      error: "Kiro CLI returned empty output",
    });
  });

  it("returns error when CLI returns whitespace-only output", async () => {
    exec.mockImplementation((cmd, opts, callback) => {
      callback(null, "   \n  \t  ", "");
    });

    const result = await analyzeImage("/path/to/image.jpeg", "prompt");

    expect(result).toEqual({
      success: false,
      content: "",
      error: "Kiro CLI returned empty output",
    });
  });
});
