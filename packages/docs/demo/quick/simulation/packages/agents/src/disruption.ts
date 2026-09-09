// ─── Interfaces ─────────────────────────────────────────────────────────────

/** A risk cluster grouping correlated disruption scenarios. */
export type RiskCluster = "geo_energy_transport" | "climate_agri_fresh";

/** KPI types affected by disruption scenarios. */
export type KpiType = "otd" | "osa" | "cost_deviation" | "mape";

/** Definition of a predefined disruption scenario. */
export interface DisruptionScenario {
  id: string;
  name: string;
  marginImpactBps: number; // basis points
  riskCluster: RiskCluster | null;
  defaultDuration: number; // days
  affectedKpis: KpiType[];
}

/** Parameters for creating a disruption event. */
export interface DisruptionEventParams {
  affectedSkus?: string[];
  duration?: number; // overrides defaultDuration
  marginImpact?: number; // overrides marginImpactBps
}

/** The structured event payload for a disruption. */
export interface DisruptionEventPayload {
  type: string;
  affected_skus: string[];
  duration: number;
  margin_impact: number;
}

/** Result of risk cluster propagation for a correlated scenario. */
export interface PropagatedEffect {
  scenario: DisruptionScenario;
  correlatedImpactFactor: number; // e.g. 0.3 = 30% of original impact
  correlatedImpactBps: number;
}

// ─── Predefined Scenarios ───────────────────────────────────────────────────

/**
 * The 8 predefined disruption scenarios as specified in Requirements 5.1.
 * Margin impact is expressed in basis points (bps).
 */
export const DISRUPTION_SCENARIOS: DisruptionScenario[] = [
  {
    id: "rueckruf",
    name: "Recall",
    marginImpactBps: 18,
    riskCluster: null,
    defaultDuration: 14,
    affectedKpis: ["osa", "cost_deviation"],
  },
  {
    id: "verpackungsaenderung",
    name: "Packaging Change",
    marginImpactBps: 18,
    riskCluster: null,
    defaultDuration: 21,
    affectedKpis: ["cost_deviation", "mape"],
  },
  {
    id: "saisonale_spitzen",
    name: "Seasonal Peaks",
    marginImpactBps: 22,
    riskCluster: null,
    defaultDuration: 30,
    affectedKpis: ["osa", "mape"],
  },
  {
    id: "it_ausfall",
    name: "IT Outage",
    marginImpactBps: 25,
    riskCluster: null,
    defaultDuration: 3,
    affectedKpis: ["otd", "osa", "mape"],
  },
  {
    id: "extremwetter",
    name: "Extreme Weather",
    marginImpactBps: 30,
    riskCluster: "climate_agri_fresh",
    defaultDuration: 7,
    affectedKpis: ["otd", "osa", "cost_deviation"],
  },
  {
    id: "mindestlohnerhoehung",
    name: "Minimum Wage Increase",
    marginImpactBps: 45,
    riskCluster: "geo_energy_transport",
    defaultDuration: 90,
    affectedKpis: ["cost_deviation"],
  },
  {
    id: "lieferketten_disruption",
    name: "Supply Chain Disruption",
    marginImpactBps: 50,
    riskCluster: "geo_energy_transport",
    defaultDuration: 30,
    affectedKpis: ["otd", "osa", "cost_deviation", "mape"],
  },
  {
    id: "pandemie",
    name: "Pandemic",
    marginImpactBps: 125,
    riskCluster: "geo_energy_transport",
    defaultDuration: 180,
    affectedKpis: ["otd", "osa", "cost_deviation", "mape"],
  },
];

// ─── Correlation factor for risk cluster propagation ────────────────────────

/** Default correlation factor for scenarios in the same risk cluster. */
const CLUSTER_CORRELATION_FACTOR = 0.3;

// ─── KPI impact scaling factors ─────────────────────────────────────────────

/**
 * Maximum degradation per KPI (absolute units).
 * These caps prevent unrealistic values during extreme scenarios.
 */
const MAX_KPI_IMPACT: Record<KpiType, number> = {
  otd: 0.25, // OTD can degrade by max 25 percentage points
  osa: 0.2, // OSA can degrade by max 20 percentage points
  cost_deviation: 0.15, // Cost deviation can increase by max 15 percentage points
  mape: 0.3, // MAPE can increase by max 30 percentage points
};

/**
 * Scaling factor to convert basis points to KPI impact.
 * 1 bps = 0.0001 (0.01%), scaled by this factor for realistic effects.
 */
const BPS_TO_KPI_SCALE = 0.001;

// ─── Functions ──────────────────────────────────────────────────────────────

/**
 * Creates a disruption event payload with all required fields.
 * Uses scenario defaults for any unspecified parameters.
 */
export function createDisruptionEvent(
  scenario: DisruptionScenario,
  params: DisruptionEventParams = {},
): DisruptionEventPayload {
  return {
    type: scenario.id,
    affected_skus: params.affectedSkus ?? [],
    duration: params.duration ?? scenario.defaultDuration,
    margin_impact: params.marginImpact ?? scenario.marginImpactBps,
  };
}

/**
 * Propagates risk cluster effects to correlated scenarios.
 * If the scenario belongs to a risk cluster, computes correlated impacts
 * on other scenarios in the same cluster.
 *
 * Returns an empty array if the scenario has no risk cluster.
 */
export function propagateRiskCluster(
  scenario: DisruptionScenario,
  allScenarios: DisruptionScenario[] = DISRUPTION_SCENARIOS,
): PropagatedEffect[] {
  if (!scenario.riskCluster) {
    return [];
  }

  return allScenarios
    .filter(
      (s) => s.id !== scenario.id && s.riskCluster === scenario.riskCluster,
    )
    .map((s) => ({
      scenario: s,
      correlatedImpactFactor: CLUSTER_CORRELATION_FACTOR,
      correlatedImpactBps: Math.round(
        scenario.marginImpactBps * CLUSTER_CORRELATION_FACTOR,
      ),
    }));
}

/**
 * Computes the adjusted KPI value after applying disruption impact.
 * The degradation is proportional to the margin impact in basis points,
 * but never exceeds the maximum allowed impact for the KPI.
 *
 * For "below" KPIs (otd, osa): value decreases (lower is worse)
 * For "above" KPIs (cost_deviation, mape): value increases (higher is worse)
 */
export function computeKpiAdjustment(
  marginImpactBps: number,
  kpi: KpiType,
  currentValue: number,
): number {
  const rawImpact = marginImpactBps * BPS_TO_KPI_SCALE;
  const maxImpact = MAX_KPI_IMPACT[kpi];
  const clampedImpact = Math.min(rawImpact, maxImpact);

  // OTD and OSA degrade downward, cost_deviation and MAPE degrade upward
  if (kpi === "otd" || kpi === "osa") {
    return Math.max(0, currentValue - clampedImpact);
  } else {
    return currentValue + clampedImpact;
  }
}
