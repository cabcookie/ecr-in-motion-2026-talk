import fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
  propagateRiskCluster,
  DisruptionScenario,
  RiskCluster,
  KpiType,
} from "./disruption.js";

/**
 * **Validates: Requirements 5.3**
 *
 * Property 10: Risikocluster-Propagation
 *
 * For every active disruption scenario that belongs to a risk cluster:
 * All other scenarios in the same cluster experience a correlated impact,
 * and scenarios outside the cluster remain unaffected.
 */

// ─── Arbitraries ────────────────────────────────────────────────────────────

const riskClusterArb: fc.Arbitrary<RiskCluster> = fc.constantFrom(
  "geo_energy_transport",
  "climate_agri_fresh",
);

const riskClusterOrNullArb: fc.Arbitrary<RiskCluster | null> = fc.oneof(
  riskClusterArb,
  fc.constant(null as RiskCluster | null),
);

const kpiTypeArb: fc.Arbitrary<KpiType> = fc.constantFrom(
  "otd",
  "osa",
  "cost_deviation",
  "mape",
);

const scenarioIdArb = fc.stringOf(
  fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz_0123456789"),
  { minLength: 1, maxLength: 20 },
);

const scenarioArb = (id: string): fc.Arbitrary<DisruptionScenario> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    marginImpactBps: fc.integer({ min: 1, max: 500 }),
    riskCluster: riskClusterOrNullArb,
    defaultDuration: fc.integer({ min: 1, max: 365 }),
    affectedKpis: fc.uniqueArray(kpiTypeArb, { minLength: 1, maxLength: 4 }),
  });

/**
 * Generate a list of scenarios with unique IDs and at least one scenario
 * that belongs to a risk cluster (to be the "trigger").
 */
const scenarioSetArb = fc
  .uniqueArray(scenarioIdArb, { minLength: 2, maxLength: 10 })
  .chain((ids) => fc.tuple(...ids.map((id) => scenarioArb(id))));

describe("Feature: supply-chain-simulation, Property 10: Risikocluster-Propagation", () => {
  it("scenarios in the same cluster receive a correlated impact when a cluster scenario is triggered", () => {
    fc.assert(
      fc.property(scenarioSetArb, (scenarios) => {
        // Find scenarios that belong to a cluster
        const clusterScenarios = scenarios.filter(
          (s) => s.riskCluster !== null,
        );

        if (clusterScenarios.length === 0) {
          // No cluster scenarios generated, nothing to test – trivially true
          return;
        }

        // Test each cluster scenario as trigger
        for (const trigger of clusterScenarios) {
          const effects = propagateRiskCluster(trigger, scenarios);

          // All effects must target scenarios in the same cluster
          for (const effect of effects) {
            expect(effect.scenario.riskCluster).toBe(trigger.riskCluster);
          }

          // All other scenarios in the same cluster must appear in effects
          const sameClusterPeers = scenarios.filter(
            (s) => s.id !== trigger.id && s.riskCluster === trigger.riskCluster,
          );
          const affectedIds = effects.map((e) => e.scenario.id);
          for (const peer of sameClusterPeers) {
            expect(affectedIds).toContain(peer.id);
          }

          // The correlated impact factor must be positive (> 0) for in-cluster peers
          // Note: correlatedImpactBps may be 0 due to rounding when marginImpactBps is very small
          for (const effect of effects) {
            expect(effect.correlatedImpactFactor).toBeGreaterThan(0);
            expect(effect.correlatedImpactBps).toBeGreaterThanOrEqual(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("scenarios outside the cluster are never affected by propagation", () => {
    fc.assert(
      fc.property(scenarioSetArb, (scenarios) => {
        const clusterScenarios = scenarios.filter(
          (s) => s.riskCluster !== null,
        );

        if (clusterScenarios.length === 0) {
          return;
        }

        for (const trigger of clusterScenarios) {
          const effects = propagateRiskCluster(trigger, scenarios);
          const affectedIds = new Set(effects.map((e) => e.scenario.id));

          // Scenarios outside the cluster (different cluster or null) must NOT appear
          const outsideCluster = scenarios.filter(
            (s) => s.id !== trigger.id && s.riskCluster !== trigger.riskCluster,
          );
          for (const outsider of outsideCluster) {
            expect(affectedIds.has(outsider.id)).toBe(false);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("the triggering scenario itself is never included in propagated effects", () => {
    fc.assert(
      fc.property(scenarioSetArb, (scenarios) => {
        const clusterScenarios = scenarios.filter(
          (s) => s.riskCluster !== null,
        );

        if (clusterScenarios.length === 0) {
          return;
        }

        for (const trigger of clusterScenarios) {
          const effects = propagateRiskCluster(trigger, scenarios);
          const affectedIds = effects.map((e) => e.scenario.id);
          expect(affectedIds).not.toContain(trigger.id);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("scenarios with no risk cluster produce no propagated effects", () => {
    fc.assert(
      fc.property(scenarioSetArb, (scenarios) => {
        const nonClusterScenarios = scenarios.filter(
          (s) => s.riskCluster === null,
        );

        for (const trigger of nonClusterScenarios) {
          const effects = propagateRiskCluster(trigger, scenarios);
          expect(effects).toHaveLength(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("correlated impact is proportional to the trigger's margin impact", () => {
    fc.assert(
      fc.property(scenarioSetArb, (scenarios) => {
        const clusterScenarios = scenarios.filter(
          (s) => s.riskCluster !== null,
        );

        if (clusterScenarios.length === 0) {
          return;
        }

        for (const trigger of clusterScenarios) {
          const effects = propagateRiskCluster(trigger, scenarios);

          for (const effect of effects) {
            // correlatedImpactBps should be correlatedImpactFactor * trigger.marginImpactBps (rounded)
            const expected = Math.round(
              trigger.marginImpactBps * effect.correlatedImpactFactor,
            );
            expect(effect.correlatedImpactBps).toBe(expected);

            // The correlated impact must never exceed the trigger's original impact
            expect(effect.correlatedImpactBps).toBeLessThanOrEqual(
              trigger.marginImpactBps,
            );
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
