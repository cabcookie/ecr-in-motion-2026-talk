export interface KpiState {
  id: number;
  kpi_name: "otd" | "osa" | "cost_deviation" | "mape";
  value: number;
  timestamp: string;
  role_id: number;
}

const KPI_CONFIG: Record<
  KpiState["kpi_name"],
  { label: string; threshold: number; unit: string; higherIsBetter: boolean }
> = {
  otd: {
    label: "On-Time Delivery",
    threshold: 0.92,
    unit: "%",
    higherIsBetter: true,
  },
  osa: {
    label: "On-Shelf Availability",
    threshold: 0.95,
    unit: "%",
    higherIsBetter: true,
  },
  cost_deviation: {
    label: "Cost Deviation",
    threshold: 0.05,
    unit: "%",
    higherIsBetter: false,
  },
  mape: {
    label: "MAPE (Forecast Accuracy)",
    threshold: 0.15,
    unit: "%",
    higherIsBetter: false,
  },
};

const styles = {
  container: {
    marginBottom: "24px",
  },
  heading: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "12px",
    color: "#1a1a1a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  card: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
  },
  cardBreached: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #fce8e6",
    backgroundColor: "#fce8e6",
  },
  kpiLabel: {
    fontSize: "12px",
    color: "#5f6368",
    marginBottom: "4px",
  },
  kpiValue: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a1a1a",
  },
  kpiValueBreached: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#c5221f",
  },
  kpiThreshold: {
    fontSize: "11px",
    color: "#80868b",
    marginTop: "4px",
  },
};

function isBreached(kpi: KpiState): boolean {
  const config = KPI_CONFIG[kpi.kpi_name];
  if (!config) return false;
  if (config.higherIsBetter) {
    return kpi.value < config.threshold;
  }
  return kpi.value > config.threshold;
}

function formatValue(kpi: KpiState): string {
  const config = KPI_CONFIG[kpi.kpi_name];
  if (!config) return String(kpi.value);
  return `${(kpi.value * 100).toFixed(1)}${config.unit}`;
}

interface KpiOverviewProps {
  kpiStates: KpiState[];
}

export function KpiOverview({ kpiStates }: KpiOverviewProps) {
  // Get the latest value for each KPI name
  const latestByName = new Map<KpiState["kpi_name"], KpiState>();
  for (const kpi of kpiStates) {
    if (!latestByName.has(kpi.kpi_name)) {
      latestByName.set(kpi.kpi_name, kpi);
    }
  }

  const kpis = Array.from(latestByName.values());

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>KPI Overview</h2>
      <div style={styles.grid}>
        {kpis.map((kpi) => {
          const breached = isBreached(kpi);
          const config = KPI_CONFIG[kpi.kpi_name];
          return (
            <div
              key={kpi.id}
              style={breached ? styles.cardBreached : styles.card}
            >
              <div style={styles.kpiLabel}>{config?.label ?? kpi.kpi_name}</div>
              <div style={breached ? styles.kpiValueBreached : styles.kpiValue}>
                {formatValue(kpi)}
              </div>
              <div style={styles.kpiThreshold}>
                Schwelle: {((config?.threshold ?? 0) * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
