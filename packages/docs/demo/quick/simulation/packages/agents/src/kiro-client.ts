/**
 * Kiro CLI interaction wrapper for agent LLM calls.
 *
 * Provides a simple interface for agents to generate context-aware responses
 * using the kiro-cli. Each agent passes a system prompt (role context) and
 * a user prompt (situation/event) to get an intelligent response.
 */

import { exec } from "node:child_process";

const TIMEOUT_MS = 60_000; // 60 seconds

export interface KiroResponse {
  success: boolean;
  content: string;
  error?: string;
}

/**
 * Sends a prompt to the Kiro CLI and returns the generated response.
 *
 * @param prompt - The full prompt to send (should include role context + situation)
 * @returns Promise with the generated response
 */
export function askKiro(prompt: string): Promise<KiroResponse> {
  return new Promise((resolve) => {
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, "\\n");
    const command = `kiro-cli chat --no-interactive --trust-all-tools "${escapedPrompt}"`;

    exec(command, { timeout: TIMEOUT_MS }, (error, stdout, _stderr) => {
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
 * Generates a contextual agent response based on role and situation.
 *
 * @param roleContext - Description of the agent's role and responsibilities
 * @param situation - The current situation/event the agent should respond to
 * @param instruction - What the agent should produce (e.g., "Write a reply email")
 * @returns Promise with the generated response text
 */
export async function generateAgentResponse(
  roleContext: string,
  situation: string,
  instruction: string,
): Promise<string> {
  const prompt = `You are part of an ALDI SÜD Supply Chain Simulation.\n\n${roleContext}\n\nCurrent situation:\n${situation}\n\nTask:\n${instruction}\n\nRespond EXCLUSIVELY with the desired text (no explanations, no markdown formatting, no prefix). The response should be realistic, professional, and in English.`;

  const response = await askKiro(prompt);

  if (!response.success) {
    // Fallback to a generic response if LLM fails
    return "";
  }

  return response.content;
}

/**
 * Summarizes a message for the Activity Feed.
 * Extracts the most important sentence and creates a short summary.
 *
 * @param sender - Who sent the message
 * @param subject - Email subject (if applicable)
 * @param body - Full message body
 * @returns Promise with a short summary string
 */
export async function summarizeForFeed(
  sender: string,
  subject: string | null,
  body: string,
): Promise<string> {
  const prompt = `You are an assistant for a buyer at ALDI SÜD.\n\nSummarize the following message in ONE short sentence (max. 120 characters). Quote the most important aspect. No quotation marks.\n\nFrom: ${sender}\n${subject ? `Subject: ${subject}\n` : ""}Message:\n${body}\n\nSummary:`;

  const response = await askKiro(prompt);

  if (!response.success) {
    // Fallback: use subject or first line of body
    if (subject) return subject;
    const firstLine = body.split("\n").find((l) => l.trim().length > 10);
    return firstLine?.slice(0, 120) ?? body.slice(0, 120);
  }

  return response.content.slice(0, 150);
}

/**
 * Strips ANSI escape codes from a string.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
