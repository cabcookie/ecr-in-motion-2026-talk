import fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { AgentAction, AgentConfig, SimEvent } from "./orchestrator.js";
import { RoleAgent } from "./role-agent.js";

/**
 * **Validates: Requirements 13.5**
 *
 * Property 15: Nachrichten-Timestamps innerhalb Geschäftszeiten
 * Für jede Nachricht, die von einem Agenten generiert wird, gilt:
 * Die Uhrzeit des Timestamps liegt zwischen 08:00 und 18:00 Uhr.
 */

// ─── Test Subclass to expose protected method ────────────────────────────────

class TestableRoleAgent extends RoleAgent {
  constructor(
    config?: Partial<AgentConfig>,
    senderAddress = "test.user@aldi-sued.de",
  ) {
    super(
      {
        roleId: config?.roleId ?? "test",
        eventTypes: config?.eventTypes ?? ["disruption", "communication"],
        channels: config?.channels ?? ["outlook", "teams"],
        systemsAccess: config?.systemsAccess ?? ["outlook", "teams"],
      },
      senderAddress,
    );
  }

  async handleEvent(event: SimEvent): Promise<AgentAction[]> {
    return [
      this.createMessageAction({
        recipient: "colleague@aldi-sued.de",
        subject: `RE: ${event.type}`,
        body: "Testantwort",
        resolutionTimeHours: 12,
      }),
    ];
  }

  public testGenerateBusinessHoursTimestamp(baseDate?: Date): string {
    return this.generateBusinessHoursTimestamp(baseDate);
  }
}

// ─── Generators ──────────────────────────────────────────────────────────────

/** Realistic dates within safe JavaScript Date range (2000–2100). */
const realisticDate = fc.date({
  min: new Date("2000-01-01T00:00:00.000Z"),
  max: new Date("2100-12-31T23:59:59.999Z"),
});

// ─── Property Tests ──────────────────────────────────────────────────────────

describe("Feature: supply-chain-simulation, Property 15: Nachrichten-Timestamps innerhalb Geschäftszeiten", () => {
  const agent = new TestableRoleAgent();

  it("generateBusinessHoursTimestamp always produces hours in [8, 18)", () => {
    fc.assert(
      fc.property(realisticDate, (randomDate) => {
        const isoTimestamp =
          agent.testGenerateBusinessHoursTimestamp(randomDate);
        const resultDate = new Date(isoTimestamp);
        const hours = resultDate.getHours();

        expect(hours).toBeGreaterThanOrEqual(8);
        expect(hours).toBeLessThan(18);
      }),
      { numRuns: 100 },
    );
  });

  it("timestamps from early morning (before 8:00) are clamped to 08:00", () => {
    fc.assert(
      fc.property(
        realisticDate,
        fc.integer({ min: 0, max: 7 }),
        fc.integer({ min: 0, max: 59 }),
        (baseDate, earlyHour, minutes) => {
          const date = new Date(baseDate);
          date.setHours(earlyHour, minutes, 0, 0);

          const isoTimestamp = agent.testGenerateBusinessHoursTimestamp(date);
          const resultDate = new Date(isoTimestamp);

          expect(resultDate.getHours()).toBe(8);
          expect(resultDate.getMinutes()).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("timestamps from late evening (18:00+) are clamped to 17:59", () => {
    fc.assert(
      fc.property(
        realisticDate,
        fc.integer({ min: 18, max: 23 }),
        fc.integer({ min: 0, max: 59 }),
        (baseDate, lateHour, minutes) => {
          const date = new Date(baseDate);
          date.setHours(lateHour, minutes, 0, 0);

          const isoTimestamp = agent.testGenerateBusinessHoursTimestamp(date);
          const resultDate = new Date(isoTimestamp);

          expect(resultDate.getHours()).toBe(17);
          expect(resultDate.getMinutes()).toBe(59);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("timestamps during business hours (8-17) are preserved", () => {
    fc.assert(
      fc.property(
        realisticDate,
        fc.integer({ min: 8, max: 17 }),
        fc.integer({ min: 0, max: 59 }),
        (baseDate, businessHour, minutes) => {
          const date = new Date(baseDate);
          date.setHours(businessHour, minutes, 0, 0);

          const isoTimestamp = agent.testGenerateBusinessHoursTimestamp(date);
          const resultDate = new Date(isoTimestamp);

          expect(resultDate.getHours()).toBe(businessHour);
          expect(resultDate.getMinutes()).toBe(minutes);
        },
      ),
      { numRuns: 100 },
    );
  });
});
