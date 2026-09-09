import fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
  createDisruptionEvent,
  DISRUPTION_SCENARIOS,
  type DisruptionScenario,
  type DisruptionEventParams,
} from "./disruption.js";

/**
 * **Validates: Requirements 5.2**
 *
 * Property 8: Disruption-Event enthält alle Pflichtfelder
 *
 * For every valid combination of disruption parameters (scenario type, affected SKUs,
 * duration, margin impact): The generated event contains all specified fields and the
 * payload is valid JSON with keys `type`, `affected_skus`, `duration`, and `margin_impact`.
 */
describe("Feature: supply-chain-simulation, Property 8: Disruption-Event Pflichtfelder", () => {
  /**
   * Generator: Produces a valid DisruptionScenario from the predefined list.
   */
  const scenarioArb = fc.constantFrom(...DISRUPTION_SCENARIOS);

  /**
   * Generator: Produces valid disruption event parameters with random SKUs, duration, and impact.
   */
  const paramsArb: fc.Arbitrary<DisruptionEventParams> = fc.record(
    {
      affectedSkus: fc.array(
        fc.string({ minLength: 1, maxLength: 20 }).map((s) => `SKU-${s}`),
        { minLength: 0, maxLength: 10 },
      ),
      duration: fc.integer({ min: 1, max: 365 }),
      marginImpact: fc.integer({ min: 1, max: 500 }),
    },
    { requiredKeys: [] },
  );

  it("generated event payload contains all required fields (type, affected_skus, duration, margin_impact)", () => {
    fc.assert(
      fc.property(scenarioArb, paramsArb, (scenario, params) => {
        const event = createDisruptionEvent(scenario, params);

        // Payload must have all 4 required keys
        expect(event).toHaveProperty("type");
        expect(event).toHaveProperty("affected_skus");
        expect(event).toHaveProperty("duration");
        expect(event).toHaveProperty("margin_impact");
      }),
      { numRuns: 100 },
    );
  });

  it("generated event payload is valid JSON-serializable with correct key structure", () => {
    fc.assert(
      fc.property(scenarioArb, paramsArb, (scenario, params) => {
        const event = createDisruptionEvent(scenario, params);

        // Payload must be valid JSON (round-trip)
        const json = JSON.stringify(event);
        const parsed = JSON.parse(json);

        // Parsed JSON must contain exactly the required keys
        expect(parsed).toHaveProperty("type");
        expect(parsed).toHaveProperty("affected_skus");
        expect(parsed).toHaveProperty("duration");
        expect(parsed).toHaveProperty("margin_impact");

        // Verify types of the fields
        expect(typeof parsed.type).toBe("string");
        expect(Array.isArray(parsed.affected_skus)).toBe(true);
        expect(typeof parsed.duration).toBe("number");
        expect(typeof parsed.margin_impact).toBe("number");
      }),
      { numRuns: 100 },
    );
  });

  it("event type matches the scenario id", () => {
    fc.assert(
      fc.property(scenarioArb, paramsArb, (scenario, params) => {
        const event = createDisruptionEvent(scenario, params);

        // type field should always correspond to the scenario's id
        expect(event.type).toBe(scenario.id);
        expect(event.type.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
