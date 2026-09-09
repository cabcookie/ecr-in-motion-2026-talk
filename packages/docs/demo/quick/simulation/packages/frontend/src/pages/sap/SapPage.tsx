import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/api";
import type { Supplier } from "@/entities/supplier";
import {
  SupplierTable,
  KpiOverview,
  EscalationHistory,
  PurchaseOrderTable,
} from "@/features/supplier-dashboard";
import type {
  KpiState,
  Escalation,
  PurchaseOrder,
} from "@/features/supplier-dashboard";

const styles = {
  layout: {
    padding: "24px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: "1200px",
    margin: "0 auto",
    height: "100vh",
    overflow: "auto",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "#5f6368",
    marginTop: "4px",
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

export function SapPage() {
  useEffect(() => {
    document.title = "ALDI SAP";
  }, []);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [kpiStates, setKpiStates] = useState<KpiState[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [suppliersData, kpiData, escalationsData, poData] =
        await Promise.all([
          api.tables.getRows<Supplier>("suppliers"),
          api.tables.getRows<KpiState>("kpi_states", {
            _sort: "timestamp",
            _order: "DESC",
          }),
          api.tables.getRows<Escalation>("escalations", {
            _sort: "created_at",
            _order: "DESC",
          }),
          api.tables.getRows<PurchaseOrder>("purchase_orders", {
            _sort: "created_at",
            _order: "DESC",
          }),
        ]);
      setSuppliers(suppliersData);
      setKpiStates(kpiData);
      setEscalations(escalationsData);
      setPurchaseOrders(poData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={styles.layout}>
        <div style={styles.loading}>Loading data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.layout}>
        <div style={styles.error}>Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <div style={styles.header}>
        <h1 style={styles.title}>SAP S/4HANA</h1>
        <p style={styles.subtitle}>
          Supplier data, contracts, and KPI overview
        </p>
      </div>
      <KpiOverview kpiStates={kpiStates} />
      <PurchaseOrderTable orders={purchaseOrders} />
      <SupplierTable suppliers={suppliers} />
      <EscalationHistory escalations={escalations} />
    </div>
  );
}
