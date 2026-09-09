import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { selectChannel } from "./escalation.js";

/**
 * **Validates: Requirements 3.4, 6.6, 6.7**
 */
describe("Feature: supply-chain-simulation, Property 4: Kanal-Selektion basierend auf Lösungszeit", () => {
  it("resolution time < 24h → teams; >= 24h → outlook", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 720, noNaN: true }),
        (resolutionTimeHours) => {
          const channel = selectChannel(resolutionTimeHours);

          if (resolutionTimeHours < 24) {
            expect(channel).toBe("teams");
          } else {
            expect(channel).toBe("outlook");
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("boundary: exactly 24h → outlook", () => {
    expect(selectChannel(24)).toBe("outlook");
  });
});
