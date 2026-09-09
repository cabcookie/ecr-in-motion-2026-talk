export interface Escalation {
  id: number;
  level: 1 | 2 | 3;
  trigger_kpi: string;
  trigger_value: number;
  threshold: number;
  channel: string;
  created_at: string;
  resolved_at: string | null;
}

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
  levelBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 600,
  },
  level1: {
    backgroundColor: "#fef7e0",
    color: "#b06000",
  },
  level2: {
    backgroundColor: "#fce8e6",
    color: "#c5221f",
  },
  level3: {
    backgroundColor: "#d93025",
    color: "#ffffff",
  },
  resolved: {
    color: "#137333",
    fontWeight: 500,
  },
  open: {
    color: "#c5221f",
    fontWeight: 500,
  },
};

function getLevelStyle(level: number) {
  switch (level) {
    case 1:
      return { ...styles.levelBadge, ...styles.level1 };
    case 2:
      return { ...styles.levelBadge, ...styles.level2 };
    case 3:
      return { ...styles.levelBadge, ...styles.level3 };
    default:
      return styles.levelBadge;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EscalationHistoryProps {
  escalations: Escalation[];
}

export function EscalationHistory({ escalations }: EscalationHistoryProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Escalation History</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Level</th>
            <th style={styles.th}>Trigger KPI</th>
            <th style={styles.th}>Value / Threshold</th>
            <th style={styles.th}>Channel</th>
            <th style={styles.th}>Created</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {escalations.map((esc) => (
            <tr key={esc.id}>
              <td style={styles.td}>
                <span style={getLevelStyle(esc.level)}>Level {esc.level}</span>
              </td>
              <td style={styles.td}>{esc.trigger_kpi}</td>
              <td style={styles.td}>
                {(esc.trigger_value * 100).toFixed(1)}% /{" "}
                {(esc.threshold * 100).toFixed(0)}%
              </td>
              <td style={styles.td}>{esc.channel}</td>
              <td style={styles.td}>{formatDate(esc.created_at)}</td>
              <td style={styles.td}>
                {esc.resolved_at ? (
                  <span style={styles.resolved}>Resolved</span>
                ) : (
                  <span style={styles.open}>Open</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
