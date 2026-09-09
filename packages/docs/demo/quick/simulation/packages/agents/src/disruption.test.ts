import { describe, it, expect } from "vitest";
import {
  DISRUPTION_SCENARIOS,
  createDisruptionEvent,
  propagateRiskCluster,
  computeKpiAdjustment,
  DisruptionScenario,
} from "./disruption.js";

describe("Disruption Engine", () => {
  // ─── Predefined Scenarios ─────────────────────────────────────────────

  describe("DISRUPTION_SCENARIOS", () => {
    it("should define exactly 8 scenarios", () => {
      expect(DISRUPTION_SCENARIOS).toHaveLength(8);
    });

    it("should define Rückruf with 18 bps", () => {
      const s = DISRUPTION_SCENARIOS.find((s) => s.id === "rueckruf");
      expect(s).toBeDefined();
      expect(s!.name).toBe("Recall");
      expect(s!.marginImpactBps).toBe(18);
      expect(s!.riskCluster).toBeNull();
    });

    it("should define Verpackungsänderung with 18 bps", () => {
      const s = DISRUPTION_SCENARIOS.find(
        (s) => s.id === "verpackungsaenderung",
      );
      expect(s).toBeDefined();
      expect(s!.name).toBe("Packaging Change");
      expect(s!.marginImpactBps).toBe(18);
      expect(s!.riskCluster).toBeNull();
    });

    it("should define Saisonale Spitzen with 22 bps", () => {
      const s = DISRUPTION_SCENARIOS.find((s) => s.id === "saisonale_spitzen");
      expect(s).toBeDefined();
      expect(s!.name).toBe("Seasonal Peaks");
      expect(s!.marginImpactBps).toBe(22);
    });

    it("should define IT-Ausfall with 25 bps", () => {
      const s = DISRUPTION_SCENARIOS.find((s) => s.id === "it_ausfall");
      expect(s).toBeDefined();
      expect(s!.name).toBe("IT Outage");
      expect(s!.marginImpactBps).toBe(25);
    });

    it("should define Extremwetter with 30 bps in climate_agri_fresh cluster", () => {
      const s = DISRUPTION_SCENARIOS.find((s) => s.id === "extremwetter");
      expect(s).toBeDefined();
      expect(s!.name).toBe("Extreme Weather");
      expect(s!.marginImpactBps).toBe(30);
      expect(s!.riskCluster).toBe("climate_agri_fresh");
    });

    it("should define Mindestlohnerhöhung with 45 bps in geo_energy_transport cluster", () => {
      const s = DISRUPTION_SCENARIOS.find(
        (s) => s.id === "mindestlohnerhoehung",
      );
      expect(s).toBeDefined();
      expect(s!.name).toBe("Minimum Wage Increase");
      expect(s!.marginImpactBps).toBe(45);
      expect(s!.riskCluster).toBe("geo_energy_transport");
    });

    it("should define Supply Chain Disruption with 50 bps in geo_energy_transport cluster", () => {
      const s = DISRUPTION_SCENARIOS.find(
        (s) => s.id === "lieferketten_disruption",
      );
      expect(s).toBeDefined();
      expect(s!.name).toBe("Supply Chain Disruption");
      expect(s!.marginImpactBps).toBe(50);
      expect(s!.riskCluster).toBe("geo_energy_transport");
    });

    it("should define Pandemie with 125 bps in geo_energy_transport cluster", () => {
      const s = DISRUPTION_SCENARIOS.find((s) => s.id === "pandemie");
      expect(s).toBeDefined();
      expect(s!.name).toBe("Pandemic");
      expect(s!.marginImpactBps).toBe(125);
      expect(s!.riskCluster).toBe("geo_energy_transport");
    });

    it("should have unique IDs for all scenarios", () => {
      const ids = DISRUPTION_SCENARIOS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // ─── createDisruptionEvent ────────────────────────────────────────────

  describe("createDisruptionEvent", () => {
    const scenario = DISRUPTION_SCENARIOS[0]; // Rückruf

    it("should create event payload with all required fields", () => {
      const event = createDisruptionEvent(scenario);
      expect(event).toHaveProperty("type");
      expect(event).toHaveProperty("affected_skus");
      expect(event).toHaveProperty("duration");
      expect(event).toHaveProperty("margin_impact");
    });

    it("should use scenario id as event type", () => {
      const event = createDisruptionEvent(scenario);
      expect(event.type).toBe("rueckruf");
    });

    it("should use scenario defaults when no params provided", () => {
      const event = createDisruptionEvent(scenario);
      expect(event.affected_skus).toEqual([]);
      expect(event.duration).toBe(scenario.defaultDuration);
      expect(event.margin_impact).toBe(scenario.marginImpactBps);
    });

    it("should use provided params when specified", () => {
      const event = createDisruptionEvent(scenario, {
        affectedSkus: ["SKU-001", "SKU-002"],
        duration: 7,
        marginImpact: 30,
      });
      expect(event.affected_skus).toEqual(["SKU-001", "SKU-002"]);
      expect(event.duration).toBe(7);
      expect(event.margin_impact).toBe(30);
    });

    it("should produce a JSON-serializable payload", () => {
      const event = createDisruptionEvent(scenario, {
        affectedSkus: ["SKU-A"],
      });
      const json = JSON.stringify(event);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(event);
    });
  });

  // ─── propagateRiskCluster ─────────────────────────────────────────────

  describe("propagateRiskCluster", () => {
    it("should return empty array for scenarios without a risk cluster", () => {
      const rueckruf = DISRUPTION_SCENARIOS.find((s) => s.id === "rueckruf")!;
      const effects = propagateRiskCluster(rueckruf);
      expect(effects).toEqual([]);
    });

    it("should return correlated effects for same-cluster scenarios", () => {
      const pandemie = DISRUPTION_SCENARIOS.find((s) => s.id === "pandemie")!;
      const effects = propagateRiskCluster(pandemie);

      // Pandemic is geo_energy_transport; Minimum Wage Increase and Supply Chain Disruption are in the same cluster
      expect(effects.length).toBe(2);
      const affectedIds = effects.map((e) => e.scenario.id);
      expect(affectedIds).toContain("mindestlohnerhoehung");
      expect(affectedIds).toContain("lieferketten_disruption");
    });

    it("should NOT include the triggering scenario itself", () => {
      const pandemie = DISRUPTION_SCENARIOS.find((s) => s.id === "pandemie")!;
      const effects = propagateRiskCluster(pandemie);
      const affectedIds = effects.map((e) => e.scenario.id);
      expect(affectedIds).not.toContain("pandemie");
    });

    it("should NOT affect scenarios from different clusters", () => {
      const pandemie = DISRUPTION_SCENARIOS.find((s) => s.id === "pandemie")!;
      const effects = propagateRiskCluster(pandemie);
      const affectedClusters = effects.map((e) => e.scenario.riskCluster);
      // All affected should be geo_energy_transport (same as pandemie)
      for (const cluster of affectedClusters) {
        expect(cluster).toBe("geo_energy_transport");
      }
    });

    it("should NOT affect scenarios without a risk cluster", () => {
      const pandemie = DISRUPTION_SCENARIOS.find((s) => s.id === "pandemie")!;
      const effects = propagateRiskCluster(pandemie);
      const affectedIds = effects.map((e) => e.scenario.id);
      // Rückruf, Verpackungsänderung, Saisonale Spitzen, IT-Ausfall have null cluster
      expect(affectedIds).not.toContain("rueckruf");
      expect(affectedIds).not.toContain("verpackungsaenderung");
      expect(affectedIds).not.toContain("saisonale_spitzen");
      expect(affectedIds).not.toContain("it_ausfall");
    });

    it("should compute correlated impact as 30% of original impact", () => {
      const pandemie = DISRUPTION_SCENARIOS.find((s) => s.id === "pandemie")!;
      const effects = propagateRiskCluster(pandemie);
      for (const effect of effects) {
        expect(effect.correlatedImpactFactor).toBe(0.3);
        expect(effect.correlatedImpactBps).toBe(
          Math.round(125 * 0.3), // 38 bps
        );
      }
    });

    it("should handle climate_agri_fresh cluster (Extremwetter alone)", () => {
      const extremwetter = DISRUPTION_SCENARIOS.find(
        (s) => s.id === "extremwetter",
      )!;
      const effects = propagateRiskCluster(extremwetter);
      // Extremwetter is the only scenario in climate_agri_fresh
      expect(effects).toEqual([]);
    });

    it("should work with custom scenario list", () => {
      const customScenarios: DisruptionScenario[] = [
        {
          id: "a",
          name: "A",
          marginImpactBps: 100,
          riskCluster: "geo_energy_transport",
          defaultDuration: 10,
          affectedKpis: ["otd"],
        },
        {
          id: "b",
          name: "B",
          marginImpactBps: 50,
          riskCluster: "geo_energy_transport",
          defaultDuration: 5,
          affectedKpis: ["osa"],
        },
        {
          id: "c",
          name: "C",
          marginImpactBps: 30,
          riskCluster: "climate_agri_fresh",
          defaultDuration: 7,
          affectedKpis: ["otd"],
        },
      ];

      const effects = propagateRiskCluster(customScenarios[0], customScenarios);
      expect(effects).toHaveLength(1);
      expect(effects[0].scenario.id).toBe("b");
      expect(effects[0].correlatedImpactBps).toBe(Math.round(100 * 0.3));
    });
  });

  // ─── computeKpiAdjustment ─────────────────────────────────────────────

  describe("computeKpiAdjustment", () => {
    it("should degrade OTD downward proportional to impact", () => {
      const result = computeKpiAdjustment(50, "otd", 0.95);
      // 50 bps * 0.001 = 0.05 impact, 0.95 - 0.05 = 0.90
      expect(result).toBeCloseTo(0.9, 5);
    });

    it("should degrade OSA downward proportional to impact", () => {
      const result = computeKpiAdjustment(30, "osa", 0.98);
      // 30 bps * 0.001 = 0.03 impact, 0.98 - 0.03 = 0.95
      expect(result).toBeCloseTo(0.95, 5);
    });

    it("should increase cost_deviation upward proportional to impact", () => {
      const result = computeKpiAdjustment(50, "cost_deviation", 0.02);
      // 50 bps * 0.001 = 0.05, 0.02 + 0.05 = 0.07
      expect(result).toBeCloseTo(0.07, 5);
    });

    it("should increase MAPE upward proportional to impact", () => {
      const result = computeKpiAdjustment(25, "mape", 0.1);
      // 25 bps * 0.001 = 0.025, 0.1 + 0.025 = 0.125
      expect(result).toBeCloseTo(0.125, 5);
    });

    it("should never let OTD/OSA drop below 0", () => {
      // Very high impact on low value
      const result = computeKpiAdjustment(500, "otd", 0.1);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should cap impact at maximum for OTD (0.25)", () => {
      // 300 bps * 0.001 = 0.3 raw impact, max is 0.25
      const result = computeKpiAdjustment(300, "otd", 0.95);
      // Should apply max 0.25: 0.95 - 0.25 = 0.70
      expect(result).toBeCloseTo(0.7, 5);
    });

    it("should cap impact at maximum for OSA (0.20)", () => {
      // 250 bps * 0.001 = 0.25 raw impact, max is 0.20
      const result = computeKpiAdjustment(250, "osa", 0.98);
      // Should apply max 0.20: 0.98 - 0.20 = 0.78
      expect(result).toBeCloseTo(0.78, 5);
    });

    it("should cap impact at maximum for cost_deviation (0.15)", () => {
      // 200 bps * 0.001 = 0.2 raw impact, max is 0.15
      const result = computeKpiAdjustment(200, "cost_deviation", 0.03);
      // Should apply max 0.15: 0.03 + 0.15 = 0.18
      expect(result).toBeCloseTo(0.18, 5);
    });

    it("should cap impact at maximum for MAPE (0.30)", () => {
      // 400 bps * 0.001 = 0.4 raw impact, max is 0.30
      const result = computeKpiAdjustment(400, "mape", 0.1);
      // Should apply max 0.30: 0.1 + 0.30 = 0.40
      expect(result).toBeCloseTo(0.4, 5);
    });

    it("should handle zero impact (no change)", () => {
      expect(computeKpiAdjustment(0, "otd", 0.95)).toBe(0.95);
      expect(computeKpiAdjustment(0, "cost_deviation", 0.03)).toBe(0.03);
    });

    it("should be proportional: double impact means double degradation (within cap)", () => {
      const impact1 = computeKpiAdjustment(25, "otd", 0.95);
      const impact2 = computeKpiAdjustment(50, "otd", 0.95);
      const degradation1 = 0.95 - impact1;
      const degradation2 = 0.95 - impact2;
      expect(degradation2).toBeCloseTo(degradation1 * 2, 5);
    });
  });
});
