import type { SimEvent } from "@/entities/event";

const styles = {
  container: {
    padding: "16px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: 600 as const,
    marginBottom: "16px",
    color: "#1a1a1a",
  },
  emptyState: {
    fontSize: "14px",
    color: "#5f6368",
    padding: "12px 0",
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  statusPending: {
    backgroundColor: "#fbbc04",
  },
  statusProcessing: {
    backgroundColor: "#1a73e8",
  },
  statusCompleted: {
    backgroundColor: "#34a853",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  type: {
    fontSize: "13px",
    fontWeight: 500 as const,
    color: "#1a1a1a",
    textTransform: "capitalize" as const,
  },
  meta: {
    fontSize: "12px",
    color: "#5f6368",
    marginTop: "2px",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 500 as const,
    padding: "2px 8px",
    borderRadius: "12px",
    textTransform: "capitalize" as const,
  },
  badgePending: {
    color: "#7c4d00",
    backgroundColor: "#fef7e0",
  },
  badgeProcessing: {
    color: "#174ea6",
    backgroundColor: "#e8f0fe",
  },
  badgeCompleted: {
    color: "#137333",
    backgroundColor: "#e6f4ea",
  },
};

function getStatusDotStyle(status: SimEvent["status"]) {
  switch (status) {
    case "pending":
      return { ...styles.statusDot, ...styles.statusPending };
    case "processing":
      return { ...styles.statusDot, ...styles.statusProcessing };
    case "completed":
      return { ...styles.statusDot, ...styles.statusCompleted };
  }
}

function getStatusBadgeStyle(status: SimEvent["status"]) {
  switch (status) {
    case "pending":
      return { ...styles.statusBadge, ...styles.badgePending };
    case "processing":
      return { ...styles.statusBadge, ...styles.badgeProcessing };
    case "completed":
      return { ...styles.statusBadge, ...styles.badgeCompleted };
  }
}

interface EventListProps {
  events: SimEvent[];
  loading?: boolean;
}

export function EventList({ events, loading }: EventListProps) {
  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Aktive Ereignisse</h2>
        <p style={styles.emptyState}>Ereignisse werden geladen…</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Aktive Ereignisse</h2>
      {events.length === 0 ? (
        <p style={styles.emptyState}>Keine aktiven Ereignisse vorhanden.</p>
      ) : (
        <div style={styles.list}>
          {events.map((event) => (
            <div key={event.id} style={styles.item}>
              <div style={getStatusDotStyle(event.status)} />
              <div style={styles.content}>
                <div style={styles.type}>{event.type.replace("_", " ")}</div>
                <div style={styles.meta}>
                  {event.source_role}
                  {event.target_role ? ` → ${event.target_role}` : ""} ·{" "}
                  {new Date(event.timestamp).toLocaleString("de-DE")}
                </div>
              </div>
              <span style={getStatusBadgeStyle(event.status)}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
