import fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
  computeKpiAdjustment,
  DISRUPTION_SCENARIOS,
  type KpiType,
} from "./disruption.js";

/**
 * **Validates: Requirements 5.5**
 *
 * Property 9: KPI-Anpassung proportional zum Szenario-Impact
 *
 * For every active disruption scenario with a configured margin impact:
 * The KPI degradation per time unit is proportional to the configured impact
 * (in basis points) and never exceeds the maximum impact value of the scenario.
 */
describe("Feature: supply-chain-simulation, Property 9: KPI-Anpassung proportional zum Szenario-Impact", () => {
  const kpiTypes: KpiType[] = ["otd", "osa", "cost_deviation", "mape"];

  // Maximum impact caps (mirrors MAX_KPI_IMPACT from disruption.ts)
  const MAX_KPI_IMPACT: Record<KpiType, number> = {
    otd: 0.25,
    osa: 0.2,
    cost_deviation: 0.15,
    mape: 0.3,
  };

  const BPS_TO_KPI_SCALE = 0.001;

  /**
   * Property 9.1: KPI degradation is proportional to the configured impact.
   * For any margin impact and KPI type, the actual degradation equals
   * marginImpactBps * BPS_TO_KPI_SCALE (clamped at the maximum).
   */
  it("KPI degradation is proportional to configured margin impact (in bps)", () => {
    const input = fc.record({
      marginImpactBps: fc.integer({ min: 1, max: 500 }),
      kpi: fc.constantFrom(...kpiTypes),
      currentValue: fc.double({
        min: 0.5,
        max: 1.0,
        noNaN: true,
        noDefaultInfinity: true,
      }),
    });

    fc.assert(
      fc.property(input, ({ marginImpactBps, kpi, currentValue }) => {
        const adjustedValue = computeKpiAdjustment(
          marginImpactBps,
          kpi,
          currentValue,
        );

        const rawImpact = marginImpactBps * BPS_TO_KPI_SCALE;
        const maxImpact = MAX_KPI_IMPACT[kpi];
        const expectedImpact = Math.min(rawImpact, maxImpact);

        if (kpi === "otd" || kpi === "osa") {
          // Downward degradation
          const actualDegradation = currentValue - adjustedValue;
          expect(actualDegradation).toBeCloseTo(expectedImpact, 10);
        } else {
          // Upward degradation (cost_deviation, mape)
          const actualIncrease = adjustedValue - currentValue;
          expect(actualIncrease).toBeCloseTo(expectedImpact, 10);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9.2: KPI degradation never exceeds the maximum impact value.
   * For any margin impact (even extremely high), the degradation is capped.
   */
  it("KPI degradation never exceeds the maximum allowed impact", () => {
    const input = fc.record({
      marginImpactBps: fc.integer({ min: 1, max: 10000 }),
      kpi: fc.constantFrom(...kpiTypes),
      currentValue: fc.double({
        min: 0.5,
        max: 1.0,
        noNaN: true,
        noDefaultInfinity: true,
      }),
    });

    fc.assert(
      fc.property(input, ({ marginImpactBps, kpi, currentValue }) => {
        const adjustedValue = computeKpiAdjustment(
          marginImpactBps,
          kpi,
          currentValue,
        );
        const maxImpact = MAX_KPI_IMPACT[kpi];

        if (kpi === "otd" || kpi === "osa") {
          const actualDegradation = currentValue - adjustedValue;
          expect(actualDegradation).toBeLessThanOrEqual(maxImpact + 1e-10);
        } else {
          const actualIncrease = adjustedValue - currentValue;
          expect(actualIncrease).toBeLessThanOrEqual(maxImpact + 1e-10);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9.3: Proportionality — doubling the impact doubles the degradation
   * (as long as both are below the cap).
   */
  it("doubling the impact doubles the degradation when both are below cap", () => {
    const input = fc.record({
      // Keep impact low enough so that double is still below the smallest cap (0.15 for cost_deviation → 150 bps)
      marginImpactBps: fc.integer({ min: 1, max: 70 }),
      kpi: fc.constantFrom(...kpiTypes),
      currentValue: fc.double({
        min: 0.5,
        max: 1.0,
        noNaN: true,
        noDefaultInfinity: true,
      }),
    });

    fc.assert(
      fc.property(input, ({ marginImpactBps, kpi, currentValue }) => {
        const adjustedSingle = computeKpiAdjustment(
          marginImpactBps,
          kpi,
          currentValue,
        );
        const adjustedDouble = computeKpiAdjustment(
          marginImpactBps * 2,
          kpi,
          currentValue,
        );

        if (kpi === "otd" || kpi === "osa") {
          const degradationSingle = currentValue - adjustedSingle;
          const degradationDouble = currentValue - adjustedDouble;
          expect(degradationDouble).toBeCloseTo(degradationSingle * 2, 10);
        } else {
          const increaseSingle = adjustedSingle - currentValue;
          const increaseDouble = adjustedDouble - currentValue;
          expect(increaseDouble).toBeCloseTo(increaseSingle * 2, 10);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9.4: Using real predefined scenarios — KPI adjustment is proportional
   * and within bounds for all 8 configured scenarios.
   */
  it("all predefined scenarios produce proportional KPI adjustments within bounds", () => {
    const input = fc.record({
      scenarioIndex: fc.integer({
        min: 0,
        max: DISRUPTION_SCENARIOS.length - 1,
      }),
      kpiIndex: fc.integer({ min: 0, max: kpiTypes.length - 1 }),
      currentValue: fc.double({
        min: 0.5,
        max: 1.0,
        noNaN: true,
        noDefaultInfinity: true,
      }),
    });

    fc.assert(
      fc.property(input, ({ scenarioIndex, kpiIndex, currentValue }) => {
        const scenario = DISRUPTION_SCENARIOS[scenarioIndex];
        const kpi = kpiTypes[kpiIndex];

        const adjustedValue = computeKpiAdjustment(
          scenario.marginImpactBps,
          kpi,
          currentValue,
        );
        const maxImpact = MAX_KPI_IMPACT[kpi];

        if (kpi === "otd" || kpi === "osa") {
          const degradation = currentValue - adjustedValue;
          // Proportional: degradation = min(bps * scale, max)
          expect(degradation).toBeLessThanOrEqual(maxImpact + 1e-10);
          expect(degradation).toBeGreaterThanOrEqual(0);
          // Check proportionality
          const expectedImpact = Math.min(
            scenario.marginImpactBps * BPS_TO_KPI_SCALE,
            maxImpact,
          );
          expect(degradation).toBeCloseTo(expectedImpact, 10);
        } else {
          const increase = adjustedValue - currentValue;
          // Never exceeds max
          expect(increase).toBeLessThanOrEqual(maxImpact + 1e-10);
          expect(increase).toBeGreaterThanOrEqual(0);
          // Check proportionality
          const expectedImpact = Math.min(
            scenario.marginImpactBps * BPS_TO_KPI_SCALE,
            maxImpact,
          );
          expect(increase).toBeCloseTo(expectedImpact, 10);
        }
      }),
      { numRuns: 100 },
    );
  });
});
