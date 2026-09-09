import type { Message } from "@/entities/message";

interface EmailListProps {
  messages: Message[];
  selectedId: number | null;
  onSelect: (message: Message) => void;
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #e0e0e0",
    fontWeight: 600,
    fontSize: "16px",
    color: "#1a1a1a",
    backgroundColor: "#f8f9fa",
  },
  list: {
    flex: 1,
    overflowY: "auto" as const,
  },
  item: {
    padding: "12px 20px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  itemSelected: {
    backgroundColor: "#e8f0fe",
  },
  itemUnread: {
    backgroundColor: "#ffffff",
  },
  itemRead: {
    backgroundColor: "#f8f9fa",
  },
  sender: {
    fontSize: "14px",
    marginBottom: "2px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  senderName: {
    fontWeight: 600,
    color: "#1a1a1a",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  senderNameRead: {
    fontWeight: 400,
    color: "#5f6368",
  },
  timestamp: {
    fontSize: "12px",
    color: "#5f6368",
    whiteSpace: "nowrap" as const,
  },
  subject: {
    fontSize: "13px",
    color: "#1a1a1a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    marginBottom: "2px",
  },
  subjectRead: {
    color: "#5f6368",
  },
  preview: {
    fontSize: "12px",
    color: "#5f6368",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#0078d4",
    flexShrink: 0,
  },
  empty: {
    padding: "40px 20px",
    textAlign: "center" as const,
    color: "#5f6368",
    fontSize: "14px",
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function EmailList({ messages, selectedId, onSelect }: EmailListProps) {
  if (messages.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>Posteingang</div>
        <div style={styles.empty}>Keine E-Mails vorhanden.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Posteingang ({messages.length})</div>
      <div style={styles.list}>
        {messages.map((message) => {
          const isSelected = message.id === selectedId;
          const isUnread = message.read_status === 0;

          return (
            <div
              key={message.id}
              style={{
                ...styles.item,
                ...(isSelected
                  ? styles.itemSelected
                  : isUnread
                    ? styles.itemUnread
                    : styles.itemRead),
              }}
              onClick={() => onSelect(message)}
            >
              <div style={styles.sender}>
                {isUnread && <div style={styles.unreadDot} />}
                <span
                  style={{
                    ...styles.senderName,
                    ...(isUnread ? {} : styles.senderNameRead),
                  }}
                >
                  {message.sender}
                </span>
                <span style={styles.timestamp}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div
                style={{
                  ...styles.subject,
                  ...(isUnread ? {} : styles.subjectRead),
                }}
              >
                {message.subject || "(Kein Betreff)"}
              </div>
              <div style={styles.preview}>
                {message.body.substring(0, 80)}
                {message.body.length > 80 ? "…" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
