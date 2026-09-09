import type { Message } from "@/entities/message";

interface ChannelListProps {
  threads: Map<string, Message[]>;
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
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
  itemDefault: {
    backgroundColor: "#ffffff",
  },
  threadName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  meta: {
    fontSize: "12px",
    color: "#5f6368",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageCount: {
    fontSize: "11px",
    color: "#5f6368",
  },
  lastMessage: {
    fontSize: "12px",
    color: "#5f6368",
    marginTop: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
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

export function ChannelList({
  threads,
  selectedThreadId,
  onSelectThread,
}: ChannelListProps) {
  const threadEntries = Array.from(threads.entries());

  if (threadEntries.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>Kanäle</div>
        <div style={styles.empty}>Keine Kanäle vorhanden.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Kanäle ({threadEntries.length})</div>
      <div style={styles.list}>
        {threadEntries.map(([threadId, messages]) => {
          const isSelected = threadId === selectedThreadId;
          const lastMessage = messages[messages.length - 1];

          return (
            <div
              key={threadId}
              style={{
                ...styles.item,
                ...(isSelected ? styles.itemSelected : styles.itemDefault),
              }}
              onClick={() => onSelectThread(threadId)}
            >
              <div style={styles.threadName}>{threadId}</div>
              <div style={styles.meta}>
                <span style={styles.messageCount}>
                  {messages.length}{" "}
                  {messages.length === 1 ? "Nachricht" : "Nachrichten"}
                </span>
                <span>{formatTimestamp(lastMessage.timestamp)}</span>
              </div>
              <div style={styles.lastMessage}>
                {lastMessage.sender}: {lastMessage.body.substring(0, 60)}
                {lastMessage.body.length > 60 ? "…" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
