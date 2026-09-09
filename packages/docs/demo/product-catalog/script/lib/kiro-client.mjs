// Kiro CLI interaction wrapper
// Implements: analyzeImage

import { exec } from "node:child_process";

const TIMEOUT_MS = 120_000; // 120 seconds

/**
 * Sends an image to the Kiro CLI with a prompt and returns the raw response.
 *
 * @param {string} imagePath - Absolute path to the image file
 * @param {string} prompt - The prompt to send alongside the image
 * @returns {Promise<{success: boolean, content: string, error?: string}>}
 */
export function analyzeImage(imagePath, prompt) {
  return new Promise((resolve) => {
    // Embed the file path in the prompt and use --no-interactive + --trust-all-tools
    const fullPrompt = `Analyze the image at ${imagePath}. ${prompt}`;
    const command = `kiro-cli chat --no-interactive --trust-all-tools "${fullPrompt.replace(/"/g, '\\"')}"`;

    exec(command, { timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
      if (error) {
        const errorMessage = error.killed
          ? `Kiro CLI timed out after ${TIMEOUT_MS / 1000} seconds`
          : error.message || "Unknown error during Kiro CLI execution";

        resolve({
          success: false,
          content: "",
          error: errorMessage,
        });
        return;
      }

      // Strip ANSI escape codes from the output
      const content = stripAnsi(stdout || "").trim();

      if (!content) {
        resolve({
          success: false,
          content: "",
          error: "Kiro CLI returned empty output",
        });
        return;
      }

      resolve({
        success: true,
        content,
      });
    });
  });
}

/**
 * Strips ANSI escape codes from a string.
 * @param {string} str
 * @returns {string}
 */
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
