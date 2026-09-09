import type { Message } from "@/entities/message";

interface MessageThreadProps {
  threadId: string | null;
  messages: Message[];
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
  messageList: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px 20px",
  },
  messageBubble: {
    marginBottom: "16px",
    padding: "12px 16px",
    backgroundColor: "#f1f3f4",
    borderRadius: "8px",
    maxWidth: "80%",
  },
  messageSender: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1a73e8",
    marginBottom: "4px",
  },
  messageBody: {
    fontSize: "14px",
    color: "#1a1a1a",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap" as const,
  },
  messageTimestamp: {
    fontSize: "11px",
    color: "#5f6368",
    marginTop: "6px",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#5f6368",
    fontSize: "14px",
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageThread({ threadId, messages }: MessageThreadProps) {
  if (!threadId) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          Wählen Sie einen Kanal aus, um die Nachrichten zu sehen.
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>{threadId}</div>
        <div style={styles.emptyState}>Keine Nachrichten in diesem Kanal.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>{threadId}</div>
      <div style={styles.messageList}>
        {messages.map((message) => (
          <div key={message.id} style={styles.messageBubble}>
            <div style={styles.messageSender}>{message.sender}</div>
            <div style={styles.messageBody}>{message.body}</div>
            <div style={styles.messageTimestamp}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
