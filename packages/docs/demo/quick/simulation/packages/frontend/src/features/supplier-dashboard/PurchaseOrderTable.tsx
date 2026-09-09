/**
 * PurchaseOrderTable – displays purchase orders from SAP.
 */

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_name: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  requested_delivery_date: string;
  confirmed_delivery_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const styles = {
  section: {
    marginBottom: "24px",
  },
  heading: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "12px",
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
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
    color: "#1a1a1a",
  },
  statusBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
  },
  statusOpen: {
    backgroundColor: "#fef7cd",
    color: "#92400e",
  },
  statusConfirmed: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusShipped: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  statusDelivered: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  empty: {
    textAlign: "center" as const,
    padding: "24px",
    color: "#5f6368",
    fontSize: "14px",
  },
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function getStatusStyle(status: string) {
  switch (status) {
    case "open":
      return styles.statusOpen;
    case "confirmed":
      return styles.statusConfirmed;
    case "shipped":
      return styles.statusShipped;
    case "delivered":
      return styles.statusDelivered;
    case "cancelled":
      return styles.statusCancelled;
    default:
      return styles.statusOpen;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
}

export function PurchaseOrderTable({ orders }: PurchaseOrderTableProps) {
  return (
    <div style={styles.section}>
      <h3 style={styles.heading}>Purchase Orders</h3>
      {orders.length === 0 ? (
        <div style={styles.empty}>No purchase orders available</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>PO No.</th>
              <th style={styles.th}>Supplier</th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Requested Delivery</th>
              <th style={styles.th}>Confirmed Delivery</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={styles.td}>{order.po_number}</td>
                <td style={styles.td}>{order.supplier_name}</td>
                <td style={styles.td}>
                  {order.product_name} ({order.sku})
                </td>
                <td style={styles.td}>
                  {order.quantity.toLocaleString("de-DE")} VE
                </td>
                <td style={styles.td}>
                  {formatDate(order.requested_delivery_date)}
                </td>
                <td style={styles.td}>
                  {order.confirmed_delivery_date
                    ? formatDate(order.confirmed_delivery_date)
                    : "–"}
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(order.status),
                    }}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
