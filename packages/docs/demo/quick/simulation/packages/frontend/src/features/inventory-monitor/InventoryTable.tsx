import type { InventoryItem } from "@/entities/inventory";

interface InventoryTableProps {
  items: InventoryItem[];
}

const styles = {
  container: {
    overflow: "auto",
    flex: 1,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "14px",
  },
  th: {
    padding: "10px 12px",
    textAlign: "left" as const,
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
    fontWeight: 600,
    color: "#1a1a1a",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
    color: "#1a1a1a",
  },
  rowCritical: {
    backgroundColor: "#fde8e8",
  },
  rowWarning: {
    backgroundColor: "#fef3cd",
  },
  rowOk: {
    backgroundColor: "#ffffff",
  },
  coverageCritical: {
    color: "#d32f2f",
    fontWeight: 700,
  },
  coverageWarning: {
    color: "#f57c00",
    fontWeight: 600,
  },
  coverageOk: {
    color: "#388e3c",
    fontWeight: 600,
  },
  warningIcon: {
    marginRight: "4px",
  },
  empty: {
    padding: "40px 20px",
    textAlign: "center" as const,
    color: "#5f6368",
    fontSize: "14px",
  },
};

function getCoverageStyle(coverageDays: number) {
  if (coverageDays < 3) return styles.coverageCritical;
  if (coverageDays <= 5) return styles.coverageWarning;
  return styles.coverageOk;
}

function getRowStyle(coverageDays: number) {
  if (coverageDays < 3) return styles.rowCritical;
  if (coverageDays <= 5) return styles.rowWarning;
  return styles.rowOk;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InventoryTable({ items }: InventoryTableProps) {
  if (items.length === 0) {
    return <div style={styles.empty}>No inventory data available.</div>;
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>SKU</th>
            <th style={styles.th}>Product</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Coverage Days</th>
            <th style={styles.th}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={getRowStyle(item.coverage_days)}>
              <td style={styles.td}>{item.sku}</td>
              <td style={styles.td}>{item.product_name}</td>
              <td style={styles.td}>{item.quantity}</td>
              <td style={styles.td}>{item.location}</td>
              <td
                style={{
                  ...styles.td,
                  ...getCoverageStyle(item.coverage_days),
                }}
              >
                {item.coverage_days < 3 && (
                  <span style={styles.warningIcon}>⚠️</span>
                )}
                {item.coverage_days}
              </td>
              <td style={styles.td}>{formatDate(item.last_updated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
