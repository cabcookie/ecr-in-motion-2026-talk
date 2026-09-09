/**
 * Property-Based Test: Lieferanten-Nachrichten Invariante (Property 5)
 *
 * Für jede Nachricht, die vom Lieferanten-Agenten erzeugt wird, gilt:
 * - Der Kanal ist immer 'outlook'
 * - Die Absenderadresse endet niemals auf '@aldi-sued.de'
 *
 * **Validates: Requirements 3.5, 13.2**
 */

import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { LieferantenAgent } from "./agents/lieferanten-agent.js";
import type { SimEvent } from "./orchestrator.js";

// ─── Generators ──────────────────────────────────────────────────────────────

/**
 * Generates a random disruption event payload matching what the system produces.
 */
const disruptionPayloadArb = fc.record({
  type: fc.oneof(
    fc.constant("recall"),
    fc.constant("supply_chain_disruption"),
    fc.constant("extreme_weather"),
    fc.constant("seasonal_peaks"),
    fc.constant("packaging_change"),
    fc.constant("unknown_disruption"),
  ),
  affected_skus: fc.array(fc.stringMatching(/^SKU-[0-9]{3,6}$/), {
    minLength: 0,
    maxLength: 5,
  }),
  duration: fc.integer({ min: 1, max: 90 }),
  margin_impact: fc.float({ min: 0, max: Math.fround(0.3), noNaN: true }),
  supplier_id: fc.oneof(
    fc.constant("newcoffee"),
    fc.constant("storck"),
    fc.constant("muellermilch"),
    fc.constant("freshfruit"),
    fc.constant("koelln"),
    fc.constant("bauckhof"),
    fc.constant("dole"),
    fc.constant("teekanne"),
    fc.constant("suedfruchte"),
    fc.constant("nordgrain"),
    fc.constant(undefined),
  ),
  supplier_name: fc.oneof(
    fc.constant("NewCoffee Trading"),
    fc.constant("Storck GmbH"),
    fc.constant("MüllerMilch"),
    fc.constant("FreshFruit Import"),
    fc.constant(undefined),
  ),
});

/**
 * Generates a random communication event payload.
 */
const communicationPayloadArb = fc.record({
  subject: fc.oneof(
    fc.constant(undefined),
    fc.string({ minLength: 1, maxLength: 100 }),
  ),
  body: fc.oneof(
    fc.constant(undefined),
    fc.string({ minLength: 1, maxLength: 500 }),
  ),
  supplier_id: fc.oneof(
    fc.constant("newcoffee"),
    fc.constant("storck"),
    fc.constant("dole"),
    fc.constant(undefined),
  ),
  supplier_name: fc.oneof(
    fc.constant("Teekanne"),
    fc.constant("Koelln"),
    fc.constant(undefined),
  ),
});

/**
 * Generates a valid SimEvent for the Lieferanten-Agent.
 */
const simEventArb: fc.Arbitrary<SimEvent> = fc
  .oneof(
    fc.record({
      type: fc.constant("disruption" as const),
      payload: disruptionPayloadArb,
    }),
    fc.record({
      type: fc.constant("communication" as const),
      payload: communicationPayloadArb,
    }),
  )
  .map(({ type, payload }) => ({
    id: 1,
    timestamp: new Date().toISOString(),
    type,
    source_role: "system",
    target_role: null,
    payload: JSON.stringify(payload),
    status: "pending",
    scenario_id: null,
  }));

// ─── Property 5: Lieferanten-Nachrichten Invariante ──────────────────────────

/**
 * **Validates: Requirements 3.5, 13.2**
 */
describe("Feature: supply-chain-simulation, Property 5: Lieferanten-Nachrichten Invariante", () => {
  it("every message from LieferantenAgent uses channel 'outlook' and sender never ends with '@aldi-sued.de'", async () => {
    const agent = new LieferantenAgent();

    await fc.assert(
      fc.asyncProperty(simEventArb, async (event) => {
        const actions = await agent.handleEvent(event);

        // Filter to message actions only
        const messageActions = actions.filter((a) => a.type === "message");

        for (const action of messageActions) {
          // Invariant 1: channel is always 'outlook'
          expect(action.payload.channel).toBe("outlook");

          // Invariant 2: sender never ends with '@aldi-sued.de'
          const sender = action.payload.sender as string;
          expect(sender.endsWith("@aldi-sued.de")).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });
});
