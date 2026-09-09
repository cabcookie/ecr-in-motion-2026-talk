import type { Supplier } from "@/entities/supplier";

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
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
  },
  th: {
    textAlign: "left" as const,
    padding: "8px 12px",
    borderBottom: "2px solid #e0e0e0",
    color: "#5f6368",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
    color: "#1a1a1a",
  },
  row: {
    cursor: "default",
  },
  statusActive: {
    color: "#137333",
    fontWeight: 500,
  },
  statusNegotiation: {
    color: "#b06000",
    fontWeight: 500,
  },
  statusSuspended: {
    color: "#c5221f",
    fontWeight: 500,
  },
  riskHigh: {
    color: "#c5221f",
    fontWeight: 500,
  },
  riskMedium: {
    color: "#b06000",
    fontWeight: 500,
  },
  riskLow: {
    color: "#137333",
    fontWeight: 500,
  },
};

function getStatusStyle(status: Supplier["contract_status"]) {
  switch (status) {
    case "active":
      return styles.statusActive;
    case "negotiation":
      return styles.statusNegotiation;
    case "suspended":
      return styles.statusSuspended;
  }
}

function getRiskStyle(risk: string | null) {
  if (!risk) return {};
  const lower = risk.toLowerCase();
  if (lower === "high") return styles.riskHigh;
  if (lower === "medium") return styles.riskMedium;
  return styles.riskLow;
}

interface SupplierTableProps {
  suppliers: Supplier[];
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Lieferanten</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Region</th>
            <th style={styles.th}>OTD Score</th>
            <th style={styles.th}>Risk Cluster</th>
            <th style={styles.th}>Vertragsstatus</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id} style={styles.row}>
              <td style={styles.td}>{supplier.name}</td>
              <td style={styles.td}>{supplier.region}</td>
              <td style={styles.td}>
                {(supplier.otd_score * 100).toFixed(1)}%
              </td>
              <td
                style={{ ...styles.td, ...getRiskStyle(supplier.risk_cluster) }}
              >
                {supplier.risk_cluster ?? "–"}
              </td>
              <td
                style={{
                  ...styles.td,
                  ...getStatusStyle(supplier.contract_status),
                }}
              >
                {supplier.contract_status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
