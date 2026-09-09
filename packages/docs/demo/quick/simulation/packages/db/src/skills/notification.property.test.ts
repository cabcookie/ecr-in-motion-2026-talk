import fc from "fast-check";
import { describe, it, expect } from "vitest";

/**
 * Notification formatting logic extracted from post-notification/steps/step_01.md
 */
function formatNotification(input: {
  channel: string;
  sender: string;
  subject?: string;
  body: string;
  importance?: string;
  suggested_actions?: string;
}) {
  // Channel mapping
  const channelMap: Record<string, string> = {
    email: "outlook",
    teams: "teams",
  };
  const channel_source = channelMap[input.channel] || input.channel;

  // Importance mapping
  const importanceMap: Record<string, string> = {
    important: "important",
    informational: "fyi",
    fyi: "fyi",
  };
  const importance = importanceMap[input.importance || "fyi"] || "fyi";

  // CTA labels
  const cta_labels = input.suggested_actions
    ? input.suggested_actions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    channel_source,
    sender: input.sender,
    subject: input.subject || null,
    body: input.body,
    importance,
    timestamp: "gerade eben",
    cta_labels,
  };
}

/**
 * **Validates: Requirements 11.1, 11.2**
 *
 * Property 12: Notification Channel Formatting
 *
 * For channel "email": output includes sender with email, subject, and body.
 * For channel "teams": output includes sender with handle and body.
 */
describe("Property 12: Notification Channel Formatting", () => {
  const emailInputArb = fc.record({
    channel: fc.constant("email"),
    sender: fc
      .tuple(fc.string({ minLength: 1, maxLength: 20 }), fc.emailAddress())
      .map(([name, email]) => `${name} <${email}>`),
    subject: fc.string({ minLength: 1, maxLength: 100 }),
    body: fc.string({ minLength: 1, maxLength: 500 }),
    importance: fc.constantFrom("important", "informational", "fyi"),
    suggested_actions: fc
      .array(fc.string({ minLength: 1, maxLength: 30 }), {
        minLength: 0,
        maxLength: 3,
      })
      .map((actions) => actions.join(", ")),
  });

  const teamsInputArb = fc.record({
    channel: fc.constant("teams"),
    sender: fc
      .string({ minLength: 1, maxLength: 20 })
      .map((name) => `${name} (@${name.toLowerCase().replace(/\s/g, ".")})`),
    subject: fc.constant(undefined as unknown as string),
    body: fc.string({ minLength: 1, maxLength: 500 }),
    importance: fc.constantFrom("important", "informational", "fyi"),
    suggested_actions: fc
      .array(fc.string({ minLength: 1, maxLength: 30 }), {
        minLength: 0,
        maxLength: 3,
      })
      .map((actions) => actions.join(", ")),
  });

  it("email channel produces outlook channel_source with sender, subject, and body", () => {
    fc.assert(
      fc.property(emailInputArb, (input) => {
        const output = formatNotification(input);
        expect(output.channel_source).toBe("outlook");
        expect(output.sender).toContain("<");
        expect(output.sender).toContain(">");
        expect(output.subject).not.toBeNull();
        expect(output.body).toBe(input.body);
      }),
      { numRuns: 100 },
    );
  });

  it("teams channel produces teams channel_source with sender handle and body", () => {
    fc.assert(
      fc.property(teamsInputArb, (input) => {
        const output = formatNotification(input);
        expect(output.channel_source).toBe("teams");
        expect(output.sender).toContain("@");
        expect(output.body).toBe(input.body);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * **Validates: Requirements 11.3, 11.4**
 *
 * Property 13: Notification Metadata Mapping
 *
 * For non-empty suggested_actions: all comma-separated values appear in cta_labels.
 * Importance mapping: important→important, informational→fyi, fyi→fyi, undefined→fyi.
 */
describe("Property 13: Notification Metadata Mapping", () => {
  it("all comma-separated suggested_actions appear in output cta_labels", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc
            .string({ minLength: 1, maxLength: 30 })
            .filter((s) => !s.includes(",") && s.trim().length > 0),
          { minLength: 1, maxLength: 5 },
        ),
        (actions) => {
          const input = {
            channel: "email" as const,
            sender: "Test <test@example.com>",
            body: "Test body",
            suggested_actions: actions.join(", "),
          };
          const output = formatNotification(input);
          for (const action of actions) {
            expect(output.cta_labels).toContain(action.trim());
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("importance mapping is correct", () => {
    const mappings: Array<[string | undefined, string]> = [
      ["important", "important"],
      ["informational", "fyi"],
      ["fyi", "fyi"],
      [undefined, "fyi"],
    ];

    for (const [input, expected] of mappings) {
      const result = formatNotification({
        channel: "email",
        sender: "Test <test@example.com>",
        body: "test",
        importance: input,
      });
      expect(result.importance).toBe(expected);
    }
  });

  it("empty suggested_actions produces empty cta_labels array", () => {
    const result = formatNotification({
      channel: "email",
      sender: "Test <test@example.com>",
      body: "test",
      suggested_actions: "",
    });
    expect(result.cta_labels).toEqual([]);
  });

  it("undefined suggested_actions produces empty cta_labels array", () => {
    const result = formatNotification({
      channel: "email",
      sender: "Test <test@example.com>",
      body: "test",
    });
    expect(result.cta_labels).toEqual([]);
  });
});

/**
 * **Validates: Requirements 12.3**
 *
 * Property 14: Notification Input Validation
 *
 * For any notification input missing at least one required field (channel, sender, or body),
 * the skill SHALL produce an error message identifying the missing field(s) WITHOUT calling update_feed.
 */
describe("Property 14: Notification Input Validation", () => {
  function validateNotificationInput(input: Record<string, any>): {
    valid: boolean;
    error?: string;
  } {
    const required = ["channel", "sender", "body"];
    const missing = required.filter(
      (field) =>
        !input[field] ||
        (typeof input[field] === "string" && input[field].trim() === ""),
    );

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing required input: ${missing[0]}. Cannot post notification.`,
      };
    }

    if (input.channel !== "email" && input.channel !== "teams") {
      return {
        valid: false,
        error: `Invalid channel '${input.channel}'. Must be 'email' or 'teams'.`,
      };
    }

    return { valid: true };
  }

  it("missing channel produces validation error", () => {
    fc.assert(
      fc.property(
        fc.record({
          sender: fc.string({ minLength: 1, maxLength: 50 }),
          body: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        (input) => {
          const result = validateNotificationInput(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain("channel");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("missing sender produces validation error", () => {
    fc.assert(
      fc.property(
        fc.record({
          channel: fc.constantFrom("email", "teams"),
          body: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        (input) => {
          const result = validateNotificationInput(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain("sender");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("missing body produces validation error", () => {
    fc.assert(
      fc.property(
        fc.record({
          channel: fc.constantFrom("email", "teams"),
          sender: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (input) => {
          const result = validateNotificationInput(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain("body");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("empty string channel produces validation error", () => {
    const result = validateNotificationInput({
      channel: "",
      sender: "Test",
      body: "Test",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("channel");
  });

  it("invalid channel value produces validation error", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => s !== "email" && s !== "teams"),
        (channel) => {
          const result = validateNotificationInput({
            channel,
            sender: "Test",
            body: "Test",
          });
          expect(result.valid).toBe(false);
          expect(result.error).toContain("Invalid channel");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("valid input passes validation", () => {
    fc.assert(
      fc.property(
        fc.record({
          channel: fc.constantFrom("email", "teams"),
          sender: fc.string({ minLength: 1, maxLength: 50 }),
          body: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        (input) => {
          const result = validateNotificationInput(input);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        },
      ),
      { numRuns: 50 },
    );
  });
});
