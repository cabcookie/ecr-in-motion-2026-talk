import type { InventoryItem } from "@/entities/inventory";

interface CoverageWarningsProps {
  items: InventoryItem[];
}

const styles = {
  container: {
    marginBottom: "20px",
  },
  panel: {
    backgroundColor: "#fde8e8",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    fontWeight: 600,
    fontSize: "15px",
    color: "#d32f2f",
  },
  alertList: {
    listStyle: "none" as const,
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  alertItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    fontSize: "13px",
    color: "#1a1a1a",
  },
  sku: {
    fontWeight: 600,
    minWidth: "100px",
  },
  coverage: {
    color: "#d32f2f",
    fontWeight: 700,
  },
  noWarnings: {
    backgroundColor: "#e8f5e9",
    border: "1px solid #c8e6c9",
    borderRadius: "6px",
    padding: "12px 16px",
    color: "#388e3c",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

export function CoverageWarnings({ items }: CoverageWarningsProps) {
  const criticalItems = items.filter((item) => item.coverage_days < 3);

  if (criticalItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.noWarnings}>
          <span>✅</span>
          <span>All SKUs have sufficient coverage days (≥ 3 days).</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <span>⚠️</span>
          <span>
            Critical Stock: {criticalItems.length} SKU
            {criticalItems.length !== 1 ? "s" : ""} below 3 days coverage
          </span>
        </div>
        <ul style={styles.alertList}>
          {criticalItems.map((item) => (
            <li key={item.id} style={styles.alertItem}>
              <span style={styles.sku}>{item.sku}</span>
              <span>{item.product_name}</span>
              <span>–</span>
              <span style={styles.coverage}>
                {item.coverage_days} day{item.coverage_days !== 1 ? "s" : ""}
              </span>
              <span>({item.location})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
