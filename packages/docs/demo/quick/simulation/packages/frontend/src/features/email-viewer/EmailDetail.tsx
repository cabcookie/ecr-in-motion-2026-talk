import type { Message } from "@/entities/message";

interface EmailDetailProps {
  message: Message | null;
}

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#5f6368",
    fontSize: "14px",
  },
  header: {
    padding: "24px 32px 16px",
    borderBottom: "1px solid #e0e0e0",
  },
  subject: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "16px",
  },
  meta: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#0078d4",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 600,
    flexShrink: 0,
  },
  metaInfo: {
    flex: 1,
  },
  sender: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  recipient: {
    fontSize: "12px",
    color: "#5f6368",
    marginTop: "2px",
  },
  timestamp: {
    fontSize: "12px",
    color: "#5f6368",
    whiteSpace: "nowrap" as const,
  },
  body: {
    flex: 1,
    padding: "24px 32px",
    overflowY: "auto" as const,
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#1a1a1a",
    whiteSpace: "pre-wrap" as const,
  },
};

function getInitials(name: string): string {
  const parts = name.split(/[@.\s]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatFullTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmailDetail({ message }: EmailDetailProps) {
  if (!message) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>Select an email to view it here.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.subject}>{message.subject || "(No Subject)"}</div>
        <div style={styles.meta}>
          <div style={styles.avatar}>{getInitials(message.sender)}</div>
          <div style={styles.metaInfo}>
            <div style={styles.sender}>{message.sender}</div>
            <div style={styles.recipient}>An: {message.recipient}</div>
          </div>
          <div style={styles.timestamp}>
            {formatFullTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
      <div style={styles.body}>{message.body}</div>
    </div>
  );
}
