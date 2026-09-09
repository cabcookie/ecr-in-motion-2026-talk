import fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
  evaluateEscalation,
  DEFAULT_ESCALATION_RULES,
  type EscalationRule,
} from "./escalation.js";

/**
 * **Validates: Requirements 6.2, 6.3, 6.4, 6.5**
 *
 * Property 3: Eskalations-Schwellenwert-Evaluation
 *
 * For every KPI value and every configured threshold rule:
 * The escalation logic triggers an escalation of the correct level EXACTLY when
 * the KPI value exceeds the threshold (OTD < 90% → Level 1, cost_deviation > 5% → Level 2,
 * OSA < 95% → Level 2, MAPE > 20% → Level 1), and does NOT trigger an escalation
 * when the value is within tolerance.
 */
describe("Feature: supply-chain-simulation, Property 3: Eskalations-Schwellenwert-Evaluation", () => {
  /**
   * Property 3.1: For any random KPI value that breaches a threshold,
   * evaluateEscalation returns the correct level.
   */
  it("triggers escalation of the correct level when threshold is breached", () => {
    // Generator: pick a rule and generate a value that breaches it
    const breachingInput = fc
      .integer({ min: 0, max: DEFAULT_ESCALATION_RULES.length - 1 })
      .chain((ruleIndex) => {
        const rule = DEFAULT_ESCALATION_RULES[ruleIndex];
        // Generate a value that breaches the threshold
        const valueArb =
          rule.direction === "below"
            ? // For "below" direction: value must be strictly less than threshold
              fc.double({
                min: 0,
                max: rule.threshold - 0.0001,
                noNaN: true,
                noDefaultInfinity: true,
              })
            : // For "above" direction: value must be strictly greater than threshold
              fc.double({
                min: rule.threshold + 0.0001,
                max: 1.0,
                noNaN: true,
                noDefaultInfinity: true,
              });

        return valueArb.map((value) => ({ rule, value }));
      });

    fc.assert(
      fc.property(breachingInput, ({ rule, value }) => {
        const result = evaluateEscalation(rule.kpi, value);

        // Must trigger an escalation
        expect(result).not.toBeNull();
        // The level must match the rule's configured level
        expect(result!.level).toBe(rule.level);
        // The returned rule must match
        expect(result!.rule.kpi).toBe(rule.kpi);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * Property 3.2: For any random KPI value within tolerance,
   * evaluateEscalation returns null (no escalation).
   */
  it("does not trigger escalation when value is within tolerance", () => {
    // Generator: pick a rule and generate a value that does NOT breach it
    const withinToleranceInput = fc
      .integer({ min: 0, max: DEFAULT_ESCALATION_RULES.length - 1 })
      .chain((ruleIndex) => {
        const rule = DEFAULT_ESCALATION_RULES[ruleIndex];
        // Generate a value within tolerance (not breaching)
        const valueArb =
          rule.direction === "below"
            ? // For "below" direction: value must be >= threshold (not breaching)
              fc.double({
                min: rule.threshold,
                max: 1.0,
                noNaN: true,
                noDefaultInfinity: true,
              })
            : // For "above" direction: value must be <= threshold (not breaching)
              fc.double({
                min: 0,
                max: rule.threshold,
                noNaN: true,
                noDefaultInfinity: true,
              });

        return valueArb.map((value) => ({ rule, value }));
      });

    fc.assert(
      fc.property(withinToleranceInput, ({ rule, value }) => {
        const result = evaluateEscalation(rule.kpi, value);

        // Must NOT trigger an escalation for this specific KPI
        expect(result).toBeNull();
      }),
      { numRuns: 200 },
    );
  });

  /**
   * Property 3.3: The returned level always matches the rule's configured level.
   * For any KPI and any value, if evaluateEscalation returns a result,
   * the level in the result matches the triggered rule's level.
   */
  it("returned level always matches the triggered rule's configured level", () => {
    const kpiNames = ["otd", "osa", "cost_deviation", "mape"] as const;

    const kpiAndValue = fc.record({
      kpi: fc.constantFrom(...kpiNames),
      value: fc.double({
        min: 0,
        max: 1.0,
        noNaN: true,
        noDefaultInfinity: true,
      }),
    });

    fc.assert(
      fc.property(kpiAndValue, ({ kpi, value }) => {
        const result = evaluateEscalation(kpi, value);

        if (result !== null) {
          // The result level must match the rule's level
          expect(result.level).toBe(result.rule.level);
          // The rule's KPI must match the input KPI
          expect(result.rule.kpi).toBe(kpi);
          // The rule must be from the default rules
          const matchingRule = DEFAULT_ESCALATION_RULES.find(
            (r) => r.kpi === kpi && r.level === result.level,
          );
          expect(matchingRule).toBeDefined();
        }
      }),
      { numRuns: 200 },
    );
  });
});
