import { useState, useCallback, useEffect } from "react";
import { useMessages, useMarkAsRead } from "@/entities/message";
import { EmailList, EmailDetail } from "@/features/email-viewer";
import type { Message } from "@/entities/message";

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    width: "360px",
    minWidth: "280px",
    borderRight: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
    overflow: "hidden",
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

export function OutlookPage() {
  useEffect(() => {
    document.title = "ALDI Email";
  }, []);
  const { messages, loading, error, refetch } = useMessages();
  const markAsRead = useMarkAsRead();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleSelectMessage = useCallback(
    async (message: Message) => {
      setSelectedMessage(message);

      if (message.read_status === 0) {
        try {
          await markAsRead(message.id);
          refetch();
        } catch {
          // Silently fail – the message is still displayed
        }
      }
    },
    [markAsRead, refetch],
  );

  if (loading) {
    return (
      <div style={styles.layout}>
        <div style={styles.loading}>Nachrichten werden geladen…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.layout}>
        <div style={styles.error}>
          Fehler beim Laden der Nachrichten: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <EmailList
          messages={messages}
          selectedId={selectedMessage?.id ?? null}
          onSelect={handleSelectMessage}
        />
      </div>
      <div style={styles.content}>
        <EmailDetail message={selectedMessage} />
      </div>
    </div>
  );
}
