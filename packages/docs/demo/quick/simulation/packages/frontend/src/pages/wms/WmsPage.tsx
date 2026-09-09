import { useState, useEffect, useCallback } from "react";
import { api } from "@/shared/api/client";
import type { InventoryItem } from "@/entities/inventory";
import { CoverageWarnings, InventoryTable } from "@/features/inventory-monitor";

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: "hidden",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#5f6368",
  },
  content: {
    flex: 1,
    padding: "20px 24px",
    overflow: "auto",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#5f6368",
    fontSize: "14px",
  },
  error: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#d93025",
    fontSize: "14px",
    padding: "20px",
    textAlign: "center" as const,
  },
};

export function WmsPage() {
  useEffect(() => {
    document.title = "ALDI WMS";
  }, []);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      const data = await api.tables.getRows<InventoryItem>("inventory", {
        _sort: "coverage_days",
        _order: "ASC",
      });
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Laden der Bestandsdaten",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 10_000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  if (loading) {
    return (
      <div style={styles.layout}>
        <div style={styles.loading}>Bestandsdaten werden geladen…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.layout}>
        <div style={styles.error}>
          Fehler beim Laden der Bestandsdaten: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manhattan WMS</h1>
        <p style={styles.subtitle}>
          Lagerbestandsübersicht – {items.length} SKUs
        </p>
      </div>
      <div style={styles.content}>
        <CoverageWarnings items={items} />
        <InventoryTable items={items} />
      </div>
    </div>
  );
}
