import fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
  computeKpiDeclineEntries,
  computeHistoricMessages,
  computeHistoricEscalations,
  type ScenarioConfig,
} from "./pre-aged.js";
import { computeTimestamp, type SeedOffset } from "../../db/src/index.js";

/**
 * **Validates: Requirements 7.1, 7.2, 7.3**
 *
 * Property 11: Pre-Aged-Modus erzeugt chronologisch korrekte historische Daten
 *
 * For every arbitrary disruption scenario and every arbitrary anchor date:
 * 1. All generated historic messages have timestamps that are chronologically ordered
 * 2. All generated historic messages have timestamps that are BEFORE the anchor date
 * 3. All generated escalation entries have timestamps that are chronologically ordered
 * 4. All generated escalation entries have timestamps that are BEFORE the anchor date
 * 5. All generated KPI decline entries have offsets that are chronologically ordered
 * 6. All generated KPI decline entries have offsets representing times BEFORE the anchor date
 */
describe("Feature: supply-chain-simulation, Property 11: Pre-Aged chronologische Korrektheit", () => {
  // ─── Arbitraries ────────────────────────────────────────────────────────────

  const scenarioTypes = [
    "rueckruf",
    "verpackungsaenderung",
    "saisonale_spitzen",
    "it_ausfall",
    "extremwetter",
    "mindestlohnerhoehung",
    "lieferketten_disruption",
    "pandemie",
  ];

  const riskClusters: (string | null)[] = [
    "geo_energy_transport",
    "climate_agri_fresh",
    null,
  ];

  const scenarioConfigArb: fc.Arbitrary<ScenarioConfig> = fc.record({
    type: fc.constantFrom(...scenarioTypes),
    label: fc.constant("Test-Szenario"),
    margin_impact_bps: fc.integer({ min: 10, max: 200 }),
    duration_days: fc.integer({ min: 1, max: 60 }),
    probability: fc.constant(0.1),
    risk_cluster: fc.constantFrom(...riskClusters),
    affected_skus: fc.array(fc.stringMatching(/^SKU-\d{4}$/), {
      minLength: 0,
      maxLength: 10,
    }),
  });

  /** Anchor dates between 2020-01-01 and 2030-01-01 at midnight UTC */
  const anchorDateArb: fc.Arbitrary<Date> = fc
    .integer({
      min: new Date("2020-01-01T00:00:00Z").getTime(),
      max: new Date("2030-01-01T00:00:00Z").getTime(),
    })
    .map((ms) => {
      // Normalize to midnight UTC to avoid partial-day offsets causing ambiguity
      const d = new Date(ms);
      return new Date(
        Date.UTC(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
    });

  // ─── Helper ─────────────────────────────────────────────────────────────────

  function offsetToMs(offset: SeedOffset): number {
    return (
      offset.days * 24 * 60 * 60 * 1000 +
      (offset.hours ?? 0) * 60 * 60 * 1000 +
      (offset.minutes ?? 0) * 60 * 1000
    );
  }

  // ─── Property Tests ─────────────────────────────────────────────────────────

  it("KPI decline entries are chronologically ordered and before anchor date", () => {
    fc.assert(
      fc.property(scenarioConfigArb, anchorDateArb, (scenario, anchorDate) => {
        const entries = computeKpiDeclineEntries(scenario, anchorDate);

        if (entries.length === 0) return; // Some scenarios have no matching disruption

        // Group by KPI name – entries within the same KPI should be ordered
        const byKpi = new Map<string, typeof entries>();
        for (const entry of entries) {
          const group = byKpi.get(entry.kpi_name) ?? [];
          group.push(entry);
          byKpi.set(entry.kpi_name, group);
        }

        for (const [_kpiName, kpiEntries] of byKpi) {
          // Timestamps within each KPI must be chronologically ordered
          for (let i = 1; i < kpiEntries.length; i++) {
            const prevTs = computeTimestamp(
              anchorDate,
              kpiEntries[i - 1].offset,
            );
            const currTs = computeTimestamp(anchorDate, kpiEntries[i].offset);
            expect(new Date(prevTs).getTime()).toBeLessThanOrEqual(
              new Date(currTs).getTime(),
            );
          }

          // All timestamps must be strictly before the anchor date
          for (const entry of kpiEntries) {
            const ts = computeTimestamp(anchorDate, entry.offset);
            expect(new Date(ts).getTime()).toBeLessThan(anchorDate.getTime());
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("historic messages are chronologically ordered and before anchor date", () => {
    fc.assert(
      fc.property(scenarioConfigArb, anchorDateArb, (scenario, anchorDate) => {
        const messages = computeHistoricMessages(scenario, anchorDate);

        if (messages.length === 0) return;

        // All timestamps must be chronologically ordered
        for (let i = 1; i < messages.length; i++) {
          const prevTs = computeTimestamp(anchorDate, messages[i - 1].offset);
          const currTs = computeTimestamp(anchorDate, messages[i].offset);
          expect(new Date(prevTs).getTime()).toBeLessThanOrEqual(
            new Date(currTs).getTime(),
          );
        }

        // All timestamps must be strictly before the anchor date
        for (const msg of messages) {
          const ts = computeTimestamp(anchorDate, msg.offset);
          expect(new Date(ts).getTime()).toBeLessThan(anchorDate.getTime());
        }
      }),
      { numRuns: 100 },
    );
  });

  it("historic escalations are chronologically ordered and before anchor date", () => {
    fc.assert(
      fc.property(scenarioConfigArb, anchorDateArb, (scenario, anchorDate) => {
        const escalations = computeHistoricEscalations(scenario, anchorDate);

        if (escalations.length === 0) return; // Some scenarios may not breach thresholds

        // Timestamps must be chronologically ordered
        for (let i = 1; i < escalations.length; i++) {
          const prevTs = computeTimestamp(
            anchorDate,
            escalations[i - 1].offset,
          );
          const currTs = computeTimestamp(anchorDate, escalations[i].offset);
          expect(new Date(prevTs).getTime()).toBeLessThanOrEqual(
            new Date(currTs).getTime(),
          );
        }

        // All timestamps must be strictly before the anchor date
        for (const esc of escalations) {
          const ts = computeTimestamp(anchorDate, esc.offset);
          expect(new Date(ts).getTime()).toBeLessThan(anchorDate.getTime());
        }
      }),
      { numRuns: 100 },
    );
  });
});
